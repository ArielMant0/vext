# VextLayerInfo

## Props

| Prop name    | Description                                                | Type           | Values | Default |
| ------------ | ---------------------------------------------------------- | -------------- | ------ | ------- |
| data         | Layer data                                                 | object         | -      |         |
| active       | Whether this layer is active.                              | boolean        | -      |         |
| modifyName   | Whether to allow modidying the layer name.                 | boolean        | -      | true    |
| annotations  | Whether to show the annotations indicator.                 | boolean        | -      | true    |
| connections  | Whether to show the connections indicator.                 | boolean        | -      | true    |
| comments     | Whether to allow comments.                                 | boolean        | -      | true    |
| opacity      | Whether to allow changing the layer's opactiy.             | boolean        | -      | true    |
| actions      | Whether to show the layer actions (merge, delete, export). | boolean        | -      | true    |
| state        | Whether to show the layer's application state.             | boolean        | -      | true    |
| merge        | Whether to allow merging this layer.                       | boolean        | -      | true    |
| treeDepth    | The tree depth to use for the application state display.   | number         | -      | 1       |
| tooltipDelay | The delay to use when showing tooltips.                    | number\|string | -      | 500     |

## Events

| Event name | Properties | Description                                                           |
| ---------- | ---------- | --------------------------------------------------------------------- |
| node-click |            | Emitted when the user clicks on a tree node in the application state. |

## Slots

| Name          | Description | Bindings |
| ------------- | ----------- | -------- |
| title-prepend |             |          |
| title         |             |          |
| title-append  |             |          |

---
