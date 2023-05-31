# Note Store

> Pinia store that implements the externalization capabilities, storing layers
> all configuration options (e.g. brush size, colors, etc.)

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| enabled | whether VEXT is enabled | boolean | -      | `true` |
| canvas | fabric.js canvas object | object | -      | `null` |
| mode | which mode is currently active | string | `["layer", "brush", "shape", "edit", "connect", "settings", "whiteboard"]` | `"layer"` |
| currentState | current state as stored in the state store | object | - | `null` |
| layers | list of all layers (AnntotationLayer) | array | - | `[]` |
| activeLayer | currently active layer id | string | - | `null` |
| layerMode | how layers are added | string | `["on annotation", "on state change", "manual"]` | `on annotation` |
| LAYER_ID_IDX | number for the next layer id | number | - | `0` |
| activeObjectUUID | UUID of the selected fabric.js object | string | - | `null` |
| activeObject | the selected fabric.js object | object | - | `null` |
| connectLocation | start location of a connection | array | - | `[0, 0]` |
| connectObject | connection data | any | - | `null` |

## Getters

### currentLayer

> Return the currently active layer object if it exists, null otherwise.

### previewLayer

> Returns the preview layer object if it exists, null otherwise.

### color

> Currently active color.

### layerColors

> Array of layer colors.

### nextColor

> Next available color from the default colors.
> Will cycle if the number of layers exceeds the number of default colors.

### nextID

> An ID for a next layer.

## Methods

### enable

> Enable the VEXT annotation functionalities.

### disable

> Disable the VEXT annotation functionalities.

### enablePointerEvents

> Enable or disable pointer events for the canvas node.
> <br>`@param {Boolean}` value

### emit

> Emit an event from the note event handler.
> <br>`@param {String}` name - event name
> <br>`@param {*}` data - event payload

### on

> Register an event handler.
> <br>`@param {String}` name - event name
> <br>`@param {Function}` hadler - event callback handler
> <br>`@returns` handle id

### off

> Remove an event handler for the given event.
> <br>`@param {String}` name - event name
> <br>`@param {Number}` handler - event handle
> <br>`@returns` true if the event was removed

### isUniqueID

> Whether the given id already exists for another layer.
> <br>`@param {String}` id
> <br>`@returns` true if the id already exists, else false

### getLayerIndex

> Get the index in the layers array for a given layer id
> <br>`@param {String}` id
> <br>`@returns` index if exists, else -1

### getLayer

> Get the AnnotationLayer object for a given layer id
> <br>`@param {String}` id
> <br>`@returns` AnnotationLayer object if exists, else null

### overwriteState

> Set the current application state as the associated state of the
> currently active layer.
> <br>`@param {Object}` state - current application state

### renameLayer

> Rename the given layer. If `id` is null, active layer will be renamed.
> <br>`@param {String}` oldId - layer id
> <br>`@param {String}` newId - new layer name/id
> <br>`@returns` true if the layer was renamed, otherwise false

### addLayerComment

> Add a comment to the given layer. If `id` is null, the comment is added to the active layer.
> <br>`@param {String}` comment - comment
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@returns` true if the comment was added, otherwise false

### updateLayerComment

> Update the comment of the given layer. If `id` is null, the active layer is assumed.
> <br>`@param {String}` comment - comment
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Number}` index - comment index (default `0`)
> <br>`@returns` true if the comment was updated, otherwise false

### removeLayerComment

> Remove the comment of the given layer. If `id` is null, the active layer is assumed.
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Number}` index - comment index (default `0`)
> <br>`@returns` true if the comment was removed, otherwise false

### removeLayerComments

> Remove all comments of the given layer. If `id` is null, the active layer is assumed.
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@returns` true if the comments were removed, otherwise false

### mergeLayers

> Merge annotations from one layer into another. The state of the merged layer is lost in the process. If `idInto` is null, the active layer is assumed.
> <br>`@param {String}` idFrom - layer to merge
> <br>`@param {String}` idInto - layer to merge into (default `null`)

### addLayer

