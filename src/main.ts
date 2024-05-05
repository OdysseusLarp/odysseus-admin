import Vue from "vue";
import "./plugins/bootstrap-vue";
import "./plugins/axios";
import "./plugins/vue-fontawesome";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { initDataBlobSync } from "./store/DataBlobSync";
import { initFleetBlobSync } from "./store/FleetBlobSync";

import Notifications from "vue-notification";
Vue.use(Notifications);

Vue.config.productionTip = false;

initDataBlobSync();
initFleetBlobSync();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
