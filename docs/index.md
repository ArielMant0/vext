# VEXT

## Description

VEXT is a Vue component library to add externalization/annotation capabilities to any Vue application,
primarily for visual analytics systems implemented with Vue. The two essential components are the following:

The [VextNoteCanvas](/src/components/VextNoteCanvas) component holds a fabric.js canvas that can be used to create annotations, i. e. drawings, shapes or text. It should be included where you want to annotate.

The [VextNoteDrawer](/src/components/VextNoteDrawer) component is a sidebar that lets you use and control the NoteCanvas and all related externalization capabilities. It lets you select the mode you want to use and handles state changes.

You can find the source code on [GitHub](https://github.com/ArielMant0/vext).

### Stores

A lot of settings and functionalities is separated into different PINIA stores that you can also use.

The [`note` store](/stores/note) implements much of the externalization functionalities.

The [`settings` store](/stores/settings) handles settings.

The [`state` store](/stores/state) takes care of tracking state changes. You need to pass your application state, e.g. data you visualize, to it so that the state can be tracked and revisited later.

The [`history` store](/stores/history) implements the action history mechanism used by the `note` store.

The [`app` store](/stores/app) implements the action history mechanism used by the `note` store.

The [`whiteboard` store](/stores/whiteboard) implements whiteboard functionalities.

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
sure that all Vuetify components used by the plugin are actually provided.
For more information see [treeshaking](https://vuetifyjs.com/en/features/treeshaking/).

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

Here is a minimal example on how to include the required VEXT component in a view. This example is also included in the GitHub repository in the src folder.

```Vue
<!-- src/views/MyView.vue -->
<template>
  <div>
    <VextNoteDrawer v-model="open"/>
    <section style="width: 100%; height: 100%;">
      <VextNoteCanvas :width="visAreaWidth" :height="visAreaHeight" show-border/>
      <div>
        <VisA :data="dataA"/>
        <VisB :data="dataB"/>
      </div>
    </section>
  </div>
</template>

<script setup>
  // ... imports

  const open = ref(false);
  const visAreaWidth = ref(800);
  const visAreaHeight = ref(600);
</script>
```

Here is an example on how to use the stores in a Vue component.
This code uses the state store and manually sets the state (once).

```Vue
<!-- src/components/MyComponent.vue -->
<script setup>
import { useVextState } from '@nullbild/vext'

const vextState = useVextState();
const myStateObj = {
  key0: "...",
}

function loadState(state) {
  // ...
}

function modifyState() {
  // tell state store that the state changed
  vextState.setData(myStateObj);
}

// register callback that is invoked when a state is loaded
vextState.on("load", loadState);
</script>
```
