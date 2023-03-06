import { defineStore } from "pinia"

export const useVextApp = defineStore("vext-app", {

    state: () => {
        return {
            errors: [],
            alertText: "",
            alertType: "error",
            alertDuration: 6000, // 6 seconds

            ttX: 0,
            ttY: 0,
            ttContent: "",
            ttPlacement: "auto"
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
        },

        showTooltip(content, x, y, placement) {
            this.ttX = x;
            this.ttY = y;
            this.ttContent = content;
            this.ttPlacement = placement;
        },

        hideTooltip() {
            this.ttContent = "";
        },

        updateTooltipPos(x, y, placement) {
            this.ttX = x;
            this.ttY = y;
            this.ttPlacement = placement;
        }
    },
});