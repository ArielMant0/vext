import * as components from './components'

import { useVextNote } from './store/note.js'
import { useVextState } from './store/state.js'
import { useVextHistory } from './store/history.js'
import { useVextApp } from './store/app.js'

function createVextPlugin() {
    // app.provide("useVextNote", useVextNote);
    // app.provide("useVextState", useVextState);
    // app.provide("useVextHistory", useVextHistory);
    // app.provide("useVextApp", useVextApp);
    // auto import all components
    for (const componentKey in components) {
        app.component(componentKey, components[componentKey])
    }
}

export default createVextPlugin

export { useVextNote, useVextState, useVextHistory, useVextApp }
