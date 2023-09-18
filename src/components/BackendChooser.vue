<template>
  <div>
    <b-modal id="backendChooserModal" title="Choose backend URI" @ok="handleOk">
      <b-form>
        <b-form-group
          label="Backend URI:"
          label-for="backendUri"
          description="Backend URI, e.g. http://localhost:8888"
        >
          <b-form-input
            id="backendUri"
            v-model="uri"
            type="text"
            required
            placeholder=""
          >
          </b-form-input>
        </b-form-group>
        <b-form-group
          label="Basic authentication username:"
          label-for="backendUsername"
        >
          <b-form-input
            id="backendUsername"
            v-model="username"
            type="text"
            placeholder="(none)"
          >
          </b-form-input>
        </b-form-group>
        <b-form-group
          label="Basic authentication password:"
          label-for="backendPassword"
        >
          <b-form-input
            id="backendPassword"
            v-model="password"
            type="text"
            placeholder="(none)"
          >
          </b-form-input>
        </b-form-group>
        <b-form-group
          label="Auto refresh seconds (0 to disable):"
          label-for="autoRefresh"
        >
          <b-form-input
            id="autoRefresh"
            v-model="autoRefresh"
            type="number"
            min="0"
          >
          </b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      uri: this.$store.state.backend.uri,
      username: this.$store.state.backend.username,
      password: this.$store.state.backend.password,
      autoRefresh: this.$store.state.backend.autoRefresh,
    };
  },

  methods: {
    handleOk() {
      let uri = this.$data.uri;
      if (uri.endsWith("/")) {
        uri = uri.substring(0, uri.length - 1);
      }
      this.$store.commit({
        type: "setBackend",
        uri,
        username: this.$data.username,
        password: this.$data.password,
        autoRefresh: this.$data.autoRefresh,
      });
      setTimeout(() => window.location.reload(), 100);
    },
  },
};
</script>
