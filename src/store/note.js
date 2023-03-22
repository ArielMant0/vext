import { defineStore } from "pinia"
import { useVextHistory } from "@/store/history";
import { createFabricObject } from '@/use/util';
import { toRaw } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const TOOLS = Object.freeze({
    BRUSH: "brush",
    EDIT: "edit",
    SHAPE: "shape",
    LAYER: "layer",
})
const LAYER_MODES = Object.freeze({
    ANNOTATE: "on annotation",
    STATE: "on state change",
    MANUAL: "manual"
});
// https://stackoverflow.com/questions/69881048/cannot-resize-edit-objects-until-i-group-ungroup-them-alpinejs-fabricjs/70564680#70564680
let _CANVAS = null;

function setCanvasPointerEvents(enable) {
    _CANVAS.wrapperEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.upperCanvasEl.style.pointerEvents = enable ? null : "none";
    _CANVAS.lowerCanvasEl.style.pointerEvents = enable ? null : "none";
}
function canSelect(tool) {
    switch (tool) {
        case TOOLS.BRUSH:
        case TOOLS.LAYER:
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

const vextNoteStore = {

    state: () => {
        return {
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
            activeObject: {},

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
        swatch: (state) => {
            const l = state.layers.length;
            const array = []
            for (let i = 0; i < state.defaultColors.length; i+=5) {
                array.push(state.defaultColors.slice(i, i+5));
            }
            for (let i = 0; i < l; i+=5) {
                array.push(state.layers.slice(i, i+5).map(d => d.color));
            }
            return array
        },

        nextColor: (state) => state.defaultColors[state.layers.length % state.defaultColors.length],
        nextID: (state) => "layer " + state.LAYER_ID_IDX,

    },

    actions: {

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
            } else {
                this.addLayer(state, true)
            }
        },

        addLayer(state, record=true, id=null, color=null, items=[]) {
            id = id === null ? this.nextID : id;
            color = color === null ? this.nextColor : color;

            if (record) {
                const history = useVextHistory();
                const json = items.map(d => d.toJSON("uuid"));
                history.do("add layer " + id,
                    this.addLayer.bind(this, false, id, color, json),
                    this.removeLayer.bind(this, id, false)
                )
            }

            this.layers.splice(0, 0, {
                id: id,
                color: color,
                visible: true,
                opacity: 1,
                group: items,
                time: new Date(Date.now()),
                state: state
            });
            // add items
            if (items.length > 0) {
                items.forEach(item => {
                    if (typeof item === "string") {
                        const obj = createFabricObject(item.type, item);
                        obj.set("opacity", 1);
                        obj.set("visible", true)
                        _CANVAS.add(obj)
                    } else if (typeof item === "object") {
                        item.set("opacity", 1);
                        item.set("visible", true)
                        item.set("uuid", uuidv4())
                        _CANVAS.add(toRaw(item))
                    }
                })
            }

            this.LAYER_ID_IDX++;
            this.setActiveLayer(id, false);
        },

        removeLayer(id, record=false) {
            if (id === undefined) { id = this.activeLayer }
            let idx = this.getLayerIndex(id)
            if (idx >= 0) {

                const item = this.layers.splice(idx, 1)[0];

                if (record) {
                    const history = useVextHistory();
                    const items = item.group.map(d => d.toJSON("uuid"))
                    history.do("remove layer "+id,
                        this.removeLayer.bind(this, id, false),
                        this.addLayer.bind(this, false, item.id, item.color, items)
                    )
                }

                item.group.forEach(d => _CANVAS.remove(toRaw(d)));

                const index = this.getLayerIndex(this.activeLayer);
                if (index < 0) {
                    this.setActiveLayer(this.layers.length === 0 ? null : this.layers[0].id, false);
                }
            }
        },

        removeEmptyLayers() {
            this.layers = this.layers.filter(d => d.group.length > 0);
            const index = this.getLayerIndex(this.activeLayer);
            if (index < 0) {
                this.setActiveLayer(this.layers.length === 0 ? null : this.layers[0].id, false);
            }
        },

        setActiveLayer(id, record=true) {
            const newIndex = this.getLayerIndex(id);
            if (newIndex >= 0) {
                if (record) {
                    const history = useVextHistory();
                    history.do("change active layer to "+id,
                        this.setActiveLayer.bind(this, id, false),
                        this.setActiveLayer.bind(this, this.activeLayer, false),
                    )
                }
                this.activeLayer = id;
                this.layers.forEach(t => {
                    if (t.visible !== (t.id === id)) {
                        this.setLayerVisibility(t.id === id, t.id, false, false)
                    }
                });
                _CANVAS.requestRenderAll();
            }
        },

        setLayerOpacity(value, id=null, record=true, render=true) {

            if (id === null) id = this.activeLayer

            const layer = this.layers.find(d => d.id === id);
            if (layer && layer.opacity !== value) {
                const prevValue = layer.opacity;
                layer.opacity = value;
                layer.group.forEach(d => d.set("opacity", value))
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

            if (id === null) id = this.activeLayer

            const layer = this.layers.find(d => d.id === id);
            if (layer && layer.visible !== visible) {
                layer.visible = visible;
                layer.group.forEach(d => d.set("visible", visible))

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
                    case TOOLS.SELECT:
                    case TOOLS.LAYER:
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

            if (this.layerMode === LAYER_MODES.ANNOTATE) {
                // no state available
                if (this.currentState === null) {
                    if (!addToCanvas) {
                        _CANVAS.remove(obj);
                    }
                    return;
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
        },

        addObjects(objs, addToCanvas=true, record=true) {

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
        },

        addObjectFromJSON(json, layer=null, record=true) {
            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const obj = createFabricObject(json.type, json);
            this.layers[index].group.push(obj);
            _CANVAS.add(obj);

            if (record) {
                const history = useVextHistory();
                history.do("add object of type "+obj.type,
                    this.addObjectFromJSON.bind(this, json, layer, false),
                    this.removeLastObject.bind(this, layer, false),
                );
            }
        },

        addObjectsFromJSON(json, layer=null, record=true) {
            layer = layer === null ? this.activeLayer : layer;
            const index = this.getLayerIndex(layer)
            const objs = json.map(d => createFabricObject(d.type, d));
            objs.forEach(d => {
                this.layers[index].group.push(d)
                _CANVAS.add(d);
            });

            if (record) {
                const uuids = json.map(d => d.uuid);
                const history = useVextHistory();
                history.do(`add ${objs.length} objects`,
                    this.addObjectsFromJSON.bind(this, json, layer, false),
                    this.removeObjects.bind(this, uuids, layer, false),
                );
            }
        },

        removeObject(uuid, layer=null, record=true) {
            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const idx = this.layers[layerIdx].group.findIndex(obj => obj.get("uuid") === uuid);
            if (idx >= 0) {

                const obj = this.layers[layerIdx].group.splice(idx, 1)[0];
                const objJson = obj.toJSON(["uuid"]);
                _CANVAS.remove(toRaw(obj));

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
            const layerIdx = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            const objs = this.layers[layerIdx].group.filter(d => uuids.includes(d.get("uuid")));
            const objsJson = objs.map(d => d.toJSON(["uuid"]));
            objs.forEach(d => _CANVAS.remove(toRaw(d)));

            if (record) {
                const history = useVextHistory();
                history.do(`remove ${uuids.length} objects`,
                    this.removeObjects.bind(this, uuids, layer, false),
                    this.addObjectsFromJSON.bind(this, objsJson, layer, false),
                );
            }
        },

        removeLastObject(layer=null, record=true) {
            const index = this.getLayerIndex(layer === null ? this.activeLayer : layer);
            if (this.layers[index].group.length > 0) {

                const obj = this.layers[index].group.pop()
                const objJson = obj.toJSON(["uuid"]);
                _CANVAS.remove(toRaw(obj));

                if (record) {
                    const history = useVextHistory();
                    history.do("remove object of type "+obj.type,
                        this.removeLastObject.bind(this, layer, false),
                        this.addObjectFromJSON.bind(this, objJson, layer, false),
                    );
                }
            }
        },

        getCurrentObj() {
            return this.activeObject;
        },

        deleteCurrentObj(record=true) {
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

        setCanvas(canvas) {
            _CANVAS = canvas;
            setCanvasPointerEvents(false);

            canvas
                .on("path:created", (obj) => {
                    if (this.tool === TOOLS.BRUSH) {
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
        }

    },
};

const useVextNote = defineStore("vext-note", vextNoteStore);

export { useVextNote, vextNoteStore };