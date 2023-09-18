<template>
  <div>
    <b-navbar toggleable="sm" variant="light" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">Odysseus admin</b-navbar-brand>
      <b-collapse id="nav_collapse" is-nav>
        <b-navbar-nav tabs>
          <b-nav-item to="/data">Data stores</b-nav-item>
          <b-nav-item to="/jump" :class="{ alerting: jumpNeedsAttention }"
            >Jump drive</b-nav-item
          >
          <b-nav-item to="/social"
            >Social
            <b-badge v-if="socialPendingCount > 0" variant="warning">{{
              socialPendingCount
            }}</b-badge></b-nav-item
          >
          <b-nav-item to="/fleet">Fleet</b-nav-item>
          <b-nav-item to="/ship-log">Ship log</b-nav-item>
          <b-nav-item to="/infoboard">Infoboard</b-nav-item>
          <b-nav-item to="/operations"
            >Operations
            <b-badge v-if="operationsPendingCount > 0" variant="warning">{{
              operationsPendingCount
            }}</b-badge></b-nav-item
          >
          <b-nav-item to="/emptyepsilon" :class="{ alerting: eeNeedsAttention }"
            >Empty Epsilon</b-nav-item
          >
          <b-nav-item to="/airlocks">Airlocks</b-nav-item>
          <b-nav-item to="/dmx">DMX</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-text
            :class="$store.state.info.type"
            style="padding-right: 1em"
            >{{ $store.state.info.text }}</b-nav-text
          >
          <b-nav-form>
            <b-button
              v-b-modal.backendChooserModal
              size="sm"
              class="my-2 my-sm-0"
              >{{ backendUri }}</b-button
            >
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <backend-chooser></backend-chooser>
    <router-view></router-view>
    <notifications position="bottom right" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import BackendChooser from "@/components/BackendChooser.vue";
import { get } from "lodash-es";

export default {
  components: {
    BackendChooser,
  },
  data() {
    return {
      jumpNeedsAttention: false,
      eeNeedsAttention: false,
      operationsPendingCount: 0,
      socialPendingCount: 0,
    };
  },
  computed: mapState({
    backendUri: (state) => state.backend.uri,
  }),
  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchStatusOverview();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchStatusOverview,
        this.$store.state.backend.autoRefresh * 1000,
      );
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  },
  methods: {
    async fetchStatusOverview() {
      const [
        jump,
        shipMetadata,
        eeMetadata,
        operations,
        posts,
        votes,
        messages,
      ] = await Promise.all([
        axios.get("/data/ship/jump"),
        axios.get("/data/ship/metadata"),
        axios.get("/data/ship/ee_metadata"),
        axios.get("/operation"),
        axios.get("/post?status=PENDING"),
        axios.get("/vote?status=PENDING"),
        axios.get("/messaging/unread"),
      ]);
      this.jumpNeedsAttention = get(jump, "data.status") === "calculating";
      this.eeNeedsAttention = !(
        get(eeMetadata, "data.isConnectionHealthy") &&
        get(shipMetadata, "data.ee_sync_enabled") &&
        get(shipMetadata, "data.ee_connection_enabled")
      );
      const npcMessages = messages.data.filter((m) => !m.receiver.is_character);
      this.operationsPendingCount = (operations.data || []).filter(
        (o) => o.is_analysed,
      ).length;
      this.socialPendingCount =
        posts.data.length + votes.data.length + npcMessages.length;
    },
  },
};
</script>

<style lang="scss">
@import "assets/css/global.scss";

.alerting {
  a {
    color: #f00 !important;
    text-shadow: none;
    animation: alert-blinker 1s linear infinite;
  }
}
@keyframes alert-blinker {
  50% {
    text-shadow: 0px 0px 3px rgba(255, 113, 113, 0.6);
  }
}
</style>
