import { defineStore } from "pinia"


export const useHistory = defineStore("history", {

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

        undo() {
            if (this.hasUndo) {
                const action = this.undoStack.pop();
                action.undo()
                this.redoStack.push({
                    description: "undo " + action.description,
                    do: action.undo,
                    undo: action.do,
                    time: action.time,
                });
            }
        },

        redo() {
            if (this.hasRedo) {
                const action = this.redoStack.pop();
                action.undo()
                const desc = action.description.startsWith("undo ") ?
                    action.description.slice(5) : action.description;
                this.undoStack.push({
                    description: desc,
                    do: action.undo,
                    undo: action.do,
                    time: action.time,
                });
            }
        },

        clear() {
            this.undoStack = [];
            this.redoStack = [];
        }
    },
});