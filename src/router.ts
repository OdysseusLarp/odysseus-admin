import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './views/Home.vue'
import DataBlobs from './views/DataBlobs.vue'
import Tasks from './views/Tasks.vue'
import Social from './views/Social.vue';
import ShipLog from './views/ShipLog.vue';
import Fleet from './views/Fleet.vue';
import Infoboard from './views/Infoboard.vue';

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/data',
      name: 'data',
      component: DataBlobs
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks
    },
    {
      path: '/social',
      name: 'social',
      component: Social
    },
    {
      path: '/fleet',
      name: 'fleet',
      component: Fleet
    },
    {
      path: '/ship-log',
      name: 'ship-log',
      component: ShipLog
    },
    {
      path: '/infoboard',
      name: 'infoboard',
      component: Infoboard
    },
  ]
})
