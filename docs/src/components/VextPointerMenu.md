# VextPointerMenu

## Props

| Prop name        | Description                                                                                  | Type           | Values | Default |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------- | ------ | ------- |
| indicator        | Whether to show an indicator when the gesture is initiated.                                  | boolean        | -      | true    |
| stroke           | Whether to stroke the indicator.                                                             | boolean        | -      | true    |
| fill             | Whether to fill the indicator.                                                               | boolean        | -      | false   |
| strokeColor      | The stroke color to use for the indicator.                                                   | string         | -      | "gray"  |
| fillColor        | The fill color to use for the indicator                                                      | string         | -      | "gray"  |
| timeThresholdMin | The minimum threshold (in ms) before the indicator is shown after initiating \* the gesture. | number         | -      | 125     |
| timeThresholdMax | The maximum threshold (in ms) that has to be reached with the gesture to open the menu.      | number         | -      | 1000    |
| zIndex           | CSS z-index value for the menu element.                                                      | number\|string | -      | 300     |

## Slots

| Name      | Description | Bindings   |
| --------- | ----------- | ---------- |
| indicator |             | <br/><br/> |

---
