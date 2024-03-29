import * as components from './components'

import { useVextNote } from './store/note.js'
import { useVextSettings } from './store/settings'
import { useVextState } from './store/state.js'
import { useVextHistory } from './store/history.js'
import { useVextApp } from './store/app.js'
import { useVextInput } from './store/input.js'
import { useVextWhiteboard } from './store/whiteboard.js'

import * as VEXT_ENUMS from './use/enums.js';

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
    useVextSettings,
    useVextState,
    useVextHistory,
    useVextApp,
    useVextInput,
    useVextWhiteboard,
    VEXT_ENUMS
}
