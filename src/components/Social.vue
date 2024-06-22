<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show dismissible :hover="true" @dismissed="removeError(i)"><strong>Error: </strong>{{
        error }}</b-alert>
    </b-container>
    <div v-if="!!pendingVotes.length">
      <h2>Pending new votes</h2>
      <b-card
v-for="vote in pendingVotes" :key="vote.id" class="card" :title="vote.title"
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
      <b-card
v-for="post in pendingPosts" :key="post.id" class="card" :title="post.title"
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
        <b-form-checkbox v-model="showNpcUnreadMessagesOnly" name="check-button" switch @change="parseUnreadMessages">
          Show only NPCs unread messages
        </b-form-checkbox>
      </p>
      <b-table striped hover bordered :items="formattedUnreadMessages" :fields="unreadTableColumns"></b-table>
    </div>
    <div v-else>
      No unread messages.
    </div>
    <hr>
    <div>
        <h2>Person actions</h2>
        <h4>Search</h4>
        <b-input-group prepend="Ship" class="mt-3">
          <b-form-select v-model="selectedShipFilter" :options="allShips" placeholder="odysseus"></b-form-select>
          <b-form-input v-model="writtenPersonName" placeholder="Person name" @keydown.enter.native="searchPerson"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" @click="searchPerson">Search person</b-button>
          </b-input-group-append>
        </b-input-group>
        <div v-if="searchPersonResults.length" class="person-search-results">
          <ul>
            <li v-for="person in searchPersonResults" :key="person.id">
                <strong @click="selectPerson(person)">{{ person.full_name }}</strong>
                <b-badge v-if="person.title" pill variant="light"> {{ person.title }}</b-badge>
                <b-badge pill variant="primary">{{ person.status }}</b-badge>
                <b-badge v-if="person.ship" pill variant="secondary">{{ person.ship.id }}</b-badge>
                <b-badge v-if="person.is_character === false" pill variant="warning" >NPC</b-badge>
                <b-badge v-if="person.is_character === true" pill variant="warning" >Character</b-badge>
                <b-badge v-if="person.is_character === null" pill variant="danger" >Random generated NPC</b-badge>
              </li>
          </ul>
        </div>
        <b-input-group prepend="Person ID" class="mt-3">
          <b-form-input v-model="writtenPersonId" @keydown.enter.native="getPerson"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" @click="getPerson">Get person</b-button>
          </b-input-group-append>
        </b-input-group>
        <b-input-group prepend="Bio ID" class="mt-3">
          <b-form-input v-model="writtenBioId" @keydown.enter.native="getPerson"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-success" @click="getPerson">Get person</b-button>
          </b-input-group-append>
        </b-input-group>
        <div v-if="selectedPerson" class="selected-person">
          <h3>Selected person: {{ selectedPerson.full_name }} <span v-if="!selectedPerson.is_character">(NPC)</span></h3>
          <p><strong>Card ID:</strong>{{selectedPerson.card_id}} &nbsp;&nbsp;&nbsp; <strong>Bio ID:</strong> {{ selectedPerson.bio_id }}</p>
          <b-input-group prepend="Person last name" class="mt-3">
            <b-form-input v-model="personLastName"></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonLastName">Set last name</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person status" class="mt-3">
            <b-form-select v-model="personStatus" :options="personStatusOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonStatus">Set status</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person ship" class="mt-3">
            <b-form-select v-model="personShipId" :options="allShips"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonShipId">Set ship</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person visibility" class="mt-3">
            <b-form-select v-model="personIsVisible" :options="personVisibleOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonVisibility">Set visibility</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person title" class="mt-3">
            <b-form-input v-model="personTitle"></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonTitle">Set title</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person political party" class="mt-3">
            <b-form-select v-model="personParty" :options="personPartyOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonParty">Set political party</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person dynasty" class="mt-3">
            <b-form-select v-model="personDynasty" :options="personDynastyOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonDynasty">Set dynasty</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person religion" class="mt-3">
            <b-form-select v-model="personReligion" :options="personReligionOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonReligion">Set religion</b-button>
            </b-input-group-append>
          </b-input-group>
          <b-input-group prepend="Person military rank" class="mt-3">
            <b-form-select v-model="personMilitaryRank" :options="personMilitaryRankOptions"></b-form-select>
            <b-input-group-append>
              <b-button variant="outline-success" @click="setPersonMilitaryRank">Set military Rank</b-button>
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
            <b-button v-b-modal.modal-kill-person class="action-button" variant="warning" size="md">Kill this person</b-button>
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
    <hr>
    <div>
      <h2>Artifact actions</h2>
      <h4>Search</h4>
      <b-input-group prepend="Artifact Catalog ID" class="mt-3">
        <b-form-input v-model="writtenArtifactCatalogId" @keydown.enter.native="getArtifact"></b-form-input>
        <b-input-group-append>
          <b-button variant="outline-success" @click="getArtifact">Get artifact</b-button>
        </b-input-group-append>
      </b-input-group>
      <div v-if="selectedArtifact" class="selected-artifact">
        <h3>Selected artifact: {{ selectedArtifact.catalog_id }} <span>({{ selectedArtifact.name }})</span></h3>
        <b-input-group prepend="Artifact is visible" class="mt-3">
          <b-form-select v-model="artifactIsVisible" :options="artifactIsVisibleOptions"></b-form-select>
          <b-input-group-append>
            <b-button variant="outline-success" @click="setArtifactIsVisible">Set artifact visibility</b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
    <hr>
    <div v-if="!!auditLogEntries.length">
      <h2>Datahub audit log</h2>
      <p>
        Showing last 150 events.
      </p>
      <p>
        <b-form-checkbox v-model="showNpcAuditLog" name="check-button" switch @change="parseAuditLogEntries">
          Show logins to NPC accounts
        </b-form-checkbox>
      </p>
      <b-table striped hover bordered :items="formattedAuditLogEntries" :fields="auditLogTableColumns"></b-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueMarkdown from "vue-markdown";
