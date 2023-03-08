# VEXT

## Description

VEXT is a Vue component library to add externalization capabilities to any Vue application,
primarily to visual analytics systems implemented with Vue.

The [VextNoteCanvas](/src/components/VextNoteCanvas) component holds a fabric.js canvas that can be used to create annotations, i. e. drawings, shapes or text.

The [VextNoteConfiguration](/src/components/VextNoteConfiguration) component is basically a sidebar that lets you use and control the NoteCanvas and all related externalization capabilites.
It lets you select the tool you want to use and handles state changes.

The [VextHistoryControls](/src/components/VextHistoryControls) component can be added to a navigation bar, they let the user undo or redo operations tracked with the history store.

The [VextHistoryDrawer](/src/components/VextHistoryDrawer) component holds a drawer that lets the user see the actions in the history store.

### Stores

The [`note` store](/stores/note) implements much of the externalization capabilities.

The [`state` store](/stores/state) takes care of tracking state changes. You need to pass your application state, e.g. data you visualize, to it so that the state can be tracked and revisited later.

The [`history` store](/stores/history) implements the action history mechanism used by the `note` store.

The [`app` store](/stores/app) implements the action history mechanism used by the `note` store.

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

## Usage

To use the components provided by VEXT, you need to register the plugin and make
sure that all Vuetify components used by the plugin ([see here](#vuetify-components-and-directives))
are actually provided. For more information see [treeshaking](https://vuetifyjs.com/en/features/treeshaking/).

Here is a simple example, starting off from an essentials vuetify application:

```javascript
// src/plugins/index.js

import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import { createVextPlugin } from '@nullbuild/vext'

import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css';

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .component("vue-json-pretty", VueJsonPretty) // add the VueJsonPretty component
    .use(createVextPlugin())                     // add VEXT components
}

```

```javascript
// src/plugins/vuetify.js

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components: components, // necessary so that all components are included
  directives: directives,  // necessary so that all directives are included
})

```

Here is an example on how to use the stores in a Vue component.
This code uses the state store and manually sets the state (once).

```javascript
// src/components/MyComponent.vue
<script setup>
import { useVextState } from 'vuetify'

const mystateobject = {
  key0: ...,
}

const vextState = useVextState();
vextState.setData(mystateobject);

</script>
```

### Vuetify Components and Directives

Components:
- VBtn
- VSlider
- VTextField
- VIcon
- VDialog (+ related components)
- VCard (+ related components)
- VItemGroup (+ related components)
- VList (+ related components)
- VHover
- VContainer
- VRow
- VCol

Directives:
- Ripple
