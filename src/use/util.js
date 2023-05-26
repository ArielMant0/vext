import { fabric } from 'fabric';

function isFabric(d) {
    return typeof d === "object" && d.set !== undefined && d.get !== undefined
}

function parseAccessor(item) {
    switch (typeof item) {
        case 'string':
            return d => d[item]
        case 'number':
            return _ => item
        default:
            return item;
    }
}

function createFabricObject(type, options) {
    switch(type) {
        case "circle":
            return new fabric.Circle(options);
        case "rect":
            return new fabric.Rect(options);
        case "triangle":
            return new fabric.Triangle(options);
        case "text":
            return new fabric.Text(options);
        case "path":
            return new fabric.Path(options.path, options);
        case "line":
            return new fabric.Line([options.x1, options.y1, options.x2, options.y2], options);
    }
}

function pointerMenuOptions () {
    return [
        {
            id: "undo",
            icon: "mdi-undo",
            action: "undo",
            color: "default",
            value: "undo",
        },{
            id: "redo",
            icon: "mdi-redo",
            action: "redo",
            color: "default",
            value: "redo",
        },{
            id: "accept",
            icon: "mdi-check",
            action: "accept",
            color: "success",
            value: "accept",
        },{
            id: "accept_ignore",
            icon: "mdi-check-all",
            action: "accept_ignore",
            color: "success",
            value: "accept_ignore",
        },{
            id: "cancel",
            icon: "mdi-close-circle-outline",
            action: "cancel",
            color: "error",
            value: "cancel",
        },{
            id: "cancel_ignore",
            icon: "mdi-close-circle-multiple-outline",
            action: "cancel_ignore",
            color: "error",
            value: "cancel_ignore",
        },{
            id: "brush",
            icon: "mdi-draw",
            action: "mode",
            value: "brush",
        },{
            id: "shape",
            icon: "mdi-shape",
            action: "mode",
            value: "shape",
        },{
            id: "edit",
            icon: "mdi-cursor-pointer",
            action: "mode",
            value: "edit",
        },{
            id: "layer",
            icon: "mdi-layers",
            action: "mode",
            value: "layer",
        },{
            id: "connect",
            icon: "mdi-connection",
            action: "mode",
            value: "connect",
        },{
            id: "settings",
            icon: "mdi-cogs",
            action: "settings",
            color: "default",
            value: "",
        },
    ];
}

export { isFabric, parseAccessor, createFabricObject, pointerMenuOptions };