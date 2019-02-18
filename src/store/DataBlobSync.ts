import store from '../store'
import io from 'socket.io-client'
import axios from 'axios'


export function fetchAllDataBlobs() {
  axios.get("/data", { baseURL: store.state.backend.uri })
  .then(response => {
    store.commit('setAllDataBlobs', response.data)
  })
  .catch(e => {
    console.error("Error fetching data blobs (retrying in 5 secs): ", e)
    setTimeout(fetchAllDataBlobs, 5000)
  })
}

export function initDataBlobSync() {
  console.log("Initializing data blob syncing from " + store.state.backend.uri)

  fetchAllDataBlobs()

  const socket = io(`${store.state.backend.uri}/data`, {})
  socket.on('dataUpdate', (type: string, id: string, value: object) => {
    console.log('dataUpdate: ' + type + ' ' + id, value)
    store.commit('setDataBlob', value)
  });
  socket.on('dataDelete', (type: string, id: string, value: object) => {
    console.log('dataDelete: ' + type + ' ' + id)
    store.commit('deleteDataBlob', {type, id})
  });
}
