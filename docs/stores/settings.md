# Vext Settings Store

> Pinia store that holds settings for different VEXT tools (brush & shape).

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| pointerMenu | whether the pointer menu is open | boolean | -      | `false`         |
| onAction | whether to open the pointer menu after an annotation action | boolean | -      | `true`         |
| onGesture | whether to open the pointer menu after with a specific gesture | boolean | -      | `true`         |
| closeOnClick | whether to close the pointer menu after clicking one of its items | boolean | -      | `true`         |
| historyLimit | how many interactions to store in the history log | number | -      | `50`         |
| activeColor | currently active color (primary or secondary) | number | `[0,1]`      | `0`         |
| color0 | primary color | string | -      | `"#ffffff"`         |
| color1 | secondary color | string | -      | `"#000000"`         |
| brushSize | size of the drawing brush | number | -      | `1`         |
| brushDecimation | how much to decimate drawn lines | number | -      | `5`         |
| shape | selected shape in the shape mode | string | `["text", "circle", "rectangle", "triangle"]`      | `"text"`         |
| shapeDim0 | size of the first dimension for the new shape | number | -      | `10`         |
| shapeDim1 | size of the second dimension for the new shape | number | -      | `10`         |
| defaultColors | array of colors to use for layers | number | -      | `["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]`         |

## Getters

### color

> Returns the currently selected color string.

## Methods

### setCanvas

> Set the fabric.js canvas instance to use for the annotations.
> <br>`@param {Object}` canvas - the fabric.js canvas

### defaultColorAt

> Returns the default color at a specific index.
> Colors are wrapped -> starts at the beginning in index is out of bounds.
> <br>`@param {Number}` index - color index
> <br>`@returns {String}` the color

### setHistoryLimit

> Sets the history interaction limit (minimum value of 1 is enforced)
> <br>`@param {Number}` limit


### setBrushSize

> Sets the brush size to use for drawing.
> <br>`@param {Number}` size - brush size in pixels
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### setBrushDecimation

> Sets the brush decimation value.
> <br>`@param {Number}` value - value in pixels
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### selectColor

> Select a color by id (either primary = 0 or secondary = 1).
> If the passed id is not 0 or 1, the selected color is toggled.
> <br>`@param {Number}` id - color id
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### setColorPrimary

> Sets the color to use for the primary color.
> <br>`@param {String}` color - color value
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### setColorSecondary

> Sets the color to use for the secondary color.
> <br>`@param {String}` color - color value
> <br>`@param {Boolean}` record - whether to record this action (default `true`)

### setShape

> Sets the shape to use in the shape mode
> <br>`@param {String}` shape - shape type
> <br>`@param {Boolean}` record - whether to record this action (default `true`)
