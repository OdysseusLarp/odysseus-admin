<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
      <b-alert variant="info" v-if="connectionStatus.isEmulated" show dismissible :hover="true">
          Empty Epsilon integration is currently running in emulated mode! Set connection details in backend to connect to a real server.
        </b-alert>
        <p class="red" v-if="!connectionStatus.isConnectionHealthy">Error: {{ connectionStatus.lastErrorMessage }}</p>
    <b-container fluid>
    <b-row>
        <b-col>
            <h2>Full game state</h2>
            <vue-json-pretty :data="gameState" class="ee-state"></vue-json-pretty>
        </b-col>
        <b-col cols="8">
            <div>
                <h2>Connection status:
                <span class="green" v-if="connectionStatus.isConnectionHealthy">HEALTHY</span>
                <span class="red" v-else>UNHEALTHY</span>
                </h2>
                <hr>
            </div>
            <div>
                <h2>State synchronization:
                <span class="green" v-if="shipMetadata.ee_sync_enabled">ENABLED</span>
                <span class="red" v-else>DISABLED</span>
                </h2>
                <b-button variant="success" @click="toggleSynchronization(true)" v-if="!shipMetadata.ee_sync_enabled">Enable</b-button>
                <b-button variant="danger" @click="toggleSynchronization(false)" v-else>Disable</b-button>
                <hr>
            </div>
            <div>
                <h2>Ship alert state: <span v-if="gameState.general.alertLevel === 'NORMAL'" class="green">NORMAL</span>
                <span v-else-if="gameState.general.alertLevel === 'YELLOW ALERT'" class="yellow">YELLOW ALERT</span>
                <span v-else-if="gameState.general.alertLevel === 'RED ALERT'" class="red">RED ALERT</span>
                <span v-else class="red">UNKNOWN ALERT STATE</span></h2>
                <b-button variant="success" @click="setAlertState('normal')">Normal<span v-if="gameState.general.alertLevel === 'NORMAL'"> (active)</span></b-button>
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
                        <b-form-select v-model="selectedType" id="selected-type" :options="types"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        label="Target"
                        label-for="selected-target">
                        <b-form-select v-model="selectedTarget" id="selected-target" :options="selectedType === 'systems' ? systems : weapons"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        label="Value type"
                        label-for="selected-value-type">
                        <b-form-select v-model="selectedValueType" id="selected-value-type" :options="selectedType === 'systems' ? systemValueTypes : weaponValueTypes"></b-form-select>
                    </b-form-group>
                    <b-form-group
                        label="Value"
                        label-for="selected-value">
                        <b-input
                            v-model="selectedValue"
                            id="value"
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
    .green{
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
    .vjs-key, .vjs-value {
        font-size: .8em;
    }
    .vjs-tree .vjs-value__string {
        color: #1a9931;
    }
    .vjs-tree .vjs-value__number {
        color: #1a3199;
    }
</style>

<script>
import axiox from 'axios'
import VueJsonPretty from 'vue-json-pretty';

const systems = [
    'reactor',
    'beamweapons',
    'missilesystem',
    'maneuver',
    'impulse',
    'warp',
    'jumpdrive',
    'frontshield',
    'rearshield'
];
const weapons = ['homing', 'nuke', 'mine', 'emp', 'hvli'];

const types = ['systems', 'weapons'];
const systemValueTypes = ['health', 'heat'];
const weaponValueTypes = ['count'];

const alertStates = new Map([
    ['normal', 'NORMAL'],
    ['yellow', 'YELLOW ALERT'],
    ['red', 'RED ALERT']
]);

export default {
  components: {
      VueJsonPretty
  },
  data () {
    return {
      errors: [],
      pendingRequests: new Set([]),
      isAlertLevelChangePending: false,
      isSynchronizationChangePending: false,
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
    }
  },

  created () {},
  beforeDestroy() {},
 computed: {
        gameState() {
            this.isAlertLevelChangePending = false;
            this.isSynchronizationChangePending = false;
            return this.$store.state.dataBlobs.find(e => e.type === 'ship' && e.id === 'ee');
        },
        connectionStatus() {
            return this.$store.state.dataBlobs.find(e => e.type === 'ship' && e.id === 'ee_metadata');
        },
        shipMetadata() {
            return this.$store.state.dataBlobs.find(e => e.type === 'ship' && e.id === 'metadata');
        }
 },
  methods: {
    removeError(i) {
        this.errors.splice(i , 1);
    },
    setValue() {
        const { selectedType, selectedTarget, selectedValueType, selectedValue } = this;
        const value = parseFloat(selectedValue);
        if (value === NaN) return;
        if (selectedType === 'weapons') {
             return this.makeSetValueRequest({ command: 'setWeaponStorage', value, target: selectedTarget });
        }
        const command = selectedValueType === 'health' ? 'setSystemHealth' : 'setSystemHeat';
        this.makeSetValueRequest({ command, value, target: selectedTarget });
    },
    async makeSetValueRequest(data) {
        this.isLoading = true;
        await axios({
            url: `/state`,
            baseURL: this.$store.state.backend.uri,
            method: 'put',
            data
        }).catch(error => {
            this.errors.push("" + error);
            this.isLoading = false;
        });
        this.isLoading = false;
    },
    setAlertState(alertState) {
        // Return if a alert state change is already pending or alertState matches current one
        if (this.isAlertLevelChangePending || this.gameState.general.alertLevel === alertStates.get(alertState)) {
            return;
        }
        this.isAlertLevelChangePending = true;
        axios({
            url: `/state`,
            baseURL: this.$store.state.backend.uri,
            method: 'put',
            data: { command: 'setAlertLevel', value: alertState }
        }).catch(error => {
            this.errors.push("" + error);
            this.isAlertLevelChangePending = false;
        });
    },
    toggleSynchronization(value) {
        if (this.isSynchronizationChangePending || value === this.shipMetadata.ee_sync_enabled) {
            return;
        }
        this.isSynchronizationChangePending = true;
        axios({
            url: `/data/ship/metadata`,
            baseURL: this.$store.state.backend.uri,
            method: 'patch',
            data: { ee_sync_enabled: value, version: this.shipMetadata.version }
        }).catch(error => {
            this.errors.push("" + error);
            this.isSynchronizationChangePending = false;
        });
    }
  }
}
</script>
