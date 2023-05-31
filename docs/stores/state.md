# State Store

> Pinia store that tracks the application state using object hashing.
> Emits the `load` when a state is loaded and the `change` event when the data changes.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| data | current application state | object | -      | `null` |
| history | history of states | array | -      | `[]` |
| historySize | history size | number | -      | `25` |
| dataChange | whether the state has changed since last request | boolean | -      | `false` |
| dataChangeTime | last time a data change was recorded | number | -      | `Date.now()` |

## Getters

### hash

> Returns the hash for the current state.
> <br>`@returns` hash

## Methods

### calcHash

> Calculates the hash of the current application state.
> <br>`@param {Object}` data - the data to calculate a hash for
> <br>`@returns` hash

### checkChanges

> Check whether state has changed and set dataChange if so.
> <br>`@returns` dataChange

### on

> Registers an event listener for state events.
> <br>`@param {String}` event - event name
> <br>`@param {Function}` func - callback
> <br>`@returns` handle for event removal

### off

> Removes an event listener.
> <br>`@param {String}` event - event name
> <br>`@param {Number}` id - event handler id

### setData

> Update the application state.
> <br>`@param {object}` data
> <br>`@param {boolean}` check - whether to check for changes

### loadState

> Load the application state from state. If callback is not null, it is called with the current state.
> <br>`@param {object}` state

### resetDataChange

> Sets dataChange to false.

### exportState

> Exports the current application state (stringified to prevent Vue Proxy effects) and hash.
> <br>`@param {boolean}` reset - whether to reset dataChange
> <br>`@returns` `{ state: "...", hash: "..." }`

### clear

> Sets data and hash to null and clears the history.
