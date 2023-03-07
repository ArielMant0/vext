# VextToolTip

## Props

| Prop name | Description                                         | Type   | Values | Default |
| --------- | --------------------------------------------------- | ------ | ------ | ------- |
| width     | Minimum width of the tooltip                        | number | -      | 250     |
| height    | Minimum height of the tooltip                       | number | -      | 250     |
| offset    | Offset to add to the tooltip position (for x and y) | number | -      | 5       |

## Expose

### show

> Show the tooltip with 'content' at position [mx, my] and 'placement'.
> Content can be either a sting, object or array of objects. <br/>`@param` tooltip placement<br/>`@access` public

### hide

> Hide the tooltip <br/>`@access` public

### updatePosition

> Update the position of the tooltip wit coordinates [mx, my] and placement
> 'placement'. This may be useful if you want the tooltip to stay at the same
> position relative to the mouse. If no placement is given, the last set
> placement is used. <br/>`@param` tooltip placement<br/>`@access` public

---
