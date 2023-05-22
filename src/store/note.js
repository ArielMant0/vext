import { defineStore } from "pinia"
import { useVextHistory } from "@/store/history";
import { createFabricObject } from '@/use/util';
import { toRaw } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useExportPDF } from "@/use/export-pdf";
import { useExportZIP } from "@/use/export-zip";
import EventHandler from "@/use/event-handler";
import { useVextNoteSettings } from "./note-settings";
import { MODES, LAYER_MODES } from "@/use/enums";

// https://stackoverflow.com/questions/69881048/cannot-resize-edit-objects-until-i-group-ungroup-them-alpinejs-fabricjs/70564680#70564680
let _CANVAS = null;
let _CONTENT = null;

function setCanvasPointerEvents(enable) {
    _CANVAS.wrapperEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.upperCanvasEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.lowerCanvasEl.style.pointerEvents = enable ? null : "none";
}

function parseObject(obj, layer) {
    return {
        layer: layer.id,
        uuid: obj.uuid,
        type: obj.type,
        origin: [obj.left.toFixed(0), obj.top.toFixed(0)],
        dimensions: [obj.width.toFixed(0), obj.height.toFixed(0)],
        scale: [obj.scaleX.toFixed(1), obj.scaleY.toFixed(1)],
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth, //.toFixed(0),
        opacity: obj.opacity,
        visible: obj.visible
    }
}
function isFabric(d) {
    return typeof d === "object" && d.set !== undefined && d.get !== undefined
}
function getCanvasCoords(x, y) {
    const rect = _CANVAS.wrapperEl.getBoundingClientRect();
    const left = x < rect.x ? 0 : (x > rect.x+rect.width ? rect.width : x - rect.x)
    const top = y < rect.y ? 0 : (y > rect.y+rect.height ? rect.height : y - rect.y)
    return [left, top]
}
function getClosestMidpoint(x, y, rect) {
    const left = Math.sqrt(Math.pow(x - rect.left, 2) + Math.pow(y - (rect.top+rect.height*0.5), 2));
    const top = Math.sqrt(Math.pow(x - (rect.left+rect.width*0.5), 2) + Math.pow(y - rect.top, 2));
    const right = Math.sqrt(Math.pow(x - (rect.left+rect.width), 2) + Math.pow(y - (rect.top+rect.height*0.5), 2));
    const bot = Math.sqrt(Math.pow(x - (rect.left+rect.width*0.5), 2) + Math.pow(y - (rect.top+rect.height), 2));

    if (left <= right && left <= top && left <= bot) return [rect.left, rect.top + rect.height * 0.5];
    if (right <= left && right <= top && right <= bot) return [rect.left + rect.width, rect.top + rect.height * 0.5];
    if (top <= left && top <= right && top <= bot) return [rect.left + rect.width * 0.5, rect.top];
    return [rect.left+rect.width*0.5, rect.top+rect.height]
}
function connToJSON(connection) {
    return {
        location: connection.location,
        path: connection.path.toJSON(["uuid"]),
        data: connection.data,
    }
}
function jsonToConn(json, annotation) {
    const corner = getClosestMidpoint(
        json.location[0], json.location[1],
        annotation.getBoundingRect(true)
    );
    const line =  new fabric.Line([
        json.location[0], json.location[1],
        corner[0], corner[1]
    ], json.path);
    line.set({
        selectable: false,
        hoverCursor: "default",
    });
    return {
        location: json.location,
        path: line,
        data: json.data,
    }
}

const EVENTS = new EventHandler();

