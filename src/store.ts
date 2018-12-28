import Vue from 'vue'
import Vuex from 'vuex'
import { State } from './types'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'odysseus-admin',
  storage: localStorage
})

export default new Vuex.Store<State>({
  state: {
    backend: {
      uri: "http://localhost:8888",
      username: "",
      password: "",
      autoRefresh: 0,
    }
  },
  mutations: {
    setBackend (state, backend) {
      state.backend = backend;
    }
  },
  actions: {

  },
  plugins: [ vuexPersist.plugin ]
})
