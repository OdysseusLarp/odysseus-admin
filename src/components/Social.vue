<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <div>
        <p>
            Only pending actions are shown on this page.
        </p>
    </div>
    <div v-if="!!pendingVotes.length">
        <h2>Pending new votes</h2>
        <b-card v-for="vote in pendingVotes" :key="vote.id"
            class="card"
            :title="vote.title"
            :sub-title="formatVoteSubtitle(vote)">
            <p class="card-text">{{ vote.description }}</p>
            <p class="card-text">
                <ul>
                    <li>Will be active for: {{ vote.duration_minutes }} minutes</li>
                    <li>Allowed voters: {{ vote.allowed_voters }}</li>
                    <li>Vote options: {{ vote.options.map(o => o.text).join(', ') }}</li>
                </ul>
            </p>
            <b-button variant="success" @click="updateVoteStatus(vote.id, 'APPROVED')">Approve</b-button>
            <b-button variant="danger" @click="updateVoteStatus(vote.id, 'REJECTED')">Reject</b-button>
        </b-card>
    </div>
    <div v-else>
      No pending votes.
    </div>
    <div v-if="!!pendingPosts.length">
        <h2>Pending new posts</h2>
        <b-card v-for="post in pendingPosts" :key="post.id"
            class="card"
            :title="post.title"
            :sub-title="formatPostSubtitle(post)">
            <p class="card-text">
              <vue-markdown :source="post.body"></vue-markdown>
            </p>
            <b-button variant="success" @click="updatePostStatus(post.id, 'APPROVED')">Approve</b-button>
            <b-button variant="danger" @click="updatePostStatus(post.id, 'REJECTED')">Reject</b-button>
        </b-card>
    </div>
    <div v-else>
      No pending posts.
    </div>
    <div v-if="!!unreadMessages.length">
      <h2>Unread messages</h2>
      <p>
        <b-form-checkbox v-model="showNpcUnreadMessagesOnly" @change="parseUnreadMessages" name="check-button" switch>
          Show only NPCs unread messages
        </b-form-checkbox>
      </p>
      <b-table striped hover :items="formattedUnreadMessages" :fields="unreadTableColumns"></b-table>
    </div>
    <div v-else>
      No unread messages.
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
import axiox from "axios";
import VueMarkdown from "vue-markdown";

export default {
  components: {
    VueMarkdown
  },
  data() {
    return {
      errors: [],
      isLoading: true,
      pendingRequests: new Set([]),
      pendingVotes: [],
      pendingPosts: [],
      unreadMessages: [],
      formattedUnreadMessages: [],
      showNpcUnreadMessagesOnly: false,
      unreadTableColumns: [
        {
          key: 'full_name',
          label: 'Full name'
        },
        {
          key: 'card_id',
          label: 'Card ID'
        },
        {
          key: 'is_character',
          label: 'NPC',
          sortable: true,
          formatter: value => value ? 'No' : 'Yes'
        },
        {
          key: 'unread_count',
          label: 'Count',
          sortable: true
        },
      ],
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
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  },
  methods: {
    formatVoteSubtitle(vote) {
      return `Created by ${vote.author.full_name} at ${vote.created_at}`;
    },
    formatPostSubtitle(vote) {
      return `Created by ${vote.author.full_name} at ${vote.created_at} (${
        vote.type
      })`;
    },
    fetchData() {
      this.fetchPendingVotes();
      this.fetchPendingsPosts();
      this.fetchUnreadMessages();
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    async fetchPendingVotes() {
      this.pendingRequests.add("votes");
      await axios
        .get("/vote?status=PENDING", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.pendingVotes = response.data;
        })
        .catch(error => {
          this.errors.push(`[${Date.now()}] ${error}`);
        });
      this.pendingRequests.delete("votes");
      this.updateIsLoading();
    },
    async fetchPendingsPosts() {
      this.pendingRequests.add("posts");
      this.updateIsLoading();
      await axios
        .get("/post?status=PENDING", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.pendingPosts = response.data;
        })
        .catch(error => {
          this.errors.push(`[${Date.now()}] ${error}`);
        });
      this.pendingRequests.delete("posts");
      this.updateIsLoading();
    },
    async fetchUnreadMessages() {
      this.pendingRequests.add("messages");
      this.updateIsLoading();
      await axios
        .get("/messaging/unread", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.unreadMessages = response.data;
          this.parseUnreadMessages();
        })
        .catch(error => {
          this.errors.push(`[${Date.now()}] ${error}`);
        });
      this.pendingRequests.delete("messages");
      this.updateIsLoading();
    },
    parseUnreadMessages(showNpcUnreadMessagesOnly = this.showNpcUnreadMessagesOnly) {
      const unreadSummary = this.unreadMessages.reduce((prev, cur) => {
        const obj = prev[cur.target_person] || {
          full_name: cur.receiver.full_name,
          card_id: cur.receiver.card_id,
          is_character: cur.receiver.is_character,
          unread_count: 0
        };
        obj.unread_count = obj.unread_count + 1;
        prev[cur.target_person] = obj;
        return prev;
      }, {});
      const unreadMessages = Object.keys(unreadSummary)
        .map(key => unreadSummary[key])
        .filter(person => showNpcUnreadMessagesOnly ? !person.is_character : true)
        .sort((a, b) => (a.unread_count > b.unread_count ? -1 : 1));

      this.formattedUnreadMessages = unreadMessages;
    },
    updateIsLoading() {
      this.isLoading = this.pendingRequests.size > 0;
    },
    updateVoteStatus(id, status) {
      const is_active = status === "APPROVED";
      axios({
        url: `/vote/${id}?sendMessage=true`,
        baseURL: this.$store.state.backend.uri,
        method: "put",
        data: { status, is_active }
      })
        .then(r => {
          this.fetchData();
        })
        .catch(error => {
          this.errors.push(`[${Date.now()}] ${error}`);
        });
    },
    updatePostStatus(id, status) {
      axios({
        url: "/post?sendMessage=true",
        baseURL: this.$store.state.backend.uri,
        method: "put",
        data: { id, status }
      })
        .then(r => {
          this.fetchData();
        })
        .catch(error => {
          this.errors.push(`[${Date.now()}] ${error}`);
        });
    }
  }
};
</script>
