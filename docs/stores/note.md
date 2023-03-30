# Note Store

> Pinia store that implements the externalization capabilities, storing layers
> all configuration options (e.g. brush size, colors, etc.)

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| color0 | primary color | string | -      | `"#ff0000` |
| color1 | secondary color | string | -      | `"#000000"` |
| activeColor | which color is active | number | `[0, 1]` | `0` |
| brushSize | size of the canvas brush in pixel | number | - | `1` |
| brushDecimation | how much to decimate lines | number | - | `5` |
| tool | which tool is currently active | string | `["layer", "brush", "shape", "edit"]` | `"layer"` |
| currentState | current state as stored in the state store | object | - | `null` |
| layers | list of all layers | array | - | `[]` |
| activeLayer | currently active layer id | string | - | `null` |
| layerMode | how layers are added | string | `["on annotation", "on state change", "manual"]` | `on annotation` |
| LAYER_ID_IDX | number for the next layer id | number | - | `0` |
| activeObjectUUID | UUID of the selected fabric.js object | string | - | `null` |
| activeObject | the selected fabric.js object | object | - | `null` |
| defaultColors | colors to include in the color picker palette that are used when a new layer is created automatically | array | - | `["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"]` |

## Getters

### tools

> JavaScript object of all available tools.

### canvas

> fabris.js canvas (null if not set)

### layerModeValues

> Array of possible layer mode values.

### layerModeEnum

> JavaScript object of all possible layer modes.

### currentLayer

> Current layer object if it exists, null otherwise.

### color

> Currently active color.

### layerColors

> Array of layer colors.

### swatch

> Array of default and layer colors.

### nextColor

> Next available color from the default colors.
> Will cycle if the number of layers exceeds the number of default colors.

### nextID

> An ID for a next layer.

## Methods

### isUniqueID

> Whether the given id already exists for another layer.
> <br>`@param {string}` id
> <br>`@returns` true if the id already exists, else false

### getLayerIndex

> Get the index in the layers array for a given layer id
> <br>`@param {string}` id
> <br>`@returns` index if exists, else -1

### overwriteState

> Set the current application state as the associated state of the
> currently active layer.
> <br>`@param {object}` state - current application state

### addLayer

> Create a new layer with the given state and set it as the active layer.
> <br>`@param {object}` state - application state
> <br>`@param {boolean}` record - whether to record this action in history
> <br>`@param {string}` id - id for the new layer
> <br>`@param {string}`color - color for the new layer
> <br>`@param {array}`items - items to be included in the layer

### removeLayer

> Remove the layer with the given id, if it exists.
> <br>`@param {string}` id
> <br>`@param {boolean}` record - whether to record this action in history

### removeEmptyLayers

> Remove all layers that contain no annotations.

### setActiveLayer

> Set the active layer to the layer with id.
> <br>`@param {string}` id
> <br>`@param {boolean}` record - whether to record this action in history

### setLayerVisibility

> Set the opacity for the layer with id.
> <br>`@param {number}` value - opacity value
> <br>`@param {string}` id
> <br>`@param {boolean}` record - whether to record this action in history
> <br>`@param {boolean}` render - whether to request a re-render of the canvas

### setLayerOpacity

> Set the visibility for the layer with id.
> <br>`@param {boolean}` visible
> <br>`@param {string}` id
> <br>`@param {boolean}` record - whether to record this action in history
> <br>`@param {boolean}` render - whether to request a re-render of the canvas

### setTool

> Set the active tool.
> <br>`@param {string}` tool
> <br>`@param {boolean}` record - whether to record this action in history

### setBrushSize

> Set the brush size for drawing.
> <br>`@param {number}` size - brush size in pixel
> <br>`@param {boolean}` record - whether to record this action in history

### setBrushDecimation

> Set the decimation value for drawing.
> <br>`@param {number}` value - decimation value
> <br>`@param {boolean}` record - whether to record this action in history

### selectColor

> Select either the primary or secondary color.
> <br>`@param {number}` id - 0 if primary color, else 1
> <br>`@param {boolean}` record - whether to record this action in history

### setColorPrimary

> Set the primary color.
> <br>`@param {string}` color
> <br>`@param {boolean}` record - whether to record this action in history


### setColorSecondary

> Set the secondary color.
> <br>`@param {string}` color
> <br>`@param {boolean}` record - whether to record this action in history

### addObject

> Add an object to the active layer.
> <br>`@param {object}` obj - fabric.js objects
> <br>`@param {boolean}` addToCanvas - whether to add them to the canvas
> <br>`@param {boolean}` record - whether to record this action in history

### addObjects

> Add a list of objects to the active layer
> <br>`@param {array}` objs - list of fabric.js objects
> <br>`@param {boolean}` addToCanvas - whether to add them to the canvas
> <br>`@param {boolean}` record - whether to record this action in history

### addObjectFromJSON

> Add an object to the active layer
> <br>`@param {string}` json - JSON representation of a frabic.js object
> <br>`@param {string}` layer - id of the layer to add the object to
> <br>`@param {boolean}` record - whether to record this action in history

### addObjectsFromJSON

> Add a list of object to the active layer
> <br>`@param {array}` json - a list of JSON representations of frabic.js objects
> <br>`@param {boolean}` record - whether to record this action in history

### removeObject

> Remove the object with uuid from a layer
> <br>`@param {string}` uuid
> <br>`@param {string}` layer - id of the layer to remove the object from
> <br>`@param {boolean}` record - whether to record this action in history

### removeObjects

> Remove all objects with a UUID included in uuids from a layer
> <br>`@param {array}` uuids
> <br>`@param {string}` layer - id of the layer to remove the objects from
> <br>`@param {boolean}` record - whether to record this action in history

### removeLastObject

> Remove the last object that was added.
> <br>`@param {string}` layer - id of the layer to remove the object from
> <br>`@param {boolean}` record - whether to record this action in history

### removeLastObject

> Get the currently active fabric.js selection.
> <br>`@returns` active object

### deleteCurrentObj

> Deletes the object currently selected in fabric.js, if it exists.
> <br>`@param {boolean}` record - whether to record this action in history

### layerFromItem

> Get the layer object for a given fabric.js item.
> <br>`@param {object}` item
> <br>`@returns` layer object if exists, else undefined

### resizeCanvas

> Resize the fabric.js canvas to [width, height].
> <br>`@param {number}` width
> <br>`@param {number}` height

### setCanvasZIndex

> Sets the z-index for the canvas and wrapper elements.
> <br>`@param {number}` value - z-index value to set

### setCanvas

> Set the fabric.js canvas object - since it cannot be instantiated in a store.
> This adds several event listeners to the canvas.
> <br>`@param {object}` canvas

### hasStateHash

> Whether a layer with the given state exists.
> <br>`@param {string}` hash
> <br>`@returns` true if exists, else false

### layerFromStateHash

> Returns the corresponding layer for a given state hash.
> <br>`@param {string}` hash
> <br>`@returns` layer object if exists, else undefined

### setState

> Set the current application state
> <br>`@param {object}` state

### setContentNode

> Sets the content (HTML) node to be used for PDF exports.
> <br>`@param {object}` node

### exportLayer

> Exports the currently active layer and content into a PDF that is downloaded.
> If the content node is null, the parent of the VextNoteCanvas
> component is used as the content node.
> <br>`@param {boolean}` canvasOnly - whether to only export the canvas with annotations
