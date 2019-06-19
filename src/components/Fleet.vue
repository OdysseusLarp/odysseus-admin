<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <p><b-button variant="outline-primary" @click="fetchData()">Refresh ship data (data age: {{ fetchAgo }}s)</b-button></p>
    <h2>Odysseus ship info</h2>
    <b-card v-if="odysseus" class="card">
        <div class="card-text">
          <div>Current position: {{ odysseus.position.name }}</div>
          <div>
            <b-input-group prepend="Probe count" class="mt-3">
              <b-form-input v-model="probeCount"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('probe_count', probeCount)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Jump range (grid)" class="mt-3">
              <b-form-input v-model="jumpRange"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('jump_range', jumpRange)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Scan range (grid)" class="mt-3">
              <b-form-input v-model="scanRange"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('scan_range', scanRange)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Object scan min (s)" class="mt-3">
              <b-form-input v-model="objectScanMin"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('object_scan_duration.min_seconds', objectScanMin)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Object scan max (s)" class="mt-3">
              <b-form-input v-model="objectScanMax"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('object_scan_duration.max_seconds', objectScanMax)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Grid scan min (s)" class="mt-3">
              <b-form-input v-model="gridScanMin"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('grid_scan_duration.min_seconds', gridScanMin)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div>
            <b-input-group prepend="Grid scan max (s)" class="mt-3">
              <b-form-input v-model="gridScanMax"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="patchMetadata('grid_scan_duration.max_seconds', gridScanMax)">Patch value</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
        </div>
    </b-card>
    <h2>All ships</h2>
    <b-button v-b-toggle.collapse-1 variant="primary">Toggle visibility</b-button>
    <b-collapse id="collapse-1" class="mt-2">
      <div v-if="!!fleet.length">
        <vue-json-pretty :data="fleet" class="fleet-state"></vue-json-pretty>
      </div>
    </b-collapse>
  </div>
</template>

<style lang="scss">
h1 {
  margin-bottom: 10px;
}
button {
  margin-right: 15px;
}
.wrapper {
  padding: 15px;
  margin-bottom: 40px;
}
.card {
  margin: 15px;
}
</style>

<script>
import axiox from "axios";
import VueJsonPretty from "vue-json-pretty";
import { get, isInteger } from 'lodash';

export default {
  components: {
    VueJsonPretty
  },
  data() {
    return {
      errors: [],
      isLoading: true,
      fleet: [],
      odysseus: null,
      fetchTimestamp: Date.now(),
      fetchAgo: 0,
      probeCount: 0,
      jumpRange: 0,
      scanRange: 0,
      objectScanMin: 0,
      objectScanMax: 0,
      gridScanMin: 0,
      gridScanMax: 0,
      selectedShip: null,
    };
  },

  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchData,
        this.$store.state.backend.autoRefresh * 1000
      );
    }
    // Calculate data age every second
    this.dataAgeTimer = setInterval(() => this.calculateDataAge(), 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    clearInterval(this.dataAgeTimer);
  },
  methods: {
    handleOk() {
      this.addLogEntry(this.newLogType, this.newLogMessage);
    },
    fetchData() {
      this.fetchFleet();
    },
    calculateDataAge() {
      this.fetchAgo = Math.ceil((Date.now() - this.fetchTimestamp) / 1000);
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    patchMetadata(key_path, value) {
      const numericValue = parseInt(value, 10);
      if (!isInteger(numericValue))
        return this.errors.push(`[${Date.now()}] Value provided for ${key_path} is not an integer`);
      axios.patch(`/fleet/odysseus/metadata`, { key_path, value: numericValue })
        .then(() => this.fetchFleet())
        .catch(err => {
          console.log('error patching', err);
          this.errors.push(err + '');
        });
    },
    async fetchFleet() {
      this.isLoading = true;
      await axios
        .get("/fleet?show_hidden=true", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.fleet = (response.data || []).sort(
            (a, b) => (a.id === "odysseus" ? -1 : 1)
          );
          this.odysseus = this.fleet.find(ship => ship.id === "odysseus");
          this.fetchTimestamp = Date.now();
          this.calculateDataAge();
          this.jumpRange = get(this.odysseus, 'metadata.jump_range', 0);
          this.scanRange = get(this.odysseus, 'metadata.scan_range', 0);
          this.probeCount = get(this.odysseus, 'metadata.probe_count', 0);
          this.objectScanMin = get(this.odysseus, 'metadata.object_scan_duration.min_seconds', 0);
          this.objectScanMax = get(this.odysseus, 'metadata.object_scan_duration.max_seconds', 0);
          this.gridScanMin = get(this.odysseus, 'metadata.grid_scan_duration.min_seconds', 0);
          this.gridScanMax = get(this.odysseus, 'metadata.grid_scan_duration.max_seconds', 0);
        })
        .catch(error => {
          this.errors.push("" + error);
        });
      this.isLoading = false;
    }
  }
};
</script>
