<template>
  <div>
    <b-modal id="backendChooserModal" title="Choose backend URI" @ok="handleOk">
      <b-form>
        <b-form-group label="Backend URI:"
                      label-for="backendUri"
                      description="Backend URI, e.g. http://localhost:8888">
          <b-form-input id="backendUri"
                        type="text"
                        v-model="uri"
                        required
                        placeholder="">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Basic authentication username:"
                      label-for="backendUsername">
          <b-form-input id="backendUsername"
                        type="text"
                        v-model="username"
                        placeholder="(none)">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Basic authentication password:"
                      label-for="backendPassword">
          <b-form-input id="backendPassword"
                        type="text"
                        v-model="password"
                        placeholder="(none)">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Auto refresh seconds (0 to disable):"
                      label-for="autoRefresh">
          <b-form-input id="autoRefresh"
                        type="number"
                        min="0"
                        v-model="autoRefresh">
          </b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>


<script>
  import { mapState } from 'vuex';

  export default {
    data () {
      return {
        'uri': this.$store.state.backend.uri,
        'username': this.$store.state.backend.username,
        'password': this.$store.state.backend.password,
        'autoRefresh': this.$store.state.backend.autoRefresh,
      }
    },

    methods: {
      handleOk () {
        this.$store.commit({
          type: "setBackend",
          uri: this.$data.uri,
          username: this.$data.username,
          password: this.$data.password,
          autoRefresh: this.$data.autoRefresh,
        })
        setTimeout(() => window.location.reload(), 100)
      }
    }
  }
</script>
