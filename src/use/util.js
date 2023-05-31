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
            icon: "mdi-cursor-move",
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
            icon: "mdi-cog",
            action: "mode",
            value: "settings",
        },{
            id: "mode-settings",
            icon: "mdi-cogs",
            action: "settings",
            value: "",
        },{
            id: "accept",
            icon: "mdi-check",
            action: "accept",
            color: "success",
            value: "accept",
            forceClose: true,
        },{
            id: "accept_ignore",
            icon: "mdi-check-all",
            action: "accept_ignore",
            color: "success",
            value: "accept_ignore",
            forceClose: true,
        },{
            id: "cancel",
            icon: "mdi-close-circle-outline",
            action: "cancel",
            color: "error",
            value: "cancel",
            forceClose: true,
        },{
            id: "cancel_ignore",
            icon: "mdi-close-circle-multiple-outline",
            action: "cancel_ignore",
            color: "error",
            value: "cancel_ignore",
            forceClose: true,
        },{
            id: "undo",
            icon: "mdi-undo",
            action: "undo",
            color: "default",
            value: "undo",
            forceOpen: true,
        },{
            id: "redo",
            icon: "mdi-redo",
            action: "redo",
            color: "default",
            value: "redo",
            forceOpen: true,
        }
    ];
}

function colorContrast(color) {
    let hex = (color[0] === '#') ? color.substring(1, 7) : color;

    // Convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // By this point, it should be 6 characters
    if (hex.length !== 6) {
        return 'text-black';
    }

    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    // Return light or dark class based on contrast calculation
    return r * 0.299 + g * 0.587 + b * 0.114;
}


function colorContrastColor(color) {
    switch (color) {
        case "success":
        case "error":
        case "info":
        case "default":
            return 'text-black';
        default:
            const contrast = colorContrast(color);
            // return light or dark class based on contrast calculation
            return contrast > 0.186 ? 'black' : 'white';
    }
}

function colorContrastTextClass(color) {
    switch (color) {
        case "success":
        case "error":
        case "info":
        case "default":
            return 'text-black';
        default:
            const contrast = colorContrast(color);
            // return light or dark class based on contrast calculation
            return contrast > 0.186 ? 'text-black' : 'text-white';
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

function getElementCoords(element, x, y) {
    const rect = element.getBoundingClientRect();
    const left = x < rect.x ? 0 : (x > rect.x+rect.width ? rect.width : x - rect.x)
    const top = y < rect.y ? 0 : (y > rect.y+rect.height ? rect.height : y - rect.y)
    return [left, top]
}

export {
    isFabric, parseAccessor, createFabricObject,
    pointerMenuOptions,
    getObjTransform,
    colorContrast,
    colorContrastColor,
    colorContrastTextClass,
    getElementCoords,
};