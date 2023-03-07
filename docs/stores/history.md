# History Store

> Pinia store that tracks an interaction history with a `do` and an
> `undo` stack.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| menu | whether to show the menu | boolean | `[true, false]`      | `false` |
| undoStack | list of action that were done  | array | -  | `[]` |
| redoStack | list of action that were undone  | array | -  | `[]` |

## Methods

### do

> Tell the history that an action has been performed and store it in
> the history.
> <br>`@param {String}` desc - description of the action
> <br>`@param {Function}` doAction -  function that has been performed
> <br>`@param {Function}` undoAction - function that will be called on *undo*

### undo

> Tell the history to undo the last action. This will call the *undoAction*
> stored for the last action and push this action to the redo stack.

### redo

> Redo the last action that was undo (if available). This will pop the action
> from the redo stack and push it back to the undo stack.

### clear

> Clears all interactions from the history

### setMenu

> Whether to show the history menu/drawer
> <br>`@param {Boolean}` value - show if true; else hide