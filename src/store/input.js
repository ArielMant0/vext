import EventHandler from "@/use/event-handler";
import { defineStore } from "pinia"

function getCoordinates(x, y, element) {
    if (!element) {
        return [x, y]
    }
    const rect = element.getBoundingClientRect();
    const left = x < rect.x ? 0 :
        (x > rect.x+rect.width ? rect.width : x - rect.x)
    const top = y < rect.y ? 0 :
        (y > rect.y+rect.height ? rect.height : y - rect.y)
    return [left, top]
}

const ACTIONS = Object.freeze({
    ACCEPT: "accept",
    ACCEPT_IGNORE: "accept_ignore",
    CANCEL: "cancel",
    CANCEL_IGNORE: "cancel_ignore",
    MODE: "mode",
});

const EVENTS = new EventHandler();

const vextInputStore = {

    state: () => {
        return {

            pointerMove: null,
            pointerMoveType: null,
            mx: 0,
            my: 0,
            pointerDown: null,
            pointerDownType: null,
            dx: 0,
            dy: 0,
            pointerUp: null,
            pointerUpType: null,
            ux: 0,
            uy: 0,

            key: {
                key: "",
                ctrl: false,
                shift: false,
                alt: false,
                meta: false,
            },
            keyTime: null,
        };
    },

    getters: {
        ACTIONS: () => ACTIONS,
    },

    actions: {

        /**
         * Add event listener to track mouse and keyboard
         */
        init() {
            window.addEventListener("pointermove", event => {
                this.mx = event.pageX;
                this.my = event.pageY;
                this.pointerMoveType = event.pointerType;
                this.pointerMove = Date.now();
                this.emit("pointermove", event);
            });
            window.addEventListener("pointerdown", event => {
                this.dx = event.pageX;
                this.dy = event.pageY;
                this.pointerDownType = event.pointerType;
                this.pointerDown = Date.now();
                this.emit("pointerdown", event);
            });
            window.addEventListener("pointerup", event => {
                this.ux = event.pageX;
                this.uy = event.pageY;
                this.pointerUpType = event.pointerType;
                this.pointerUp = Date.now();
                this.emit("pointerup", event);
            });
            window.addEventListener("keydown", event => {
                this.key.key = event.key;
                this.key.ctrl = event.ctrlKey;
                this.key.shift = event.shiftKey;
                this.key.alt = event.altKey;
                this.key.meta = event.metaKey;
                this.keyTime = Date.now();
                this.emit("keydown", event);
            });
        },

        emit(name, data) {
            EVENTS.emit(name, data);
        },

        on(name, handler) {
            return EVENTS.on(name, handler);
        },

        off(name, handler) {
            return EVENTS.off(name, handler);
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointer(which="move", element=null) {
            switch (which) {
                case "down":
                    return getCoordinates(this.dx, this.dy, element)
                case "up":
                    return getCoordinates(this.ux, this.uy, element)
                case "move":
                default:
                    return getCoordinates(this.mx, this.my, element)
            }
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerMove(element=null) {
            return getCoordinates(this.mx, this.my, element)
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerDown(element=null) {
            return getCoordinates(this.dx, this.dy, element)
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerUp(element=null) {
            return getCoordinates(this.ux, this.uy, element)
        },

        getKey(withMods=false) {
            return withMods ? this.key : this.key.key;
        }

    },
}

const useVextInput = defineStore("vext-input", vextInputStore);

export { useVextInput, vextInputStore }