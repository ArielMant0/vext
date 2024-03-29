# VEXT

[![Releases](https://github.com/ArielMant0/vext/actions/workflows/release.yml/badge.svg)](https://github.com/ArielMant0/vext/actions/workflows/release.yml)
[![Deploy](https://github.com/ArielMant0/vext/actions/workflows/deploy.yml/badge.svg)](https://github.com/ArielMant0/vext/actions/workflows/deploy.yml)
[![NPM](https://img.shields.io/npm/v/@nullbuild/vext?color=critical&logo=npm)](https://www.npmjs.com/package/@nullbuild/vext)

VEXT is a Vue component library to add externalization capabilities to any Vue application,
primarily intended to be used visual analytics systems implemented with Vue.

## Documentation

Documentation can be found at [https://arielmant0.github.io/vext/](https://arielmant0.github.io/vext/).

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

## Dependencies

These dependencies are required to use VEXT, but declared as external when building the project,
i.e. they are not included in the bundle.

- [Vue](https://vuejs.org)
- [Vuetify](https://vuetifyjs.com/en/)
- [VueUse](https://vueuse.org)
- [Pinia](https://pinia.vuejs.org)
- [fabric.js](http://fabricjs.com)
- [vue-json-pretty](https://www.npmjs.com/package/vue-json-pretty)
- [jsPDF](https://parall.ax/products/jspdf)
- [JSZip](https://stuk.github.io/jszip/)
- [html2canvas](https://html2canvas.hertzen.com)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/)

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