> Create a new layer with the given state and set it as the active layer.
> <br>`@param {Object}` state - application state
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {String}` color - layer color (default `null`)
> <br>`@param {Number}` width - canvas width (default `null`)
> <br>`@param {Number}` height - canvas height (default `null`)
> <br>`@param {Array}` items - annotation items (default `[]`)
> <br>`@param {Array}` comments - comments (default `[]`)
> <br>`@param {Array}` connections - connections (default `[]`)

### removeLayer

> Remove the layer with the given id, if it exists.
> <br>`@param {String}` id -  layer id
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeEmptyLayers

> Remove all layers that contain no annotations.
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setActiveLayer

> Set the active layer to the layer with id.
> <br>`@param {String}` id
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setLayerVisibility

> Set the visibility for the layer with id.
> <br>`@param {Boolean}` visible
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history
> <br>`@param {Boolean}` render - whether to request a re-render of the canvas

### setLayerOpacity

> Set the opacity for the layer with id.
> <br>`@param {Number}` value
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)
> <br>`@param {Boolean}` render - whether to request a re-render of the canvas (default `true`)

### setMode

> Set the active mode.
> <br>`@param {String}` mode
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setPreviousMode

> Go to the previous mode.
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setBrushSize

> Set the brush size for drawing.
> <br>`@param {Number}` size - brush size in pixels
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setBrushDecimation

> Set the decimation value for drawing.
> <br>`@param {Number}` value - decimation value
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### selectColor

> Select either the primary or secondary color.
> <br>`@param {Number}` id - 0 if primary color, else 1
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setColorPrimary

> Set the primary color.
> <br>`@param {String}` color
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)


### setColorSecondary

> Set the secondary color.
> <br>`@param {String}` color
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setShape

> Set the shape type for the shape mode.
> <br>`@param {String}` shape
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### addObject

> Add an object to the active layer.
> <br>`@param {Object}` obj - fabric.js object
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` addToCanvas - whether to add them to the canvas (default `true`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### addObjects

> Add a list of objects to the active layer
> <br>`@param {Array}` objs - list of fabric.js objects
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` addToCanvas - whether to add them to the canvas
> <br>`@param {Boolean}` record - whether to record this action in history

### addObjectFromJSON

> Add an object to the active layer
> <br>`@param {String}` json - JSON representation of a fabric.js object
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### addObjectsFromJSON

> Add a list of object to the active layer
> <br>`@param {Array}` json - a list of JSON representations of frabic.js objects
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeObject

> Remove the object with uuid from a layer
> <br>`@param {String}` uuid
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeObjects

> Remove all objects with a UUID included in uuids from a layer
> <br>`@param {Array}` uuids
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeLastObject

> Remove the last object that was added.
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeLastObject

> Remove the most recently added annotation object.
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### modifyObject

> Modify an annotation object.
> <br>`@param {String}` uuid - object UUID
> <br>`@param {Object}` transform - object transform
> <br>`@param {String}` layer - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### setActiveObject

> Set a specific annotation object to be active.
> <br>`@param {String}` uuid - object UUID
> <br>`@param {String}` layer - layer id (default `null`)

### getActiveObject

> Returns the currently active fabric.js object.
> <br>`@returns` active object or null

### discardActiveObject

> Discards the currently active fabric.js object.

### deleteActiveObject

> Deletes the object currently selected in fabric.js, if it exists.
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### layerFromItem

> Get the layer object for a given fabric.js item.
> <br>`@param {Object}` item
> <br>`@returns` layer object if exists, else undefined

### resizeCanvas

> Resize the fabric.js canvas to [width, height].
> <br>`@param {Number}` width
> <br>`@param {Number}` height

### setCanvasZIndex

> Sets the z-index for the canvas and wrapper elements.
> <br>`@param {number}` value - z-index value to set

### setContentNode

> Set the visualization HTML node to include when rendering a layer into a PDF.
> <br>`@param {HTMLElement}` node

### setCanvas

> Set the fabric.js canvas object - since it cannot be instantiated in a store.
> This adds several event listeners to the canvas.
> <br>`@param {Object}` canvas

### hasStateHash

> Whether a layer with the given state exists.
> <br>`@param {String}` hash
> <br>`@returns` true if exists, else false

### layerFromStateHash

> Returns the corresponding layer for a given state hash.
> <br>`@param {String}` hash
> <br>`@returns` layer object if exists, else undefined

### setState

> Set the current application state.
> <br>`@param {object}` state

### selectPreviewLayer

> Select the preview layer as active layer.

### addConnection

> Add a connection to a specific annotation in a layer.
> <br>`@param {String}` uuid - annotation UUID
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### addConnectionFromJSON

> Add a connection from a JSON object to a specific annotation in a layer.
> <br>`@param {String}` uuid - annotation UUID
> <br>`@param {Object}` json - connection
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeLastConnection

> Remove the most recently added connection of an annotation from a layer.
> <br>`@param {String}` uuid - annotation UUID
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### removeConnectionAtIndex

> Remove the a connection of an annotation from a layer.
> <br>`@param {String}` uuid - annotation UUID
> <br>`@param {Number}` index - connection index
> <br>`@param {String}` id - layer id (default `null`)
> <br>`@param {Boolean}` record - whether to record this action in history (default `true`)

### startConnect

> Start a connection action.
> <br>`@param {Object}` element - data to connect to
> <br>`@param {Number}` x - x position in window coordinates
> <br>`@param {Number}` y - y position in window coordinates

### moveConnect

> Move a started connection action.
> <br>`@param {Number}` x - new x position in window coordinates
> <br>`@param {Number}` y - new y position in window coordinates

### endConnect

> End a started connection action.
> <br>`@param {Number}` x - final x position in window coordinates
> <br>`@param {Number}` y - final y position in window coordinates

### async importLayer

> Reads the json file and creates a layer from it.
> <br>`@param {File}` file - JSON file
> <br>`@returns` promise that is resolved when the layer is added

### exportLayer

> Return the currently active layer as a JSON object.
> <br>`@returns` layer object if exists, else throws an exception

### async exportZIP

> Creates a .zip archive containing a report PDF, the layer as JSON, and state as JSON
> that is then automatically downloaded.
> <br>`@param {String}` name - name to use for the zip file (default available)
> <br>`@param {Boolean}` canvasOnly - one include the canvas, not the whole content in the report PDF

