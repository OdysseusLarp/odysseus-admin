<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
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
      <b-table striped hover bordered :items="formattedUnreadMessages" :fields="unreadTableColumns"></b-table>
    </div>
    <div v-else>
      No unread messages.
    </div>
    <div v-if="!!auditLogEntries.length">
      <h2>Datahub audit log</h2>
      <p>
        Showing last 150 events.
      </p>
      <p>
        <b-form-checkbox v-model="showNpcAuditLog" @change="parseAuditLogEntries" name="check-button" switch>
          Show logins to NPC accounts
        </b-form-checkbox>
      </p>
      <b-table striped hover bordered :items="formattedAuditLogEntries" :fields="auditLogTableColumns"></b-table>
    </div>
    <hr>
    <div>
        <h2>Person actions</h2>
        <b-input-group prepend="Person ID" class="mt-3">
          <b-form-input v-model="writtenPersonId" @keydown.enter.native="getPerson"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" @click="getPerson">Get person</b-button>
          </b-input-group-append>
        </b-input-group>
        <div v-if="selectedPerson" class="selected-person">
          <h3>Selected person: {{ selectedPerson.full_name }}<span v-if="!selectedPerson.is_character"> (NPC)</span></h3>
          <b-input-group prepend="Person status" class="mt-3">
            <b-form-select v-model="personStatus" :options="personStatusOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonStatus">Set status</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person visibility" class="mt-3">
            <b-form-select v-model="personIsVisible" :options="personVisibleOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonVisibility">Set visibility</b-button>
            </b-input-group-append>
          </b-input-group>
          <div class="person-groups-checkboxes">
            <b-form-group label="Person groups">
              <b-form-checkbox-group
                  v-model="personGroups"
                  :options="allGroups"
                  name="flavour-1a"
                ></b-form-checkbox-group>
            </b-form-group>
            <b-button class="action-button" variant="primary" size="md" @click="updateGroups">Update groups</b-button>
          </div>
          <div>
            <b-button class="action-button" variant="warning" size="md" v-b-modal.modal-kill-person>Kill this person</b-button>
            <b-modal
              id="modal-kill-person"
              ref="modal"
              title="Kill person"
              @ok="killselectedPerson">
              WARNING: Pressing OK will set {{ selectedPerson.full_name }} status to 'Deceased' and add a personal log entry 'Deceased'.
            </b-modal>
          </div>
        </div>
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
.selected-person {
  margin-top: 15px
}
.action-button {
  margin: 12px auto;
}
.person-groups-checkboxes {
  margin-top: 15px;

  legend {
    font-weight: bold;
  }
}
</style>

