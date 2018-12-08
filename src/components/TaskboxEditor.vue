<template>
  <div>
    <b-modal id="taskboxEditorModal" ref="taskboxEditorModal" :title="existing ? 'Edit Taskbox' : 'New Taskbox'" @ok="handleOk">
      <b-form>
        <b-form-group label="Taskbox ID:"
                      label-for="id">
          <b-input type="text" v-model="id" id="id" required :state="idState"></b-input>
        </b-form-group>
        <b-form-group label="Taskbox content:"
                      label-for="json">
          <b-form-textarea v-model="json" id="json" :rows="10" :state="jsonState"></b-form-textarea>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>


<script>
import axiox from 'axios'

export default {
  data () {
    return {
      existing: false,
      id: "",
      idState: null,
      json: "",
      jsonState: null,
    }
  },

  watch: {
    id () {
      this.validateId();
    },
    json () {
      this.validateJson();
    }, 
  },

  methods: {
    show (taskbox) {
      console.log("Edit taskbox", taskbox)
      this.existing = !!taskbox.id
      this.id = taskbox.id || ""
      this.json = JSON.stringify(taskbox.value || {}, null, 4)
      this.$refs.taskboxEditorModal.show()
    },
    validateId () {
      var valid = this.id.match(/^[a-zA-Z0-9_-]+$/)
      this.idState = (valid ? "valid" : "invalid")
      return valid
    },
    validateJson () {
      try {
        JSON.parse(this.json)
        this.jsonState = "valid"
        return true
      } catch (e) {
        this.jsonState = "invalid"
        return false
      }
    },
    handleOk (evt) {
      if (this.validateId() && this.validateJson()) {
        var box = {
          id: this.id,
          value: JSON.parse(this.json),
        }
        axios.post(`/engineering/box/${this.id}`, box)
          .then(response => {
            console.log("Success")
            this.$emit('saved')
          })
          .catch(error => {
            console.log("Error saving box:", error)
            this.$emit('saved')
          });
      } else {
        evt.preventDefault()
      }
    },
  }
}
</script>
