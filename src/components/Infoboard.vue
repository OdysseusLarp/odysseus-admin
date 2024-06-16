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
    <b-form>
      <b-input-group prepend="Active set">
        <b-form-select
          id="currentPriority"
          v-model="currentPriority"
          type="text"
          :options="infoboardPriorities"
          required
          :value="currentPriority"
        >
        </b-form-select>
        <b-input-group-append>
          <b-button
            class="my-2 my-sm-0"
            variant="outline-primary"
            @click="updatePriority"
            >Update current set</b-button
          >
        </b-input-group-append>
      </b-input-group>
    </b-form>
    <div v-if="news.length">
      <h2>News posts</h2>
      <p>Checked news posts will be shown on infoboards</p>
      <b-form-checkbox
        v-for="post in news"
        :key="post.id"
        v-model="post.show_on_infoboard"
        switch
        @change="(value) => setShowOnInfoboard(post, value)"
      >
        {{ post.title }}
      </b-form-checkbox>
    </div>
    <div>
      <h2 class="infoboard-entry-title">
        Infoboard entries<b-button
          v-b-modal.infoboard-entry-modal
          class="my-2 my-md-0 add-infoboard-entry"
          variant="primary"
          entry="'newInfoboard'"
          @click="sendInfo(newInfoboard)"
          >Add new infoboard entry</b-button
        >
      </h2>
      <b-form-checkbox
        v-model="showEnabledOnly"
        name="show-enabled-only"
        switch
      >
        Show enabled only
      </b-form-checkbox>
      <b-card
        v-for="(infoboard, i) in filteredInfoboards"
        :key="i"
        :class="'card'"
        :title="infoboard.title"
        :sub-title="'Created on ' + formatDate(infoboard.created_at)"
        :v-if="!showEnabledOnly || infoboard.enabled"
      >
        <div class="badges">
          <b-badge variant="info">Set {{ infoboard.priority }}</b-badge>
          <b-badge v-if="infoboard.enabled" variant="success">Enabled</b-badge>
          <b-badge v-else variant="secondary">Disabled</b-badge>
          <b-badge v-if="infoboard.active_until" :variant="alreadyHappend(infoboard.active_until) ? 'secondary' : 'primary'"
            >{{ alreadyHappend(infoboard.active_until) ? "Closed on" : "Active until" }} {{ formatDate(infoboard.active_until) }} ({{ formatDuration(infoboard.active_until) }})</b-badge>
        </div>
        <div class="card-text">
          <pre>{{ infoboard.body }}</pre>
        </div>
        <b-button
          v-b-modal.infoboard-entry-modal
          size="sm"
          class="my-2 my-sm-0"
          entry="'infoboard'"
          variant="primary"
          @click="sendInfo(infoboard)"
          >Edit infoboard entry</b-button
        >
        <b-button
          size="sm"
          variant="danger"
          @click="deleteInfoboardEntry(infoboard.id)"
          >Delete entry</b-button
        >
      </b-card>
    </div>
    <div>
      <b-modal
        id="infoboard-entry-modal"
        title="Infoboard entry"
        @ok="handleOk"
      >
        <b-form>
          <b-form-group>
            <b-form-checkbox
              id="infoboardEnabled"
              v-model="selectedEntry.enabled"
              unchecked-value="false"
            >
              Enabled
            </b-form-checkbox>
          </b-form-group>
          <b-form-group label="Set" label-for="infoboardPriority">
            <b-form-select
              id="infoboardPriority"
              v-model="selectedEntry.priority"
              type="text"
              :options="infoboardPriorities"
              required
            >
            </b-form-select>
          </b-form-group>
          <b-form-group label="Title" label-for="infoboardTitle">
            <b-form-input
              id="infoboardTitle"
              v-model="selectedEntry.title"
              type="text"
              required
            >
            </b-form-input>
          </b-form-group>
          <b-form-group label="Body" label-for="infoboardBody">
            <b-form-textarea
              id="infoboardBody"
              v-model="selectedEntry.body"
              type="text"
              required
              rows="3"
              max-rows="6"
            >
            </b-form-textarea>
          </b-form-group>
        </b-form>
      </b-modal>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { pushError } from "../helpers";
import { format, distanceInWordsToNow } from "date-fns";

