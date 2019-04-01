<template>
  <div>
    <b-table hover :items="infoboardEntries" :fields="fields" v-on:row-clicked="rowClicked" sort-by="id">
      <template slot="title" slot-scope="data">{{data.item.title}}</template>
      <template slot="updated_at" slot-scope="data">
        <time-ago :time="data.item.updated_at" :warn="600"></time-ago>
      </template>
      <template slot="delete" slot-scope="data">
        <font-awesome-icon @click.stop="del(data.item)" icon="trash-alt" />
      </template>
    </b-table>
    <infoboard-editor ref="infoboardEditor"></infoboard-editor>
  </div>
</template>

<script>
import axiox from 'axios'
import InfoboardEditor from '@/components/InfoboardEditor.vue'

export default {
  components: {
    InfoboardEditor,
  },
  data () {
    return {
      fields: [
        {
          key: 'id',
          sortable: true
        },
        {
          key: 'title',
          sortable: true
        },
        {
          key: 'updated_at',
          sortable: true
        },
        {
          key: 'priority',
          sortable: true
        },
      ],
    }
  },

  created () {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  },
  computed: {
    infoboardEntries() {
      return this.fetchData();
    }
  },
  methods: {
    fetchData() {
        this.fetchEntries();
        console.log(!!this.entries.length);
    },
    async fetchEntries() {
        this.isLoading = true;
        await axios.get("/infoboard/enabled", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.entries = response.data;
        })
        .catch(error => {
          this.errors.push("" + error);
        });
        this.isLoading = false;
    },
    rowClicked (item) {
      this.$refs.infoboardEditor.show(item)
    }
  }
}
</script>
