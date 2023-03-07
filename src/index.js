import * as components from './components'

import { vextNoteStore } from '@/store/note'
import { vextStateStore } from '@/store/state'
import { vextHistoryStore } from '@/store/history'
import { vextAppStore } from '@/store/app'

export function createVextPlugin() {
    const plugin = {
        install: function(app) {
            app.provide("vextNoteStore", vextNoteStore);
            app.provide("vextStateStore", vextStateStore);
            app.provide("vextHistoryStore", vextHistoryStore);
            app.provide("vextAppStore", vextAppStore);
            // auto import all components
            for (const componentKey in components) {
                app.component(componentKey, components[componentKey])
            }
        }
    }
    return plugin;
}


