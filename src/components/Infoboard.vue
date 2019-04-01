<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <b-button size="sm" class="my-2 my-sm-0" v-b-modal.new-infoboard-entry-modal>Add new infoboard entry</b-button>
    <div v-if="!!infoboards.length">
      <b-card :class="'card'" v-for="(infoboard,i) in infoboards"
          :title="infoboard.title"
          :sub-title="infoboard.created_at">
          <p class="card-text">
            {{ infoboard.body }}
          </p>
	  <p>Priority: {{ infoboard.priority }} Enabled: {{ infoboard.enabled }}</p>
          <b-button variant="danger" v-on:click="deleteInfoboardEntry(infoboard.id)">Delete entry</b-button>
      </b-card>
    </div>
  <div>
    <b-modal id="new-infoboard-entry-modal" title="New infoboard entry" @ok="handleOk">
      <b-form>
        <b-form-group label="Infoboard priority" label-for="infoboardPriority">
          <b-form-select id="infoboardPriority"
                        type="text"
                        v-model="newInfoboardPriority"
                        :options="infoboardPriorities"
                        required
                        placeholder="">
          </b-form-select>
        </b-form-group>
        <b-form-group label="Infoboard title"
                      label-for="infoboardTitle">
          <b-form-input id="infoboardTitle"
                        type="text"
                        v-model="newInfoboardTitle"
                        required
                        placeholder="Infoboard title...">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Infoboard body"
                      label-for="infoboardBody">
          <b-form-textarea id="infoboardBody"
                        type="text"
                        v-model="newInfoboardBody"
                        required
                        rows="3"
                        max-rows="6"
                        placeholder="Infoboard body...">
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
      newInfoboardPriority: 1,
      newInfoboardTitle: "",
      newInfoboardBody: "",
      newInfoboardEnabled: true,
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
      this.addInfoboardEntry(this.newInfoboardPriority, this.newInfoboardTitle, this.newInfoboardBody, this.newInfoboardEnabled);
    },
    async addInfoboardEntry(priority, title, body, enabled) {
      if (!priority || !title ||!body) {
        this.errors.push('Priority, title or body was not provided');
        return;
      }
      this.isLoading = true;
      await axios.put("/infoboard", { priority, title, body, enabled }, { baseURL: this.$store.state.backend.uri })
        .then(res => {
	  this.newInfoboardPriority = 1;
	  this.newInfoboardTitle = "";
	  this.newInfoboardBody = "";
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
          this.infoboards = (response.data || []).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isLoading = false;
    }
  }
}
</script>
