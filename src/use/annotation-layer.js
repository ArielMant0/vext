import { isFabric, createFabricObject } from "./util";
import { toRaw } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import AnnotationConnection from "./annotation-connection";

export default class AnnotationLayer {

    constructor(
        canvas,
        id, state, color,
        width, height,
        items=[],
        comments=[],
        connections={}
    ) {
        this.id = id;
        this.state = state;
        this.color = color;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.opacity = 1;
        this.comments = comments;
        this.created = Date.now();
        this.modified = Date.now();

        this.items = [];
        items.forEach(d => {
            // fabric object
            if (isFabric(d)) {
                d.set("opacity", 1);
                d.set("visible", true)
                d.set("uuid", uuidv4())
                canvas.add(toRaw(d))
                this.items.push(d);
            } else {
                const obj = createFabricObject(d.type, d);
                obj.set("opacity", 1);
                obj.set("visible", true)
                obj.set("uuid", d.uuid ? d.uuid : uuidv4())
                canvas.add(obj)
                this.items.push(obj);
            }
        });

        this.connections = {};
        // load connections
        for (const uuid in connections) {
            const anno = this.item(uuid)
            if (!anno) continue;
            this.connections[uuid] = connections[uuid].map(d =>  {
                const obj = AnnotationConnection.fromJSON(d, anno)
                canvas.add(obj.line)
                return obj;
            })
        }
    }

