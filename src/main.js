import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import "./index.css";
import helpers from "./helpers";
import VueLazyLoad from "vue3-lazyload";
import "@vuepic/vue-datepicker/dist/main.css";
import DropZone from "dropzone-vue";
import "dropzone-vue/dist/dropzone-vue.common.css";

const pinia = createPinia();

const app = createApp(App);

app.config.globalProperties.$helpers = helpers;

app.use(pinia).use(router).use(VueLazyLoad).use(DropZone).mount("#app");
