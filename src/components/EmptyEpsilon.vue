<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert
        variant="danger"
        show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"
        ><strong>Error: </strong>{{ error }}</b-alert
      >
    </b-container>
    <b-alert
      v-if="connectionStatus.isEmulated"
      variant="info"
      show
      dismissible
      :hover="true"
    >
      Empty Epsilon integration is currently running in emulated mode! Set
      connection details in backend to connect to a real server.
    </b-alert>
    <b-container fluid>
      <b-row>
        <b-col>
          <h2>Empty Epsilon state</h2>
          <vue-json-pretty :data="gameState" class="ee-state"></vue-json-pretty>
        </b-col>
        <b-col cols="8">
            <div class="ee-status-container">
              <h3>
              Connection status:
              <span v-if="!shipMetadata.ee_connection_enabled" class="yellow"
                >DISABLED</span
              >
              <span
                v-else-if="connectionStatus.isConnectionHealthy"
                class="green"
                >HEALTHY</span
              >
              <span v-else class="red">UNHEALTHY</span>
            </h3>
            <p v-if="!connectionStatus.isConnectionHealthy" class="red error-container">
              Error: {{ connectionStatus.lastErrorMessage }}
            </p>
            <div class="ee-action-buttons-container">
              <b-button
              v-if="!shipMetadata.ee_connection_enabled"
              variant="success"
              size="sm"
              @click="toggleConnectionEnabled(true)"
              >Enable connection</b-button
            >
            <b-button
              v-else
              variant="danger"
              size="sm"
              @click="toggleConnectionEnabled(false)"
              >Disable connection</b-button
            >
            </div>
            <hr />
            </div>
          <div class="ee-status-container">
            <h3>
              State synchronization:
              <span v-if="shipMetadata.ee_sync_enabled" class="green"
                >ENABLED</span
              >
              <span v-else class="red">DISABLED</span>
            </h3>
            <div class="ee-action-buttons-container">
            <b-button
              v-if="!shipMetadata.ee_sync_enabled"
              variant="success"
              size="sm"
              @click="toggleSynchronization(true)"
              >Enable state synchronization</b-button
            >
            <b-button
              v-else
              variant="danger"
              size="sm"
              @click="toggleSynchronization(false)"
              >Disable state synchronization</b-button
            >
            <b-button
              v-if="!shipMetadata.ee_sync_enabled"
              variant="primary"
              size="sm"
              :disabled="isPushGameStatePending"
              @click="pushFullGameState()"
              >{{
                isPushGameStatePending
                  ? `${pushGameStateProgress} / 28`
                  : "Push current state to EE"
              }}</b-button>
            </div>
            <hr />
          </div>
          <div class="ee-status-container">
            <h3>
              Ship alert state:
              <span
                v-if="gameState.general.alertLevel === 'Normal'"
                class="green"
                >NORMAL</span
              >
              <span
                v-else-if="gameState.general.alertLevel === 'YELLOW ALERT'"
                class="yellow"
                >YELLOW ALERT</span
              >
              <span
                v-else-if="gameState.general.alertLevel === 'RED ALERT'"
                class="red"
                >RED ALERT</span
              >
              <span v-else class="red">UNKNOWN ALERT STATE</span>
            </h3>
            <div class="ee-action-buttons-container">
            <b-button variant="success" @click="setAlertState('normal')" size="sm"
              >Normal<span v-if="gameState.general.alertLevel === 'Normal'">
                (active)</span
              ></b-button
            >
            <b-button variant="warning" @click="setAlertState('yellow')" size="sm"
              >Yellow alert<span
                v-if="gameState.general.alertLevel === 'YELLOW ALERT'"
              >
                (active)</span
              ></b-button
            >
            <b-button variant="danger" @click="setAlertState('red')" size="sm"
              >Red alert<span
                v-if="gameState.general.alertLevel === 'RED ALERT'"
              >
                (active)</span
              ></b-button
            >
            </div>
            <hr />
          </div>
          <div class="ee-status-container">
            <h3>Landing pad statuses</h3>
            <!-- For each key/value in gameState.landingPads print out stuff-->
             <div class="landing-pad-container">
              <div v-for="([key, value]) in landingPadStatus" :key="key" class="landing-pad-status" :class="getLandingPadClass(value)">
              <strong>{{ getLandingPadName(key) }}</strong>
              <span>{{ getLandingPadState(value) }}</span>
            </div>
             </div>
            <hr />
          </div>
          <div class="ee-status-container">
            <h3>Update values</h3>
            <b-form>
              <div class="ee-patch-values-form">
                <b-form-group label="Target type" label-for="selected-type">
                <b-form-select
                  id="selected-type"
                  v-model="selectedType"
                  :options="types"
                ></b-form-select>
              </b-form-group>
              <b-form-group
                v-if="selectedType !== 'hull'"
                label="Target"
                label-for="selected-target"
              >
                <b-form-select
                  id="selected-target"
                  v-model="selectedTarget"
                  :options="selectedType === 'systems' ? systems : weapons"
                ></b-form-select>
              </b-form-group>
              <b-form-group
                v-if="selectedType === 'systems'"
                label="Value type"
                label-for="selected-value-type"
              >
                <b-form-select
                  id="selected-value-type"
                  v-model="selectedValueType"
                  :options="
                    selectedType === 'systems'
                      ? systemValueTypes
                      : weaponValueTypes
                  "
                ></b-form-select>
              </b-form-group>
              <b-form-group label="Value" label-for="selected-value">
                <b-input
                  id="value"
                  v-model="selectedValue"
                  class="mb-2 mr-sm-2 mb-sm-0"
                  placeholder="1"
                  type="text"
                >
                </b-input>
              </b-form-group>
              </div>
              <b-button variant="primary" @click="setValue()" size="sm"
                >Set value</b-button
              >
            </b-form>
            <hr />
          </div>
          <div class="ee-status-container">
            <h3>Break a task</h3>
            <b-form>
              <b-form-group label="Task to break" label-for="selected-type">
                <b-form-select
                  id="selected-type"
                  v-model="selectedTaskToBreak"
                  :options="tasksNotBroken"
                ></b-form-select>
              </b-form-group>
              <p>{{ taskDealtDamage }}</p>
              <b-button variant="primary" @click="breakTask()" size="sm"
                >Break task</b-button
              >
            </b-form>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import VueJsonPretty from "vue-json-pretty";
