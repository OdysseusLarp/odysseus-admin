<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>

    <p>Science and Medical operation results are managed here. GMs will react to these and set them to is_complete once necessary actions (if any) have been taken.</p>

    <!-- Operations table -->
    <p>
    <b-form-checkbox v-model="showPendingOnly" @change="filterOperations" name="check-button" switch>
        Only show operations that are pending actions (is_complete = false)
    </b-form-checkbox>
    </p>
    <b-table striped hover bordered :items="filteredOperations" :fields="operationTableColumns" @row-clicked="selectOperation"></b-table>

    <!-- Operation details modal -->
    <b-modal ref="operation-details-modal" id="operation-details-modal" title="Operation details">
        <div v-if="selectedOperation">
            <p>Operation performed <strong>{{ selectedOperation.age }} ago</strong></p>
            <p>Performed by: <strong>{{ selectedOperation.author.full_name }}</strong></p>
            <p>Target: <strong>{{ selectedOperation.target }}</strong></p>
            <p>Type: <strong>{{ selectedOperation.type }}</strong></p>
            <p>Additional type: <strong>{{ selectedOperation.additional_type }}</strong></p>
            <p>Sample ID: <strong>{{ selectedOperation.sample_id }}</strong></p>
            <p>Is analysed: <strong>{{ selectedOperation.is_analysed ? 'Yes' : 'No' }}</strong></p>
            <p>Is completed: <strong>{{ selectedOperation.is_complete ? 'Yes' : 'No' }}</strong></p>
            <p>Description: <strong>{{ selectedOperation.description }}</strong></p>
            <b-button variant="primary" @click="setCompleted" v-if="!selectedOperation.is_complete">Set is completed</b-button>
        </div>
    </b-modal>
  </div>
</template>

<style lang="scss">

</style>

<script>
import axiox from "axios";
import { format, distanceInWordsToNow } from 'date-fns';
import { pushError } from '../helpers';
import { get } from 'lodash';

export default {
  components: {},
  data() {
    return {
      errors: [],
      isLoading: true,
      operations: [],
      filteredOperations: [],
      selectedOperation: null,
      showPendingOnly: true,
      operationTableColumns: [
        {
          key: 'age',
          label: 'Age',
          sortable: true,
        },
        {
          key: 'author',
          label: 'Author',
          formatter: person => person.full_name
        },
        {
          key: 'target',
          label: 'Target'
        },
        {
          key: 'type',
          label: 'Type'
        },
        {
          key: 'sample_id',
          label: 'Sample ID'
        },
        {
          key: 'additional_type',
          label: 'Additional type'
        },
        {
          key: 'is_complete',
          label: 'Completed',
          sortable: true,
          formatter: value => value ? 'Yes' : 'No'
        },
        {
          key: 'is_analysed',
          label: 'Analysed',
          sortable: true,
          formatter: value => value ? 'Yes' : 'No'
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
    fetchData() {
        this.fetchOperations();
    },
    selectOperation(operation) {
        this.selectedOperation = operation;
        this.openModal();
    },
    openModal() {
        this.$refs['operation-details-modal'].show();
    },
    hideModal() {
        this.$refs['operation-details-modal'].hide();
    },
    filterOperations(showPendingOnly = this.showPendingOnly) {
        this.filteredOperations = this.operations.filter(o => showPendingOnly ? !o.is_complete : true);
    },
    async fetchOperations() {
      this.isLoading = true;
      await axios
        .get("/operation?relations=true")
        .then(response => {
            const operations = response.data || [];
            this.operations = operations.map(o => {
                let target = '';
                if (o.person) target = `${o.person.full_name} (person)`;
                if (o.artifact) target = `${o.artifact.name} (artifact)`;
                if (o.tag) target = `${o.tag.id} (tag)`;
                return { ...o, target, age: distanceInWordsToNow(new Date(o.created_at)) };
            }).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
            this.filterOperations();
        })
        .catch(error => pushError(this.errors, error, this.$notify));
      this.isLoading = false;
    },
    setCompleted() {
        const id = get(this.selectedOperation, 'id');
        if (!id) return;
        axios.put(`/operation/${id}`, { is_complete: true }).then(() => {
            this.$notify({
                title: 'Success',
                text: `Set operation ${id} to completed`,
                type: 'success',
            });
            this.fetchOperations();
            this.hideModal();
        }).catch(error => this.pushError(this.errors, error, this.$notify));
    }
  }
};
</script>
