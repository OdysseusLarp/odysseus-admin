<template>
  <div>
    <b-table hover :items="dataBlobs" :fields="fields" v-on:row-clicked="rowClicked" sort-by="id">
      <template slot="status" slot-scope="data"><span :class="statusStyle(data.item.status)">{{data.item.status}}</span></template>
      <template slot="updated_at" slot-scope="data">
        <time-ago :time="data.item.updated_at" :warn="600"></time-ago>
      </template>
      <template slot="value" slot-scope="data">{{formatValue(data.item)}}</template>
      <template slot="config" slot-scope="data">{{formatConfig(data.item)}}</template>
      <template slot="delete" slot-scope="data">
        <font-awesome-icon @click.stop="del(data.item)" icon="trash-alt" />
      </template>
    </b-table>
    <data-blob-editor ref="dataBlobEditor"></data-blob-editor>
  </div>
</template>

<style lang="scss" scoped>
.status-good {
  color: rgb(1,134,76);
}
.status-okay {
  color: rgb(193,130,15);
}
.status-bad {
  color: rgb(184,18,24);
}
</style>


<script>
import axios from 'axios'
import DataBlobEditor from '@/components/DataBlobEditor.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import io from 'socket.io-client'

export default {
  props: {
    type: String,
  },
  components: {
    DataBlobEditor,
    TimeAgo,
  },
  data () {
    return {
      fields: [
        {
          key: 'id',
          sortable: true
        },
        {
          key: 'status',
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
        // 'config',
        {
          key: 'delete',
          label: '',
        }
      ],
    }
  },
  computed: {
    dataBlobs() {
      return this.$store.state.dataBlobs.filter(e => e.type === this.type)
    }
  },

  methods: {
    formatValue (value) {
      if (value) {
        var copy = Object.assign({}, value)
        delete copy["id"]
        delete copy["type"]
        delete copy["created_at"]
        delete copy["updated_at"]
        delete copy["config"]
        delete copy["presets"]
        delete copy["version"]
        return JSON.stringify(copy, (key, val) => val.toFixed ? Number(val.toFixed(2)) : val, 1)
      }
    },
    formatConfig (value) {
      if (value && value.config) {
        return JSON.stringify(value.config, null, 1)
      }
    },
    statusStyle (value) {
      switch (value) {
        case 'fixed': return 'status-good'
        case 'broken': return 'status-bad'
        case 'calibrating': return 'status-okay'
      }
    },
    rowClicked (item) {
      this.$refs.dataBlobEditor.show(item)
    },
    del (item) {
      if (confirm(`Really delete data store '${item.id}'?`)) {
        axios.delete(`/data/${item.type}/${item.id}`)
        .catch(e => alert(`Error occurred:\n${e}`))
      }
    }
  }
}
</script>
