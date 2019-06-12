<template>
  <b-container fluid class="my-4">
    <p><strong>Fire DMX event:</strong></p>
    <p>
      <select v-model="selectedChannel">
        <option disabled>Choose channel</option>
        <option v-for="c in Object.keys(channels)" :key="c" :value="c">{{c}} ({{channels[c]}})</option>
      </select>
      &nbsp;&nbsp;&nbsp;
      <button @click="fireEvent">Fire event</button>
      <button @click="reset">Reset</button>
      (no confirmation popup)
    </p>
    <p><em>In most cases <strong>you should not</strong> fire DMX events directly! Instead perform the action which fires the DMX event.</em></p>
    <p><a href="https://docs.google.com/spreadsheets/d/1zF7ON0w8ZFF89w-btlcbMoXc25x8yOZSiLaiF7W-T5I/edit#gid=401779151" target="_blank">DMX channel specifications</a></p>
    <p><a href="https://docs.google.com/presentation/d/1nbXQE9N10Zm7uS45eW4R1VvYU4zZQ0PZbRovUq7bA5o/edit#slide=id.g4d32841109_0_0" target="_blank">Jump drive DMX event specifications</a></p>

    <p style="margin-top: 3em"><strong>Fire shipwide announcement:</strong></p>
    <p>
      <select v-model="selectedAnnouncement">
        <option disabled>Choose announcement</option>
        <option v-for="c in Object.keys(announcements)" :key="c" :value="c">{{c}} ({{announcements[c]}})</option>
      </select>
      &nbsp;&nbsp;&nbsp;
      <button @click="fireAnnouncement">Fire announcement</button>
      <button @click="reset">Reset</button>
      (no confirmation popup)
    </p>
    <p>DMX event on channel {{announcementChannel}} with value of the selected announcement.</p>

  </b-container>
</template>

<style lang="scss" scoped>
</style>


<script>
import axios from "axios"
import io from "socket.io-client"
import announcements from "./dmx-announcements"

const ANNOUNCEMENT_CHANNEL = 119

export default {
  components: {
  },
  data() {
    return {
      channels: {},
      selectedChannel: undefined,
      announcements,
      selectedAnnouncement: undefined,
      announcementChannel: ANNOUNCEMENT_CHANNEL,
    };
  },
  computed: {
    dataBlobs() {
      return this.$store.state.dataBlobs.filter(e => e.type === this.type);
    }
  },

  created() {
    axios.get('/dmx/channels')
    .then(response => {
      this.channels = response.data
    })
    .catch(error => {
      console.log("Error retrieving data:", error);
      this.$notify({
        title: "Error retrieving available DMX channels",
        text: "" + error,
        type: "error",
      });
    });
  },
  methods: {
    fireEvent() {
      if (!this.selectedChannel) {
        return
      }
      const name = this.selectedChannel
      const channel = this.channels[name]
      axios.post(`/dmx/event/${channel}`)
      .then(response => {
        this.$notify({
          title: `Fired DMX event ${name}`,
          text: `Channel ${channel}`,
          type: "success",
          duration: 10000,
        });
      })
      .catch(error => {
        console.log("Error firing event:", error);
        this.$notify({
          title: "Error firing DMX event",
          text: "" + error,
          type: "error",
        });
      });
      this.reset()
    },

    fireAnnouncement() {
      if (!this.selectedAnnouncement) {
        return
      }
      const name = this.selectedAnnouncement
      const value = this.announcements[name]
      axios.post(`/dmx/event/${ANNOUNCEMENT_CHANNEL}?value=${value}`)
      .then(response => {
        this.$notify({
          title: `Fired DMX event ${ANNOUNCEMENT_CHANNEL} value ${value}`,
          text: name,
          type: "success",
          duration: 10000,
        });
      })
      .catch(error => {
        console.log("Error firing event:", error);
        this.$notify({
          title: "Error firing DMX event",
          text: "" + error,
          type: "error",
        });
      });
      this.reset()
    },

    reset() {
      this.selectedChannel = undefined
      this.selectedAnnouncement = undefined
    }
  }
};
</script>
