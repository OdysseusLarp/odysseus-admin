<template>
  <div class="wrapper">
    <b-container fluid v-for="(error, i) in errors" :key="error">
      <b-alert variant="danger" show
        dismissible
        @dismissed="removeError(i)"
        :hover="true"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <div>
        <p>
            Only pending actions are shown on this page.
        </p>
    </div>
    <div v-if="!!pendingVotes.length">
        <h2>Pending new votes</h2>
        <b-card class="card" v-for="vote in pendingVotes"
            v-bind:key="vote.id"
            :title="vote.title"
            :sub-title="formatVoteSubtitle(vote)">
            <p class="card-text">{{ vote.description }}</p>
            <p class="card-text">
                <ul>
                    <li>Is public: {{ vote.is_public }}</li>
                    <li>Will be active until: {{ vote.active_until ? vote.active_until : 'Not defined' }}</li>
                    <li>Allowed voter groups: {{ vote.allowed_groups ? vote.allowed_groups : 'Everyone' }}</li>
                    <li>Vote options: {{ vote.options.map(o => o.text).join(', ') }}</li>
                </ul>
            </p>
            <b-button variant="success" v-on:click="updateVoteStatus(vote.id, 'APPROVED')">Approve</b-button>
            <b-button variant="danger" v-on:click="updateVoteStatus(vote.id, 'REJECTED')">Reject</b-button>
        </b-card>
    </div>
    <div v-if="!!pendingPosts.length">
        <h2>Pending new posts</h2>
        <b-card class="card" v-for="post in pendingPosts"
            v-bind:key="post.id"
            :title="post.title"
            :sub-title="formatPostSubtitle(post)">
            <p class="card-text">
              <vue-markdown :source="post.body"></vue-markdown>
            </p>
            <b-button variant="success" v-on:click="updatePostStatus(post.id, 'APPROVED')">Approve</b-button>
            <b-button variant="danger" v-on:click="updatePostStatus(post.id, 'REJECTED')">Reject</b-button>
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
import VueMarkdown from 'vue-markdown';

export default {
  components: {
    VueMarkdown,
  },
  data () {
    return {
      errors: [],
      isLoading: true,
      isPostsFetching: false,
      isVotesFetching: false,
      pendingVotes: [],
      pendingPosts: []
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
    formatVoteSubtitle (vote) {
        return `Created by ${vote.author.full_name} at ${vote.created_at}`;
    },
    formatPostSubtitle (vote) {
        return `Created by ${vote.author.full_name} at ${vote.created_at} (${vote.type})`;
    },
    fetchData() {
        this.fetchPendingVotes();
        this.fetchPendingsPosts();
        console.log(!!this.pendingVotes.length, !!this.pendingPosts.length);
    },
    removeError(i) {
        this.errors.splice(i , 1);
    },
    async fetchPendingVotes() {
        this.isFetchingVotes = true;
        await axios.get("/vote?status=PENDING", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.pendingVotes = response.data;
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isFetchingVotes = false;
        this.updateIsLoading();
    },
    async fetchPendingsPosts() {
        this.isFetchingPosts = true;
        this.updateIsLoading();
        await axios.get("/post?status=PENDING", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.pendingPosts = response.data;
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isFetchingPosts = false;
        this.updateIsLoading();
    },
    updateIsLoading() {
        this.isLoading = this.isFetchingVotes || this.isFetchingPosts;
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
