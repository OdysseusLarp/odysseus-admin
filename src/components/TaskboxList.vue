<template>
  <div>
    <b-container fluid>
      <b-alert variant="danger" :show="!!error" :hover="true">Error loading data: {{ error }}</b-alert>
    </b-container>
    <b-table :items="taskboxes" :fields="fields" v-on:row-clicked="rowClicked"></b-table>
    <taskbox-editor ref="taskboxEditor" @saved="fetchData"></taskbox-editor>

    <b-container fluid>
      <b-button variant="primary" @click="newTaskbox">New taskbox</b-button>
    </b-container>
  </div>
</template>


<script>
import axiox from 'axios'
import TaskboxEditor from '@/components/TaskboxEditor.vue';

export default {
  components: {
    TaskboxEditor,
  },
  data () {
    return {
      loading: true,
      error: false,
      fields: [
        {
          key: 'id',
          sortable: true
        },
        {
          key: 'updated_at',
          sortable: true
        },
        {
          key: 'version',
          sortable: true
        },
        {
          key: 'value',
          sortable: true,
          formatter: 'formatValue'
        },
      ],
      taskboxes: [
      ]
    }
  },

  created () {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetchData'
  },
  methods: {
    formatValue (value) {
      if (value) {
        var copy = Object.assign({}, value);
        delete copy["config"];
        return JSON.stringify(copy);
      }
    },
    fetchData () {
      this.loading = true
      this.error = null
      axios.get("/engineering/box", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.taskboxes = response.data;
          this.loading = false;
          this.error = null
        })
        .catch(error => {
          this.loading = false;
          this.error = "" + error;
        });
    },
    rowClicked (item) {
      this.$refs.taskboxEditor.show(item)
    },
    newTaskbox () {
      this.$refs.taskboxEditor.show({})
    },
  }
}
</script>
