<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
      <b-alert v-if="connectionStatus.isEmulated" variant="info" show dismissible :hover="true">
          Empty Epsilon integration is currently running in emulated mode! Set connection details in backend to connect to a real server.
        </b-alert>
    <b-container fluid>
    <b-row>
        <b-col>
            <h2>Full game state</h2>
            <vue-json-pretty :data="gameState" class="ee-state"></vue-json-pretty>
        </b-col>
        <b-col cols="8">
            <div>
                <h2>Connection status:
                <span v-if="!shipMetadata.ee_connection_enabled" class="yellow">DISABLED</span>
                <span v-else-if="connectionStatus.isConnectionHealthy" class="green">HEALTHY</span>
                <span v-else class="red">UNHEALTHY</span>
                </h2>
                <p v-if="!connectionStatus.isConnectionHealthy" class="red">Error: {{ connectionStatus.lastErrorMessage }}</p>
                <b-button v-if="!shipMetadata.ee_connection_enabled" variant="success" @click="toggleConnectionEnabled(true)">Enable connection</b-button>
                <b-button v-else variant="danger" @click="toggleConnectionEnabled(false)">Disable connection</b-button>
                <hr>
            </div>
            <div>
                <h2>State synchronization:
                <span v-if="shipMetadata.ee_sync_enabled" class="green">ENABLED</span>
                <span v-else class="red">DISABLED</span>
                </h2>
                <b-button v-if="!shipMetadata.ee_sync_enabled" variant="success" @click="toggleSynchronization(true)">Enable state synchronization</b-button>
                <b-button v-else variant="danger" @click="toggleSynchronization(false)">Disable state synchronization</b-button>
                <b-button v-if="!shipMetadata.ee_sync_enabled" variant="primary" @click="pushFullGameState()">Push current state to EE</b-button>
                <hr>
            </div>
            <div>
                <h2>Ship alert state: <span v-if="gameState.general.alertLevel === 'Normal'" class="green">NORMAL</span>
                <span v-else-if="gameState.general.alertLevel === 'YELLOW ALERT'" class="yellow">YELLOW ALERT</span>
                <span v-else-if="gameState.general.alertLevel === 'RED ALERT'" class="red">RED ALERT</span>
                <span v-else class="red">UNKNOWN ALERT STATE</span></h2>
                <b-button variant="success" @click="setAlertState('normal')">Normal<span v-if="gameState.general.alertLevel === 'Normal'"> (active)</span></b-button>
                <b-button variant="warning" @click="setAlertState('yellow')">Yellow alert<span v-if="gameState.general.alertLevel === 'YELLOW ALERT'"> (active)</span></b-button>
                <b-button variant="danger" @click="setAlertState('red')">Red alert<span v-if="gameState.general.alertLevel === 'RED ALERT'"> (active)</span></b-button>
                <hr>
            </div>
            <div>
                <h2>Update values</h2>
                <b-form>
                    <b-form-group
                        label="Target type"
                        label-for="selected-type">
                        <b-form-select id="selected-type" v-model="selectedType" :options="types"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        v-if="selectedType !== 'hull'"
                        label="Target"
                        label-for="selected-target">
                        <b-form-select id="selected-target" v-model="selectedTarget" :options="selectedType === 'systems' ? systems : weapons"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        v-if="selectedType === 'systems'"
                        label="Value type"
                        label-for="selected-value-type">
                        <b-form-select id="selected-value-type" v-model="selectedValueType" :options="selectedType === 'systems' ? systemValueTypes : weaponValueTypes"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        label="Value"
                        label-for="selected-value">
                        <b-input
                            id="value"
                            v-model="selectedValue"
                            class="mb-2 mr-sm-2 mb-sm-0"
                            placeholder="1"
                            type="text">
                        </b-input>
                    </b-form-group>
                    <b-button variant="primary" @click="setValue()">Set value</b-button>
                </b-form>
            </div>
        </b-col>
    </b-row>
    </b-container>
  </div>
</template>

<style lang="scss">
button {
  margin-right: 15px;
}
.wrapper {
  padding: 15px;
}
.card {
  margin: 15px;
}
.green {
  color: #028e00;
}
.red {
  color: #e52a00;
}
.yellow {
  color: #e5b700;
}
.ee-state {
  background: #eee;
  padding: 8px;
}
.vjs-tree {
  line-height: 1em;
}
.vjs-key,
.vjs-value {
  font-size: 0.8em;
}
.vjs-tree .vjs-value__string {
  color: #1a9931;
}
.vjs-tree .vjs-value__number {
  color: #1a3199;
}
</style>

<script>
import axiox from "axios";
import VueJsonPretty from "vue-json-pretty";

