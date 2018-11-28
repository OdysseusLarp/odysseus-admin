import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    backend: {
      uri: "http://localhost:8888",
      username: "",
      password: ""
    }
  },
  mutations: {
    setBackend (state, backend) {
      state.backend = backend;
    }
  },
  actions: {

  }
})
