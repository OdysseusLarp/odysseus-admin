<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <div v-if="!!entries.length">
        <h2>Infoboard Entries</h2>
        <b-card class="card" v-for="entry in entries"
            :title="entry.title"
            <p class="card-text">{{ entry.body }}</p>
            <p class="card-text">
                <ul>
                    <li>Is public: {{ entry.enabled }}</li>
                </ul>
            </p>
            <b-button variant="success" v-on:click="updateVoteStatus(vote.id, 'APPROVED')">Approve</b-button>
            <b-button variant="danger" v-on:click="updateVoteStatus(vote.id, 'REJECTED')">Reject</b-button>
        </b-card>
    </div>
    <infoboard-editor ref="infoboardEditor"></infoboard-editor>
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
import InfoboardEditor from '@/components/InfoboardEditor.vue'

export default {
  components: {
    InfoboardEditor,
  },
  data () {
    return {
      errors: [],
      isLoading: true,
      entries: [],
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
    fetchData() {
        this.fetchEntries();
        console.log(!!this.entries.length, !!this.pendingPosts.length);
    },
    removeError(i) {
        this.errors.splice(i , 1);
    },
    async fetchEntries() {
        this.isLoading = true;
        await axios.get("/infoboard/enabled", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.entries = response.data;
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isLoading = false;
    },
    updateVoteStatus(id, status) {
        const is_active = status === 'APPROVED';
        axios({
            url: `/vote/${id}`,
            baseURL: this.$store.state.backend.uri,
            method: 'put',
            data: { status, is_active }
        }).then(r => {
            this.fetchData();
        }).catch(error => {
            this.errors.push("" + error);
        });
    },
    updatePostStatus(id, status) {
        axios({
            url: '/post',
            baseURL: this.$store.state.backend.uri,
            method: 'put',
            data: { id, status }
        }).then(r => {
            this.fetchData();
        }).catch(error => {
            this.errors.push("" + error);
        });
    }
  }
}
</script>
