import { defineStore } from "pinia"
import { useVextHistory } from "@/store/history";
import { isFabric } from '@/use/util';
import { toRaw } from 'vue';
import { useExportPDF } from "@/use/export-pdf";
import { useExportZIP } from "@/use/export-zip";
import EventHandler from "@/use/event-handler";
import { useVextNoteSettings } from "./note-settings";
import { MODES, LAYER_MODES } from "@/use/enums";
import AnnotationLayer from "@/use/annotation-layer";

// https://stackoverflow.com/questions/69881048/cannot-resize-edit-objects-until-i-group-ungroup-them-alpinejs-fabricjs/70564680#70564680
let _CONTENT = null;

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

function getObjTransform(obj) {
    return {
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        originX: obj.originX,
        originY: obj.originY,
        top: obj.top,
        left: obj.left,
    }
}

function getCanvasCoords(canvas, x, y) {
    const rect = canvas.wrapperEl.getBoundingClientRect();
    const left = x < rect.x ? 0 : (x > rect.x+rect.width ? rect.width : x - rect.x)
    const top = y < rect.y ? 0 : (y > rect.y+rect.height ? rect.height : y - rect.y)
    return [left, top]
}

const EVENTS = new EventHandler();

const vextNoteStore = {

    state: () => {
        return {
            enabled: true,
            canvas: null,

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
            return state.layers.filter(d => !d.isPreview);
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
            this.canvas.wrapperEl.style.pointerEvents = value ? null : "none";
            this.canvas.upperCanvasEl.style.pointerEvents = value ? null : "none";
            this.canvas.lowerCanvasEl.style.pointerEvents = value ? null : "none";
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
                layer.width = this.canvas.getWidth();
                layer.height = this.canvas.getHeight();
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
                this.layers[idx].addComment(comment);
                return true;
            }
            return false;
        },

        updateLayerComment(comment, id=null, index=0) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0) {
                this.layers[idx].updateComment(index, comment);
                return true;
            }
            return false;
        },

        removeLayerComment(id=null, index=0) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0) {
                this.layers[idx].removeComment(index);
                return true;
            }
            return false;
        },

        removeLayerComments(id=null) {
            if (!this.enabled) return false;

            id = id === null ? this.activeLayer : id;
            const idx = this.getLayerIndex(id);
            if (idx >= 0) {
                this.layers[idx].removeComments()
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
                this.layers[i0].items.forEach(d => this.layers[i1].items.push(toRaw(d)));
                this.layers[i0].comments.forEach(d => this.layers[i1].comments.push(d));
                this.layers.splice(i0, 1);

                if (idInto == this.activeLayer) {
                    this.layers[i1].items.forEach(d => d.set({
                        visible: true,
                        dirty: true
                    }));
                    this.canvas.requestRenderAll();
                }
            } else {
                throw Error("one of the merge layers does not exist")
            }

        },

        addLayer(state, record=true, id=null, color=null, width=null, height=null, items=[], comments=[], connections={}) {
            if (!this.enabled) return;

            id = id === null ? this.nextID : id;
            color = color === null ? this.nextColor : color;
            width = width === null ? this.canvas.getWidth() : width;
            height = height === null ? this.canvas.getHeight() : height

            const layer = new AnnotationLayer(
                this.canvas,
                id,
                state,
                color,
                width,
                height,
                items,
                comments,
                connections
            );
            this.layers.splice(0, 0, layer);

            if (record) {
                const history = useVextHistory();
                const json = items.map(d => isFabric(d) ? d.toJSON(["uuid"]) : d);
                history.do("add layer " + id,
                    this.addLayer.bind(this, state, false, id, color, width, height, json, comments, connections),
                    this.removeLayer.bind(this, id, false)
                );
            }

            this.LAYER_ID_IDX++;
            this.setActiveLayer(id, false);
        },

        removeLayer(id, record=true) {
            if (!this.enabled) return;

            if (id === undefined) { id = this.activeLayer }
            let idx = this.getLayerIndex(id)
            if (idx >= 0) {

                const layer = this.layers.splice(idx, 1)[0];
                const repr = layer.remove(this.canvas, record);

                if (record) {
                    const history = useVextHistory();
                    history.do("remove layer "+id,
                        this.removeLayer.bind(this, id, false),
                        this.addLayer.bind(this,
                            repr.state, false, repr.id,
                            repr.color, repr.width, repr.height,
                            repr.items, repr.comments, repr.connections
                        )
                    )
                }

                const index = this.getLayerIndex(this.activeLayer);
                if (index < 0) {
                    this.setActiveLayer(this.layers.length === 0 ? null : this.layers[0].id, false);
                }
            } else {
                throw new Error(`layer ${id} does not exist`)
            }
        },

        removeEmptyLayers(record=true) {
            if (!this.enabled) return;

            if (record) {
                const toRemove = this.layers
                    .filter(d => d.empty())
                    .map(d => d.remove(this.canvas, record))

                const history = useVextHistory();
                history.do("remove empty layers (no annotations)",
                    this.removeEmptyLayers.bind(this, false),
                    () => {
                        toRemove.forEach(d => this.addLayer(
                            d.state, false, d.id,
                            d.color, d.width, d.height,
                            d.items, d.comments, d.connections
                        ));
                    }
                )
            }

            this.layers = this.layers.filter(d => !d.empty());
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
                this.canvas.requestRenderAll();
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
                layer.updateObjects("opacity", value)

                if (render) this.canvas.requestRenderAll();

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
                layer.setVisibility(visible)

                if (id === this.activeLayer && !visible) this.canvas.discardActiveObject();
                if (render) this.canvas.requestRenderAll();

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

                if (this.canvas.getActiveObject() !== null) {
                    this.canvas.discardActiveObject();
                    this.canvas.requestRenderAll();
                }

                switch (mode) {
                    case MODES.BRUSH:
                        this.canvas.isDrawingMode = true;
                        this.enablePointerEvents(true);
                        break;
                    case MODES.LAYER:
                    case MODES.CONNECT:
                    case MODES.WHITEBOARD:
                    case MODES.SETTINGS:
                        this.canvas.isDrawingMode = false;
                        this.enablePointerEvents(false);
                        break;
                    default:
                        this.canvas.isDrawingMode = false;
                        this.enablePointerEvents(true);
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

        addObject(obj, layer=null, addToCanvas=true, record=true) {
            if (!this.enabled) return null;

            if (this.layerMode === LAYER_MODES.ANNOTATE) {
                // no state available
                if (this.currentState === null) {
                    if (!addToCanvas) {
                        this.canvas.remove(obj);
                    }
                    return null;
                }

                const l = this.layerFromStateHash(this.currentState.hash);
                if (!l) {
                    this.addLayer(this.currentState, false)
                }
            }

            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const repr = this.layers[index].addObject(obj, addToCanvas ? this.canvas : null, record)

            if (record) {
                const history = useVextHistory();
                history.do("add object of type "+obj.type,
                    this.addObjectFromJSON.bind(this, repr, this.activeLayer, false),
                    this.removeLastObject.bind(this, this.activeLayer, false),
                );
            }

            this.emit("annotation:created", obj)

            return obj.uuid;
        },

        addObjects(objs, layer=null, addToCanvas=true, record=true) {
            if (!this.enabled) return null;

            if (this.layerMode === LAYER_MODES.ANNOTATE && this.currentState !== null) {
                const l = this.layerFromStateHash(this.currentState.hash);
                if (!l) {
                    this.addLayer(this.currentState, false)
                }
            }

            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const repr = this.layers[index].addObjects(objs, addToCanvas ? this.canvas : null, record)

            if (record) {
                const history = useVextHistory();
                history.do(`add ${objs.length} objects`,
                    this.addObjectsFromJSON.bind(this, repr, this.activeLayer, false),
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
            const repr = this.layers[index].addObjectFromJSON(json, this.canvas, false)

            if (record) {
                const history = useVextHistory();
                history.do("add object of type "+json.type,
                    this.addObjectFromJSON.bind(this, repr, layer, false),
                    this.removeLastObject.bind(this, layer, false),
                );
            }

            this.emit("annotation:created", repr)

            return record ? repr.annotation.uuid : json.uuid;
        },

        addObjectsFromJSON(json, layer=null, record=true) {

            if (!this.enabled) return null;

            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const repr = this.layers[index].addObjectsFromJSON(json, this.canvas, record)

            if (record) {
                const history = useVextHistory();
                history.do(`add ${json.length} objects`,
                    this.addObjectsFromJSON.bind(this, json, layer, false),
                    this.removeObjects.bind(this, repr, layer, false),
                );
            }

            this.emit("annotation:created", repr)

            return record ? repr.map(d => d.annotation.uuid) : json.map(d => d.uuid);
        },

        removeObject(uuid, layer=null, record=true) {

            if (!this.enabled) return null;

            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const repr = this.layers[index].removeObject(uuid, this.canvas, record);

            if (record && repr) {
                const history = useVextHistory();
                history.do("remove object of type "+repr.type,
                    this.removeLastObject.bind(this, layer, false),
                    this.addObjectFromJSON.bind(this, repr, layer, false),
                );
            }
        },

        removeObjects(uuids, layer=null, record=true) {

            if (!this.enabled) return null;

            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const repr = this.layers[index].removeObjects(uuids, this.canvas, record);

            if (record && repr) {
                const history = useVextHistory();
                history.do(`remove ${uuids.length} objects`,
                    this.removeObjects.bind(this, uuids, layer, false),
                    this.addObjectsFromJSON.bind(this, repr, layer, false),
                );
            }
        },

        removeLastObject(layer=null, record=true) {

            if (!this.enabled) return null;

            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const repr = this.layers[index].removeLastObject(this.canvas, record);

            if (record && repr) {
                const history = useVextHistory();
                history.do("remove object of type "+repr.type,
                    this.removeLastObject.bind(this, layer, false),
                    this.addObjectFromJSON.bind(this, repr, layer, false),
                );
            }
        },

        modifyObject(uuid, transform, id=null, record=true) {

            id === null ? this.activeLayer : id
            const index = this.getLayerIndex(id === null ? this.activeLayer : id);
            if (index >= 0) {
                const obj = this.layers[index].item(uuid);
                if (obj) {

                    if (record) {
                        const history = useVextHistory();
                        const original = getObjTransform(obj);
                        history.do("modify annotation",
                            this.modifyObject.bind(this, uuid, transform, id, false),
                            this.modifyObject.bind(this, uuid, original, id, false),
                        );
                    }

                    obj.set(transform);
                    obj.set("dirty", true);

                    this.layers[index].updateConnections(uuid)

                    this.canvas.requestRenderAll();

                }
            }
        },

        setActiveObject(uuid, layer=null) {

            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            if (index >= 0) {
                return this.layers[index].setActiveObject(uuid, this.canvas);
            }

            return false;
        },

        getActiveObject() {
            return this.canvas.getActiveObject();
        },

        discardActiveObject() {
            this.canvas.discardActiveObject();
        },

        deleteActiveObject(record=true) {
            if (!this.enabled) return;
            const obj = this.canvas.getActiveObject();
            if (obj) {
                // remove highlight
                if (obj.isHover) {
                    obj.set({
                        backgroundColor: obj.prevBackground,
                        isHover: false,
                        dirty: true
                    });
                }
                this.canvas.discardActiveObject();
                // group selection
                if (obj.type === "activeSelection") {
                    const uuids = obj._objects.map(d => d.uuid)
                    this.removeObjects(uuids, this.activeLayer, record);
                } else {
                    this.removeObject(obj.uuid, this.activeLayer, record);
                }

            }
        },

        layerFromItem(item) {
            return this.layers.find(d => d.hasItem(item.uuid));
        },

        resizeCanvas(width, height) {
            if (this.canvas) {
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
            }
        },

        setCanvasZIndex(value) {
            if (this.canvas) {
                this.canvas.wrapperEl.style.zIndex = value;
                this.canvas.upperCanvasEl.style.zIndex = value;
                this.canvas.lowerCanvasEl.style.zIndex = value
            }
        },

        setContentNode(node) {
            _CONTENT = node;
        },

        setCanvas(canvas) {
            this.canvas = canvas;
            this.enablePointerEvents(false);
            const settings = useVextNoteSettings();
            settings.setCanvas(canvas);

            canvas
                .on("path:created", (obj) => {
                    if (this.enabled && this.mode === MODES.BRUSH) {
                        const settings = useVextNoteSettings();
                        if (!settings.pointerMenu) {
                            // obj already part of the canvas
                            this.addObject(obj.path, null, false)
                            this.emit("pointer-menu", "drawing")
                        } else {
                            this.canvas.remove(obj.path)
                        }
                    } else {
                        this.canvas.remove(obj.path)
                    }
                })
                .on("selection:created", () => {
                    this.activeObject = parseObject(this.canvas.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                    this.emit("selection:created")
                })
                .on("selection:updated", () => {
                    this.activeObject = parseObject(this.canvas.getActiveObject(), this.currentLayer);
                    this.activeObjectUUID = this.activeObject.uuid;
                    this.emit("selection:updated")
                })
                .on("selection:cleared", () => {
                    this.activeObject = null;
                    this.activeObjectUUID = null;
                    this.emit("selection:cleared")
                })
                .on("object:modified", ({ target, transform }) => {
                    if (target.get("uuid") === this.activeObjectUUID) {
                        this.activeObject = parseObject(target, this.currentLayer);
                        if (this.mode === MODES.EDIT) {
                            const history = useVextHistory();
                            history.do("modify annotation",
                                this.modifyObject.bind(this, this.activeObjectUUID, getObjTransform(transform), this.activeLayer, false),
                                this.modifyObject.bind(this, this.activeObjectUUID, getObjTransform(transform.original), this.activeLayer, false)
                            )
                        }
                        if (this.currentLayer.updateConnections(this.activeObjectUUID)) {
                            this.canvas.renderAll();
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
                                this.canvas.requestRenderAll();
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
                                this.canvas.requestRenderAll();
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
            return this.layers.find(l => !l.isPreview && l.matchesStateHash(hash))
        },

        setState(state) {
            this.currentState = state;
            if (this.previewLayerID === null) {
                this.addLayer(state, false);
                this.previewLayerID = this.activeLayer;
                this.currentLayer.setPreview(true);
            } else {
                const layer = this.getLayer(this.previewLayerID);
                if (layer) {
                    layer.updateState(state, this.canvas.getWidth(), this.canvas.getHeight());
                }
            }
        },

        selectPreviewLayer() {
            if (this.previewLayerID === null) {
                if (this.currentState !== null) {
                    this.addLayer(this.currentState, false);
                    this.previewLayerID = this.activeLayer
                    this.currentLayer.setPreview(true);
                } else {
                    // TODO: do sth!?
                    return;
                }
            }
            this.setActiveLayer(this.previewLayerID, false);
        },

        addConnection(uuid, id=null, record=true) {

            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || !layer.hasItems()) return;

            const repr = layer.addConnection(
                this.canvas, uuid,
                this.connectLocation,
                toRaw(this.connectObject),
                record
            );

            this.connectObject = null;

            if (record && repr) {
                const history = useVextHistory();
                history.do(
                    "add a connection",
                    this.addConnectionFromJSON.bind(this, uuid, repr, id, false),
                    this.removeLastConnection.bind(this, uuid, id, false),
                );
            }

            this.emit("connect:created", repr);
            if (record) this.emit("pointer-menu", "connection")
        },

        addConnectionFromJSON(uuid, json, id=null, record=true) {
            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || !layer.hasItems()) return;

            const repr = layer.addConnectionFromJSON(
                this.canvas, uuid,
                json, record
            );

            if (record && repr) {
                const history = useVextHistory();
                history.do(
                    "add a connection",
                    this.addConnectionFromJSON.bind(this, uuid, json, id, false),
                    this.removeLastConnection.bind(this, uuid, id, false),
                );
            }

            this.emit("connect:created", repr);
            if (record) this.emit("pointer-menu", "connection")
        },

        removeLastConnection(uuid, id=null, record=true) {
            this.removeConnectionAtIndex(uuid, null, id, record);
        },

        removeConnectionAtIndex(uuid, index, id=null, record=true) {
            id = id === null ? this.activeLayer : id;
            const layer = this.getLayer(id);
            if (layer === null || layer.items.length === 0) return;

            const repr = layer.removeConnection(this.canvas, uuid, index, record);

            if (record && repr) {
                const history = useVextHistory();
                history.do(
                    "remove latest connection",
                    this.removeConnectionAtIndex.bind(this, uuid, index, id, false),
                    this.addConnectionFromJSON.bind(this, uuid, repr, id, false),
                );
            }

            this.emit("connect:removed", repr);
        },

        startConnect(element, x, y) {
            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.items.length === 0) return;

            const coords = getCanvasCoords(this.canvas, x, y)
            this.connectObject = element;
            this.connectLocation = coords;
            this.emit("connect:start", {
                x: coords[0], y: coords[1], source: element
            });

            this.enablePointerEvents(true);
        },

        moveConnect(x, y) {
            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.items.length === 0) return;

            const coords = getCanvasCoords(this.canvas, x, y)
            this.emit("connect:move", { x: coords[0], y: coords[1] });
        },

        endConnect(x, y) {
            this.enablePointerEvents(false);

            if (this.currentLayer === null || this.mode !== MODES.CONNECT ||
                this.currentLayer.items.length === 0) return;

            this.canvas.discardActiveObject();

            const coords = getCanvasCoords(this.canvas, x, y)
            const point = new fabric.Point(coords[0], coords[1]);
            const annotation = this.currentLayer.findItem(d => d.containsPoint(point));

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
                return layer.toJSON()
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

                if (canvasOnly && this.canvas !== null) {
                    const bg = this.canvas.backgroundColor;
                    this.canvas.setBackgroundColor("rgba(255,255,255,1)")
                    this.canvas.requestRenderAll();
                    expPDF.addImage(pdf, this.canvas.toDataURL({
                        format: 'jpeg',
                        quality: 0.9
                    }));
                    this.canvas.setBackgroundColor(bg)
                    this.canvas.requestRenderAll();
                } else {
                    const node = _CONTENT !== null ? _CONTENT : this.canvas.wrapperEl.parentNode.parentNode;
                    const rect = node.getBoundingClientRect();
                    await expPDF.addImageFromHTML(
                        pdf,
                        node,
                        rect.width,
                        rect.height
                    );
                }
                if (this.currentLayer.hasComments()) {
                    expPDF.addText(pdf, "Comments", 16)
                    this.currentLayer.forComment(c => expPDF.addText(pdf, c));
                }

                const expZIP = useExportZIP();
                const zip = expZIP.createZIP();
                expZIP.addFile(zip, "report.pdf", expPDF.outputPDF(pdf))
                expZIP.addObjectAsFile(zip, `layer_${this.activeLayer}.json`, this.exportLayer())
                expZIP.addObjectAsFile(zip, `state_${this.activeLayer}.json`, this.currentLayer.state)
                const now = new Date();
                const datetime = now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()+'-'+
                    now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds();
                expZIP.downloadZIP(zip, name !== null ? name : `VEXT_${datetime}_${this.activeLayer}`);
            } else {
                throw new Error("no layer to include in archive")
            }
        }
    },
};

const useVextNote = defineStore("vext-note", vextNoteStore);

export { useVextNote, vextNoteStore };