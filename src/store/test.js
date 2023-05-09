import { defineStore } from "pinia"
import { useVextState } from "./state";

export const useTestStore = defineStore("vext-test", {

    state: () => {
        return {
            count: 100,
            rows: 5
        }
    },

    actions: {

        init() {
            const state = useVextState();
            state.on("load", this.loadState.bind(this));
            this.setState();
        },

        setState() {
            const state = useVextState();
            state.setData({ count: this.count, rows: this.rows });
        },

        loadState(state) {
            this.count = state.count;
            this.rows = state.rows;
        },

        setCount(n) {
            this.count = n;
            this.setState();
        },

        setRows(n) {
            this.rows = n;
            this.setState();
        },
    }
});