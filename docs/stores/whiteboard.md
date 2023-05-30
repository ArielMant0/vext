# Vext Whiteboard Store

> Pinia store that manages the whiteboard functionality.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| canvas | fabric.js canvas instance | object | -      | `null`         |
| mode | active mode  | string | `["edit", "brush"]`      | `"edit"`         |
| enabled | whether the whiteboard is enabled  | boolean | -    | `false`         |
| modified | timestamps for tracked layer modifications  | object | -    | `{}`         |
| layers | whiteboard-layer instances  | object | -    | `{}`         |
| selectedLayer | layer to select all canvas objects for  | string | -    | `""`         |
| paths | array of paths drawn on the whiteboard  | array | -    | `[]`         |
| border | border style for layer canvas objects  | object | -    | `{ color: "lightgrey", size: 1, }`  |

## Methods

### setCanvas

> Set the fabric.js canvas instance to use for the whiteboard.
> <br>`@param {Object}` canvas - the fabric.js canvas

### setMode

> Set the mode for the whiteboard.
> <br>`@param {String}` mode
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### addPath

> Adds a path to the whiteboard canvas.
> <br>`@param {Object}` path - fabric.js path object
> <br>`@param {Boolean}` addToCanvas - whether to add the path to the canvas (default `true`)
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### addPathFromJSON

> Adds a path to the whiteboard canvas.
> <br>`@param {Object}` path - JSON representation of a fabric.js path object
> <br>`@param {Boolean}` record - whether to record this action (default `true`)


### removePath

> Removes a path from the whiteboard canvas.
> <br>`@param {Number}` index - path index, null removes the most recently added path (default `null`)
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### modifyObject

> Modifies an objects transform (i.e. scale, translation, rotation).
> <br>`@param {String}` uuid - object UUID
> <br>`@param {Object}` transform - the transform to apply
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### itemFromUUID

> Returns the matching canvas object for a given UUID.
> <br>`@param {String}` uuid - object uuid
> <br>`@returns {Object}`

### setBrushColor

> Sets the brush color for the whiteboard canvas.
> <br>`@param {String}` color - brush color

### setBrushSize

> Sets the brush size for the whiteboard canvas.
> <br>`@param {Number}` size - brush size in pixels

### setCanvasZIndex

> Sets the z-index for the canvas element.
> <br>`@param {Number}` value - z-index value

### resizeCanvas

> Resize the canvas to the passed width and height.
> <br>`@param {Number}` width - new canvas width
> <br>`@param {Number}` height - new canvas height

### async enable

> Enables the whiteboard and reloads any layer data if they were modified
> since the last time the whiteboard was enabled.

### disable

> Disables the whiteboard.

### selectLayer

> Select a specific layer's canvas objects.
> <br>`@param {String}` id - layer id

### deleteActiveObject

> Deletes the currently active canvas object.

### async addLayerImage

> Adds the data from a layer as a new WhiteBoardLayer.
> <br>`@param {AnnotationLayer}` layer - layer object

### async updateLayerImage

> Updates the data from a layer.
> <br>`@param {AnnotationLayer}` layer - layer object
