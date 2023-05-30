# VextHistoryDrawer

## Props

| Prop name  | Description                                            | Type    | Values                                           | Default    |
| ---------- | ------------------------------------------------------ | ------- | ------------------------------------------------ | ---------- |
| modelValue | Whether to show the history drawer - use with v-model. | boolean | -                                                |            |
| undoIcon   | Icon to use for the undo button.                       | string  | -                                                | "mdi-undo" |
| redoIcon   | Icon to use for the redo button.                       | string  | -                                                | "mdi-redo" |
| location   | At which location to show the drawer.                  | string  | `top`, `end`, `bottom`, `start`, `left`, `right` | "left"     |

## Events

| Event name        | Properties | Description                             |
| ----------------- | ---------- | --------------------------------------- |
| update:modelValue |            | Called when the model value is updated. |

---
