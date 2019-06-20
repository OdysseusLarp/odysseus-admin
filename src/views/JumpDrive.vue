<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Jump drive</h1>

      <table class="status">
        <tr>
          <th class="label">Status:</th>
          <td class="value">{{jump.status}}</td>
          <td class="info">{{statusDescription}}</td>
        </tr>
        <tr>
          <th class="label">Ready countdown:</th>
          <td class="value">{{jumpstate.readyT}}</td>
          <td class="info">Last jump started <time-ago :time="jump.last_jump" :warn="10020"></time-ago></td>
        </tr>
        <tr>
          <th class="label">Cooldown countdown:</th>
          <td class="value">{{jumpstate.cooldownT}}</td>
        </tr>
        <tr v-if="jumpstate.jumpT">
          <th class="label">Jump counter:</th>
          <td class="value">{{jumpstate.jumpT}}</td>
        </tr>
        <tr>
          <th class="label">Jump type:</th>
          <td class="value">{{jump.breaking_jump ? "breaking" : jump.minor_breaking_jump ? "minor breaking" : "non-breaking"}}</td>
          <td class="info">{{jump.breaking_jump ? "Will break a lot of things" : jump.minor_breaking_jump ? "Will break maintenance tasks plus a little EE tasks" : "Will only break maintenance tasks"}} (can be changed during jump)</td>
        </tr>
        <tr>
          <th>Coordinates:</th>
          <td class="value">{{ jumpCoordinates }}</td>
        </tr>
        <tr>
          <th>Temperature:</th>
          <td class="value">{{temperature}}</td>
          <td class="info">{{Math.round(jumpstate.jump_drive_temp_exact)}}°C + randomness</td>
        </tr>
        <tr>
          <th>Coherence:</th>
          <td class="value">{{jumpstate.coherence}}%</td>
        </tr>
        <tr v-if="jump.status === 'preparation'">
          <th>Prep tasks:</th>
          <td class="value">
            <span :class="spectralCalibrationStatus">Spectral calibration: {{spectralCalibrationStatus}}</span><br>
            <span :class="jumpReactorStatus">Jump reactor: {{jumpReactorStatus}}</span><br>
          </td>
        </tr>
      </table>

      <h2>Actions</h2>
      <div v-if="jump.status === 'broken'">
        <b-button variant="danger" @click="write({status: 'cooldown'})">Bypass engineer fixes</b-button>
        (Bypassing will skip engineer tasks, but they will still be marked as broken)
      </div>
      <div v-if="jump.status === 'cooldown'">
        <b-button variant="secondary" @click="write({status: 'ready_to_prep'})">Mark cooldown done</b-button>
        (Marking cooldown as done will allow entering jump coordinates and jumping immediately after prep is done)
      </div>
      <div v-if="jump.status === 'ready_to_prep'">
        <b-button variant="danger" @click="write({status: 'calculating'})">Move to calculating</b-button>
        (Moving <strong>will not update</strong> jump coordinates, this needs to be done manually in data blob)
      </div>
      <div v-if="jump.status === 'calculating'">
        <b-button variant="primary" @click="write({status: 'preparation'})">Approve jump</b-button>
        <b-button variant="secondary" @click="write({status: 'ready_to_prep'})">Reject jump</b-button>
        (Approve or reject proposed jump coordinates)
      </div>
      <div v-if="jump.status === 'preparation'">
        <b-button v-if="spectralCalibrationStatus === 'broken'" variant="primary" @click="writeBlob({type:'box', id:'jump_drive_spectral_calibration', status: 'fixed'})">Mark spectral calibration done</b-button>
        <b-button v-if="spectralCalibrationStatus !== 'broken'" variant="danger" @click="writeBlob({type:'box', id:'jump_drive_spectral_calibration', status: 'broken'})">Mark spectral calibration NOT done</b-button>
        <b-button v-if="jumpReactorStatus === 'broken'" variant="danger" @click="writeBlob({type:'box', id:'jump_reactor', status: 'fixed'})">Mark jump reactor done</b-button>
        <b-button v-if="jumpReactorStatus !== 'broken'" variant="danger" @click="writeBlob({type:'box', id:'jump_reactor', status: 'broken'})">Mark jump reactor NOT done</b-button>
        <b-button variant="danger" @click="write({status: 'prep_complete'})">Next state (prep complete)</b-button>
        (Will move forward once all tasks are done and calibrated)
      </div>
      <div v-if="jump.status === 'prep_complete'">
        <b-button variant="secondary" @click="write({status: 'ready'})">Mark ready for regulation jump</b-button>
        <b-button variant="danger" @click="write({status: 'jump_initiated'})">Initiate breaking jump</b-button>
        <br>(Marking as ready will skip the ready countdown and allow non-breaking jump immediately. Initiation will start 60s countdown.)
      </div>
      <div v-if="jump.status === 'ready'">
        <b-button variant="danger" @click="write({status: 'jump_initiated'})">Initiate jump</b-button>
        (Initiation will start 60s countdown.)
      </div>
      <div v-if="jump.status === 'jump_initiated'">
        <b-button variant="danger" @click="write({status: 'prep_complete'})">Abort jump</b-button>
        (Aborting can be done during 60s countdown.)
      </div>
      <div v-if="jump.status === 'jumping'">
        <b-button :variant="(jump.breaking_jump && jumpSecs < 6*60) ? 'danger' : 'primary'" @click="write({status: 'broken'})">End jump</b-button>
        <b-button variant="secondary" @click="write({status: 'cooldown'})">End jump with nothing breaking</b-button>
        <b-button :variant="(jumpSecs < 5*60) ? 'secondary' : 'danger'" @click="write({breaking_jump: true})">Change to breaking jump</b-button>
        <b-button :variant="(jumpSecs < 5*60) ? 'secondary' : 'danger'" @click="write({breaking_jump: false, minor_breaking_jump: true})">Change to minor breaking jump</b-button>
        <b-button :variant="(jumpSecs < 5*60) ? 'secondary' : 'danger'" @click="write({breaking_jump: false, minor_breaking_jump: false})">Change to non-breaking jump</b-button>
        <br>(Switching between non/breaking jump should be done before 5min mark - after that A/V might not react correctly, but breakage will work as expected. Breaking jump should not be ended before 6min mark due to A/V.)
      </div>
      <div>
        <span class="color">Legend:</span>
        <span class="color primary">Necessary action</span>
        <span class="color secondary">Optional action</span>
        <span class="color danger">Dangerous action</span>
      </div>

      <h2>Documentation</h2>
      <iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSLFz4jzNFivHEenNnMWIsb6VY2h7Y6FGpQ5Yn-tzr7pkt_lZg6kdWNgRFVAW9rwLXdNEIfdDjCb584/embed?start=false&loop=false&delayms=3000#slide=id.g4d32841109_0_0" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
      <p><a href="https://docs.google.com/presentation/d/1nbXQE9N10Zm7uS45eW4R1VvYU4zZQ0PZbRovUq7bA5o/edit#slide=id.g4d32841109_0_0" target="_blank">Open in Google Slides</a></p>
    </b-container>
  </div>
