<template>
  <div>
    <b-table hover :items="dataBlobs" :fields="fields" v-on:row-clicked="rowClicked" sort-by="id">
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
          key: 'updated_at',
          sortable: true
        },
        {
          key: 'version',
          sortable: true
        },
        'value',
        'config',
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
        return JSON.stringify(copy, null, 1)
      }
    },
    formatConfig (value) {
      if (value && value.config) {
        return JSON.stringify(value.config, null, 1)
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
