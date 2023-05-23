import EventHandler from '@/use/event-handler';
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
            events: new EventHandler()
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
            return this.events.on(event, func);
        },

        off(event, id) {
            return this.events.off(event, id);
        },

        setData(data, check=true) {
            this.data = data;
            if (check && this.checkChanges()) {
                this.events.emit("change", toRaw(data))
            }

        },

        loadState(state) {
            const stateObj = JSON.parse(state)
            this.setData(stateObj, false);
            this.events.emit("load", toRaw(this.data))
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