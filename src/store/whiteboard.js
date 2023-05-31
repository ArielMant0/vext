import { defineStore } from "pinia"
import { useVextNote } from "./note";
import html2canvas from "html2canvas";
import WhiteBoardLayer from "@/use/whiteboard-layer";
import { ACTIONS, MODES } from "@/use/enums";
import { useVextSettings } from "@/store/settings";
import { useVextHistory } from "@/store/history";
import { fabric } from 'fabric';
import { createFabricObject, getObjTransform } from "@/use/util";
import { toRaw } from "vue";
import { v4 as uuidv4 } from 'uuid';

const vextWhiteboard = {
    state: () => {
        return {
            canvas: null,

            mode: MODES.EDIT,
            enabled: false,

            modified: {},
            layers: {},
            selectedLayer: "",

            paths: [],

            border: {
                color: "lightgrey",
                size: 1,
            }
        };
    },

    actions: {

        setMode(mode, record=true) {
            if (mode !== this.mode) {

                if (record) {
                    const history = useVextHistory();
                    const prev = this.mode;
                    history.do("set whiteboard mode to " + mode,
                        this.setMode.bind(this, mode, false),
                        this.setMode.bind(this, prev, false),
                    );
                }

                if (this.mode && MODES.EDIT && this.canvas.getActiveObject()) {
                    this.canvas.discardActiveObject()
                    this.canvas.requestRenderAll();
                }

                this.mode = mode;
                this.canvas.isDrawingMode = this.mode === MODES.BRUSH;
            }
        },

        setCanvas(canvas) {
            this.canvas = canvas;
            const brush = new fabric.PencilBrush(canvas);
            const settings = useVextSettings();
            brush.decimate = settings.brushDecimation;
            brush.color = settings.color;
            brush.width = settings.brushSize;
            canvas.freeDrawingBrush = brush;

            settings.on(ACTIONS.BRUSH_SIZE, () => {
                this.canvas.freeDrawingBrush.width = settings.brushSize;
            });
            settings.on(ACTIONS.BRUSH_DECIMATE, () => {
                this.canvas.freeDrawingBrush.decimate = settings.brushDecimation;
            });
            settings.on(ACTIONS.COLOR_CHANGE, () => {
                this.canvas.freeDrawingBrush.color = settings.color;
            });
            settings.on(ACTIONS.COLOR_VALUE, () => {
                this.canvas.freeDrawingBrush.color = settings.color;
            });

            canvas
                .on("path:created", ({ path }) => {
                    this.addPath(path, false, true);
                    if (this.mode === MODES.BRUSH) {
                        if (!settings.pointerMenu) {
                            // obj already part of the canvas
                            this.addPath(path, false, true)
                        } else {
                            this.canvas.remove(path)
                        }
                    } else {
                        this.canvas.remove(path)
                    }
                })
                .on("object:modified", ({ target, transform }) => {
                    if (target.uuid && this.mode === MODES.EDIT) {
                        const history = useVextHistory();
                        history.do("modify whiteboard annotation",
                            this.modifyObject.bind(this, target.uuid, getObjTransform(transform), false),
                            this.modifyObject.bind(this, target.uuid, getObjTransform(transform.original), false)
                        );
                    }
                })
        },

        addPath(path, addToCanvas=true, record=true) {
            if (!this.enabled) return;
            if (addToCanvas) {
                this.canvas.add(path);
            }
            path.set("uuid", uuidv4());
            this.paths.push(path);

            if (record) {
                const history = useVextHistory();
                history.do("added path on whiteboard",
                    this.addPathFromJSON.bind(this, path.toJSON(["uuid"]), false),
                    this.removePath.bind(this, null, false)
                );
            }
        },

        addPathFromJSON(json, record=true) {
            if (!this.enabled) return;

            const path = createFabricObject("path", json);
            this.canvas.add(path);
            this.paths.push(path);

            if (record) {
                const history = useVextHistory();
                history.do("added path on whiteboard",
                    this.addPathFromJSON.bind(this, json, false),
                    this.removePath.bind(this, null, false)
                );
            }
        },

        removePath(index=null, record=true) {
            if (!this.enabled || this.paths.length === 0) return;

            index = index === 0 ? this.paths.length-1 : index;
            if (index < 0 || index >= this.paths.length) return;

            const path = this.paths.pop();
            this.canvas.remove(toRaw(path))

            if (record) {
                const history = useVextHistory();
                history.do("removed path on whiteboard",
                    this.removePath.bind(this, index, false),
                    this.addPathFromJSON.bind(this, path.toJSON(["uuid"]), false),
                );
            }
        },

        modifyObject(uuid, transform, record=true) {

            const obj = this.itemFromUUID(uuid);
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

                this.canvas.requestRenderAll();
            }
        },

        itemFromUUID(uuid) {
            const path = this.paths.find(d => d.uuid === uuid);
            if (path) return path;

            for (const l in this.layers) {
                const item = this.layers[l].item(uuid)
                if (item) {
                    return item;
                }
            }

            return null;
        },

        setBrushColor(color) {
            if (this.canvas) {
                this.canvas.freeDrawingBrush.color = color;
            }
        },

        setBrushSize(size) {
            if (this.canvas) {
                this.canvas.freeDrawingBrush.width = size;
            }
        },

        setCanvasZIndex(value) {
            if (this.canvas) {
                this.canvas.wrapperEl.style.zIndex = value;
                this.canvas.upperCanvasEl.style.zIndex = value;
                this.canvas.lowerCanvasEl.style.zIndex = value
            }
        },

        resizeCanvas(width, height) {
            if (this.canvas) {
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
            }
        },

        async enable() {
            const note = useVextNote();
            const proms = [];
            note.userLayers.forEach(l => {
                if (!this.modified[l.id]) {
                    proms.push(this.addLayerImage(l))
                } else if (l.modified !== this.modified[l.id]) {
                    proms.push(this.updateLayerImage(l))
                }
            })
            return Promise.all(proms).then(() => {
                this.enabled = true
                this.canvas.renderAll()
            })
        },

        disable() {
            this.enabled = false;
        },

        selectLayer(id) {
            if (this.layers[id]) {
                this.selectedLayer = id;
                this.layers[id].select(this.canvas);
            }
        },

        deleteActiveObject() {
            const obj = this.canvas.getActiveObject();
            if (this.enabled && obj && obj.type === "path") {
                this.canvas.discardActiveObject();
                this.canvas.remove(obj);
            }
        },

        async addLayerImage(layer) {
            const id = layer.id;
            const note = useVextNote();
            const node = note.canvas.wrapperEl.parentNode.parentNode;
            const rect = node.getBoundingClientRect();
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            this.modified[id] = layer.modified;

            return html2canvas(node, { width: w, height: h })
                .then(canvas => {
                    console.debug("adding WhiteBoardLayer for layer " + id)
                    this.layers[id] = new WhiteBoardLayer(
                        id,
                        canvas, {
                            top: 10, left: 10,
                            scaleX: 0.25, scaleY: 0.25,
                            width: w, height: h,
                            stroke: this.border.color,
                            strokeWidth: this.border.size,
                        },
                        layer.comments
                    );
                    this.layers[id].addToCanvas(this.canvas);
                })
        },

        async updateLayerImage(layer) {
            const id = layer.id;
            const note = useVextNote();
            const node = note.canvas.wrapperEl.parentNode.parentNode;
            const rect = node.getBoundingClientRect();
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            this.modified[id] = layer.modified;

            return html2canvas(node, { width: w, height: h })
                .then(canvas => {
                    console.debug("updating WhiteBoardLayer for layer " + id)
                    this.layers[id].update(
                        this.canvas,
                        canvas, {
                            top: 10, left: 10,
                            scaleX: 0.25, scaleY: 0.25,
                            width: w, height: h,
                            stroke: this.border.color,
                            strokeWidth: this.border.size,
                        },
                        layer.comments
                    );
                })
        },
    },
}

const useVextWhiteboard = defineStore("vext-whiteboard", vextWhiteboard);

export { useVextWhiteboard, vextWhiteboard };