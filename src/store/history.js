import { defineStore } from "pinia"

const vextHistoryStore = {

    state: () => {
        return {
            menu: false,
            undoStack: [],
            redoStack: []
        };
    },

    getters: {
        hasUndo: (state) => state.undoStack.length > 0,
        hasRedo: (state) => state.redoStack.length > 0,
    },

    actions: {

        setMenu(value) {
            this.menu = value === true;
        },
        /**
         * An action is done - store both the action and its reverse
         * @param {*} action
         */
        do(desc, doAction, undoAction) {
            this.undoStack.push({
                description: desc,
                time: new Date(Date.now()),
                do: doAction,
                undo: undoAction
            });
        },

        undo(remember=true) {
            if (this.hasUndo) {
                const action = this.undoStack.pop();
                action.undo()
                if (remember) {
                    this.redoStack.push({
                        description: "undo " + action.description,
                        do: action.undo,
                        undo: action.do,
                        time: action.time,
                    });
                }
            }
        },

        redo(remember=true) {
            if (this.hasRedo) {
                const action = this.redoStack.pop();
                action.undo()
                const desc = action.description.startsWith("undo ") ?
                    action.description.slice(5) : action.description;
                if (remember) {
                    this.undoStack.push({
                        description: desc,
                        do: action.undo,
                        undo: action.do,
                        time: action.time,
                    });
                }
            }
        },

        clear() {
            this.undoStack = [];
            this.redoStack = [];
        }
    },
}

const useVextHistory = defineStore("vext-history", vextHistoryStore);

export { useVextHistory, vextHistoryStore }