<script>
import axiox from "axios";
import VueMarkdown from "vue-markdown";
import { distanceInWordsStrict } from 'date-fns';
import { difference } from 'lodash';
import { pushError } from '../helpers';

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
      auditLogEntries: [],
      formattedAuditLogEntries: [],
      unreadMessages: [],
      allGroups: [],
      personGroups: [],
      formattedUnreadMessages: [],
      showNpcUnreadMessagesOnly: false,
      showNpcAuditLog: false,
      writtenPersonId: '',
      selectedPerson: null,
      personStatus: '',
      personIsVisible: false,
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
          key: 'oldest_message',
          label: 'Oldest',
          sortable: true,
          formatter: timestamp => distanceInWordsStrict(new Date(), new Date(timestamp))
        },
        {
          key: 'unread_count',
          label: 'Count',
          sortable: true
        },
      ],
      auditLogTableColumns: [
        {
          key: 'created_at',
          label: 'Age',
          sortable: true,
          formatter: timestamp => distanceInWordsStrict(new Date(), new Date(timestamp))
        },
        {
          key: 'type',
          label: 'Type'
        },
        {
          key: 'person',
          label: 'Person',
          formatter: person => person.full_name
        },
        {
          key: 'hacker',
          label: 'Hacker',
          formatter: hacker => hacker ? hacker.full_name : hacker,
        },
      ],
      personStatusOptions: [
          'Killed in action',
          'Missing in action',
          'Present and accounted for',
          'Unknown',
          'Deceased',
      ],
      personVisibleOptions: [
        { value: true, text: 'Visible' },
        { value: false, text: 'Hidden' },
      ]
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
      this.fetchAuditLog();
      this.fetchAllGroups();
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    handleError(error) {
      pushError(this.errors, error, this.$notify);
    },
    getPerson() {
      this.selectedPerson = null;
      this.personGroups = [];
      if (!this.writtenPersonId) return;
      axios.get(`/person/${this.writtenPersonId}`)
        .then(res => {
          this.selectedPerson = res.data;
          if (!res.data) return;
          this.personStatus = res.data.status;
          this.personGroups = res.data.groups;
          this.personIsVisible = res.data.is_visible;
        })
        .catch(err => pushError(this.errors, err, this.$notify));
    },
    setPersonVisibility() {
      if (!this.selectedPerson) return;
      this.patchPerson({ is_visible: this.personIsVisible }).then(() => {
        this.$notify({
          title: 'Success',
          text: `Person visibility set to ${this.personIsVisible ? 'visible' : 'hidden'}`,
          type: "success",
        });
        this.getPerson();
      });
    },
    setPersonStatus() {
      this.patchPerson({ status: this.personStatus.trim() }).then(() => this.$notify({
        title: 'Success',
        text: 'Status updated',
        type: "success",
      }));
    },
    patchPerson(patch) {
      return axios.put(`/person/${this.selectedPerson.id}`, patch)
        .then(() => {
          this.getPerson();
        }).catch(error => {
          this.handleError(error);
          throw error;
        });
    },
    updateGroups() {
      if (!this.selectedPerson) return;
      const oldGroups = this.selectedPerson.groups;
      const groupsToAdd = difference(this.personGroups, oldGroups);
      const groupsToDelete = difference(oldGroups, this.personGroups);
      const personId = this.selectedPerson.id;
      Promise.all([
        ...groupsToAdd.map(g => axios.put(`/person/${personId}/group/${g}`)),
        ...groupsToDelete.map(g => axios.delete(`/person/${personId}/group/${g}`)),
      ]).then(() => {
        this.getPerson();
        this.$notify({
          title: 'Success',
          text: 'Person groups updated',
          type: "success",
        });
      }).catch(this.handleError);
    },
    async fetchAllGroups() {
      this.pendingRequests.add("groups");
      await axios
        .get("/person/groups", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.allGroups = response.data;
        })
        .catch(this.handleError);
      this.pendingRequests.delete("groups");
      this.updateIsLoading();
    },
    async fetchPendingVotes() {
      this.pendingRequests.add("votes");
      await axios
        .get("/vote?status=PENDING", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.pendingVotes = response.data;
        })
        .catch(this.handleError);
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
        }).catch(this.handleError);
      this.pendingRequests.delete("posts");
      this.updateIsLoading();
    },
    async fetchAuditLog() {
      this.pendingRequests.add("auditLog");
      this.updateIsLoading();
      await axios
        .get("/log/audit?page=1&entries=150", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.auditLogEntries = response.data;
          this.parseAuditLogEntries();
        }).catch(this.handleError);
      this.pendingRequests.delete("auditLog");
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
        }).catch(this.handleError);
      this.pendingRequests.delete("messages");
      this.updateIsLoading();
    },
    killselectedPerson() {
      if (!this.selectedPerson) return;
      axios.put(`/person/${this.selectedPerson.id}/kill`)
        .then(() => {
          this.getPerson();
          this.$notify({
            title: 'Success',
            text: 'Person was killed',
            type: "success",
          });
        })
        .catch(this.handleError);
    },
    parseUnreadMessages(showNpcUnreadMessagesOnly = this.showNpcUnreadMessagesOnly) {
      const unreadSummary = this.unreadMessages.reduce((prev, cur) => {
        const obj = prev[cur.target_person] || {
          full_name: cur.receiver.full_name,
          card_id: cur.receiver.card_id,
          is_character: cur.receiver.is_character,
          unread_count: 0,
          oldest_message: cur.created_at
        };
        obj.unread_count = obj.unread_count + 1;
        if (obj.oldest_message > cur.created_at) obj.oldest_message = cur.created_at;
        prev[cur.target_person] = obj;
        return prev;
      }, {});
      const unreadMessages = Object.keys(unreadSummary)
        .map(key => unreadSummary[key])
        .filter(person => showNpcUnreadMessagesOnly ? !person.is_character : true)
        .sort((a, b) => (a.unread_count > b.unread_count ? -1 : 1));

      this.formattedUnreadMessages = unreadMessages;
    },
    parseAuditLogEntries(showNpcAuditLog = this.showNpcAuditLog) {
      this.formattedAuditLogEntries = this.auditLogEntries.filter(entry => showNpcAuditLog ? true : entry.person.is_character);
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
        }).catch(this.handleError);
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
        }).catch(this.handleError);
    }
  }
};
</script>