</template>

<style lang="scss">
.status {
  font-size: 150%;
  th, td {
    padding-right: 2em;
    vertical-align: top;
  }
  .label {
    white-space: nowrap;
  }
  .value {
    white-space: nowrap;
    .initial, .fixed {
      color: #29A745;
    }
    .calibrating {
      color: #FFC107;
    }
    .broken {
      color: #DC3545;
    }
  }
  .info {
    font-size: 66%;
    vertical-align: middle;
  }
}
.color {
  padding: 2em 1em;
  display: inline-block;
  font-size: 70%;
  &.primary {
    color: #007BFF;
  }
  &.secondary {
    color: #6D757D;
  }
  &.danger {
    color: #DC3545;
  }
}
h1 {
  margin-bottom: 1em;
}
h2 {
  margin: 1em 0;
}
</style>


<script>
import TimeAgo from '../components/TimeAgo'
const DESCRIPTION = {
  broken: "Jump drive broken, pending engineers to perform fixing tasks.",
  cooldown: "Cooling down, coordinates cannot be entered yet. May be skipped if desired.",
  ready_to_prep: "Ready to enter coordinates in jump UI.",
  calculating: "Entered coordinates need GM approval. May be approved or rejected.",
  preparation: "Engineers to perform jump preparation tasks before jump can be performed.",
  prep_complete: "Ready to perform breaking / non-regulation jump (lots of stuff will break if jump performed).",
  ready: "Ready to perform non-breaking / regulation jump.",
  jump_initiated: "Jump countdown has been initiated.  GMs may still abort the jump.",
  jumping: "Ship is jumping. GMs can change whether this is a breaking or non-breaking jump (preferably during first 5 min of jump).",
}

