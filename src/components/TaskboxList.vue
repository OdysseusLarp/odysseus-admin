<template>
  <div>
    <v-alert type="error" :value="error">Error loading data: {{ error }}</v-alert>
    <v-data-table
      :headers="headers"
      :items="taskboxes"
      class="elevation-1"
      v-bind:loading='loading'
      v-bind:rows-per-page-items='[ 50, 100, { "text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1 } ]'
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.updated_at }}</td>
        <td>{{ props.item.version }}</td>
        <td>{{ props.item.value }}</td>
      </template>
    </v-data-table>
  </div>
</template>


<script>
  import axiox from 'axios'

  export default {
    data () {
      return {
        loading: true,
        error: false,
        headers: [
          {
            text: 'Taskbox ID',
            align: 'left',
            value: 'id'
          },
          {
            text: 'Updated',
            align: 'left',
            value: 'updated_at'
          },
          {
            text: 'Version',
            align: 'left',
            value: 'version'
          },
          { text: 'Value', value: 'value' },
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
      fetchData () {
        this.loading = true
        this.error = null
        axios.get("/engineering/box")
          .then(response => {
            this.taskboxes = response.data;
            this.loading = false;
            this.error = null
          })
          .catch(error => {
            this.loading = false;
            this.error = "" + error;
          });
      }
    }


  }
</script>
