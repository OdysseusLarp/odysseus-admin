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

    <p>
      Science and Medical operation results are managed here. GMs will react to
      these and set them to is_complete once necessary actions (if any) have
      been taken.
    </p>

    <!-- Operations table -->
    <p>
      <b-form-checkbox
        v-model="showPendingOnly"
        name="check-button"
        switch
        @change="(e) => filterOperations({ showPendingOnly: e })"
      >
        Only show operations that are pending actions (is_complete = false)
      </b-form-checkbox>
      <b-form-checkbox
        v-model="showAnalysedOnly"
        name="check-button"
        switch
        @change="(e) => filterOperations({ showAnalysedOnly: e })"
      >
        Only show operations that are analysed (is_analysed = true)
      </b-form-checkbox>
      <b-form-checkbox
        v-model="showAutomatedSamples"
        name="check-button"
        switch
        @change="(e) => filterOperations({ showAutomatedSamples: e })"
      >
        Include automated samples
      </b-form-checkbox>
    </p>
    <b-table
      striped
      hover
      bordered
      :items="filteredOperations"
      :fields="operationTableColumns"
      @row-clicked="selectOperation"
    ></b-table>

    <!-- Operation details modal -->
    <b-modal
      id="operation-details-modal"
      ref="operation-details-modal"
      title="Operation details"
    >
      <div v-if="selectedOperation">
        <b-alert
          v-if="
            selectedOperation.person &&
            hasSpecialCase(selectedOperation.person.id)
          "
          variant="danger"
          show
        >
          THIS PERSON HAS SOME SPECIAL CASES, ASK A GM!
        </b-alert>
        <p>
          Operation performed <strong>{{ selectedOperation.age }} ago</strong>
        </p>
        <p>
          Performed by:
          <strong>{{ selectedOperation.author.full_name }}</strong>
        </p>
        <p>
          Target: <strong>{{ selectedOperation.target }}</strong>
        </p>
        <p>
          Type: <strong>{{ selectedOperation.type }}</strong>
        </p>
        <p>
          Additional type:
          <strong>{{ selectedOperation.additional_type }}</strong>
        </p>
        <p>
          Sample ID: <strong>{{ selectedOperation.sample_id }}</strong>
        </p>
        <p>
          Is analysed:
          <strong>{{ selectedOperation.is_analysed ? "Yes" : "No" }}</strong>
        </p>
        <p>
          Is completed:
          <strong>{{ selectedOperation.is_complete ? "Yes" : "No" }}</strong>
        </p>
        <p>
          Description: <strong>{{ selectedOperation.description }}</strong>
        </p>
        <b-button
          v-if="!selectedOperation.is_complete"
          variant="success"
          @click="() => setIsComplete(true)"
          >Set as completed
        </b-button>
      </div>
    </b-modal>

    <h2>Tag management</h2>
    <p>
      <b-button
        size="sm"
        class="my-2 my-sm-0"
        variant="primary"
        @click="addNewTag"
        >Add new tag</b-button
      >
    </p>
    <b-table
      striped
      hover
      bordered
      :items="tags"
      :fields="tagColumns"
      @row-clicked="selectTag"
    ></b-table>

    <!-- Tag details modal -->
    <b-modal
      id="tag-details-modal"
      ref="tag-details-modal"
      title="Tag details"
      @ok="handleTagOk"
    >
      <b-form-group label="Tag ID" label-for="tag-id">
        <b-input
          id="tag-id"
          v-model="tagId"
          type="text"
          required
          :disabled="!isCreate"
        ></b-input>
      </b-form-group>
      <b-form-group label="Type" label-for="tag-type">
        <b-input id="tag-type" v-model="tagType" type="text"></b-input>
      </b-form-group>
      <b-form-group label="Description" label-for="tag-description">
        <b-form-textarea
          id="tag-description"
          v-model="tagDescription"
          :rows="10"
        ></b-form-textarea>
      </b-form-group>
      <b-button
        v-if="!isCreate"
        size="sm"
        class="my-2 my-sm-0"
        variant="danger"
        @click="deleteTag"
        >Delete tag (NO CONFIRMATION)</b-button
      >
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { distanceInWordsToNow } from "date-fns";
import { isAutomatedSample, pushError } from "../helpers";
import { get } from "lodash";

const SPECIAL_CASE_IDS = new Set(["20019", "20062"]);

