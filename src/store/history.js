import { defineStore } from "pinia"

const vextHistoryStore = {

    state: () => {
        return {
            menu: false,
            undoStack: [],
            redoStack: [],
            limit: 50
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
            console.debug("history DO:", desc)
            if (this.undoStack.length >= this.limit) {
                console.debug("history: removing oldest UNDO entry due to size limit")
                this.undoStack.splice(0, this.undoStack.length-this.limit+1);
            }
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
                console.debug("history UNDO:", action.description)
                action.undo()
                if (remember) {
                    if (this.redoStack.length >= this.limit) {
                        console.debug("history: removing oldest REDO entry due to size limit")
                        this.redoStack.splice(0, this.redoStack.length-this.limit+1);
                    }
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
                console.debug("history REDO:", action.description)
                action.undo()
                const desc = action.description.startsWith("undo ") ?
                    action.description.slice(5) : action.description;
                if (remember) {
                    if (this.undoStack.length >= this.limit) {
                        console.debug("history: removing oldest UNDO entry due to size limit")
                        this.undoStack.splice(0, this.undoStack.length-this.limit+1);
                    }
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