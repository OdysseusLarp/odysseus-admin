import store from "../store";
import io from "socket.io-client";
import axios from "axios";
import Vue from "vue";

export function fetchAllFleetBlobs() {
  store.commit("setInfo", { text: "Loading Fleet...", type: "" });
  axios
    .get("/fleet", { baseURL: store.state.backend.uri })
    .then((response) => {
      store.commit("setInfo", {});
      store.commit("setAllFleetBlobs", response.data);
    })
    .catch((e) => {
      store.commit("setInfo", { text: "Error loading fleet", type: "error" });
      console.error("Error fetching data blobs (retrying in 5 secs): ", e);
      (<any>Vue).notify({
        title: "Error loading fleet from backend",
        text: "" + e,
        type: "error",
      });
      setTimeout(fetchAllFleetBlobs, 5000);
    });
}

export function initFleetBlobSync() {
  console.log("Initializing fleet blob syncing from " + store.state.backend.uri);

  fetchAllFleetBlobs();

  const socket = io(`${store.state.backend.uri}/fleet`, {});
  socket.on("fleetUpdate", (id: string, value: object) => {
    // console.log('dataUpdate: ' + type + ' ' + id, value)
    store.commit("setFleetBlob", value);
  });
  socket.on("fleetDelete", (id: string, value: object) => {
    // console.log('fleetDelete: ' + type + ' ' + id)
    store.commit("deleteFleetBlob", { id });
  });
}
