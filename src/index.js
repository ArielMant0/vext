import * as components from './components'

import { useVextNote } from './store/note.js'
import { useVextState } from './store/state.js'
import { useVextHistory } from './store/history.js'
import { useVextApp } from './store/app.js'

function createVextPlugin() {
    const plugin = {
        install: function(app) {
            // auto import all components
            for (const componentKey in components) {
                app.component(componentKey, components[componentKey])
            }
        }
    }
    return plugin
}

export {
    createVextPlugin,
    useVextNote,
    useVextState,
    useVextHistory,
    useVextApp
}