export default {
  components: { TimeAgo },
  computed: {
    jump() {
      return this.$store.state.dataBlobs.find(blob => blob.type === 'ship' && blob.id === 'jump');
    },
    jumpstate() {
      return this.$store.state.dataBlobs.find(blob => blob.type === 'ship' && blob.id === 'jumpstate');
    },
    jumpCoordinates() {
      const coordinates = this.jump ? this.jump.coordinates : null;
      if (!coordinates) return 'Not defined';
      const { sub_sector, sector, sub_quadrant, planet_orbit } = coordinates;
      const gridDetails = `${sub_quadrant}-${sector}-${sub_sector}`;
      return planet_orbit ? `${gridDetails} (Orbit ${planet_orbit})` : gridDetails;
    },
    statusDescription() {
      const desc = DESCRIPTION[this.jump.status]
      return desc ? desc : "Unknown state, something is wrong!"
    },
    temperature() {
      let desc;
      if (this.jumpstate.jump_drive_temp < 3900) {
        desc = "nominal";
      } else if (this.jumpstate.jump_drive_temp > 5200) {
        desc = "critical";
      } else {
        desc = "high";
      }
      return `${Math.round(this.jumpstate.jump_drive_temp)}°C (${desc})`
    },
    jumpSecs() {
      return (Date.now() - this.jump.last_jump) / 1000
    },
    spectralCalibrationStatus() {
      return this.$store.state.dataBlobs
        .find(blob => blob.type === 'task' && blob.id === 'jump_drive_spectral_calibration').status
    },
    jumpReactorStatus() {
      return this.$store.state.dataBlobs
        .find(blob => blob.type === 'task' && blob.id === 'jump_reactor').status
    },
  },
  methods: {
    write(data) {
      if (confirm("Do you want to update the state?\n" + JSON.stringify(data, undefined, 2))) {
        console.log("Writing jump drive state:", data);
        axios.patch(`/data/ship/jump?force=true`, data)
        .then(response => {
          console.log("Success");
          this.$notify({
            title: "State updated",
            type: "success"
          });
        })
        .catch(error => {
          console.log("Error saving data blob:", error);
          this.$notify({
            title: "Error saving data",
            text: "" + error,
            type: "error"
          });
        });
      }
    },
    writeBlob(data) {
      if (confirm("Do you want to update the data blob?\n" + JSON.stringify(data, undefined, 2))) {
        console.log("Writing data blob:", data);
        axios.patch(`/data/${data.type}/${data.id}?force=true`, data)
        .then(response => {
          console.log("Success");
          this.$notify({
            title: `Data blob '${data.id}' updated`,
            type: "success"
          });
        })
        .catch(error => {
          console.log("Error saving data blob:", error);
          this.$notify({
            title: "Error saving data",
            text: "" + error,
            type: "error"
          });
        });
      }
    },
  },
};
</script>

