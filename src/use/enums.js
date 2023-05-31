const MODES = Object.freeze({
    BRUSH: "brush",
    EDIT: "edit",
    SHAPE: "shape",
    LAYER: "layer",
    CONNECT: "connect",
    WHITEBOARD: "whiteboard",
    SETTINGS: "settings",
})
const MODES_VALUES = Object.values(MODES);

const LAYER_MODES = Object.freeze({
    ANNOTATE: "on annotation",
    STATE: "on state change",
    MANUAL: "manual"
});
const LAYER_MODES_VALUES = Object.values(LAYER_MODES);

const ACTIONS = Object.freeze({
    ACCEPT: "accept",
    ACCEPT_IGNORE: "accept_ignore",
    CANCEL: "cancel",
    CANCEL_IGNORE: "cancel_ignore",
    MODE: "mode",
    UNDO: "undo",
    REDO: "redo",
    SETTINGS: "settings",
    COLOR_CHANGE: "color-change",
    COLOR_VALUE: "color",
    BRUSH_SIZE: "brush-size",
    SHAPE: "shape-change",
});
const ACTIONS_VALUES = Object.values(ACTIONS);

export {
    MODES, MODES_VALUES,
    LAYER_MODES, LAYER_MODES_VALUES,
    ACTIONS, ACTIONS_VALUES
};