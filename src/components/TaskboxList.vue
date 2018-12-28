<template>
  <div>
    <b-container fluid>
      <b-alert variant="danger" :show="!!error" :hover="true">Error loading data: {{ error }}</b-alert>
    </b-container>
    <b-table hover :items="taskboxes" :fields="fields" v-on:row-clicked="rowClicked">
      <template slot="updated_at" slot-scope="data">
        <timeago
          :id="`updated-${data.item.id}`"
          :class="classFromTime(data.item.updated_at)"
          :datetime="data.item.updated_at"
          auto-update></timeago>
        <b-popover :target="`updated-${data.item.id}`"
                   placement="right"
                   triggers="hover"
                   delay="500">
          <template>{{localTime(data.item.updated_at)}}</template>
        </b-popover>
      </template>
      <template slot="value" slot-scope="data">{{formatValue(data.item.value)}}</template>
      <template slot="config" slot-scope="data">{{formatConfig(data.item.value)}}</template>
    </b-table>
    <taskbox-editor ref="taskboxEditor" @saved="fetchData"></taskbox-editor>

    <b-container fluid>
      <b-button variant="primary" @click="newTaskbox">New taskbox</b-button>
    </b-container>
  </div>
</template>


<script>
import axiox from 'axios'
import TaskboxEditor from '@/components/TaskboxEditor.vue';

// Show time in red if unmodified for over this many milliseconds
const WARN_UNMODIFIED = 10 * 60 * 1000

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
        'value',
        'config',
      ],
      taskboxes: [
      ]
    }
  },

  created () {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData()
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(this.fetchData, this.$store.state.backend.autoRefresh * 1000)
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetchData'
  },
  methods: {
    formatValue (value) {
      if (value) {
        var copy = Object.assign({}, value)
        delete copy["config"]
        delete copy["presets"]
        return JSON.stringify(copy, null, 1)
      }
    },
    formatConfig (value) {
      if (value && value.config) {
        return JSON.stringify(value.config, null, 1)
      }
    },
    classFromTime (time) {
      var d = Date.parse(time)
      if (Date.now() - d > WARN_UNMODIFIED) {
        return "text-danger"
      }
    },
    localTime (time) {
      var d = Date.parse(time)
      return new Date(d).toString().replace(/\(.*\)/, "")
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
