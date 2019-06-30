import Vue from "vue";
import Vuex from "vuex";
import { State } from "./types";
import VuexPersist from "vuex-persist";

Vue.use(Vuex);

const vuexPersist = new VuexPersist({
  key: "odysseus-admin",
  storage: localStorage
});

const uri = window.location.hostname === 'localhost' ?
  'http://localhost:8888' :
  window.location.origin;

const store = new Vuex.Store<State>({
  state: {
    dataBlobs: [],
    info: {
      text: "",
      type: ""
    },
    backend: {
      uri: uri,
      username: "",
      password: "",
      autoRefresh: 15
    },
    dataBlobTypeChooser: {
      selectedType: null
    }
  },
  mutations: {
    setBackend(state, backend) {
      state.backend = backend;
    },
    setDataBlob(state, data) {
      let found = false;
      state.dataBlobs = state.dataBlobs.map(e => {
        if (e.type === data.type && e.id == data.id) {
          found = true;
          return data;
        } else {
          return e;
        }
      });
      if (!found) {
        state.dataBlobs.push(data);
      }
    },
    deleteDataBlob(state, data) {
      state.dataBlobs = state.dataBlobs.filter(
        e => e.type !== data.type || e.id !== data.id
      );
    },
    setAllDataBlobs(state, datas) {
      state.dataBlobs = datas;
    },
    setInfo(state, info) {
      state.info = info;
    },

    dataBlobTypeChooser_set_selectedType(state, value) {
      state.dataBlobTypeChooser.selectedType = value;
    }
  },
  actions: {},
  plugins: [vuexPersist.plugin]
});

// DEBUGGING: Allow accessing store from global scope:
// declare global {
//   interface Window { store: any; }
// }
// window.store = store

export default store;
