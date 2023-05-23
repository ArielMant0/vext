export default class EventHandler {

    constructor() {
        this.callbacks = {}
        this.ID = 0;
    }

    get nextID() {
        return this.ID++;
    }

    on(name, handler) {
        const names = name.trim().split(" ");
        const id = this.nextID;

        names.forEach(n => {
            if (!this.callbacks[n]) {
                this.callbacks[n] = [];
            }
            this.callbacks[n].push({
                id: id,
                handler: handler
            });
        })
        return id;
    }

    off(name, handler) {
        const names = name.trim().split(" ");
        names.forEach(n => {
            if (this.callbacks[n]) {
                const idx = this.callbacks[n].findIndex(d => d.id === handler);
                if (idx >= 0) {
                    this.callbacks[n].splice(idx, 1);
                    return true;
                }
            }
        })
        return false;
    }

    emit(name, data=null) {
        const names = name.trim().split(" ");
        names.forEach(n => {
            if (this.callbacks[n]) {
                this.callbacks[n].forEach(d => d.handler(data));
            }
        });
    }
}