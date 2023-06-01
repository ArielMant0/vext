import EventHandler from "@/use/event-handler";
import { getElementCoords } from "@/use/util";
import { defineStore } from "pinia"

function getCoordinates(x, y, element) {
    if (!element) {
        return [x, y]
    }
    return getElementCoords(element, x, y);
}

const EVENTS = new EventHandler();
let INITIALIZED = false;

const vextInputStore = {

    state: () => {
        return {

            pointerMove: null,
            pointerMoveType: null,
            mx: 0,
            my: 0,
            pointerMoveScroll: {
                x: 0,
                y: 0,
            },

            pointerDown: null,
            pointerDownType: null,
            dx: 0,
            dy: 0,
            pointerDownScroll: {
                x: 0,
                y: 0,
            },

            pointerUp: null,
            pointerUpType: null,
            ux: 0,
            uy: 0,
            pointerUpScroll: {
                x: 0,
                y: 0,
            },

            keyDown: {
                key: "",
                ctrl: false,
                shift: false,
                alt: false,
                meta: false,
                time: null,
            },
            keyUp: {
                key: "",
                ctrl: false,
                shift: false,
                alt: false,
                meta: false,
                time: null,
            },
            keyPress: {
                key: "",
                ctrl: false,
                shift: false,
                alt: false,
                meta: false,
                time: null,
            },
        };
    },

    actions: {

        /**
         * Add event listener to track mouse and keyboard
         */
        init() {
            if (INITIALIZED) {
                console.debug("input store already initialized")
                return;
            }

            window.addEventListener("pointermove", event => {
                this.mx = event.pageX;
                this.my = event.pageY;
                this.pointerMoveScroll.x = window.scrollX;
                this.pointerMoveScroll.y = window.scrollY;
                console.log(this.mx-this.pointerMoveScroll.x, this.my-this.pointerMoveScroll.y)
                this.pointerMoveType = event.pointerType;
                this.pointerMove = performance.now();
                this.emit("pointermove", event);
            });
            window.addEventListener("pointerdown", event => {
                this.dx = event.pageX;
                this.dy = event.pageY;
                this.pointerDownScroll.x = window.scrollX;
                this.pointerDownScroll.y = window.scrollY;
                this.pointerDownType = event.pointerType;
                this.pointerDown = performance.now();
                this.emit("pointerdown", event);
            });
            window.addEventListener("pointerup", event => {
                this.ux = event.pageX;
                this.uy = event.pageY;
                this.pointerUpScroll.x = window.scrollX;
                this.pointerUpScroll.y = window.scrollY;
                this.pointerUpType = event.pointerType;
                this.pointerUp = performance.now();
                this.emit("pointerup", event);
            });
            window.addEventListener("keydown", event => {
                this.keyDown.key = event.key;
                this.keyDown.ctrl = event.ctrlKey;
                this.keyDown.shift = event.shiftKey;
                this.keyDown.alt = event.altKey;
                this.keyDown.meta = event.metaKey;
                this.keyDown.time = performance.now();
                this.emit("keydown", event);
            });
            window.addEventListener("keyup", event => {
                this.keyUp.key = event.key;
                this.keyUp.ctrl = event.ctrlKey;
                this.keyUp.shift = event.shiftKey;
                this.keyUp.alt = event.altKey;
                this.keyUp.meta = event.metaKey;
                this.keyUp.time = performance.now();
                this.emit("keyup", event);
            });
            if (window.ontouchstart && navigator.maxTouchPoints > 0) {
                console.debug("touch events available")
                // TODO:
                // window.addEventListener("touchstart", event => {});
            }
            INITIALIZED = true;
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
        getPointer(event="move", element=null) {
            switch (event) {
                case "down":
                    return this.getPointerDown(element)
                case "up":
                    return this.getPointerUp(element)
                case "move":
                default:
                    return this.getPointerMove(element)
            }
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerMove(element=null) {
            return getCoordinates(
                element ? this.mx-this.pointerMoveScroll.x : this.mx,
                element ? this.my-this.pointerMoveScroll.y : this.my,
                element
            );
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerDown(element=null) {
            return getCoordinates(
                element ? this.dx-this.pointerDownScroll.x : this.dx,
                element ? this.dy-this.pointerDownScroll.y : this.dy,
                element
            );
        },

        /**
         * Returns the last mouse coordinates for the window or relative to
         * the passed HTML element.
         * @param {HTMLElement} element
         */
        getPointerUp(element=null) {
            return getCoordinates(
                element ? this.ux-this.pointerUpScroll.x : this.ux,
                element ? this.uy-this.pointerUpScroll.y : this.uy,
                element
            );
        },

        getKey(event="down", withMods=false) {
            switch (event) {
                case "up":
                    return this.getKeyUp(withMods);
                case "press":
                    return this.getKeyPress(withMods);
                case "down":
                default:
                    return this.getKeyDown(withMods);
            }
        },

        getKeyDown(withMods=false) {
            return withMods ? this.keyDown : this.keyDown.key;
        },

        getKeyUp(withMods=false) {
            return withMods ? this.keyUp : this.keyUp.key;
        },

        getKeyPress(withMods=false) {
            return withMods ? this.keyPress : this.keyPress.key;
        },
    },
}

const useVextInput = defineStore("vext-input", vextInputStore);

export { useVextInput, vextInputStore }