import { defineStore } from "pinia"

const vextAppStore = {
    state: () => {
        return {
            alerts: [],
            alertDuration: 6000, // 6 seconds

            ttX: 0,
            ttY: 0,
            ttContent: null,
            ttPlacement: "auto"
        };
    },

    actions: {

        /**
         * Set the alert text and type for a global alert
         * @param {String} text
         * @param {String} type
         */
        alert(text, type) {
            this.alerts.push({ text: text, type: type })
            setTimeout(() => {
                if (this.alerts.length > 0) {
                    this.alerts.splice(0, 1)
                }
            }, this.alertDuration);
        },

        /**
         * Set the alert text with the type 'info'
         * @param {String} text
         */
        info(text) {
            this.alert(text, "info")
        },

        /**
         * Set the alert text with the type 'success'
         * @param {String} text
         */
        success(text) {
            this.alert(text, "success")
        },

        /**
         * Set the alert text with the type 'warning'
         * @param {String} text
         */
        warning(text) {
            this.alert(text, "warning")
        },

        /**
         * Set the alert text with the type 'error'
         * @param {String} text
         */
        error(text) {
            this.alert(text, "error")
        },

        /**
         * Show the global VextToolTip with content at position [x, y].
         * Content can be either a string, an object or an array of objects.
         *
         * The x and y coordinates are expected to be in absolute document
         * coordinates. If no placement is given, the default is 'auto'.
         *
         * @param {*} content
         * @param {Number} x
         * @param {Number} y
         * @param {String} placement
         */
        showTooltip(content, x, y, placement) {
            this.ttX = x;
            this.ttY = y;
            this.ttContent = content;
            this.ttPlacement = placement;
        },

        /**
         * Hide the tooltip.
         */
        hideTooltip() {
            this.ttContent = null;
        },

        /**
         * Update the tooltip's position and placement.
         * @param {Number} x
         * @param {Number} y
         * @param {String} placement
         */
        updateTooltipPos(x, y, placement) {
            this.ttX = x;
            this.ttY = y;
            this.ttPlacement = placement;
        }
    },
}

const useVextApp = defineStore("vext-app", vextAppStore);

export { useVextApp, vextAppStore };