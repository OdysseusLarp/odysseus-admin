<template>
  <div>
    <b-modal id="infoboardEditorModal" ref="infoboardEditorModal" :title="existing ? 'Edit entry' : 'New entry'" @ok="handleOk">
      <b-form>
        
        <b-form-group label="Priority:"
                      label-for="priority">
          <b-input type="text" v-model="priority" id="priority" required :state="priorityState"></b-input>
        </b-form-group>

        <b-form-group label="Title:"
                      label-for="title">
          <b-input type="text" v-model="title" id="title" required :state="titleState"></b-input>
        </b-form-group>

        <b-form-group label="Body (valid HTML):"
                      label-for="body">
          <b-form-textarea v-model="body" id="body" :rows="10" :state="bodyState"></b-form-textarea>
        </b-form-group>

        <small v-if="patch">Provided fields will be updated, other fields will keep existing values.
          <a href="#" @click.prevent="editRaw">Edit raw</a>
        </small>
        <small v-else>Content will overwrite the entire data store.</small>

      </b-form>
    </b-modal>
  </div>
</template>


<script>
import axios from 'axios'

export default {
  data () {
    return {
      originalData: {},
      existing: false,
      priority: "",
      priorityState: null,
      title: "",
      titleState: null,
      body: "",
      bodyState: null,
      patch: true,
    }
  },

  watch: {
    id () {
      this.validateId();
    },
    type() {
      this.validateType();
    },
    json () {
      this.validateJson();
    }, 
  },

  methods: {
    show (data) {
      console.log("Edit data blob:", data)
      this.originalData = data
      this.existing = !!data.id
      this.priority = data.priority || 1
      this.title = data.title || ""
      this.body = data.body || ""
      this.patch = true
      this.$refs.infoboardEditorModal.show()
    },
    filterData(data) {
      let copy = {...data}
      delete copy["id"]
      delete copy["priority"]
      delete copy["title"]
      delete copy["body"]
      delete copy["created_at"]
      delete copy["updated_at"]
      return copy
    },
    validateId () {
      var valid = this.id.match(/^[a-zA-Z0-9_-]+$/)
      this.idState = (valid ? "valid" : "invalid")
      return valid
    },
    validateType() {
      var valid = this.type.match(/^[a-zA-Z0-9_-]+$/)
      this.typeState = (valid ? "valid" : "invalid")
      return valid
    },
    editRaw() {
      this.patch = false
      this.json = JSON.stringify(this.originalData || {}, null, 4)
    },
    handleOk (evt) {
      if (this.validateId() && this.validateJson()) {
        var data = {
          ...JSON.parse(this.json),
          id: this.id,
          type: this.type,
        }
        let method = this.patch ? axios.patch : axios.post
        method(`/data/${this.type}/${this.id}?force=true`, data)
          .then(response => {
            console.log("Success")
            this.$notify({
              title: 'Data saved successfully',
              type: 'success'
            });
          })
          .catch(error => {
            console.log("Error saving data blob:", error)
            this.$notify({
              title: 'Error saving data',
              text: '' + error,
              type: 'error',
            });
          });
      } else {
        evt.preventDefault()
      }
    },
  }
}
</script>
