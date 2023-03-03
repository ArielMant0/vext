import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {

    state: () => {
        return {
            errors: [],
            alertText: "",
            alertType: "error",
            alertDuration: 6000 // 6 seconds
        };
    },

    actions: {

        /**
         * An action is done - store both the action and its reverse
         * @param {*} action
         */
        alert(text, type) {
            this.alertType = type;
            this.alertIcon = type;
            this.alertText = text;
            setTimeout(() => this.alertText = "", this.alertDuration);
        },

        info(text) {
            this.alert(text, "info")
        },

        success(text) {
            this.alert(text, "success")
        },

        warning(text) {
            this.alert(text, "warning")
        },

        error(text) {
            this.alert(text, "error")
        },

        addError(error) {
            this.errors.push(error);
        }
    },
});