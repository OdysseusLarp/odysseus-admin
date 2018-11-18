import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './views/Home.vue'
import Taskbox from './views/Taskbox.vue'
import Tasks from './views/Tasks.vue'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/taskbox',
      name: 'taskbox',
      component: Taskbox
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks
    },
  ]
})
