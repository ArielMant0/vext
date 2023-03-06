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
    }
}

export { parseAccessor, createFabricObject };