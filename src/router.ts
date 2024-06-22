import Vue from "vue";
import VueRouter from "vue-router";
import Home from "./views/Home.vue";
import DataBlobs from "./views/DataBlobs.vue";
import JumpDrive from "./views/JumpDrive.vue";
import Social from "./views/Social.vue";
import ShipLog from "./views/ShipLog.vue";
import Fleet from "./views/Fleet.vue";
import Infoboard from "./views/Infoboard.vue";
import Operations from "./views/Operations.vue";
import EmptyEpsilon from "./views/EmptyEpsilon.vue";
import Airlocks from "./views/Airlocks.vue";
import Dmx from "./views/Dmx.vue";
import LandMissions from "./views/LandMissions.vue";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/data",
      name: "data",
      component: DataBlobs,
    },
    {
      path: "/jump",
      name: "jump",
      component: JumpDrive,
    },
    {
      path: "/social",
      name: "social",
      component: Social,
    },
    {
      path: "/fleet",
      name: "fleet",
      component: Fleet,
    },
    {
      path: "/ship-log",
      name: "ship-log",
      component: ShipLog,
    },
    {
      path: "/infoboard",
      name: "infoboard",
      component: Infoboard,
    },
    {
      path: "/operations",
      name: "operations",
      component: Operations,
    },
    {
      path: "/emptyepsilon",
      name: "emptyepsilon",
      component: EmptyEpsilon,
    },
    {
      path: "/airlocks",
      name: "airlocks",
      component: Airlocks,
    },
    {
      path: "/dmx",
      name: "dmx",
      component: Dmx,
    },
    {
      path: "/landmissions",
      name: "landmisions",
      component: LandMissions,
    },
  ],
});
