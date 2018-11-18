<template>
  <v-data-table
    :headers="headers"
    :items="taskboxes"
    class="elevation-1"
    v-bind:rows-per-page-items='[ 50, 100, { "text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1 } ]'
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.updated_at }}</td>
      <td>{{ props.item.version }}</td>
      <td>{{ props.item.value }}</td>
    </template>
  </v-data-table>
</template>


<script>
  export default {
    data () {
      return {
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
          {
            "id":"mybox",
            "value":{"value":3.14},
            "version":"1",
            "created_at":"2018-11-16T18:13:04.252Z",
            "updated_at":"2018-11-16T18:13:04.252Z"
          },
          {
            "id":"abox",
            "value":{"value":2.14},
            "version":"10",
            "created_at":"2018-11-16T18:13:04.252Z",
            "updated_at":"2018-11-16T18:13:04.252Z"
          },
        ]
      }
    }
  }
</script>