    toJSON() {
        const connections = {};
        for (const uuid in this.connections) {
            connections[uuid] = this.connections[uuid].map(d => d.toJSON());
        }
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            color: this.color,
            state: this.state,
            items: this.items.map(d => d.toJSON(["uuid"])),
            comments: this.comments,
            connections: connections,
            created: this.created,
            modified: this.modified
        }
    }

    forItem(func) {
        this.items.forEach(func);
    }

    forComment(func) {
        this.comments.forEach(func);
    }

    forConnection(func, uuid) {
        if (uuid && this.connections[uuid]) {
            this.connections[uuid].forEach(func);
        } else {
            for (const id in this.connections) {
                this.connections[id].forEach(func);
            }
        }
    }

    empty() {
        return !this.hasItems() &&
            !this.hasComments() &&
            !this.hasConnections();
    }

    hasItems() {
        return this.items.length > 0;
    }

    hasConnections() {
        return this.items.length > 0;
    }

    hasComments() {
        return this.comments.length > 0;
    }

    setModified() {
        this.modified = Date.now();
    }

    matchesStateHash(hash) {
        return this.state.hash === hash;
    }

    item(uuid) {
        return this.items.find(d => d.uuid === uuid);
    }

    itemIndex(uuid) {
        return this.items.findIndex(d => d.uuid === uuid);
    }

    hasItem(uuid) {
        return this.item(uuid) !== undefined;
    }

    findItem(func) {
        return this.items.find(func);
    }

    updateState(state, width, height) {
        this.state = state;
        this.width = width;
        this.height = height;
        this.setModified();
    }

    rename(id) {
        this.id = id;
        this.setModified();
    }

    setVisibility(visible) {
        if (this.visible !== visible) {
            this.visible = visible;
            this.updateObjects("visible", visible)
        }
    }

    setActiveObject(uuid, canvas) {
        const obj = this.item(uuid);
        if (obj) {
            canvas.setActiveObject(toRaw(obj));
            return true;
        }
        return false;
    }

    addObject(obj, canvas=null, return_record=false) {
        obj.set("opacity", this.opacity)
        obj.set("visible", this.visible)
        if (!obj.uuid) obj.set("uuid", uuidv4())
        if (canvas) canvas.add(obj);
        this.items.push(obj);
        this.setModified();
        return return_record ? { annotation: obj.toJSON(["uuid"]) } : undefined;
    }

    addObjects(objs, canvas=null, return_record=false) {
        objs.forEach(d => {
            d.set("opacity", this.opacity)
            d.set("visible", this.visible)
            if (!d.uuid) d.set("uuid", uuidv4())
            if (canvas) canvas.add(d);
            this.items.push(d);
        });
        this.setModified();
        return return_record ? {
            annotation: objs.map(d => {
                return { annotation: d.toJSON(["uuid"]) }
            }),
        }  : undefined;
    }

    updateObject(uuid, attr, value) {
        const item = this.item(uuid);
        if (item) {
            item.set(attr, isFunc ? value(item) : value)
            item.set("dirty", true)
            if (this.connections[uuid]) {
                this.connections[uuid].forEach(d => {
                    d.line.set(attr, isFunc ? value(d) : value)
                    d.line.set("dirty", true)
                })
            }
        }
    }

    updateObjects(attr, value) {
        const isFunc = typeof value === "function";
        this.items.forEach(d => {
            d.set(attr, isFunc ? value(d) : value)
            d.set("dirty", true)
        })
        for (const uuid in this.connections) {
            this.connections[uuid].forEach(d => {
                d.line.set(attr, isFunc ? value(d) : value)
                d.line.set("dirty", true)
            })
        }
    }

    addObjectFromJSON(json, canvas, return_record=false) {
        const obj = createFabricObject(json.annotation.type, json.annotation);
        if (canvas) canvas.add(obj);
        this.items.push(obj);

        if (json.connections) {
            this.connections[json.uuid] = json.connections.map(d => AnnotationConnection.fromJSON(d, obj));
            if (canvas) {
                this.connections[json.uuid].forEach(d => d.addToCanvas(canvas));
            }
        }

        this.setModified();
        return return_record ? json : undefined;
    }

    addObjectsFromJSON(json, canvas=null, return_record=false) {
        const objs = json.map(d => {
            const o = createFabricObject(d.annotation.type, d.annotation)
            if (canvas) canvas.add(o);
            this.items.push(o);
            return o;
        });

        json.forEach((d, i) => {
            if (d.connections) {
                this.connections[d.uuid] = d.connections.map(dd => AnnotationConnection.fromJSON(dd, objs[i]));
                if (canvas) {
                    this.connections[d.uuid].forEach(dd => dd.addToCanvas(canvas));
                }
            }
        });

        this.setModified();
        return return_record ? json : undefined;
    }

    removeLastObject(canvas=null, return_record=false) {
        if (this.items.length === 0) return;
        const uuid = this.items[this.items.length-1].uuid;
        return this.removeObject(uuid, canvas, return_record);
    }

    removeObject(uuid, canvas=null, return_record=false) {
        const index = this.itemIndex(uuid);
        if (index < 0) return;

        const obj = this.items.splice(index, 1)[0];
        if (canvas) canvas.remove(toRaw(obj));

        const connObjs = [];
        const conns = this.connections[uuid]
        if (return_record && conns && conns.length > 0) {
            conns.forEach(d => {
                connObjs.push(d.toJSON());
                if (canvas) d.removeFromCanvas(canvas);
            });
            delete this.connections[uuid];
        }

        this.setModified();
        return return_record ? {
            annotation: obj.toJSON(["uuid"]),
            connections: connObjs
        } : undefined;
    }

    removeObjects(uuids, canvas=null, return_record=false) {

        if (return_record) {
            const objs = uuids.map(d => this.removeObject(d, canvas, return_record))
            this.setModified();
            return objs
        }

        uuids.forEach(d => this.removeObject(d, canvas, return_record))
        this.setModified();
    }

    addConnection(canvas, uuid, location, data, return_record=false) {
        const annotation = this.item(uuid);
        if (!annotation) return false;

        const conn = new AnnotationConnection(
            location,
            annotation,
            data,
            annotation.stroke ? annotation.stroke :
                (annotation.fill ? annotation.fill : this.color)
        );
        conn.addToCanvas(canvas);

        if (!this.connections[uuid]) {
            this.connections[uuid] = [conn];
        } else {
            this.connections[uuid].push(conn);
        }

        this.setModified();
        return return_record ? conn.toJSON() : undefined;
    }

    updateConnections(uuid) {
        const annotation = this.item(uuid)
        if (annotation && this.connections[uuid]) {
            this.connections[uuid].forEach(d => d.updateLocation(annotation))
            return true;
        }
        return false;
    }

    addConnectionFromJSON(canvas, uuid, json, return_record=false) {
        const annotation = this.item(uuid);
        if (!annotation) return false;

        const conn = AnnotationConnection.fromJSON(json);
        conn.addToCanvas(canvas);

        if (!this.connections[uuid]) {
            this.connections[uuid] = [conn];
        } else {
            this.connections[uuid].push(conn);
        }

        this.setModified();
        return return_record ? json : undefined;
    }

    removeConnection(canvas, uuid, index=null, return_record=false) {
        const annotation = this.item(uuid);
        const conns = this.connections[uuid];
        if (!annotation || !conns || conns.length === 0) return;

        index = index === null ? conns.length-1 : index;
        if (index < 0 || index >= conns.length) return;
        const item = conns.splice(index, 1)[0];
        item.removeFromCanvas(canvas);

        this.setModified();
        return return_record ? item.toJSON() : undefined;
    }

    addComment(comment, return_record=false) {
        this.comments.push(comment)
        this.setModified();
        return return_record ? comment : undefined;
    }

    updateComment(index, comment, return_record=false) {
        if (index >= 0 && index < this.comments.length) {
            this.comments[index] = comment;
            this.setModified();
        }
        return return_record ? comment : undefined;
    }

    removeComment(index=null, return_record=false) {
        index = index === null ? this.comments.length-1 : index;
        if (index < 0 || index >= this.comments.length) return;

        const comment = this.comments.splice(index, 1)[0];

        this.setModified();
        return return_record ? comment : undefined;
    }

    removeComments(return_record=false) {
        let comments = undefined;
        if (return_record) {
            comments = this.comments.slice();
        }
        this.comments = [];

        this.setModified();
        return comments;
    }

    remove(canvas, return_record=false) {
        const me = return_record ? this.toJSON() : undefined
        this.items.forEach(d => canvas.remove(toRaw(d)));
        for (const uuid in this.connections) {
            this.connections[uuid].forEach(d => d.removeFromCanvas(canvas));
        }
        this.setModified();
        return me;
    }
}