const systems = [
  "reactor",
  "beamweapons",
  "missilesystem",
  "maneuver",
  "impulse",
  "warp",
  "jumpdrive",
  "frontshield",
  "rearshield"
];
const weapons = ["homing", "nuke", "mine", "emp", "hvli"];

const types = ["systems", "weapons", "hull"];
const systemValueTypes = ["health", "heat"];
const weaponValueTypes = ["count"];

const alertStates = new Map([
  ["normal", "Normal"],
  ["yellow", "YELLOW ALERT"],
  ["red", "RED ALERT"]
]);

export default {
  components: {
    VueJsonPretty
  },
  data() {
    return {
      errors: [],
      pendingRequests: new Set([]),
      isAlertLevelChangePending: false,
      isSynchronizationChangePending: false,
      isConnectionChangePending: false,
      isPushGameStatePending: false,
      isLoading: true,
      types,
      systems,
      systemValueTypes,
      weapons,
      weaponValueTypes,
      selectedType: types[0],
      selectedTarget: systems[0],
      selectedValueType: systemValueTypes[0],
      selectedValue: 1
    };
  },
  computed: {
    gameState() {
      this.isAlertLevelChangePending = false;
      this.isSynchronizationChangePending = false;
      this.isConnectionChangePending = false;
      return this.$store.state.dataBlobs.find(
        e => e.type === "ship" && e.id === "ee"
      );
    },
    connectionStatus() {
      return this.$store.state.dataBlobs.find(
        e => e.type === "ship" && e.id === "ee_metadata"
      );
    },
    shipMetadata() {
      return this.$store.state.dataBlobs.find(
        e => e.type === "ship" && e.id === "metadata"
      );
    }
  },

  created() {},
  beforeDestroy() {},
  methods: {
    removeError(i) {
      this.errors.splice(i, 1);
    },
    setValue() {
      const {
        selectedType,
        selectedTarget,
        selectedValueType,
        selectedValue
      } = this;
      const value = parseFloat(selectedValue);
      if (Number.isNaN(value)) return;
      if (selectedType === "weapons") {
        return this.makeSetValueRequest({
          command: "setWeaponStorage",
          value,
          target: selectedTarget
        });
      }
      if (selectedType === "hull") {
        return this.makeSetValueRequest({
          command: "setHull",
          value
        });
      }
      const command =
        selectedValueType === "health" ? "setSystemHealth" : "setSystemHeat";
      this.makeSetValueRequest({ command, value, target: selectedTarget });
    },
    async makeSetValueRequest(data) {
      this.isLoading = true;
      await axios({
        url: "/state",
        baseURL: this.$store.state.backend.uri,
        method: "put",
        data
      }).catch(error => {
        this.errors.push("" + error);
        this.isLoading = false;
      });
      this.isLoading = false;
    },
    setAlertState(alertState) {
      // Return if a alert state change is already pending or alertState matches current one
      if (
        this.isAlertLevelChangePending ||
        this.gameState.general.alertLevel === alertStates.get(alertState)
      ) {
        return;
      }
      this.isAlertLevelChangePending = true;
      axios({
        url: "/state",
        baseURL: this.$store.state.backend.uri,
        method: "put",
        data: { command: "setAlertLevel", value: alertState }
      }).catch(error => {
        this.errors.push("" + error);
        this.isAlertLevelChangePending = false;
      });
    },
    toggleSynchronization(value) {
      if (
        this.isSynchronizationChangePending ||
        value === this.shipMetadata.ee_sync_enabled
      ) {
        return;
      }
      this.isSynchronizationChangePending = true;
      axios({
        url: "/data/ship/metadata",
        baseURL: this.$store.state.backend.uri,
        method: "patch",
        data: { ee_sync_enabled: value, version: this.shipMetadata.version }
      }).catch(error => {
        this.errors.push("" + error);
        this.isSynchronizationChangePending = false;
      });
    },
    toggleConnectionEnabled(value) {
      if (
        this.isConnectionChangePending ||
        value === this.shipMetadata.ee_connection_enabled
      ) {
        return;
      }
      this.isConnectionChangePending = true;
      axios({
        url: "/data/ship/metadata",
        baseURL: this.$store.state.backend.uri,
        method: "patch",
        data: { ee_connection_enabled: value, version: this.shipMetadata.version }
      }).catch(error => {
        this.errors.push("" + error);
        this.isConnectionChangePending = false;
      });
    },
    async pushFullGameState(value) {
      if (this.isPushGameStatePending || this.shipMetadata.ee_sync_enabled) {
        return;
      }
      this.isPushGameStatePending = true;
      await axios({
        url: "/state/full-push",
        baseURL: this.$store.state.backend.uri,
        method: "post"
      }).catch(error => {
        this.errors.push("" + error);
      });
      this.isPushGameStatePending = false;
    }
  }
};
</script>
