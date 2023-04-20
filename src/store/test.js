import { defineStore } from "pinia"
import { useVextState } from "./state";

export const useTestStore = defineStore("vext-test", {

    state: () => {
        return {
            count: 100,
        }
    },

    actions: {

        init() {
            const state = useVextState();
            state.setCallback(this.loadState.bind(this));
            this.setState();
        },

        setState() {
            const state = useVextState();
            state.setData({ count: this.count });
        },

        loadState(state) {
            this.setCount(state.count);
        },

        setCount(n) {
            this.count = n;
            this.setState();
        }
    }
});