import { get, startCase } from "lodash";

const systems = [
  "reactor",
  "beamweapons",
  "missilesystem",
  "maneuver",
  "impulse",
  "warp",
  "jumpdrive",
  "frontshield",
  "rearshield",
];
const weapons = ["homing", "nuke", "mine", "emp", "hvli"];

const types = ["systems", "weapons", "hull"];
const systemValueTypes = ["health", "heat"];
const weaponValueTypes = ["count"];

const alertStates = new Map([
  ["normal", "Normal"],
  ["yellow", "YELLOW ALERT"],
  ["red", "RED ALERT"],
]);

export default {
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      errors: [],
      pendingRequests: new Set([]),
      isAlertLevelChangePending: false,
      isSynchronizationChangePending: false,
      isConnectionChangePending: false,
      isPushGameStatePending: false,
      pushGameStateProgress: 0,
      isLoading: true,
      types,
      systems,
      systemValueTypes,
      weapons,
      weaponValueTypes,
      selectedType: types[0],
      selectedTarget: systems[0],
      selectedValueType: systemValueTypes[0],
      selectedValue: 1,
      selectedTaskToBreak: undefined,
    };
  },
  computed: {
    gameState() {
      this.isAlertLevelChangePending = false;
      this.isSynchronizationChangePending = false;
      this.isConnectionChangePending = false;
      return this.$store.state.dataBlobs.find(
        (e) => e.type === "ship" && e.id === "ee",
      );
    },
    connectionStatus() {
      return this.$store.state.dataBlobs.find(
        (e) => e.type === "ship" && e.id === "ee_metadata",
      );
    },
    landingPadStatus() {
    const landingPads = Object.entries(
      _.get(this.gameState, "landingPads", {})
    );
    // Sort by key
    return landingPads.sort(([a], [b]) => a.localeCompare(b));
  },
    shipMetadata() {
      return this.$store.state.dataBlobs.find(
        (e) => e.type === "ship" && e.id === "metadata",
      );
    },
    tasksNotBroken() {
      return this.$store.state.dataBlobs.filter(
        (e) => e.type === "task" && e.status !== "broken" && e.eeType && e.eeHealth
      ).map((e) => e.id).sort()
    },
    taskDealtDamage() {
      if (!this.selectedTaskToBreak) {
        return "";
      }
      const task = this.$store.state.dataBlobs.find(
        (e) => e.type === "task" && e.id === this.selectedTaskToBreak,
      );
      if (!task) {
        return "";
      }
      return `Breaking task ${task.id} will cause ${Math.round(task.eeHealth*100)}% damage to ${task.eeType}.`;
    }
  },

  created() {},
  beforeDestroy() {},
  methods: {
    removeError(i) {
      this.errors.splice(i, 1);
    },
    setValue() {
      const { selectedType, selectedTarget, selectedValueType, selectedValue } =
        this;
      const value = parseFloat(selectedValue);
      if (Number.isNaN(value)) return;
      if (selectedType === "weapons") {
        return this.makeSetValueRequest({
          command: "setWeaponStorage",
          value,
          target: selectedTarget,
        });
      }
      if (selectedType === "hull") {
        return this.makeSetValueRequest({
          command: "setHull",
          value,
        });
      }
      const command =
        selectedValueType === "health" ? "setSystemHealth" : "setSystemHeat";
      return this.makeSetValueRequest({
        command,
        value,
        target: selectedTarget,
      });
    },
    breakTask() {
      return axios({
        url: "/state/break-task",
        baseURL: this.$store.state.backend.uri,
        method: "post",
        data: {
          taskId: this.selectedTaskToBreak,
        }
      })
        .catch((error) => {
          this.errors.push("" + error);
          this.isLoading = false;
        });
    },
    getLandingPadName(key) {
      switch (key) {
        case "landingPadStatus1": {
          return "Fighter 1";
        }
        case "landingPadStatus2": {
          return "Fighter 2";
        }
        case "landingPadStatus3": {
          return "Fighter 3";
        }
        case "landingPadStatus4": {
          return "Starcaller";
        }
        default: {
          return key;
        }
      }
    },
    getLandingPadState(value) {
      switch (value) {
        case 0: {
          return "Destroyed";
        }
        case 1: {
          return "Docked";
        }
        case 2: {
          return "Launched";
        }
        default: {
          return String(value) + " (unknown)";
        }
      }
    },
    getLandingPadClass(value) {
      switch (value) {
        case 0: {
          return "landing-pad-status-destroyed";
        }
        case 1: {
          return "landing-pad-status-docked";
        }
        case 2: {
          return "landing-pad-status-launched";
        }
        default: {
          return "";
        }
      }
    },
    async makeSetValueRequest(data) {
      this.isLoading = true;
      return axios({
        url: "/state",
        baseURL: this.$store.state.backend.uri,
        method: "put",
        data,
      })
        .then(() => (this.isLoading = false))
        .catch((error) => {
          this.errors.push("" + error);
          this.isLoading = false;
        });
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
        data: { command: "setAlertLevel", value: alertState },
      }).catch((error) => {
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
        data: { ee_sync_enabled: value, version: this.shipMetadata.version },
      }).catch((error) => {
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
        data: {
          ee_connection_enabled: value,
          version: this.shipMetadata.version,
        },
      }).catch((error) => {
        this.errors.push("" + error);
        this.isConnectionChangePending = false;
      });
    },
    async pushFullGameState() {
      this.pushGameStateProgress = 0;
      this.isPushGameStatePending = true;
      const DELAY_BETWEEN_REQUESTS = 400;
      // Sync system healths and heats first
      this.selectedType = "systems";
      for (const system of systems) {
        this.selectedTarget = system;
        for (const systemType of systemValueTypes) {
          this.selectedValueType = systemType;
          const valueKey = `${system}${startCase(systemType)}`;
          this.selectedValue = get(this.gameState, [
            "systems",
            systemType,
            valueKey,
          ]);
          await this.setValue();
          await new Promise((resolve) =>
            setTimeout(() => resolve(), DELAY_BETWEEN_REQUESTS),
          );
          this.pushGameStateProgress = this.pushGameStateProgress + 1;
        }
      }

      // Then sync weapon counts
      this.selectedType = "weapons";
      for (const weapon of weapons) {
        this.selectedTarget = weapon;
        this.selectedValue = get(this.gameState, ["weapons", `${weapon}Count`]);
        await this.setValue();
        await new Promise((resolve) =>
          setTimeout(() => resolve(), DELAY_BETWEEN_REQUESTS),
        );
        this.pushGameStateProgress = this.pushGameStateProgress + 1;
      }

      // Finally sync the hull health
      this.selectedType = "hull";
      this.selectedValue = get(this.gameState, "general.shipHullPercent");
      await this.setValue();

      // And landing pad statuses
      const landingPads = Object.getEntries(
        get(this.gameState, "landingPads", {}),
      );
      for (const [pad, value] of landingPads) {
        const target = pad.replace("landingPadStatus", "");
        await this.makeSetValueRequest({
          command: "setLandingPadState",
          value,
          target,
        });
        await new Promise((resolve) =>
          setTimeout(() => resolve(), DELAY_BETWEEN_REQUESTS),
        );
        this.pushGameStateProgress = this.pushGameStateProgress + 1;
      }
      this.pushGameStateProgress = this.pushGameStateProgress + 1;
      this.isPushGameStatePending = false;
      this.$notify({
        title: `Success`,
        text: `Game state pushed`,
        type: `success`,
      });
    },
  },
};
</script>

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
.ee-patch-values-form {
  display: flex;
  flex-direction: row;
  // They should all grow!
  > * {
    flex-grow: 1;
  }
  > *:not(:last-child) {
    margin-right: 0.5rem;
  }
}
.ee-action-buttons-container {
  position: absolute;
  top: 0;
  right: 0;
  padding-top: 0.5rem;
}
.ee-status-container {
  position: relative;
}
.error-container {
  font-family: monospace;
  background: #ffeeef;
  padding: 10px;
}
.landing-pad-container {
  display: flex;
  flex-direction: row;
}
.landing-pad-status {
  border: 1px solid #f00;
  padding: 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 0.2rem;
}
.landing-pad-status:not(:last-child) {
  margin-right: 0.5rem;
}

.landing-pad-status-destroyed {
  border: 1px solid #dc3545;
}

.landing-pad-status-docked {
  border: 1px solid #28a745;
}

.landing-pad-status-launched {
  border: 1px solid #ffc107;
}
h2 {
  margin: auto;
  margin-bottom: 1rem;
}
h3 {
  padding-top: 0.5rem;
}
</style>
