<template>
  <b-container fluid class="my-4">
    <p><strong>Fire DMX event:</strong></p>
    <p>
      <select v-model="selectedChannel">
        <option disabled>Choose channel</option>
        <option
          v-for="c in Object.keys(channels)"
          :key="c"
          :value="c"
          :disabled="!channels[c]"
        >
          {{ c }} {{ channels[c] ? `(${channels[c]})` : "" }}
        </option>
      </select>
      &nbsp;&nbsp;&nbsp;
      <button @click="fireEvent">Fire event</button>
      <button @click="reset">Reset</button>
      (no confirmation popup)
    </p>
    <p>
      <em
        >In most cases <strong>you should not</strong> fire DMX events directly!
        Instead perform the action which fires the DMX event.</em
      >
    </p>
    <p>
      <a
        href="https://docs.google.com/spreadsheets/d/1mRvZRy1BF4fMMMeLxJHCa-LvVdn0C8GnQVu5wlSvsPE/edit#gid=0"
        target="_blank"
        >DMX channel specifications</a
      >
    </p>
    <p>
      <a
        href="https://docs.google.com/presentation/d/1T3lxvrgauPcpKyM31RYYDEfTDfUCgJVXkqpqUQIjVRU/edit#slide=id.g4d32841109_0_0"
        target="_blank"
        >Jump drive DMX event specifications</a
      >
    </p>
  </b-container>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";

const ANNOUNCEMENT_CHANNEL = 119;

export default {
  components: {},
  data() {
    return {
      channels: {},
      selectedChannel: undefined,
    };
  },
  computed: {
    dataBlobs() {
      return this.$store.state.dataBlobs.filter((e) => e.type === this.type);
    },
  },

  created() {
    axios
      .get("/dmx/channels")
      .then((response) => {
        this.channels = response.data;
      })
      .catch((error) => {
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
        return;
      }
      const name = this.selectedChannel;
      const channel = this.channels[name];
      axios
        .post(`/dmx/event/${channel}`)
        .then((response) => {
          this.$notify({
            title: `Fired DMX event ${name}`,
            text: `Channel ${channel}`,
            type: "success",
            duration: 10000,
          });
        })
        .catch((error) => {
          console.log("Error firing event:", error);
          this.$notify({
            title: "Error firing DMX event",
            text: "" + error,
            type: "error",
          });
        });
      this.reset();
    },

    reset() {
      this.selectedChannel = undefined;
    },
  },
};
</script>

<style lang="scss" scoped></style>
