# Vext Input Store

> Pinia store that holds information about mouse/pointer and keyboard input.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| pointerMove | timestamp for most recent pointermove event | number | -      | `null`         |
| pointerMoveType | type for most recent pointermove event | string | -      | `null`         |
| pointerDown | timestamp for most recent pointerdown event | number | -      | `null`         |
| pointerDownType | type for most recent pointerdown event | string | -      | `null`         |
| pointerUp | timestamp for most recent pointerup event | number | -      | `null`         |
| pointerUpType | type for most recent pointerup event | string | -      | `null`         |
| mx | x position in window for most recent pointermove event | string | - | `0` |
| my | y position in window for most recent pointermove event | string | - | `0` |
| dx | x position in window for most recent pointerdown event | string | - | `0` |
| dy | y position in window for most recent pointerdown event | string | - | `0` |
| ux | x position in window for most recent pointerup event | string | - | `0` |
| uy | y position in window for most recent pointerup event | string | - | `0` |
| keyDown | information for most recent keydown event | object | - | `{ key: "", ctrl: false, shift: false, alt: false, meta: false, time: null }` |
| keyUp | information for most recent keydown event | object | - | `{ key: "", ctrl: false, shift: false, alt: false, meta: false, time: null }` |
| keyPress | information for most recent keydown event | object | - | `{ key: "", ctrl: false, shift: false, alt: false, meta: false, time: null }` |

## Methods

### init

> Adds event listeners to the window (once).

### emit

> Emits an event for this event handler.
> <br>`@param {String}` name - event name
> <br>`@param {*}` data - event data

### on

> Registers an event handler.
> <br>`@param {String}` name - event name
> <br>`@param {Function}` handler - event callback function
> <br>`@returns` callback handle

### off

> Removes an event handler for a specific event.
> <br>`@param {String}` name - event name
> <br>`@param {Number}` handler - event callback function handler
> <br>`@returns` true if removed, false otherwise

### getPointer

> Returns the latest x/y coordinates for a pointer event.
> <br>`@param {String}` event - event type (default `move`)
> <br>`@param {HTMLElement}` element - relative to which node to retrieve coordinates (default `null`)
> <br>`@returns` array of latest x/y pointer coordinates

### getPointerMove

> Returns the latest x/y coordinates for the pointermove event.
> <br>`@param {HTMLElement}` element - relative to which node to retrieve coordinates (default `null`)
> <br>`@returns` array of latest x/y pointer coordinates

### getPointerDown

> Returns the latest x/y coordinates for the pointerdown event.
> <br>`@param {HTMLElement}` element - relative to which node to retrieve coordinates (default `null`)
> <br>`@returns` array of latest x/y pointer coordinates

### getPointerUp

> Returns the latest x/y coordinates for the pointerup event.
> <br>`@param {HTMLElement}` element - relative to which node to retrieve coordinates (default `null`)
> <br>`@returns` array of latest x/y pointer coordinates

### getKey

> Returns the latest x/y information for a key event.
> <br>`@param {String}` event - key event (default `down`)
> <br>`@param {Boolean}` withMods - whether to include modifiers (default `false`)
> <br>`@returns` key string if `withModes` is false, complete object otherwise

### getKeyDown

> Returns the latest x/y information for the keydown event.
> <br>`@param {Boolean}` withMods - whether to include modifiers (default `false`)
> <br>`@returns` key string if `withModes` is false, complete object otherwise

### getKeyUp

> Returns the latest x/y information for the keyup event.
> <br>`@param {Boolean}` withMods - whether to include modifiers (default `false`)
> <br>`@returns` key string if `withModes` is false, complete object otherwise

### getKeyPress

> Returns the latest x/y information for the keypress event.
> <br>`@param {Boolean}` withMods - whether to include modifiers (default `false`)
> <br>`@returns` key string if `withModes` is false, complete object otherwise
