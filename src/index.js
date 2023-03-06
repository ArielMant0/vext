import * as components from './components'

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
