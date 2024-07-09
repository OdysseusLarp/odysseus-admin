<template>
  <b-container fluid class="my-4">
    <h2>
      {{ boxId }}
      <span v-if="box.config?.title_bar_text">("{{box.config.title_bar_text}}")</span>
    </h2>
    <ul>
      <li>
        Status: <b>{{ box.status }}</b>
      </li>
      <li>
        Last command: {{ box.last_command || "none" }} ({{
          timeString(box.last_command_at)
        }})
      </li>
      <li>
        Pressure:
        <pressureRamp
          :raw-pressure="box.pressure"
          :curve="box.config.pressure_curve"
        />
      </li>
      <li>Countdown: <countdown :target="box.countdown_to" /></li>
      <li>
        Fighters:
        <span v-if="box.fighters === 'active'"><b>active</b> (cannot open or pressurize from control panel)</span>
        <span v-else-if="box.fighters === 'launching'"><b>launching</b> (launched from EE, depressurizing soon)</span>
        <span v-else-if="(box.fighters || 'docked') !== 'docked'"><b>${box.fighters}</b> (unrecognized status!)</span>
        <span v-else-if="(box.config?.fighter_pads || []).length > 0"><b>all docked</b></span>
        <span v-else>none</span>
      </li>
      <li>
        <label for="accessDenied">Access denied: &nbsp;</label>
        <input type="checkbox" id="accessDenied" :checked="box.access_denied" @change="toggleAccess()">
      </li>
    </ul>

    Force status (aborts action countdown, does not fire DMX events!):
    <div class="button-group">
      <b-button variant="warning" @click="forceStatus('open')">Unlocked</b-button>
      <b-button variant="warning" @click="forceStatus('closed')">Locked</b-button>
      <b-button variant="warning" @click="forceStatus('vacuum')" v-if="canDepressurize">Vacuum</b-button>
    </div>

    Actions:
    <div class="button-group">
      <b-button variant="success" @click="sendCommand('open')">Unlock</b-button>
      <b-button variant="success" @click="sendCommand('close')">Lock</b-button>
      <b-button variant="outline-warning" @click="sendCommand('stop')">Stop Transition</b-button>
    </div>

    <div class="button-group" v-if="canDepressurize">
      <b-button variant="success" @click="sendCommand('pressurize')">Pressurize</b-button>
      <b-button variant="success" @click="sendCommand('depressurize')">Depressurize</b-button>
      <b-button variant="success" @click="sendCommand('evacuate')" v-if="box.config?.allow_depressurize">Emergency Depressurize</b-button>
    </div>

    <div v-if="box.config?.allow_depressurize">
      For Tristan Fukui (non-interruptible 10 min depressurization):
      <div class="button-group">
        <b-button variant="warning" @click="sendCommand('forceDepressurize')">Force Depressurize</b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
import axios from "axios";
import Countdown from "@/components/Countdown.vue";
import PressureRamp from "@/components/PressureRamp.vue";

export default {
  components: { Countdown, PressureRamp },
  props: {
    boxId: String,
  },
  computed: {
    box() {
      return this.getBlob("box", this.boxId) || DEFAULT_BOX;
    },
  },
  methods: {
    getBlob(type, id) {
      return this.$store.state.dataBlobs.find(
        (e) => e.type === type && e.id === id,
      );
    },
    sendCommand(command) {
      console.log(`Send command ${command} to ${this.boxId}...`);
      axios
        .patch(`/data/box/${this.boxId}?force=true`, { command: command })
        .then(() => console.log(`Command ${command} sent to ${this.boxId}`))
        .catch((err) =>
          console.log(`Command ${command} to ${this.boxId} failed:`, err),
        );
    },
    forceStatus(status) {
      console.log(`Forcing ${this.boxId} to state ${status}...`);
      axios
        .patch(`/data/box/${this.boxId}?force=true`, {
          status: status,
          command: "stop",
        })
        .then(() => console.log(`Forced ${this.boxId} to state ${status}`))
        .catch((err) =>
          console.log(`Forcing ${this.boxId} to state ${status} failed:`, err),
        );
    },
    toggleAccess() {
      const accessDenied = !this.box.access_denied;
      console.log(`Setting access_denied for ${this.boxId} to ${accessDenied}...`);
      axios
          .patch(`/data/box/${this.boxId}?force=true`, {
            access_denied: accessDenied,
          })
          .then(() => console.log(`Set access_denied for ${this.boxId} to ${accessDenied}`))
          .catch((err) =>
              console.log(`Failed to set access_denied for ${this.boxId} to ${accessDenied}:`, err),
          );
    },
    timeString(timestamp) {
      if (!timestamp) return "never";
      return "at " + new Date(timestamp).toISOString();
    },
    canDepressurize() {
      const config = this.box.config || {};
      return config.allow_depressurize || (config.fighter_pads || []).length > 0
    },
  },
};
</script>

<style lang="scss">
.button-group {
  margin-bottom: 1em;
}

li > * {
  margin: auto
}
</style>