const emptyEntry = { priority: 1, title: "", body: "", enabled: true };

export default {
  components: {},
  data() {
    return {
      errors: [],
      isLoading: true,
      infoboards: [],
      infoboardPriorities: [1, 2, 3],
      currentPriority: 0,
      newInfoboard: { ...emptyEntry },
      selectedEntry: { ...emptyEntry },
      news: [],
      showEnabledOnly: true,
    };
  },
  computed: {
    filteredInfoboards() {
      if (this.showEnabledOnly) {
        return this.infoboards.filter((infoboard) => infoboard.enabled);
      }
      return this.infoboards;
    }
  },

  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchData,
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
    handleOk() {
      this.addInfoboardEntry(this.selectedEntry);
    },
    handleError(error) {
      pushError(this.errors, error, this.$notify);
    },
    alreadyHappend(date) {
      return new Date(date) < new Date();
    },
    formatDate(date) {
      return date ? format(new Date(date), "dddd HH:mm:ss") : "";
    },
    formatDuration(date) {
      const suffix = this.alreadyHappend(date) ? " ago" : " from now";
      return date ? distanceInWordsToNow(date) + suffix : "";
    },
    async addInfoboardEntry(entry) {
      if (!entry.priority || !entry.title || !entry.body) {
        this.errors.push("Priority, title or body was not provided");
        return;
      }
      this.isLoading = true;
      var url = "/infoboard";
      if (entry.id) {
        url = `/infoboard/${entry.id}`;
      }
      await axios
        .put(url, entry, { baseURL: this.$store.state.backend.uri })
        .then((_res) => {
          this.selectedEntry = { ...emptyEntry };
          this.newInfoboard = { ...emptyEntry };
          this.fetchInfoboardEntries();
        })
        .catch(this.handleError);
      this.isLoading = false;
    },
    async deleteInfoboardEntry(id) {
      this.isLoading = true;
      await axios
        .delete(`/infoboard/${id}`, { baseUrl: this.$store.state.backend.uri })
        .then(() => this.fetchInfoboardEntries())
        .catch(this.handleError);
      this.isLoading = false;
    },
    async updatePriority() {
      this.isLoading = true;
      await axios
        .put(
          "/infoboard/priority",
          { priority: this.currentPriority },
          { baseUrl: this.$store.state.backend.uri },
        )
        .catch(this.handleError);
      this.isLoading = false;
    },
    fetchData() {
      this.fetchInfoboardEntries();
      this.fetchNews();
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    async setShowOnInfoboard({ id, title }, show_on_infoboard) {
      await axios
        .put(`/post`, { id, show_on_infoboard })
        .then(() => {
          this.$notify({
            title: "Success",
            text: `Post ${title} will ${
              show_on_infoboard ? "" : "NOT "
            }be shown on infoboard`,
            type: "success",
          });
        })
        .catch(this.handleError);
    },
    async fetchInfoboardEntries() {
      this.isLoading = true;
      await axios
        .get("/infoboard", { baseURL: this.$store.state.backend.uri })
        .then((response) => {
          this.infoboards = (response.data.infoboards || []).sort((a, b) =>
            a.created_at < b.created_at ? 1 : -1,
          );
          this.currentPriority = response.data.priority.priority || 0;
        })
        .catch(this.handleError);
      this.isLoading = false;
    },
    async fetchNews() {
      await axios
        .get("/post", { baseURL: this.$store.state.backend.uri })
        .then((response) => {
          // Take first five news posts
          this.news = (response.data || [])
            .filter((n) => n.type === "NEWS")
            .filter((_, i) => i < 5);
        })
        .catch(this.handleError);
    },
    sendInfo(entry) {
      this.selectedEntry = entry;
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  margin-right: 15px;
}
.badges {
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
}
.badges > *:not(:last-child) {
  margin-right: 5px;
}
.wrapper {
  padding: 15px;
}
.card {
  margin: 15px;
}
.SUCCESS {
  background-color: #f0ffea;
}
.WARNING {
  background: #ffffb0;
}
.INFO {
  background: #def1ff;
}
.ERROR {
  background: #ffe8eb;
}
.add-infoboard-entry {
  float: right;
}
.infoboard-entry-title {
  margin-bottom: 0.5rem;
}
</style>
