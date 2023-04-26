import { defineStore } from "pinia"
import { useVextHistory } from "@/store/history";
import { createFabricObject } from '@/use/util';
import { toRaw } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useExportPDF } from "@/use/export-pdf";
import { useExportZIP } from "@/use/export-zip";

const TOOLS = Object.freeze({
    BRUSH: "brush",
    EDIT: "edit",
    SHAPE: "shape",
    LAYER: "layer",
    CONNECT: "connect"
})
const LAYER_MODES = Object.freeze({
    ANNOTATE: "on annotation",
    STATE: "on state change",
    MANUAL: "manual"
});
// https://stackoverflow.com/questions/69881048/cannot-resize-edit-objects-until-i-group-ungroup-them-alpinejs-fabricjs/70564680#70564680
let _CANVAS = null;
let _CONTENT = null;

function setCanvasPointerEvents(enable) {
    _CANVAS.wrapperEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.upperCanvasEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.lowerCanvasEl.style.pointerEvents = enable ? null : "none";
}
function canSelect(tool) {
    switch (tool) {
        case TOOLS.BRUSH:
        case TOOLS.LAYER:
        case TOOLS.CONNECT:
        case TOOLS.SHAPE:
            return false;
        default:
            return true;
    }
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
        path: connection.path.toJSON("uuid"),
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

const vextNoteStore = {

    state: () => {
        return {
            enabled: true,

            color0: "#ff0000",
            color1: "#000000",
            activeColor: 0,
            brushSize: 1,
            brushDecimation: 5,

            tool: TOOLS.LAYER,

            currentState: null,

            layers: [],
            activeLayer: null,
            layerMode: LAYER_MODES.ANNOTATE,
            LAYER_ID_IDX: 0,

            activeObjectUUID: null,
            activeObject: null,

            connectLocation: [0, 0],
            connectObject: null,

            // d3.schemeTableau10
            defaultColors: [
                "#4e79a7",
                "#f28e2c",
                "#e15759",
                "#76b7b2",
                "#59a14f",
                "#edc949",
                "#af7aa1",
                "#ff9da7",
                "#9c755f",
                "#bab0ab",
            ],
        };
    },

    getters: {
        tools: () => TOOLS,
        canvas: () => _CANVAS,
        layerModeValues: () => Object.values(LAYER_MODES),
        layerModeEnum: () => LAYER_MODES,
        currentLayer: (state) => {
            if (state.activeLayer === null) return null;
            return state.layers[state.getLayerIndex(state.activeLayer)]
        },

        color: (state) => state.activeColor === 0 ? state.color0 : state.color1,
        layerColors: (state) => state.layers.map(t => t.color),

        nextColor: (state) => state.defaultColors[state.layers.length % state.defaultColors.length],
        nextID: (state) => "layer " + state.LAYER_ID_IDX,
    },

    actions: {

        enable() {
            this.enabled = true;
        },

        disable() {
            this.enabled = false;
        },

        isUniqueID(id) {
            return !this.layers.some(d => d.id === id);
        },

        getLayerIndex(id) {
            return this.layers.findIndex(d => d.id === id)
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

            const idx = this.getLayerIndex(oldId);
            if (idx >= 0) {
                if (this.isUniqueID(newId)) {
                    this.layers[idx].id = newId;
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
                    this.layers[i1].group.forEach(d => d.set("visible", true))
                    _CANVAS.requestRenderAll();
                }
            } else {
                throw Error("one of the merge layers does not exist")
            }

        },

        addLayer(state, record=false, id=null, color=null, width=null, height=null, items=[], comments=[], connections={}) {
            if (!this.enabled) return;

            id = id === null ? this.nextID : id;
            color = color === null ? this.nextColor : color;
            width = width === null ? _CANVAS.getWidth() : width;
            height = height === null ? _CANVAS.getHeight() : height

            if (record) {
                const history = useVextHistory();
                const json = items.map(d => isFabric(d) ? d.toJSON("uuid") : d);
                history.do("add layer " + id,
                    this.addLayer.bind(this, state, false, id, color, width, height, json, comments, connections),
                    this.removeLayer.bind(this, id, false)
                )
            }

            this.layers.splice(0, 0, {
                id: id,
                color: color,
                visible: true,
                opacity: 1,
                group: [],
                comments: comments,
                connections: connections,
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

            // TODO:
            // for (const uuid in connections) {
            //     connections[uuid].forEach(item => {

            //     })
            // }

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
                    const items = item.group.map(d => d.toJSON("uuid"))
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

        setTool(tool, record=false) {
            if (tool !== this.tool) {
                if (record) {
                    const history = useVextHistory();
                    history.do("change tool to "+tool,
                        this.setTool.bind(this, tool, false),
                        this.setTool.bind(this, this.tool, false)
                    );
                }

                const prev = canSelect(this.tool)
                const next = canSelect(tool);

                if (prev !== next && _CANVAS.getActiveObject() !== null) {
                    _CANVAS.discardActiveObject();
                    _CANVAS.requestRenderAll();
                }

                switch (tool) {
                    case TOOLS.BRUSH:
                        _CANVAS.isDrawingMode = true;
                        setCanvasPointerEvents(true);
                        break;
                    case TOOLS.LAYER:
                    case TOOLS.CONNECT:
                        _CANVAS.isDrawingMode = false;
                        setCanvasPointerEvents(false);
                        break;
                    default:
                        _CANVAS.isDrawingMode = false;
                        setCanvasPointerEvents(true);
                        break;
                }

                this.tool = tool;
            }
        },

        setBrushSize(size, record=true) {
            const newVal = Math.max(size, 1);
            if (record) {
                const history = useVextHistory();
                history.do("set brush size to "+newVal,
                    this.setBrushSize.bind(this, newVal, false),
                    this.setBrushSize.bind(this, this.brushSize, false)
                );
            }
            _CANVAS.freeDrawingBrush.width = newVal;
            this.brushSize = newVal;
        },

        setBrushDecimation(value, record=false) {
            const newVal = Math.max(value, 0);
            if (record) {
                const history = useVextHistory();
                history.do("set brush decimation to "+newVal,
                    this.setBrushDecimation.bind(this, newVal, false),
                    this.setBrushDecimation.bind(this, this.brushDecimation, false)
                );
            }
            _CANVAS.freeDrawingBrush.decimate = newVal;
            this.brushDecimation = newVal;
        },

        selectColor(id, record=true) {
            if (!this.enabled) return;
            const newColor = id === 0 || id === 1 ? id : this.activeColor;
            if (record) {
                const history = useVextHistory();
                history.do("select color to "+(newColor === 0 ? 'primary' : 'secondary'),
                    this.selectColor.bind(this, newColor, false),
                    this.selectColor.bind(this, this.activeColor, false)
                );
            }
            this.activeColor = newColor
            if (this.tool === TOOLS.BRUSH) {
                _CANVAS.freeDrawingBrush.color = this.color;
            }
        },

        setColorPrimary(color, record=true) {
            if (!this.enabled) return;
            if (record) {
                const history = useVextHistory();
                history.do("set primary color to "+color,
                    this.setColorPrimary.bind(this, color, false),
                    this.setColorPrimary.bind(this, this.color0, false),
                );
            }
            this.color0 = color;
            if (this.activeColor === 0) {
                _CANVAS.freeDrawingBrush.color = color
            }
        },

        setColorSecondary(color, record=true) {
            if (!this.enabled) return;
            if (record) {
                const history = useVextHistory();
                history.do("set secondary color to "+color,
                    this.setColorSecondary.bind(this, color, false),
                    this.setColorSecondary.bind(this, this.color1, false),
                );
            }
            this.color1 = color;
            if (this.activeColor === 1) {
                _CANVAS.freeDrawingBrush.color = color
            }
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

            return objs.map(d => d.uuid);
        },

        removeObject(uuid, layer=null, record=true) {

            if (!this.enabled) return null;

            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const idx = this.layers[layerIdx].group.findIndex(obj => obj.get("uuid") === uuid);
            if (idx >= 0) {

                const obj = this.layers[layerIdx].group.splice(idx, 1)[0];
                const objJson = obj.toJSON(["uuid"]);
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
            return this.activeObject;
        },

        deleteActiveObject(record=true) {
            if (!this.enabled) return;
            const obj = _CANVAS.getActiveObject();
            if (obj) {
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

            canvas
                .on("path:created", (obj) => {
                    if (this.enabled && this.tool === TOOLS.BRUSH) {
                        // obj already part of the canvas
                        this.addObject(obj.path, false)
                    }
                })
                .on("selection:created", () => {
                    this.activeObject = parseObject(_CANVAS.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                })
                .on("selection:updated", () => {
                    this.activeObject = parseObject(_CANVAS.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                })
                .on("selection:cleared", () => {
                    this.activeObject = null;
                    this.activeObjectUUID = null;
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
                        switch (this.tool) {
                            case TOOLS.CONNECT:
                            case TOOLS.EDIT:
                                target.set({
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
                        switch (this.tool) {
                            case TOOLS.CONNECT:
                            case TOOLS.EDIT:
                                target.set({
                                    backgroundColor: target.prevBackground,
                                    dirty: true
                                });
                                _CANVAS.requestRenderAll();
                                break;
                        }
                    }
                })
        },

        hasStateHash(hash) {
            return this.layerFromStateHash(hash) !== undefined;
        },

        layerFromStateHash(hash) {
            return this.layers.find(t => t.state.hash === hash)
        },

        setState(state) {
            this.currentState = state;
        },

        addConnection(annotation) {
            if (this.currentLayer === null || this.currentLayer.group.length === 0) return;

            const uuid = annotation.uuid;
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

            if (this.currentLayer.connections[uuid]) {
                this.currentLayer.connections[uuid].push(obj);
            } else {
                this.currentLayer.connections[uuid] = [obj];
            }
        },

        startConnect(element, x, y) {
            if (this.currentLayer === null || this.tool !== TOOLS.CONNECT ||
                this.currentLayer.group.length === 0) return;

            const coords = getCanvasCoords(x, y)
            this.connectObject = element;
            this.connectLocation = coords;
            const connectEvent = new CustomEvent("v-connectstart", { detail: {
                x: coords[0], y: coords[1], source: element
            } });

            setCanvasPointerEvents(true);

            window.dispatchEvent(connectEvent)
        },

        moveConnect(x, y) {
            if (this.currentLayer === null || this.tool !== TOOLS.CONNECT ||
                this.currentLayer.group.length === 0) return;

            const coords = getCanvasCoords(x, y)
            const connectEvent = new CustomEvent("v-connectmove", { detail: {
                x: coords[0], y: coords[1],
            } });

            window.dispatchEvent(connectEvent, coords[0], coords[1])
        },

        endConnect(x, y) {
            setCanvasPointerEvents(false);

            if (this.currentLayer === null || this.tool !== TOOLS.CONNECT ||
                this.currentLayer.group.length === 0) return;

            _CANVAS.discardActiveObject();

            const coords = getCanvasCoords(x, y)
            const point = new fabric.Point(coords[0], coords[1]);
            const annotation = this.currentLayer.group.find(d => d.containsPoint(point));
            if (!annotation) return;

            const connectEvent = new CustomEvent("v-connectend", { detail: {
                x: coords[0], y: coords[1], target: annotation
            } });

            window.dispatchEvent(connectEvent)

            this.addConnection(annotation);
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
                );
            }, false)

            reader.readAsText(file);

        },

        exportLayer() {
            if (!this.enabled) return;
            const layer = this.currentLayer;
            if (layer) {
                return {
                    id: layer.id,
                    width: layer.width,
                    height: layer.height,
                    color: layer.color,
                    state: layer.state,
                    items: layer.group.map(d => d.toJSON("uuid")),
                    comments: layer.comments,
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