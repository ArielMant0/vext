# VextCircleMenu

## Props

| Prop name     | Description                                                                                                                                                                                                                                                                                                                                                                                                                  | Type           | Values | Default |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | ------- |
| items         | Items to display in the menu, e.g.<br/>{<br/> "color": "error", // color (vuetify- compatible)<br/> "icon": "mdi-account" // icon for the button - will use value as fallback<br/> "value": 0, // value - fallback for display if no icon is set<br/> "forceOpen": true // if true, menu will not close when this item is clicked<br/> "forceClose": true // if true, menu will always close when this item is clicked<br/>} | array          | -      |         |
| itemsPerLevel | How many items per level to allow (default 8), must be greater than 0.<br/>Could be useful when doing custom rendering.                                                                                                                                                                                                                                                                                                      | number         | -      | 8       |
| closeOnClick  | Whether to close the menu after an item was clicked.                                                                                                                                                                                                                                                                                                                                                                         | boolean        | -      | true    |
| background    | Whether to display a background for the menu.                                                                                                                                                                                                                                                                                                                                                                                | boolean        | -      | true    |
| modelValue    | Whether to show the menu - use with v-model.                                                                                                                                                                                                                                                                                                                                                                                 | boolean        | -      | true    |
| x             | Menu center position on the x axis                                                                                                                                                                                                                                                                                                                                                                                           | number         | -      | 10      |
| y             | Menu center position on the y axis                                                                                                                                                                                                                                                                                                                                                                                           | number         | -      | 10      |
| zIndex        | CSS z-index to use for the menu                                                                                                                                                                                                                                                                                                                                                                                              | number\|string | -      | 300     |

## Events

| Event name        | Properties                                    | Description                                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| update:modelValue | **value** `Boolean` - new model value         | Called when the modelValue is updated                                    |
| close             |                                               | Called when the menu is closed via the close button or an outside click. |
| click             | **item** `Object` - the item that was clicked | Called when an item is clicked - with the item as parameter.             |

## Slots

| Name   | Description | Bindings |
| ------ | ----------- | -------- |
| button |             | <br/>    |

---
