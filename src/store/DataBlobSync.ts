import store from "../store";
import io from "socket.io-client";
import axios from "axios";
import Vue from 'vue';


export function fetchAllDataBlobs() {
  store.commit("setInfo", { text: "Loading data...", type: "" });
  axios
    .get("/data", { baseURL: store.state.backend.uri })
    .then(response => {
      store.commit("setInfo", {});
      store.commit("setAllDataBlobs", response.data);
    })
    .catch(e => {
      store.commit("setInfo", { text: "Error loading data", type: "error" });
      console.error("Error fetching data blobs (retrying in 5 secs): ", e);
      (<any>Vue).notify({
        title: "Error loading data from backend",
        text: "" + e,
        type: "error"
      });
      setTimeout(fetchAllDataBlobs, 5000);
    });
}

export function initDataBlobSync() {
  console.log("Initializing data blob syncing from " + store.state.backend.uri);

  fetchAllDataBlobs();

  const socket = io(`${store.state.backend.uri}/data`, {});
  socket.on("dataUpdate", (type: string, id: string, value: object) => {
    // console.log('dataUpdate: ' + type + ' ' + id, value)
    store.commit("setDataBlob", value);
  });
  socket.on("dataDelete", (type: string, id: string, value: object) => {
    // console.log('dataDelete: ' + type + ' ' + id)
    store.commit("deleteDataBlob", { type, id });
  });
}
