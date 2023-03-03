import hash from 'object-hash'
import { defineStore } from "pinia"
import { toRaw } from 'vue';

export const useState = defineStore("state", {

    state: () => {
        return {
            data: null,
            hash: null,
            dataChange: false,
            callback: null,
        };
    },

    actions: {

        calcHash() {
            return hash(this.data);
        },

        checkChanges() {
            const newHash = this.calcHash();
            if (newHash !== this.hash) {
                this.hash = newHash;
                this.dataChange = true;
            }
        },

        setData(data, check=true) {
            this.data = data;
            if (check) {
                this.checkChanges();
            } else {
                this.hash = this.calcHash();
            }
        },

        loadState(state) {
            this.setData(JSON.parse(state), false);
            if (this.callback !== null) {
                this.callback(this.data);
            }
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
        },

    },
});