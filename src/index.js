import * as components from './components'

import { useVextNote } from '@/store/note'
import { useVextState } from '@/store/state'
import { useVextHistory } from '@/store/history'
import { useVextApp } from '@/store/app'

export function createVextPlugin() {
    const plugin = {
        install: function(app) {
            // auto import all components
            for (const componentKey in components) {
                app.component(componentKey, components[componentKey])
            }
        }
    }
    return plugin;
}

export {
    useVextNote,
    useVextState,
    useVextHistory,
    useVextApp
}
