"use strict";

import Vue from 'vue';
import axios from "axios";
import store from '../store';

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  // baseURL: store.state.backend.url
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function(Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

function updateBackend(backend) {
  console.log("Setting backend URI to '" + backend.uri + "' " + (backend.username ? "with":"without") + " credentials");
  axios.defaults.baseURL = backend.uri;
  if (backend.username) {
    axios.withCredentials = true;
    axios.defaults.auth = {
      username: backend.username,
      password: backend.password
    };
  } else {
    axios.defaults.auth = undefined;
  }
}

store.watch(state => state.backend, updateBackend);
updateBackend(store.state.backend);

export default Plugin;
