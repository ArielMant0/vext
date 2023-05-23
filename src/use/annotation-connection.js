import { fabric } from "fabric";
import { toRaw } from 'vue';

export default class AnnotationConnection {

    constructor(location, annotation, data, color="#000000") {
        this.data = data;
        this.location = location.slice();
        const [x, y] = AnnotationConnection.getClosestPoint(
            location[0],
            location[1],
            annotation.getBoundingRect(true)
        );
        this.line = new fabric.Line(
            [location[0], location[1], x, y], {
            stroke: color,
            strokeWidth: 1,
            strokeUniform: true,
            opacity: 1,
            selectable: false,
            hoverCursor: "default"
        });
    }

    static fromJSON(json, annotation) {
        return new AnnotationConnection(
            json.location,
            annotation,
            json.data,
            json.line.stroke
        )
    }

    // TODO: also consider corners
    static getClosestPoint(x, y, rect) {
        const left = Math.sqrt(Math.pow(x - rect.left, 2) + Math.pow(y - (rect.top+rect.height*0.5), 2));
        const top = Math.sqrt(Math.pow(x - (rect.left+rect.width*0.5), 2) + Math.pow(y - rect.top, 2));
        const right = Math.sqrt(Math.pow(x - (rect.left+rect.width), 2) + Math.pow(y - (rect.top+rect.height*0.5), 2));
        const bot = Math.sqrt(Math.pow(x - (rect.left+rect.width*0.5), 2) + Math.pow(y - (rect.top+rect.height), 2));

        if (left <= right && left <= top && left <= bot) return [rect.left, rect.top + rect.height * 0.5];
        if (right <= left && right <= top && right <= bot) return [rect.left + rect.width, rect.top + rect.height * 0.5];
        if (top <= left && top <= right && top <= bot) return [rect.left + rect.width * 0.5, rect.top];
        return [rect.left+rect.width*0.5, rect.top+rect.height]
    }


    toJSON() {
        return {
            location: this.location,
            path: this.line.toJSON(),
            data: this.data,
        }
    }

    addToCanvas(canvas) {
        canvas.add(toRaw(this.line));
    }

    removeFromCanvas(canvas) {
        canvas.remove(toRaw(this.line));
    }

    updateLocation(annotation) {
        const [x, y] = AnnotationConnection.getClosestPoint(
            this.location[0],
            this.location[1],
            annotation.getBoundingRect(true, true)
        );
        this.line.set({ x2: x, y2: y, dirty: true });
        this.line.setCoords();
    }
}