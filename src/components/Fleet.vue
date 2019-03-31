<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <h2>Odysseus ship info</h2>
    <b-card class="card" v-if="odysseus">
        <div class="card-text">
          <div>Current position: {{ odysseus.position.name }}</div>
          <div>Probe count: {{ odysseus.metadata.probe_count }}</div>
          <div>Jump range: {{ odysseus.metadata.jump_range }}</div>
          <div>Scan range: {{ odysseus.metadata.scan_range }}</div>
        </div>
    </b-card>
    <h2>All ships</h2>
    <div v-if="!!fleet.length">
      <b-card class="card" v-for="ship in fleet"
          :title="ship.name">
          <p class="card-text">
            <pre>{{ JSON.stringify(ship) }}</pre>
          </p>
      </b-card>
    </div>
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
</style>

<script>
import axiox from 'axios'

export default {
  components: {},
  data () {
    return {
      errors: [],
      isLoading: true,
      fleet: [],
      odysseus: null,
    }
  },

  created () {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(this.fetchData, this.$store.state.backend.autoRefresh * 1000);
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
 },
  methods: {
    handleOk() {
      this.addLogEntry(this.newLogType, this.newLogMessage);
    },
    fetchData() {
        this.fetchFleet();
    },
    removeError(i) {
        this.errors.splice(i , 1);
    },
    async fetchFleet() {
        this.isLoading = true;
        await axios.get("/fleet", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.fleet = (response.data || []).sort((a, b) => a.id === 'odysseus' ? -1 : 1);
          this.odysseus = this.fleet.find(ship => ship.id === 'odysseus');
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isLoading = false;
    }
  }
}
</script>