export default {
  components: {},
  data() {
    return {
      errors: [],
      isLoading: true,
      operations: [],
      tags: [],
      filteredOperations: [],
      selectedOperation: null,
      showPendingOnly: true,
      showAnalysedOnly: true,
      showAutomatedSamples: false,
      isCreate: true,
      selectedTag: null,
      tagId: "",
      tagType: "",
      tagDescription: "",
      // tagMetadata: {}, // Not really used but whatever
      operationTableColumns: [
        {
          key: "age",
          label: "Age",
          sortable: true,
        },
        {
          key: "author",
          label: "Author",
          formatter: (person) => (person ? person.full_name : "Unknown"),
        },
        {
          key: "target",
          label: "Target",
        },
        {
          key: "type",
          label: "Type",
        },
        {
          key: "sample_id",
          label: "Sample ID",
        },
        {
          key: "additional_type",
          label: "Additional type",
        },
        {
          key: "is_analysed",
          label: "Analysed",
          sortable: true,
          formatter: (value) => (value ? "Yes" : "No"),
        },
        {
          key: "is_complete",
          label: "Completed",
          sortable: true,
          formatter: (value) => (value ? "Yes" : "No"),
        },
      ],
      tagColumns: [
        {
          key: "id",
          label: "ID",
        },
        {
          key: "type",
          label: "Type",
        },
        {
          key: "description",
          label: "Description",
        },
        // Not used, at least in the first game
        // {
        //   key: 'metadata',
        //   label: 'Metadata'
        // },
      ],
    };
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
    hasSpecialCase(id) {
      return SPECIAL_CASE_IDS.has(id);
    },
    fetchData() {
      this.fetchOperations();
      this.fetchTags();
    },
    selectOperation(operation) {
      this.selectedOperation = operation;
      this.openModal();
    },
    selectTag(tag) {
      this.isCreate = false;
      this.selectedTag = tag;
      this.tagId = tag.id;
      this.tagType = tag.type;
      this.tagDescription = tag.description;
      this.$refs["tag-details-modal"].show();
    },
    addNewTag() {
      this.tagId = "";
      this.tagType = "";
      this.tagDescription = "";
      this.isCreate = true;
      this.$refs["tag-details-modal"].show();
    },
    deleteTag() {
      if (!this.selectedTag) return;
      this.$refs["tag-details-modal"].hide();
      axios
        .delete(`/tag/${this.selectedTag.id}`)
        .then(() => {
          this.$notify({
            title: `Tag deleted`,
            text: `Successfully deleted tag ${this.selectedTag.id}`,
            type: "success",
          });
          this.fetchTags();
          this.selectedTag = null;
        })
        .catch((err) => pushError(this.errors, err, this.$notify));
    },
    handleTagOk() {
      const data = { id: this.tagId, description: this.tagDescription };
      if (this.tagType) data.type = this.tagType;
      axios
        .put("/tag", data)
        .then(() => {
          this.fetchTags();
          this.$notify({
            title: `Tag added`,
            text: `Successfully ${this.isCreate ? "created" : "updated"} tag ${
              this.tagId
            }`,
            type: "success",
          });
        })
        .catch((err) => pushError(this.errors, err, this.$notify));
    },
    openModal() {
      this.$refs["operation-details-modal"].show();
    },
    hideModal() {
      this.$refs["operation-details-modal"].hide();
    },
    filterOperations({
      showPendingOnly = this.showPendingOnly,
      showAnalysedOnly = this.showAnalysedOnly,
      showAutomatedSamples = this.showAutomatedSamples,
    } = {}) {
      this.filteredOperations = this.operations
        .filter((o) => {
          const shouldShowPending = showPendingOnly ? !o.is_complete : true;
          const shouldShowAnalysed = showAnalysedOnly ? o.is_analysed : true;
          const shouldShowAutomated = showAutomatedSamples ? true : !isAutomatedSample(o);
          return shouldShowPending && shouldShowAnalysed && shouldShowAutomated;
        })
        .map((o) => {
          // Special cases
          if (o.person && SPECIAL_CASE_IDS.has(o.person.id))
            return { ...o, _rowVariant: "danger" };
          return o;
        });
    },
    async fetchOperations() {
      this.isLoading = true;
      await axios
        .get("/operation?relations=true&include_complete=true")
        .then((response) => {
          const operations = response.data || [];
          this.operations = operations
            .map((o) => {
              let target = "";
              if (o.person) target = `${o.person.full_name} (person)`;
              if (o.artifact) target = `${o.artifact.catalog_id} (artifact)`;
              if (o.tag) target = `${o.tag.id} (tag)`;
              return {
                ...o,
                target,
                age: distanceInWordsToNow(new Date(o.created_at)),
              };
            })
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
          this.filterOperations();
        })
        .catch((error) => pushError(this.errors, error, this.$notify));
      this.isLoading = false;
    },
    async fetchTags() {
      this.isLoading = true;
      await axios
        .get("/tag")
        .then((res) => (this.tags = res.data))
        .catch((err) => pushError(this.errors, err, this.$notify));
      this.isLoading = false;
    },
    setIsComplete(isComplete) {
      const id = get(this.selectedOperation, "id");
      if (!id) return;
      // Note that this API endpoint cannot currently be used to
      // set an operation as incomplete, because it triggers side effects
      // that mark it as complete right away.
      axios
        .put(`/operation/${id}`, { is_complete: isComplete })
        .then(() => {
          this.$notify({
            title: "Success",
            text: `Set operation ${id} to completed`,
            type: "success",
          });
          this.fetchOperations();
          this.hideModal();
        })
        .catch((error) => this.pushError(this.errors, error, this.$notify));
    },
  },
};
</script>

<style lang="scss"></style>
