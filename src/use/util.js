import { fabric } from 'fabric';

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
        },{
            id: "redo",
            icon: "mdi-redo",
            action: "redo",
            color: "default",
        },{
            id: "accept",
            icon: "mdi-check",
            action: "accept",
            color: "success",
        },{
            id: "accept_ignore",
            icon: "mdi-check-all",
            action: "accept_ignore",
            color: "success",
        },{
            id: "cancel",
            icon: "mdi-close-circle-outline",
            action: "cancel",
            color: "error",
        },{
            id: "cancel_ignore",
            icon: "mdi-close-circle-multiple-outline",
            action: "cancel_ignore",
            color: "error",
        },{
            id: "brush",
            icon: "mdi-draw",
            action: "mode"
        },{
            id: "shape",
            icon: "mdi-shape",
            action: "mode"
        },{
            id: "edit",
            icon: "mdi-cursor-pointer",
            action: "mode"
        },{
            id: "layer",
            icon: "mdi-layers",
            action: "mode"
        },{
            id: "connect",
            icon: "mdi-connection",
            action: "mode"
        },{
            id: "settings",
            icon: "mdi-cog",
            action: "settings",
            color: "default",
        },
    ];
}

export { parseAccessor, createFabricObject, pointerMenuOptions };