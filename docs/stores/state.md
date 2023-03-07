# State Store

> Pinia store that tracks the application state using object hashing.

## State

| Name      | Description                      | Type   | Values | Default              |
| --------- | -------------------------------- | ------ | ------ | -------------------- |
| data | current application state | object | -      | `null` |
| hash | has of the current application state | string | -      | `null` |
| dataChange | whether the state has changed since last request | boolean | -      | `false` |
| callback | function to call when a state is loaded | function | -      | `null` |

## Methods

### calcHash

> Calculates the hash of the current application state.
> <br>`@returns` hash

### checkChanges

> Check whether state has changed and set dataChange if so.
> <br>`@returns` dataChange

### resetDataChange

> Sets dataChange to false.

### setData

> Update the application state.
> <br>`@param {object}` data
> <br>`@param {boolean}` check - whether to check for changes

### loadState

> Load the application state from state. If callback is not null, it is called with the current state.
> <br>`@param {object}` state

### exportState

> Exports the current application state (stringified to prevent Vue Proxy effects) and hash.
> <br>`@param {boolean}` reset - whether to reset dataChange
> <br>`@returns` `{ state: "...", hash: "..." }`

### clear

> Sets data and hash to null.
