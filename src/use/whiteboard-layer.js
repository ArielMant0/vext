import { fabric } from 'fabric';
import { toRaw } from 'vue';

export default class WhiteBoardLayer {

    constructor(id, image=null, imageOptions={}, comments=[], commentsOptions={}) {
        this.id = id;
        this.image = image ? new fabric.Image(image, imageOptions) : null;
        this.comments = comments.map((d, i) => {
            return new fabric.Text(d, Object.assign({
                top: i*20 + 10,
                left: 10,
            }, commentsOptions))
        });

        this.group = null;
    }

    addToCanvas(canvas) {
        this.addImageToCanvas(canvas);
        this.addCommentsToCanvas(canvas);
    }

    removeFromCanvas(canvas, reset=false) {
        if (this.group) {
            canvas.remove(toRaw(this.group));
            this.group = null;
        } else {
            this.removeFromCanvas(canvas, reset);
            this.removeCommentsFromCanvas(canvas, reset);
        }
    }

    makeGroup() {
        const items = [];
        if (this.image) {
            items.push(this.image);
        }
        this.comments.forEach(d => items.push(d))

        if (items.length > 0) {
            this.group = new fabric.Group(items);
        }
    }

    addGroupToCanvas(canvas) {
        if (this.group) {
            canvas.add(this.group);
        }
    }

    addImageToCanvas(canvas) {
        if (this.image) {
            canvas.add(this.image);
        }
    }

    addCommentsToCanvas(canvas) {
        if (this.comments.length > 0) {
            this.comments.forEach(d => canvas.add(d))
        }
    }

    removeImageFromCanvas(canvas, reset=false) {
        if (this.image) {
            canvas.remove(toRaw(this.image));
            if (reset) {
                this.image = null;
            }
        }
    }

    removeCommentsFromCanvas(canvas, reset=false) {
        if (this.comments.length > 0) {
            this.comments.forEach(d => canvas.remove(toRaw(d)))
            if (reset) {
                this.comments = [];
            }
        }
    }

    update(canvas, image=null, imageOptions={}, comments=[], commentsOptions={}) {

        if (this.image && image) {
            this.image.setElement(image);
            this.image.set("dirty", true)
            this.image.setCoords();
        } else if (image) {
            this.image = new fabric.Image(image, imageOptions);
            this.addImageToCanvas(canvas);
        }

        if (comments.length > 0) {
            this.removeCommentsFromCanvas(canvas, true);
            this.comments = comments.map((d, i) => {
                return new fabric.Text(d, Object.assign({
                    top: i*20 + 10,
                    left: 10,
                }, commentsOptions))
            });
            this.addCommentsToCanvas(canvas);
        }
    }

    select(canvas) {
        // this.addGroupToCanvas(canvas);
        // canvas.setActiveObject(toRaw(this.group));
        const items = [];
        if (this.image) { items.push(this.image) }
        this.comments.forEach(d => { items.push(d) })

        if (items.length > 0) {
            // TODO: this does not work
            canvas.setActiveObject(new fabric.ActiveSelection(items, {
                canvas: canvas,
            }));
            canvas.requestRenderAll();
        }
    }

    deselect(canvas) {
        // canvas.remove(toRaw(this.group));
    }

}