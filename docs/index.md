# VEXT

## Description

VEXT is a Vue component library to add externalization capabilities to any Vue application,
primarily to visual analytics systems implemented with Vue.

The [NoteCanvas](/src/components/NoteCanvas) component holds a fabric.js canvas that can be used to create annotations, i. e. drawings, shapes or text.

The [NoteConfiguration](/src/components/NoteConfiguration) component is basically a sidebar that lets you use and control the NoteCanvas and all related externalization capabilites.
It lets you select the tool you want to use and handles state changes.

The [HistoryControls](/src/components/HistoryControls) component can be added to a navigation bar, they let the user undo or redo operations tracked with the history store.

The [HistoryDrawer](/src/components/HistoryDrawer) component holds a drawer that lets the user see the actions in the history store.

## Installation

To use this package, simply install it via yarn or npm.

using yarn:
```shell
yarn add @nullbuild/vext
```

using npm:
```shell
npm install @nullbuild/vext
```

## Stores

### note

The [`note` store](/stores/note) implements much of the externalization capabilities.

### state

The [`state` store](/stores/state) takes care of tracking state changes. You need to pass your application state, e.g. data you visualize, to it so that the state can be tracked and revisited later.

### history

The [`history` store](/stores/history) implements the action history mechanism used by the `note` store.