const vextNoteStore = {

    state: () => {
        return {
            enabled: true,

            mode: MODES.LAYER,

            currentState: null,

            layers: [],
            activeLayer: null,
            layerMode: LAYER_MODES.ANNOTATE,
            LAYER_ID_IDX: 0,
            previewLayerID: null,

            activeObjectUUID: null,
            activeObject: null,

            connectLocation: [0, 0],
            connectObject: null,
        };
    },

    getters: {
        canvas: () => _CANVAS,
        currentLayer: state => {
            if (state.activeLayer === null) return null;
            return state.getLayer(state.activeLayer);
        },
        previewLayer: state => {
            if (state.previewLayerID === null) return null;
            return state.getLayer(state.previewLayerID);
        },
        userLayers: state => {
            if (state.previewLayerID === null) return state.layers;
            return state.layers.filter(d => d.id !== state.previewLayerID);
        },

        color: () => {
            const settings = useVextNoteSettings();
            return settings.color;
        },
        layerColors: state => state.layers.map(t => t.color),

        nextColor: state => {
            const settings = useVextNoteSettings();
            return settings.defaultColorAt(state.layers.length);
        },
        nextID: state => "layer " + state.LAYER_ID_IDX,
    },

    actions: {

        enable() {
            this.enabled = true;
        },

        disable() {
            this.enabled = false;
        },

        enablePointerEvents(value)  {
            setCanvasPointerEvents(value === true);
        },

        emit(name, data) {
            EVENTS.emit(name, data);
        },

        on(name, handler) {
            return EVENTS.on(name, handler);
        },

        off(name, handler) {
            return EVENTS.off(name, handler);
        },

        isUniqueID(id) {
            return !this.layers.some(d => d.id === id);
        },

        getLayerIndex(id) {
            return this.layers.findIndex(d => d.id === id)
        },

        getLayer(id) {
            const idx = this.getLayerIndex(id);
            return idx >= 0 ? this.layers[idx] : null;
        },

        overwriteState(state) {
            const layer = this.currentLayer;
            if (layer) {
                layer.state = state;
                layer.width = _CANVAS.getWidth();
                layer.height = _CANVAS.getHeight();
            } else {
                this.addLayer(state, true)
            }
        },

        renameLayer(oldId, newId) {
            if (!this.enabled) return false;

            const l = this.getLayer(oldId);
            if (l !== null) {
                if (this.isUniqueID(newId)) {
                    l.id = newId;
                    if (this.activeLayer === oldId) {
                        this.activeLayer = newId;
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },

        addLayerComment(comment, id=null) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0) {
                this.layers[idx].comments.push(comment);
                return true;
            }
            return false;
        },

        updateLayerComment(comment, id=null, index=0) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0 && index >= 0 && index <= this.layers[idx].comments.length) {
                this.layers[idx].comments[index] = comment;
                return true;
            }
            return false;
        },

        removeLayerComment(id=null, index=0) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0 && index >= 0 && index <= this.layers[idx].comments.length) {
                this.layers[idx].comments.splice(index, 1);
                return true;
            }
            return false;
        },

        removeLayerComments(id=null) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0) {
                this.layers[idx].comments = [];
                return true;
            }
            return false;
        },

        mergeLayers(idFrom, idInto=null) {
            if (!this.enabled) return;

            idInto = idInto === null ? this.activeLayer : idInto;
            const i0 = this.getLayerIndex(idFrom);
            const i1 = this.getLayerIndex(idInto);
            if (i0 >= 0 && i1 >= 0) {
                this.layers[i0].group.forEach(d => this.layers[i1].group.push(toRaw(d)));
                this.layers[i0].comments.forEach(d => this.layers[i1].comments.push(d));
                this.layers.splice(i0, 1);

                if (idInto == this.activeLayer) {
                    this.layers[i1].group.forEach(d => d.set({
                        visible: true,
                        dirty: true
                    }));
                    _CANVAS.requestRenderAll();
                }
            } else {
                throw Error("one of the merge layers does not exist")
            }

        },

        addLayer(state, record=true, id=null, color=null, width=null, height=null, items=[], comments=[], connections={}) {
            if (!this.enabled) return;

            id = id === null ? this.nextID : id;
            color = color === null ? this.nextColor : color;
            width = width === null ? _CANVAS.getWidth() : width;
            height = height === null ? _CANVAS.getHeight() : height

            if (record) {
                const history = useVextHistory();
                const json = items.map(d => isFabric(d) ? d.toJSON(["uuid"]) : d);
                history.do("add layer " + id,
                    this.addLayer.bind(this, state, false, id, color, width, height, json, comments, connections),
                    this.removeLayer.bind(this, id, false)
                );
            }

            this.layers.splice(0, 0, {
                id: id,
                color: color,
                visible: true,
                opacity: 1,
                group: [],
                comments: comments,
                connections: [],
                width: width,
                height: height,
                time: new Date(Date.now()),
                state: state
            });

            // add items
            if (items.length > 0) {
                items.forEach(item => {
                    // fabric object
                    if (isFabric(item)) {
                        item.set("opacity", 1);
                        item.set("visible", true)
                        item.set("uuid", uuidv4())
                        _CANVAS.add(toRaw(item))
                        this.layers[0].group.push(item);
                    } else {
                        const obj = createFabricObject(item.type, item);
                        obj.set("opacity", 1);
                        obj.set("visible", true)
                        obj.set("uuid", item.uuid ? item.uuid : uuidv4())
                        _CANVAS.add(obj)
                        this.layers[0].group.push(obj);
                    }
                })
            }

            // load connections
            for (const uuid in connections) {
                const anno = this.layers[0].group.find(d => d.uuid === uuid);
                if (!anno) continue;
                this.layers[0].connections[uuid] = connections[uuid].map(item => {
                    const obj = jsonToConn(item, anno)
                    _CANVAS.add(obj.path)
                    return obj;
                })
            }

            this.LAYER_ID_IDX++;
            this.setActiveLayer(id, false);
        },

        removeLayer(id, record=true) {
            if (!this.enabled) return;

            if (id === undefined) { id = this.activeLayer }
            let idx = this.getLayerIndex(id)
            if (idx >= 0) {

                const item = this.layers.splice(idx, 1)[0];

                if (record) {
                    const history = useVextHistory();
                    const items = item.group.map(d => d.toJSON(["uuid"]))
                    history.do("remove layer "+id,
                        this.removeLayer.bind(this, id, false),
                        this.addLayer.bind(this,
                            item.state, false, item.id,
                            item.color, item.width, item.height,
                            items, toRaw(item.comments), toRaw(item.connections)
                        )
                    )
                }

                item.group.forEach(d => _CANVAS.remove(toRaw(d)));

                const index = this.getLayerIndex(this.activeLayer);
                if (index < 0) {
                    this.setActiveLayer(this.layers.length === 0 ? null : this.layers[0].id, false);
                }
            } else {
                throw new Error(`layer ${id} does not exist`)
            }
        },

        removeEmptyLayers() {
            if (!this.enabled) return;

            this.layers = this.layers.filter(d => d.group.length > 0);
            const index = this.getLayerIndex(this.activeLayer);
            if (index < 0) {
                this.setActiveLayer(this.layers.length === 0 ? null : this.layers[0].id, false);
            }
        },

        setActiveLayer(id, record=true) {
            if (!this.enabled) return;

            if (id === null) {
                this.activeLayer = null;
                return;
            }

            const newIndex = this.getLayerIndex(id);
            if (newIndex >= 0) {
                if (record) {
                    const history = useVextHistory();
                    history.do("change active layer to "+id,
                        this.setActiveLayer.bind(this, id, false),
                        this.setActiveLayer.bind(this, this.activeLayer, false),
                    )
                }
                this.setLayerVisibility(false, this.activeLayer, false, false)
                this.setLayerVisibility(true, id, false, false)
                this.activeLayer = id;
                this.resizeCanvas(
                    this.layers[newIndex].width,
                    this.layers[newIndex].height
                );
                _CANVAS.requestRenderAll();
            } else {
                throw new Error(`layer ${id} does not exist`)
            }
        },

        setLayerOpacity(value, id=null, record=true, render=true) {
            if (!this.enabled) return;

            if (id === null) id = this.activeLayer

            const layer = this.layers.find(d => d.id === id);
            if (layer && layer.opacity !== value) {
                const prevValue = layer.opacity;
                layer.opacity = value;
                layer.group.forEach(d => d.set("opacity", value))
                for (const uuid in layer.connections) {
                    layer.connections[uuid].forEach(d => d.path.set("opacity", value))
                }

                if (render) _CANVAS.requestRenderAll();

                if (record) {
                    const history = useVextHistory();
                    history.do("set layer opacity to "+value,
                        this.setLayerOpacity.bind(this, value, id, false),
                        this.setLayerOpacity.bind(this, prevValue, id, false),
                    )
                }
            }
        },

        setLayerVisibility(visible, id=null, record=true, render=true) {
            if (!this.enabled) return;

            if (id === null) id = this.activeLayer

            const layer = this.layers.find(d => d.id === id);
            if (layer && layer.visible !== visible) {
                layer.visible = visible;
                layer.group.forEach(d => d.set("visible", visible))
                for (const uuid in layer.connections) {
                    layer.connections[uuid].forEach(d => d.path.set("visible", visible))
                }

                if (id === this.activeLayer && !visible) _CANVAS.discardActiveObject();
                if (render) _CANVAS.requestRenderAll();

                if (record) {
                    const history = useVextHistory();
                    history.do("set layer visibility to "+visible,
                        this.setLayerVisibility.bind(this, visible, id, false, true),
                        this.setLayerVisibility.bind(this, !visible, id, false, true)
                    )
                }
            }
        },

        setMode(mode, record=true) {
            if (mode !== this.mode) {
                if (record) {
                    const history = useVextHistory();
                    history.do("change mode to "+mode,
                        this.setMode.bind(this, mode, false),
                        this.setMode.bind(this, this.mode, false)
                    );
                }

                if (_CANVAS.getActiveObject() !== null) {
                    _CANVAS.discardActiveObject();
                    _CANVAS.requestRenderAll();
                }

                switch (mode) {
                    case MODES.BRUSH:
                        _CANVAS.isDrawingMode = true;
                        setCanvasPointerEvents(true);
                        break;
                    case MODES.LAYER:
                    case MODES.CONNECT:
                        _CANVAS.isDrawingMode = false;
                        setCanvasPointerEvents(false);
                        break;
                    default:
                        _CANVAS.isDrawingMode = false;
                        setCanvasPointerEvents(true);
                        break;
                }

                this.mode = mode;
            }
        },

        setBrushSize(size, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.setBrushSize(size, record);
        },

        setBrushDecimation(value, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.setBrushDecimation(value, record);
        },

        selectColor(id, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.selectColor(id, record);
        },

        setColorPrimary(color, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.setColorPrimary(color, record);
        },

        setColorSecondary(color, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.setColorSecondary(color, record);
        },

        setShape(shape, record=true) {
            if (!this.enabled) return;
            const settings = useVextNoteSettings();
            settings.setShape(shape, record);
        },

        addObject(obj, addToCanvas=true, record=true) {
            if (!this.enabled) return null;

            if (this.layerMode === LAYER_MODES.ANNOTATE) {
                // no state available
                if (this.currentState === null) {
                    if (!addToCanvas) {
                        _CANVAS.remove(obj);
                    }
                    return null;
                }

                const l = this.layerFromStateHash(this.currentState.hash);
                if (!l) {
                    this.addLayer(this.currentState, record)
                }
            }

            const index = this.getLayerIndex(this.activeLayer)
            obj.set("opacity", this.layers[index].opacity)
            obj.set("visible", this.layers[index].visible)
            obj.set("uuid", uuidv4())

            this.layers[index].group.push(obj);
            if (addToCanvas) {
                _CANVAS.add(obj);
            }

            if (record) {
                const history = useVextHistory();
                history.do("add object of type "+obj.type,
                    this.addObjectFromJSON.bind(this, obj.toJSON(["uuid"]), this.activeLayer, false),
                    this.removeLastObject.bind(this, this.activeLayer, false),
                );
            }

            this.emit("annotation:created", obj)

            return obj.uuid;
        },

        addObjects(objs, addToCanvas=true, record=true) {
            if (!this.enabled) return null;

            if (this.layerMode === LAYER_MODES.ANNOTATE && this.currentState !== null) {
                const l = this.layerFromStateHash(this.currentState.hash);
                if (!l) {
                    this.addLayer(this.currentState, record)
                }
            }

            const index = this.getLayerIndex(this.activeLayer)
            objs.forEach(d => {
                d.set("opacity", this.layers[index].opacity)
                d.set("visible", this.layers[index].visible)
                d.set("uuid", uuidv4())

                this.layers[index].group.push(d);
                if (addToCanvas) {
                    _CANVAS.add(d);
                }
            });

            if (record) {
                const history = useVextHistory();
                const objJsons = objs.map(d => d.toJSON(["uuid"]));
                history.do(`add ${objs.length} objects`,
                    this.addObjectsFromJSON.bind(this, objJsons, this.activeLayer, false),
                    this.removeLastObject.bind(this, this.activeLayer, false),
                );
            }

            this.emit("annotation:created", objs)

            return objs.map(d => d.uuid);
        },

        addObjectFromJSON(json, layer=null, record=true) {

            if (!this.enabled) return null;

            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const obj = createFabricObject(json.type, json);
            this.layers[index].group.push(obj);
            _CANVAS.add(obj);

            if (json.connections) {
                this.layers[index].connections[json.uuid] = json.connections.map(d => jsonToConn(d, obj));
                this.layers[index].connections[json.uuid].forEach(d => _CANVAS.add(d.path));
            }

            if (record) {
                const history = useVextHistory();
                history.do("add object of type "+obj.type,
                    this.addObjectFromJSON.bind(this, json, layer, false),
                    this.removeLastObject.bind(this, layer, false),
                );
            }

            this.emit("annotation:created", obj)

            return obj.uuid;
        },

        addObjectsFromJSON(json, layer=null, record=true) {

            if (!this.enabled) return null;

            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const objs = json.map(d => createFabricObject(d.type, d));
            objs.forEach(d => {
                this.layers[index].group.push(d)
                _CANVAS.add(d);
            });

            json.forEach((d, i) => {
                if (d.connections) {
                    this.layers[index].connections[d.uuid] = json.connections.map(dd => jsonToConn(dd, objs[i]));
                    this.layers[index].connections[d.uuid].forEach(dd => _CANVAS.add(dd.path));
                }
            })

            if (record) {
                const uuids = json.map(d => d.uuid);
                const history = useVextHistory();
                history.do(`add ${objs.length} objects`,
                    this.addObjectsFromJSON.bind(this, json, layer, false),
                    this.removeObjects.bind(this, uuids, layer, false),
                );
            }

            this.emit("annotation:created", objs)

            return objs.map(d => d.uuid);
        },

        removeObject(uuid, layer=null, record=true) {

            if (!this.enabled) return null;

            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const idx = this.layers[layerIdx].group.findIndex(obj => obj.get("uuid") === uuid);
            if (idx >= 0) {

                const obj = this.layers[layerIdx].group.splice(idx, 1)[0];
                const objJson = obj.toJSON(["uuid"]);
                // discard
                if (this.activeObjectUUID === obj.uuid) {
                    _CANVAS.discardActiveObject();
                }
                _CANVAS.remove(toRaw(obj));

                if (this.layers[layerIdx].connections[uuid]) {
                    objJson.connections = this.layers[layerIdx].connections[uuid].map(d => connToJSON(d))
                    this.layers[layerIdx].connections[uuid].forEach(d => {
                        _CANVAS.remove(toRaw(d.path));
                    });
                    delete this.layers[layerIdx].connections[uuid]
                }

                if (record) {
                    const history = useVextHistory();
                    history.do("remove object of type "+obj.type,
                        this.removeLastObject.bind(this, layer, false),
                        this.addObjectFromJSON.bind(this, objJson, layer, false),
                    );
                }
            }
        },

        removeObjects(uuids, layer=null, record=true) {

            if (!this.enabled) return null;

            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const objs = this.layers[layerIdx].group.filter(d => uuids.includes(d.get("uuid")));
            const objsJson = objs.map(d => {
                const json = d.toJSON(["uuid"])
                if (this.layers[layerIdx].connections[d.uuid]) {
                    json.connections = this.layers[layerIdx].connections[d.uuid].map(dd => connToJSON(dd))
                }
            });
            objs.forEach(d => {
                // discard
                if (this.activeObjectUUID === d.uuid) {
                    _CANVAS.discardActiveObject();
                }
                _CANVAS.remove(toRaw(d))
                if (this.layers[layerIdx].connections[d.uuid]) {
                    this.layers[layerIdx].connections[d.uuid].forEach(dd => {
                        _CANVAS.remove(toRaw(dd.path));
                    });
                    delete this.layers[layerIdx].connections[d.uuid]
                }
            });

            if (record) {
                const history = useVextHistory();
                history.do(`remove ${uuids.length} objects`,
                    this.removeObjects.bind(this, uuids, layer, false),
                    this.addObjectsFromJSON.bind(this, objsJson, layer, false),
                );
            }
        },

        removeLastObject(layer=null, record=true) {

            if (!this.enabled) return null;

            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            if (this.layers[index].group.length > 0) {

                const obj = this.layers[index].group.pop()
                const objJson = obj.toJSON(["uuid"]);
                // discard
                if (this.activeObjectUUID === obj.uuid) {
                    _CANVAS.discardActiveObject();
                }
                _CANVAS.remove(toRaw(obj));

                if (this.layers[index].connections[obj.uuid]) {
                    objJson.connections = this.layers[index].connections[obj.uuid].map(d => connToJSON(d))
                    this.layers[index].connections[obj.uuid].forEach(d => {
                        _CANVAS.remove(toRaw(d.path));
                    });
                    delete this.layers[index].connections[obj.uuid]
                }

                if (record) {
                    const history = useVextHistory();
                    history.do("remove object of type "+obj.type,
                        this.removeLastObject.bind(this, layer, false),
                        this.addObjectFromJSON.bind(this, objJson, layer, false),
                    );
                }
            }
        },

        setActiveObject(uuid, layer=null) {

            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            if (layerIdx >= 0) {

                const obj = this.layers[layerIdx].group.find(d => d.uuid === uuid);
                if (obj) {
                    _CANVAS.setActiveObject(obj);
                    return true;
                }
            }

            return false;
        },

        getActiveObject() {
            return _CANVAS.getActiveObject();
        },

        discardActiveObject() {
            _CANVAS.discardActiveObject();
        },

        deleteActiveObject(record=true) {
            if (!this.enabled) return;
            const obj = _CANVAS.getActiveObject();
            if (obj) {
                // remove highlight
                if (obj.isHover) {
                    obj.set({
                        backgroundColor: obj.prevBackground,
                        isHover: false,
                        dirty: true
                    });
                }
                _CANVAS.discardActiveObject();
                // group selection
                if (obj.type === "activeSelection") {
                    const uuids = obj._objects.map(d => d.get("uuid"))
                    this.removeObjects(uuids, this.activeLayer, record);
                } else {
                    this.removeObject(obj.get("uuid"), this.activeLayer, record);
                }

            }
        },

        layerFromItem(item) {
            return this.layers.find(d => d.group.some(o => o.get("uuid") === item.get("uuid")));
        },

        resizeCanvas(width, height) {
            if (_CANVAS) {
                _CANVAS.setWidth(width);
                _CANVAS.setHeight(height);
            }
        },

        setCanvasZIndex(value) {
            if (_CANVAS) {
                _CANVAS.wrapperEl.style.zIndex = value;
                _CANVAS.upperCanvasEl.style.zIndex = value;
                _CANVAS.lowerCanvasEl.style.zIndex = value
            }
        },

        setContentNode(node) {
            _CONTENT = node;
        },

        setCanvas(canvas) {
            _CANVAS = canvas;
            setCanvasPointerEvents(false);
            const settings = useVextNoteSettings();
            settings.setCanvas(canvas);

            canvas
                .on("path:created", (obj) => {
                    if (this.enabled && this.mode === MODES.BRUSH) {
                        const settings = useVextNoteSettings();
                        if (!settings.pointerMenu) {
                            // obj already part of the canvas
                            this.addObject(obj.path, false)
                            this.emit("pointer-menu", "drawing")
                        } else {
                            _CANVAS.remove(obj.path)
                        }
                    } else {
                        _CANVAS.remove(obj.path)
                    }
                })
                .on("selection:created", () => {
                    this.activeObject = parseObject(_CANVAS.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                    this.emit("selection:created")
                })
                .on("selection:updated", () => {
                    this.activeObject = parseObject(_CANVAS.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                    this.emit("selection:updated")
                })
                .on("selection:cleared", () => {
                    this.activeObject = null;
                    this.activeObjectUUID = null;
                    this.emit("selection:cleared")
                })
                .on("object:modified", ({ target }) => {
                    if (target.get("uuid") === this.activeObjectUUID) {
                        this.activeObject = parseObject(target, this.currentLayer);
                        if (this.currentLayer.connections[this.activeObjectUUID]) {
                            this.currentLayer.connections[this.activeObjectUUID].forEach(d => {
                                const corner = getClosestMidpoint(
                                    d.location[0],
                                    d.location[1],
                                    target.getBoundingRect(true)
                                );
                                d.path.set({
                                    x2: corner[0],
                                    y2: corner[1],
                                    dirty: true
                                });
                                d.path.setCoords();
                            })
                            _CANVAS.renderAll();
                        }
                    }
                })
                .on("mouse:over", ({ target }) => {
                    if (target && target.selectable) {
                        switch (this.mode) {
                            case MODES.CONNECT:
                            case MODES.EDIT:
                                target.set({
                                    isHover: true,
                                    prevBackground: target.backgroundColor,
                                    backgroundColor: "rgba(200,200,200,0.5)",
                                    dirty: true
                                });
                                _CANVAS.requestRenderAll();
                                break;
                        }
                    }
                })
                .on("mouse:out", ({ target }) => {
                    if (target && target.selectable) {
                        switch (this.mode) {
                            case MODES.CONNECT:
                            case MODES.EDIT:
                                target.set({
                                    isHover: false,
                                    backgroundColor: target.prevBackground,
                                    dirty: true
                                });
                                _CANVAS.requestRenderAll();
                                break;
                        }
                    }
                })

            this.emit("canvas:created", this.canvas);
        },

        hasStateHash(hash) {
            return this.layerFromStateHash(hash) !== undefined;
        },

        layerFromStateHash(hash) {
            return this.layers.find(t => t.state.hash === hash && t.id !== this.previewLayerID)
        },

        setState(state) {
            this.currentState = state;
            if (this.previewLayerID === null) {
                this.addLayer(state, false);
                this.previewLayerID = this.activeLayer;
            } else {
                const layer = this.getLayer(this.previewLayerID);
                if (layer !== null) {
                    layer.state = state;
                    layer.width = _CANVAS.getWidth();
                    layer.height = _CANVAS.getHeight();
                    layer.time = new Date(Date.now());
                }
            }
        },

        selectPreviewLayer() {
            if (this.previewLayerID === null) {
                if (this.currentState !== null) {
                    this.addLayer(this.currentState, false);
                    this.previewLayerID = this.activeLayer
                } else {
                    // TODO: do sth!?
                    return;
                }
            }
            this.setActiveLayer(this.previewLayerID);
        },

        addConnection(uuid, id=null, record=true) {

            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || layer.group.length === 0) return;

            const annotation = layer.group.find(d => d.uuid === uuid);
            if (!annotation) return;

            const [x, y] = getClosestMidpoint(
                this.connectLocation[0],
                this.connectLocation[1],
                annotation.getBoundingRect(true)
            );

            const obj = {
                data: Object.assign({}, toRaw(this.connectObject)),
                location: this.connectLocation.slice(),
                path: new fabric.Line([this.connectLocation[0], this.connectLocation[1], x, y], {
                    stroke: this.color,
                    strokeWidth: 1,
                    strokeUniform: true,
                    opacity: 1,
                    selectable: false,
                    hoverCursor: "default"
                }),
            };
            _CANVAS.add(obj.path);

            this.connectObject = null;

            if (layer.connections[uuid]) {
                layer.connections[uuid].push(obj);
            } else {
                layer.connections[uuid] = [obj];
            }

            if (record) {
                const history = useVextHistory();
                const json = connToJSON(obj);
                history.do(
                    "add a connection",
                    this.addConnectionFromJSON.bind(this, uuid, json, id, false),
                    this.removeLastConnection.bind(this, uuid, id, false),
                );
            }

            this.emit("connect:created", obj);
            if (record) this.emit("pointer-menu", "connection")
        },

        addConnectionFromJSON(uuid, json, id=null, record=true) {
            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || layer.group.length === 0) return;

            const annotation = layer.group.find(d => d.uuid === uuid);
            if (!annotation) return;


            const obj = jsonToConn(json, annotation)
            _CANVAS.add(obj.path);

            if (layer.connections[uuid]) {
                layer.connections[uuid].push(obj);
            } else {
                layer.connections[uuid] = [obj];
            }

            if (record) {
                const history = useVextHistory();
                history.do(
                    "add a connection",
                    this.addConnectionFromJSON.bind(this, uuid, json, id, false),
                    this.removeLastConnection.bind(this, uuid, id, false),
                );
            }

            this.emit("connect:created", obj);
            if (record) this.emit("pointer-menu", "connection")
        },

        removeLastConnection(uuid, id=null, record=true) {
            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || layer.group.length === 0) return;

            const annotation = layer.group.find(d => d.uuid === uuid);
            if (!annotation || layer.connections[uuid].length === 0) return;

            const obj = layer.connections[uuid].pop();
            _CANVAS.remove(toRaw(obj.path))

            if (record) {
                const history = useVextHistory();
                const json = connToJSON(obj)
                history.do(
                    "remove latest connection",
                    this.removeLastConnection.bind(this, uuid, id, false),
                    this.addConnectionFromJSON.bind(this, uuid, json, id, false),
                );
            }

            this.emit("connect:removed", obj);
        },

        removeConnectionAtIndex(uuid, index, id=null, record=true) {
            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || layer.group.length === 0) return;

            const annotation = layer.group.find(d => d.uuid === uuid);
            if (!annotation || layer.connections[uuid].length === 0) return;

            if (index >= layer.connections[uuid].length) return;

            const obj = layer.connections[uuid].splice(index, 1)[0];
            _CANVAS.remove(toRaw(obj.path))

            if (record) {
                const history = useVextHistory();
                const json = connToJSON(obj)
                history.do(
                    "remove latest connection",
                    this.removeConnectionAtIndex.bind(this, uuid, index, id, false),
                    this.addConnectionFromJSON.bind(this, uuid, json, id, false),
                );
            }

            this.emit("connect:removed", obj);
        },

        startConnect(element, x, y) {
            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.group.length === 0) return;

            const coords = getCanvasCoords(x, y)
            this.connectObject = element;
            this.connectLocation = coords;
            this.emit("connect:start", {
                x: coords[0], y: coords[1], source: element
            });

            setCanvasPointerEvents(true);
        },

        moveConnect(x, y) {
            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.group.length === 0) return;

            const coords = getCanvasCoords(x, y)
            this.emit("connect:move", { x: coords[0], y: coords[1] });
        },

        endConnect(x, y) {
            setCanvasPointerEvents(false);

            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.group.length === 0) return;

            _CANVAS.discardActiveObject();

            const coords = getCanvasCoords(x, y)
            const point = new fabric.Point(coords[0], coords[1]);
            const annotation = this.currentLayer.group.find(d => d.containsPoint(point));
            if (!annotation) {
                this.emit("connect:cancel");
            } else {
                this.emit("connect:end", { x: coords[0], y: coords[1], target: annotation });
                this.addConnection(annotation.uuid);
            }
        },

        async importLayer(file) {
            if (!this.enabled) return;
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                const layer = JSON.parse(reader.result);
                const id = this.isUniqueID(layer.id) ? layer.id : layer.id+"_import";
                this.addLayer(
                    layer.state,
                    false,
                    id,
                    layer.color,
                    layer.width,
                    layer.height,
                    layer.items,
                    layer.comments,
                    layer.connections
                );
            }, false)

            reader.readAsText(file);

        },

        exportLayer() {
            if (!this.enabled) return;
            const layer = this.currentLayer;
            if (layer) {
                const connections = {};
                for (const uuid in layer.connections) {
                    connections[uuid] = layer.connections[uuid].map(connToJSON);
                }
                return {
                    id: layer.id,
                    width: layer.width,
                    height: layer.height,
                    color: layer.color,
                    state: layer.state,
                    items: layer.group.map(d => d.toJSON(["uuid"])),
                    comments: layer.comments,
                    connections: connections
                }
            } else {
                throw new ("no layer to export")
            }
        },

        async exportZIP(name=null, canvasOnly=false) {
            if (!this.enabled) return;
            if (this.layers.length > 0) {

                const expPDF = useExportPDF();
                const pdf = expPDF.createPDF();
                expPDF.addText(pdf, "VEXT Annotation Report", 8);
                expPDF.addVerticalSpace(pdf, 5);
                expPDF.addText(pdf, ""+this.activeLayer, 20)

                if (canvasOnly && _CANVAS !== null) {
                    const bg = _CANVAS.backgroundColor;
                    _CANVAS.setBackgroundColor("rgba(255,255,255,1)")
                    _CANVAS.requestRenderAll();
                    expPDF.addImage(pdf, _CANVAS.toDataURL({
                        format: 'jpeg',
                        quality: 0.9
                    }));
                    _CANVAS.setBackgroundColor(bg)
                    _CANVAS.requestRenderAll();
                } else {
                    const node = _CONTENT !== null ? _CONTENT : _CANVAS.wrapperEl.parentNode.parentNode;
                    const rect = node.getBoundingClientRect();
                    await expPDF.addImageFromHTML(
                        pdf,
                        node,
                        rect.width,
                        rect.height
                    );
                }
                if (this.currentLayer.comments.length > 0) {
                    expPDF.addText(pdf, "Comments", 16)
                    this.currentLayer.comments.forEach(c => expPDF.addText(pdf, c));
                }

                const expZIP = useExportZIP();
                const zip = expZIP.createZIP();
                expZIP.addFile(zip, "report.pdf", expPDF.outputPDF(pdf))
                expZIP.addObjectAsFile(zip, "layer.json", this.exportLayer())
                expZIP.addObjectAsFile(zip, "state.json", this.currentLayer.state)
                const now = new Date();
                const datetime = now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()+'-'+
                    now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds();
                expZIP.downloadZIP(zip, name !== null ? name : `vext_${datetime}_${this.activeLayer}`);
            } else {
                throw new Error(`no layer to include in archive`)
            }
        }
    },
};

const useVextNote = defineStore("vext-note", vextNoteStore);

export { useVextNote, vextNoteStore };