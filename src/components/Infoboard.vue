<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <b-form>
      <b-form-group label="Current Priority" label-for="currentPriority">
        <b-form-select id="currentPriority"
                      type="text"
                      v-model="currentPriority"
                      :options="infoboardPriorities"
                      required
                      :value="currentPriority">
        </b-form-select>
      </b-form-group>
      <b-button size="sm" class="my-2 my-sm-0" @click="updatePriority">Change priority</b-button>
    </b-form>
    <b-button size="sm" class="my-2 my-sm-0" v-b-modal.infoboard-entry-modal entry="'newInfoboard'" @click="sendInfo(newInfoboard)">Add new infoboard entry</b-button>
    <div v-if="!!infoboards.length">
      <b-card :class="'card'" v-for="(infoboard,i) in infoboards"
          :title="infoboard.title"
          :sub-title="infoboard.created_at">
          <p class="card-text">
            {{ infoboard.body }}
          </p>
	  <p>Priority: {{ infoboard.priority }} Enabled: {{ infoboard.enabled }}</p>
	  <b-button size="sm" class="my-2 my-sm-0" v-b-modal.infoboard-entry-modal entry="'infoboard'" @click="sendInfo(infoboard)">Edit infoboard entry</b-button>
          <b-button variant="danger" v-on:click="deleteInfoboardEntry(infoboard.id)">Delete entry</b-button>
      </b-card>
    </div>
  <div>
    <b-modal id="infoboard-entry-modal" title="Infoboard entry" @ok="handleOk">
      <b-form>
        <b-form-group label="Enabled" label-for="infoboardEnabled">
        <input name="selectedEntry.id" :value="selectedEntry.id" type="hidden" />
	  <b-form-checkbox id="infoboardEnabled"
	                v-model="selectedEntry.enabled"
			unchecked-value="false">
          </b-form-checkbox>
        </b-form-group>
        <b-form-group label="Priority" label-for="infoboardPriority">
          <b-form-select id="infoboardPriority"
                        type="text"
                        v-model="selectedEntry.priority"
                        :options="infoboardPriorities"
                        required>
          </b-form-select>
        </b-form-group>
        <b-form-group label="Title"
                      label-for="infoboardTitle">
          <b-form-input id="infoboardTitle"
                        type="text"
                        v-model="selectedEntry.title"
                        required>
          </b-form-input>
        </b-form-group>
        <b-form-group label="Body"
                      label-for="infoboardBody">
          <b-form-textarea id="infoboardBody"
                        type="text"
                        v-model="selectedEntry.body"
                        required
                        rows="3"
                        max-rows="6">
          </b-form-textarea>
        </b-form-group>
      </b-form>
    </b-modal>
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
</style>

<script>
import axiox from 'axios'

export default {
  components: {},
  data () {
    return {
      errors: [],
      isLoading: true,
      infoboards: [],
      infoboardPriorities: [1,2,3],
      currentPriority: 0,
      newInfoboard: { priority: 1, title: "", body: "", enabled: true },
      selectedEntry: { priority: 1, title: "", body: "", enabled: true }
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
      this.addInfoboardEntry(this.selectedEntry);
    },
    async addInfoboardEntry(entry) {
      if (!entry.priority || !entry.title ||!entry.body) {
        this.errors.push('Priority, title or body was not provided');
        return;
      }
      this.isLoading = true;
      var url = "/infoboard";
      if(entry.id) {
        url = `/infoboard/${entry.id}`
      }
      await axios.put(url, entry, { baseURL: this.$store.state.backend.uri })
        .then(res => {
	  this.newInfoboardPriority = 1;
	  this.newInfoboardTitle = "";
	  this.newInfoboardBody = "";
	  this.selectedEntry = this.newInfoboard;
          this.fetchInfoboardEntries();
        }).catch(err => {
          console.log('error adding infoboard entry', err);
          this.errors.push(err + '');
        });
      this.isLoading = false;
    },
    async deleteInfoboardEntry(id) {
      this.isLoading = true;
      await axios.delete(`/infoboard/${id}`, { baseUrl: this.$store.state.backend.uri })
        .then(() => this.fetchInfoboardEntries())
        .catch(err => {
          this.errors.push(err.message);
          console.log('error deleting infoboard entry', err);
        });
      this.isLoading = false;
    },
    async updatePriority() {
      this.isLoading = true;
      await axios.put(`/infoboard/priority`, {priority: this.currentPriority}, { baseUrl: this.$store.state.backend.uri })
        .catch(err => {
          this.errors.push(err.message);
          console.log('error updating priority', err);
        });
      this.isLoading = false;
    },
    fetchData() {
        this.fetchInfoboardEntries();
    },
    removeError(i) {
        this.errors.splice(i , 1);
    },
    async fetchInfoboardEntries() {
        this.isLoading = true;
        await axios.get("/infoboard", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.infoboards = (response.data.infoboards || []).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
	  this.currentPriority = (response.data.priority.priority || 0)
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isLoading = false;
    },
    sendInfo(entry) {
        this.selectedEntry = entry;
    }
  }
}
</script>
