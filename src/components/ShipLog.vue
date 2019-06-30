<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert variant="danger" show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"><strong>Error: </strong>{{ error }}</b-alert>
    </b-container>
    <b-button v-b-modal.new-log-entry-modal size="sm" variant="primary" class="my-2 my-sm-0">Add new log entry</b-button>
    <b-button @click="newLogMessageFromTemplate('WARNING', 'Long range anomaly detected. Possible incoming jump into current sector.')" size="sm" variant="warning" class="my-2 my-sm-0">Jump NOW</b-button>
    <b-button @click="newLogMessageFromTemplate('WARNING', 'Long range anomaly detected. Possible incoming jump into current sector. ETA 5 min.')" size="sm" variant="warning" class="my-2 my-sm-0">Jump 5m</b-button>
    <b-button @click="newLogMessageFromTemplate('WARNING', 'Long range anomaly detected. Possible incoming jump into current sector. ETA 10 min.')" size="sm" variant="warning" class="my-2 my-sm-0">Jump 10m</b-button>
    <b-button @click="newLogMessageFromTemplate('WARNING', 'Long range anomaly detected. Possible incoming jump into current sector. ETA 15 min.')" size="sm" variant="warning" class="my-2 my-sm-0">Jump 15m</b-button>
    <div v-if="!!logs.length">
      <b-card v-for="logEntry in logs" :key="logEntry.id"
          :class="'card ' + logEntry.type"
          :title="logEntry.type"
          :sub-title="logEntry.created_at">
          <b-button variant="outline-danger" class="delete-log-entry" @click="deleteLogEntry(logEntry.id)">Delete entry</b-button>
          <p class="card-text">
            {{ logEntry.message }}
          </p>
      </b-card>
    </div>
  <div>
    <b-modal id="new-log-entry-modal" title="New log entry" @ok="handleOk" ref="new-log-modal">
      <b-form>
        <b-form-group label="Log type" label-for="logType">
          <b-form-select id="logType"
                        v-model="newLogType"
                        type="text"
                        :options="logTypes"
                        required
                        placeholder="">
          </b-form-select>
        </b-form-group>
        <b-form-group label="Log message"
                      label-for="logMessage">
          <b-form-textarea id="logMessage"
                        v-model="newLogMessage"
                        type="text"
                        required
                        rows="3"
                        max-rows="6"
                        placeholder="Log message...">
          </b-form-textarea>
        </b-form-group>
        <b-form-group>
          <b-form-checkbox id="showPopup" v-model="showPopup">Show popup</b-form-checkbox>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
  </div>
</template>

<style lang="scss">
$error-color: #dc3545;
$info-color: #007bff;
$success-color: #28a745;
$warning-color: #ffc107;
button {
  margin-right: 15px;
}
.wrapper {
  padding: 15px;
}
.card {
  margin: 15px;
}
.SUCCESS {
  border: 1px solid $success-color;
  background: rgba($success-color, 0.05);
}
.WARNING {
  border: 1px solid $warning-color;
  background: rgba($warning-color, 0.05);
}
.INFO {
  border: 1px solid $info-color;
  background: rgba($info-color, 0.05);
}
.ERROR {
  border: 1px solid $error-color;
  background: rgba($error-color, 0.05);
}
.delete-log-entry {
  position: absolute;
  top: 15px;
  right: 0;
  background: #fff;
}
</style>

<script>
import axiox from "axios";
import { format, distanceInWordsToNow } from 'date-fns';

export default {
  components: {},
  data() {
    return {
      errors: [],
      isLoading: true,
      logs: [],
      logTypes: ["SUCCESS", "INFO", "WARNING", "ERROR"],
      newLogType: "SUCCESS",
      newLogMessage: "",
      showPopup: false,
    };
  },

  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchData,
        this.$store.state.backend.autoRefresh * 1000
      );
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  },
  methods: {
    handleOk() {
      this.addLogEntry(this.newLogType, this.newLogMessage, this.showPopup);
    },
    newLogMessageFromTemplate(type, message, showPopup = true) {
      this.newLogType = type;
      this.newLogMessage = message;
      this.showPopup = true;
      this.$refs['new-log-modal'].show();
    },
    async addLogEntry(type, message, showPopup) {
      if (!type || !message) {
        this.errors.put("Type or message was not provided");
        return;
      }
      this.isLoading = true;
      const logEntry = { type, message };
      if (showPopup) logEntry.metadata = { showPopup };
      await axios
        .put(
          "/log",
          logEntry,
          { baseURL: this.$store.state.backend.uri }
        )
        .then(res => {
          this.newLogMessage = "";
          this.fetchLogEntries();
        })
        .catch(err => {
          console.log("error adding log entry", err);
          this.errors.push(err + "");
        });
      this.isLoading = false;
    },
    async deleteLogEntry(id) {
      this.isLoading = true;
      await axios
        .delete(`/log/${id}`, { baseUrl: this.$store.state.backend.uri })
        .then(() => this.fetchLogEntries())
        .catch(err => {
          this.errors.push(err.message);
          console.log("error deleting log entry", err);
        });
      this.isLoading = false;
    },
    fetchData() {
      this.fetchLogEntries();
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    async fetchLogEntries() {
      this.isLoading = true;
      await axios
        .get("/log", { baseURL: this.$store.state.backend.uri })
        .then(response => {
          this.logs = (response.data || [])
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            .map(logEntry => ({
              ...logEntry,
              created_at:
                format(new Date(logEntry.created_at), "dddd HH:mm:ss") +
                ` (${distanceInWordsToNow(logEntry.created_at)} ago)`
            }));
        })
        .catch(error => {
          this.errors.push("" + error);
        });
      this.isLoading = false;
    }
  }
};
</script>
