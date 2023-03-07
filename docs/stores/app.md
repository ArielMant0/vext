# Vext App Store

> Pinia store that holds generic app information regarding the global alert
> or tooltip.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| alertText | global alert text | string | -      | `""`         |
| alertType | global alert type   | string | `["info", "success", "warning", "error"]` | `"error"` |
| alertDuration | duration in ms that the alert is shown  | number | -      | `6000` |
| ttX | x position of the tooltip  | number | -      | `0` |
| ttY | y position of the tooltip  | number | -      | `0` |
| ttContent | content of the tooltip  | string | -      | `""` |
| ttPlacement | placement of the tooltip  | string | -      | `"auto"` |

## Methods

### alert

> Set the alert text and type for a global alert
> <br>`@param {String}` text
> <br>`@param {String}` type

### info

> Set the alert text with the type 'info'
> <br>`@param {String}` text

### success

> Set the alert text with the type 'success'
> <br>`@param {String}` text

### warning

> Set the alert text with the type 'warning'
> <br>`@param {String}` text

### error

> Set the alert text with the type 'error'
> <br>`@param {String}` text

### showTooltip

> Show the global VextToolTip with content at position [x, y].
> Content can be either a string, an object or an array of objects.
> The x and y coordinates are expected to be in absolute document
> coordinates. If no placement is given, the default is 'auto'.
> <br>`@param {*}` content
> <br>`@param {Number}` x
> <br>`@param {Number}` y
> <br>`@param {String}` placement

### hideTooltip

> Hide the tooltip.

### updateTooltipPos

> Update the tooltip's position and placement.
> <br>`@param {Number}` x
> <br>`@param {Number}` y
> <br>`@param {String}` placement
