<template>
  <div>
    <b-modal
      id="dataBlobEditorModal"
      ref="dataBlobEditorModal"
      :title="existing ? 'Edit data store' : 'New data store'"
      @ok="handleOk"
    >
      <b-form>
        <b-form-group label="Data type:" label-for="type">
          <b-input
            id="type"
            v-model="type"
            type="text"
            required
            :state="typeState"
          ></b-input>
        </b-form-group>

        <b-form-group label="Data ID:" label-for="id">
          <b-input
            id="id"
            v-model="id"
            type="text"
            required
            :state="idState"
          ></b-input>
        </b-form-group>

        <b-form-group label="Content:" label-for="json">
          <b-form-textarea
            id="json"
            v-model="json"
            :rows="10"
            :state="jsonState"
          ></b-form-textarea>
        </b-form-group>

        <small v-if="patch"
          >Provided fields will be updated, other fields will keep existing
          values.
          <a href="#" @click.prevent="editRaw">Edit raw</a>
        </small>
        <small v-else>Content will overwrite the entire data store.</small>

        <b-dropdown v-if="presets" size="sm" text="Apply preset">
          <b-dropdown-item
            v-for="preset in Object.keys(presets)"
            :key="preset"
            @click="applyPreset(preset)"
          >
            {{ preset }}
          </b-dropdown-item>
        </b-dropdown>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      originalData: {},
      existing: false,
      id: "",
      type: "",
      idState: null,
      typeState: null,
      json: "",
      jsonState: null,
      presets: undefined,
      patch: true,
    };
  },

  watch: {
    id() {
      this.validateId();
    },
    type() {
      this.validateType();
    },
    json() {
      this.validateJson();
    },
  },

  methods: {
    show(data) {
      console.log("Edit data blob:", data);
      this.originalData = data;
      this.existing = !!data.id;
      this.id = data.id || "";
      this.type = data.type || "";
      this.json = JSON.stringify(this.filterData(data), null, 4);
      this.presets = data.presets;
      this.patch = true;
      this.$refs.dataBlobEditorModal.show();
    },
    filterData(data) {
      let copy = { ...data };
      delete copy["id"];
      delete copy["type"];
      delete copy["created_at"];
      delete copy["updated_at"];
      delete copy["presets"];
      delete copy["version"];
      return copy;
    },
    validateId() {
      var valid = this.id.match(/^[a-zA-Z0-9_-]+$/);
      this.idState = valid ? "valid" : "invalid";
      return valid;
    },
    validateType() {
      var valid = this.type.match(/^[a-zA-Z0-9_-]+$/);
      this.typeState = valid ? "valid" : "invalid";
      return valid;
    },
    validateJson() {
      try {
        JSON.parse(this.json);
        this.jsonState = "valid";
        return true;
      } catch (e) {
        this.jsonState = "invalid";
        return false;
      }
    },
    editRaw() {
      this.patch = false;
      this.json = JSON.stringify(this.originalData || {}, null, 4);
    },
    applyPreset(presetKey) {
      try {
        const value = JSON.parse(this.json);
        const preset = this.originalData["presets"][presetKey];
        const note = preset["note"];
        for (const key of Object.keys(preset)) {
          if (key !== "note") {
            value[key] = preset[key];
          }
        }
        this.json = JSON.stringify(value, null, 4);
        if (note) {
          alert(note);
        }
      } catch (e) {
        console.log("Error applying preset", e);
      }
    },
    handleOk(evt) {
      if (this.validateId() && this.validateJson()) {
        var data = {
          ...JSON.parse(this.json),
          id: this.id,
          type: this.type,
        };
        let method = this.patch ? axios.patch : axios.post;
        method(`/data/${this.type}/${this.id}?force=true`, data)
          .then((response) => {
            console.log("Success");
            this.$notify({
              title: "Data saved successfully",
              type: "success",
            });
          })
          .catch((error) => {
            console.log("Error saving data blob:", error);
            this.$notify({
              title: "Error saving data",
              text: "" + error,
              type: "error",
            });
          });
      } else {
        evt.preventDefault();
      }
    },
  },
};
</script>
