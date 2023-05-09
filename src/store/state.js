import hash from 'object-hash'
import { defineStore } from "pinia"
import { toRaw } from 'vue';

let EID = 0;

const vextStateStore = {

    state: () => {
        return {
            data: null,
            history: [],
            historySize: 25,
            dataChange: false,
            dataChangeTime: null,
            callbacks: {
                change: [],
                load: []
            },
        };
    },

    getters: {
        hash: state => state.history.length > 0 ? state.history[state.history.length-1].hash : null
    },

    actions: {

        calcHash(data=this.data) {
            return hash(data);
        },

        checkChanges() {
            const newHash = this.calcHash();
            if (newHash !== this.hash) {
                this.history.push({
                    hash: newHash,
                    state: JSON.stringify(toRaw(this.data)),
                });
                if (this.history.length > this.historySize) {
                    this.history.splice(0, this.history.length-this.historySize)
                }
                this.dataChange = true;
                this.dataChangeTime = Date.now();
            }
            return this.dataChange;
        },

        on(event, func) {
            if (!this.callbacks[event]) {
                return null;
            }
            const id = EID++;
            this.callbacks[event].push({
                id: id,
                func: func
            })
            return id;
        },

        off(event, id) {
            if (!this.callbacks[event]) return null;
            const idx = this.callbacks[event].findIndex(d => d.id === id);
            if (idx >= 0) {
                this.callbacks[event].splice(idx, 1);
            }
        },

        setData(data, check=true) {
            this.data = data;
            if (check && this.checkChanges()) {
                this.callbacks.change.forEach(f => f.func(toRaw(data)));
            }

        },

        loadState(state) {
            const stateObj = JSON.parse(state)
            this.setData(stateObj, false);
            this.callbacks.load.forEach(f => f.func(toRaw(this.data)))
        },

        resetDataChange() {
            this.dataChange = false;
        },

        exportState(reset=true) {
            if (reset) this.resetDataChange();
            // have to stringify state to prevent reactive objects
            // from just keeping the value
            return {
                state: JSON.stringify(toRaw(this.data)),
                hash: this.hash
            }
        },

        clear() {
            this.data = null;
            this.dataChange = false;
            this.dataChangeTime = null;
            this.history = [];
        },

    },
};

const useVextState = defineStore("vext-state", vextStateStore);

export { useVextState, vextStateStore };