# VextCircleSettingsMenu

## Props

| Prop name     | Description                                                                                                             | Type           | Values | Default |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | ------- |
| modelValue    | Whether to show the menu - use with v-model.                                                                            | boolean        | -      |         |
| x             | Menu center position on the x axis                                                                                      | number         | -      | 10      |
| y             | Menu center position on the y axis                                                                                      | number         | -      | 10      |
| closeOnClick  | Whether to close the menu after an item was clicked.                                                                    | boolean        | -      | true    |
| background    | Whether to display a background for the menu.                                                                           | boolean        | -      | true    |
| itemsPerLevel | How many items per level to allow (default 8), must be greater than 0.<br/>Could be useful when doing custom rendering. | number         | -      | 8       |
| zIndex        | CSS z-index to use for the menu                                                                                         | number\|string | -      | 300     |

## Events

| Event name        | Properties                                    | Description                                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| update:modelValue | **value** `Boolean` - new model value         | Called when the modelValue is updated                                    |
| close             |                                               | Called when the menu is closed via the close button or an outside click. |
| click             | **item** `Object` - the item that was clicked | Called when an item is clicked - with the item as parameter.             |

---