import { distanceInWordsStrict } from 'date-fns';
import { difference } from 'lodash';
import { pushError } from '../helpers';
import { format } from "date-fns";

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
      showNpcUnreadMessagesOnly: true,
      showNpcAuditLog: false,
      writtenArtifactCatalogId: '',
      selectedArtifact: null,
      writtenPersonId: '',
      writtenBioId: '',
      writtenPersonName: '',
      searchPersonResults: [],
      selectedPerson: null,
      selectedShipFilter: null,
      allShips: [],
      personStatus: '',
      personShip: '',
      personParty: '',
      personDynasty: '',
      personReligion: '',
      personMilitaryRank: '',
      personIsVisible: false,
      personTitle: '',
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
      ],
      personPartyOptions: [
          'Blue Party',
          'Purple Party',
          'Yellow Party',
          'None',
      ],
      personDynastyOptions: [
          'Floater',
          'Defiance',
          'Hope',
          'Mercy',
          'Purity',
          'Strength',
          'Wisdom',
          'None',
      ],
      personReligionOptions: [
          'Faith of the High Science',
          'Old Ways',
          'Other',
          'None',
      ],
      personMilitaryRankOptions: [
          'Recruit',
          'Cadet',
          'Junior Petty Officer',
          'Petty Officer',
          'Chief Petty Officer',
          'Junior Lieutenant',
          'Lieutenant',
          'Commander',
          'Vice Admiral',
          'Admiral One Star',
          'Admiral Two Stars',
          'Admiral Three Stars',
          'None',
      ],
      artifactIsVisibleOptions: [
        { value: true, text: 'Visible' },
        { value: false, text: 'Hidden' },
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
    searchPerson() {
      if (!this.writtenPersonName) return this.searchPersonResults = [];
      const searchParams = { name: this.writtenPersonName, entries: 150, show_hidden: true };
      if (this.selectedShipFilter) searchParams.ship_id = this.selectedShipFilter.trim();
      axios.get(`/person`, { params: searchParams }).then(res => {
        this.searchPersonResults = res.data.persons;
      });
    },
    async selectPerson(person) {
      if (!(person && person.id)) return;
      this.writtenPersonId = person.id;
      this.getPerson();
    },
    async selectArtifact(artifact) {
      if (!(artifact && artifact.catalog_id)) return;
      this.writtenArtifactCatalogId = artifact.catalog_id;
      this.getArtifact();
    },
    formatVoteSubtitle(vote) {
      return `Created by ${vote.author.full_name} on ${format(new Date(vote.created_at), "dddd HH:mm:ss")}`;
    },
    formatPostSubtitle(post) {
      return `Created by ${post.author.full_name} on ${format(new Date(post.created_at), "dddd HH:mm:ss")} (${post.type
        })`;
    },
    fetchData() {
      this.fetchPendingVotes();
      this.fetchPendingsPosts();
      this.fetchUnreadMessages();
      this.fetchAuditLog();
      if (!this.allGroups.length) this.fetchAllGroups();
      if (!this.allShips.length) this.fetchAllShips();
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
      if (this.writtenPersonId) {
        axios.get(`/person/${this.writtenPersonId}`)
        .then(res => {
          this.selectedPerson = res.data;
          if (!res.data) return;
          this.personLastName = res.data.last_name;
          this.personStatus = res.data.status;
          this.personGroups = res.data.groups;
          this.personShipId = res.data.ship_id || 'None';
          this.personIsVisible = res.data.is_visible;
          this.personTitle = res.data.title || '';
          this.personParty = res.data.political_party || 'None';
          this.personDynasty = res.data.dynasty || 'None';
          this.personReligion = res.data.religion || 'None';
          this.personMilitaryRank = res.data.military_rank || 'None';
        })
        .catch(err => pushError(this.errors, err, this.$notify));
      } else if (this.writtenBioId) {
        axios.get(`/person/bio/${this.writtenBioId}`)
        .then(res => {
          this.selectedPerson = res.data;
          if (!res.data) return;
          this.personLastName = res.data.last_name;
          this.personStatus = res.data.status;
          this.personGroups = res.data.groups;
          this.personShipId = res.data.ship_id || 'None';
          this.personIsVisible = res.data.is_visible;
          this.personTitle = res.data.title || '';
          this.personParty = res.data.political_party || 'None';
          this.personDynasty = res.data.dynasty || 'None';
          this.personReligion = res.data.religion || 'None';
          this.personMilitaryRank = res.data.military_rank || 'None';
        })
        .catch(err => pushError(this.errors, err, this.$notify));
      }
    },
    getArtifact() {
      this.selectedArtifact = null;
      if (this.writtenArtifactCatalogId) {
        axios.get(`/science/artifact/catalog/${this.writtenArtifactCatalogId}`)
        .then(res => {
          this.selectedArtifact = res.data;
          if (!res.data) return;
          this.artifactIsVisible = res.data.is_visible;
        })
        .catch(err => pushError(this.errors, err, this.$notify));
      }
    },
    setArtifactIsVisible() {
      if (!this.selectedArtifact) return;
      const artifactToPatch = {...this.selectedArtifact, is_visible: this.artifactIsVisible }
      delete artifactToPatch.entries;
      console.log(artifactToPatch);
      this.patchArtifact(artifactToPatch).then(() => {
        this.$notify({
          title: 'Success',
          text: `Artifact visibility is set to ${this.artifactIsVisible}`,
          type: "success",
        });
        this.getArtifact();
      });
    },
    setPersonLastName() {
      if (!this.selectedPerson) return;
      this.patchPerson({ last_name: this.personLastName }).then(() => {
        this.$notify({
          title: 'Success',
          text: `Person last name set to ${this.personLastName}`,
          type: "success",
        });
        this.getPerson();
      });
    },
    setPersonTitle() {
      if (!this.selectedPerson) return;
      this.patchPerson({ title: this.personTitle }).then(() => {
        this.$notify({
          title: 'Success',
          text: `Person title set to ${this.personTitle}`,
          type: "success",
        });
        this.getPerson();
      });
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
        text: `Status updated to ${this.personStatus}`,
        type: "success",
      }));
    },
    setPersonShipId() {
      this.patchPerson({ ship_id: this.personShipId.trim() }).then(() => this.$notify({
        title: 'Success',
        text: `Person ship set to ${this.personShipId}`,
        type: "success",
      }));
    },
    setPersonParty() {
      this.patchPerson({ political_party: this.personParty.trim() }).then(() => this.$notify({
        title: 'Success',
        text: `Person political party set to ${this.personParty}`,
        type: "success",
      }));
    },
    setPersonDynasty() {
      this.patchPerson({ dynasty: this.personDynasty.trim() }).then(() => this.$notify({
        title: 'Success',
        text: `Person dynasty set to ${this.personDynasty}`,
        type: "success",
      }));
    },
    setPersonReligion() {
      this.patchPerson({ religion: this.personReligion.trim() }).then(() => this.$notify({
        title: 'Success',
        text: `Person religion set to ${this.personReligion}`,
        type: "success",
      }));
    },
    setPersonMilitaryRank() {
      this.patchPerson({ military_rank: this.personMilitaryRank.trim() }).then(() => this.$notify({
        title: 'Success',
        text: `Person military rank set to ${this.personMilitaryRank}`,
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
    patchArtifact(patch) {
      return axios.put(`/science/artifact/`, patch)
        .then(() => {
          this.getArtifact();
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
    async fetchAllShips() {
      this.pendingRequests.add("ships");
      await axios
        .get("/fleet?show_hidden=true", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.allShips = ['', ...(response.data || []).map(s => s.id)];
        })
        .catch(this.handleError);
      this.pendingRequests.delete("ships");
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
      }).then(() => {
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
        .then(() => {
          this.fetchData();
        }).catch(this.handleError);
    },
  }
};
</script>

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
h3 {
  padding-top: 25px
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

.person-search-results {
  padding: 16px;
}

li>* {
  margin: auto 4px;
}

li>strong {
  cursor: pointer;
}
</style>
