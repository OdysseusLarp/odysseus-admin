<template>
  <div>
    <b-container fluid class="my-4">
      <b-form-select v-model="selected" :options="options" style="width:auto;">
        <template slot="first">
          <option :value="null" disabled>-- Choose data type --</option>
        </template>
      </b-form-select>
    </b-container>

    <DataBlobList v-if="selected" :type="selected"></DataBlobList>
    <data-blob-editor ref="dataBlobEditor"></data-blob-editor>

    <b-container fluid>
      <b-button variant="primary" @click="newDataBlob">New data store</b-button>
    </b-container>

  </div>
</template>

<script>
import { mapState } from "vuex";
import DataBlobList from "@/components/DataBlobList.vue";
import DataBlobEditor from "@/components/DataBlobEditor.vue";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export default {
  components: { DataBlobList, DataBlobEditor },
  data() {
    return {};
  },
  computed: {
    selected: {
      get() {
        return this.$store.state.dataBlobTypeChooser.selectedType;
      },
      set(value) {
        this.$store.commit("dataBlobTypeChooser_set_selectedType", value);
      }
    },
    options() {
      return this.$store.state.dataBlobs
        .map(e => e.type)
        .sort()
        .filter(onlyUnique);
    }
  },
  methods: {
    newDataBlob() {
      this.$refs.dataBlobEditor.show({ type: this.selected });
    }
  }
};
</script>
