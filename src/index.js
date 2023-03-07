import * as components from './components'

import { useVextNote } from '@/store/note'
import { useVextState } from '@/store/state'
import { useVextHistory } from '@/store/history'
import { useVextApp } from '@/store/app'

export function createVextPlugin() {
    const plugin = {
        install: function(app) {
            app.provide("useVextNote", useVextNote);
            app.provide("useVextState", useVextState);
            app.provide("useVextHistory", useVextHistory);
            app.provide("useVextApp", useVextApp);
            // auto import all components
            for (const componentKey in components) {
                app.component(componentKey, components[componentKey])
            }
        }
    }
    return plugin;
}


