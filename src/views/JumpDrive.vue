<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Jump drive</h1>

      <table class="status">
        <tr>
          <th class="label">Status:</th>
          <td class="value">{{ jump.status }}</td>
          <td class="info">{{ statusDescription }}</td>
        </tr>
        <tr>
          <th class="label">Ready countdown:</th>
          <td class="value">{{ jumpstate.readyT }}</td>
          <td class="info">
            Last jump started
            <time-ago :time="jump.last_jump" :warn="10020"></time-ago>
          </td>
        </tr>
        <tr>
          <th class="label">Cooldown countdown:</th>
          <td class="value">{{ jumpstate.cooldownT }}</td>
        </tr>
        <tr v-if="jumpstate.jumpT">
          <th class="label">Jump counter:</th>
          <td class="value">{{ jumpstate.jumpT }}</td>
        </tr>
        <tr>
          <th class="label">Jump type:</th>
          <td class="value">
            {{
              jump.breaking_jump
                ? "breaking"
                : jump.minor_breaking_jump
                ? "minor breaking"
                : "non-breaking"
            }}
          </td>
          <td class="info">
            {{
              jump.breaking_jump
                ? "Will break a lot of things"
                : jump.minor_breaking_jump
                ? "Will break maintenance tasks plus a little EE tasks"
                : "Will only break maintenance tasks"
            }}
            (can be changed during jump)
          </td>
        </tr>
        <tr>
          <th>Coordinates:</th>
          <td class="value">{{ jumpCoordinates }}</td>
        </tr>
        <tr>
          <th>Temperature:</th>
          <td class="value">{{ temperature }}</td>
          <td class="info">
            {{ Math.round(jumpstate.jump_drive_temp_exact) }} K + randomness<br />
            Target: {{ jump.jump_drive_target_temp }} K
            <a href="#" @click.prevent="changeTargetTemperature">Change</a>
          </td>
        </tr>
        <tr>
          <th>Coherence:</th>
          <td class="value">{{ jumpstate.coherence }}%</td>
        </tr>
        <tr>
          <th>Jump crystal count:</th>
          <td class="value">
            {{ jumpCrystalCount }}
          </td>
          <td>
            <b-button variant="outline-primary" @click="fetchJumpCrystalCount()"
              >Refresh crystal count (data age: {{ fetchAgo }}s)</b-button
            >
          </td>
        </tr>
        <tr v-if="jump.status === 'preparation'">
          <th>Prep tasks:</th>
          <td class="value">
            <span :class="jumpCrystalStatus"
              >Jump crystal inserted: {{ jumpCrystalStatus }}</span
            ><br />
            <span :class="jumpReactorStatus"
              >Jump reactor: {{ jumpReactorStatus }}</span
            ><br />
          </td>
        </tr>
      </table>

      <h2>Actions</h2>
      <div v-if="jump.status === 'broken'">
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button variant="danger" @click="write({ status: 'cooldown' })"
          >Bypass engineer fixes</b-button
        >
        (Bypassing will skip engineer tasks, but they will still be marked as
        broken)
      </div>
      <div v-if="jump.status === 'cooldown'">
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button
          variant="secondary"
          @click="write({ status: 'ready_to_prep' })"
          >Mark cooldown done</b-button
        ><br />
        (Marking cooldown as done will allow entering jump coordinates and
        jumping immediately after prep is done, but does NOT cool down the jump
        drive nor allow making a regulation jump like the Immediate cooldown
        does.)
      </div>
      <div v-if="jump.status === 'ready_to_prep'">
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button variant="danger" @click="write({ status: 'calculating' })"
          >Move to calculating</b-button
        >
        (Moving <strong>will not update</strong> jump coordinates, this needs to
        be done manually in data blob)
      </div>
      <div v-if="jump.status === 'calculating'">
        <b-button variant="primary" @click="write({ status: 'preparation' })"
          >Approve jump</b-button
        >
        <b-button
          variant="secondary"
          @click="write({ status: 'ready_to_prep' })"
          >Reject jump</b-button
        >
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button variant="secondary" @click="changeMood()"
          >Change mood ({{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }})</b-button
        >
        (Approve or reject proposed jump coordinates)
      </div>
      <div v-if="jump.status === 'preparation'">
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button
          v-if="jumpCrystalStatus === 'broken'"
          variant="danger"
          @click="
            writeBlob({
              type: 'game',
              id: 'jump_drive_insert_jump_crystal',
              status: 'fixed',
            })
          "
          >Mark jump crystal insertion done</b-button
        >
        <b-button
          v-if="jumpCrystalStatus !== 'broken'"
          variant="danger"
          @click="
            writeBlob({
              type: 'game',
              id: 'jump_drive_insert_jump_crystal',
              status: 'broken',
            })
          "
          >Mark jump crystal insertion NOT done</b-button
        >
        <b-button
          v-if="jumpReactorStatus === 'broken'"
          variant="danger"
          @click="
            writeBlob({ type: 'box', id: 'jump_reactor', status: 'fixed' })
          "
          >Mark jump reactor done</b-button
        >
        <b-button
          v-if="jumpReactorStatus !== 'broken'"
          variant="danger"
          @click="
            writeBlob({ type: 'box', id: 'jump_reactor', status: 'broken' })
          "
          >Mark jump reactor NOT done</b-button
        >
        <b-button variant="danger" @click="write({ status: 'prep_complete' })"
          >Next state (prep complete)</b-button
        >
        <b-button variant="secondary" @click="changeMood()"
          >Change mood ({{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }})</b-button
        >
        (Will move forward once all tasks are done and calibrated)
      </div>
      <div v-if="jump.status === 'prep_complete'">
        <b-button
          v-if="!ready_for_safe_jump"
          variant="secondary"
          @click="immediateCooldown"
          >Immediate cooldown (artifact)</b-button
        >
        <b-button variant="secondary" @click="write({ status: 'ready' })"
          >Mark ready for regulation jump</b-button
        >
        <b-button variant="danger" @click="write({ status: 'jump_initiated' })"
          >Initiate breaking jump</b-button
        >
        <b-button variant="secondary" @click="changeMood()"
          >Change mood ({{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }})</b-button
        >
        <br />(Marking as ready will skip the ready countdown and allow
        non-breaking jump immediately. Initiation will start 60s countdown.)
      </div>
      <div v-if="jump.status === 'ready'">
        <b-button variant="danger" @click="write({ status: 'jump_initiated' })"
          >Initiate jump</b-button
        >
        <b-button variant="secondary" @click="changeMood()"
          >Change mood ({{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }})</b-button
        >
        (Initiation will start 60s countdown.)
      </div>
      <div v-if="jump.status === 'jump_initiated'">
        <b-button variant="danger" @click="write({ status: 'prep_complete' })"
          >Abort jump</b-button
        >
        <b-button variant="secondary" @click="changeMood()"
          >Change mood ({{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }})</b-button
        >
        (Aborting can be done during 60s countdown.)
      </div>
      <div v-if="jump.status === 'jumping'">
        <p v-if="jumpLength" style="font-weight: bold">
          Next jump cycle length overridden duration:
          <span style="color: #dc3545">
            {{ Math.floor(jumpLength / 60 / 60 / 1000) }} hours
            {{ (jumpLength / 60 / 1000) % 60 }} minutes</span
          >
          ({{ jumpLength / 60 / 1000 }} minutes)
        </p>
        <b-button
          :variant="
            jump.breaking_jump && jumpSecs < 6 * 60 ? 'danger' : 'primary'
          "
          @click="endJumpWithWarning()"
          >End jump with {{ jump.jump_end_warning_secs }}s warning</b-button
        >
        <b-button :variant="secondary" @click="fireJumpEndingSoonSignal()"
          >Fire ending DMX signal</b-button
        >
        <b-button :variant="secondary" @click="endJump()"
          >End jump immediately</b-button
        >
        <b-button
          variant="danger"
          @click="write({ status: 'cooldown', last_jump_override })"
          >End jump without breaking tasks (go to 'cooldown' state)</b-button
        >
        <p></p>
        <b-button
          :variant="jumpSecs < 5 * 60 ? 'secondary' : 'danger'"
          @click="
            write({
              breaking_jump: true,
              jump_drive_target_temp: jump.breaking_jump_target_temp,
            })
          "
          >Change to breaking jump</b-button
        >
        <b-button
          :variant="
            jumpSecs < 5 * 60 || !jump.breaking_jump ? 'secondary' : 'danger'
          "
          @click="
            write({
              breaking_jump: false,
              minor_breaking_jump: true,
              jump_drive_target_temp: jump.regular_jump_target_temp,
            })
          "
          >Change to minor breaking jump</b-button
        >
        <b-button
          :variant="
            jumpSecs < 5 * 60 || !jump.breaking_jump ? 'secondary' : 'danger'
          "
          @click="
            write({
              breaking_jump: false,
              minor_breaking_jump: false,
              jump_drive_target_temp: jump.regular_jump_target_temp,
            })
          "
          >Change to non-breaking jump</b-button
        >
        <br />(Switching between major breaking / (minor/non)-breaking jump
        should be done before 5min mark - after that A/V might not react
        correctly, but breakage will work as expected. Breaking jump should not
        be ended before 6min mark due to A/V. Jump mood:
        <strong
          >{{ jump.next_jump_mood }}
          {{ moodDescriptions[jump.next_jump_mood] }}</strong
        >)
      </div>
      <div style="margin-top: 1em">
        <b-button
          v-if="jump.status !== 'jumping' && jump.status !== 'jump_initiated'"
          variant="outline-secondary"
          @click="changeCurrentJumpDuration()"
          >Change current jump cycle length</b-button
        >
        <b-button
          v-if="jump.status === 'jumping'"
          variant="outline-secondary"
          @click="changeNextJumpDuration()"
          >Change next jump cycle length</b-button
        >
      </div>

      <div>
        <span class="color">Legend:</span>
        <span class="color primary">Necessary action</span>
        <span class="color secondary">Optional action</span>
        <span class="color danger">Dangerous action</span>
      </div>

      <h2>Initialization</h2>
      <p>
        Initialize the jump drive to a specific duration since the last jump
        start. To be used once when setting up the game.
      </p>
      <p>
        It asks how many minutes has passed since the last jump start, then sets
        the jump drive to 'cooldown' state with proper last jump time. Jump
        cycle 2h 47min = 167 minutes, cooldown time 2h 15min = 135 minutes.
      </p>
      <b-button variant="danger" @click="initialize()"
        >Initialize jump drive</b-button
      >

      <h2>Documentation</h2>
      <iframe
        src="https://docs.google.com/presentation/d/e/2PACX-1vRsHKCTenVnujapvya-G2T-qLCZmxFwKBE7g7NIZA6V3Ey8plf1mkOD_sAQhd_TUxOajQ1vNPgW_UXg/embed?start=false&loop=false&delayms=3000#slide=id.g4d32841109_0_0"
        frameborder="0"
        width="960"
        height="569"
        allowfullscreen="true"
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
      ></iframe>
      <p>
        <a
          href="https://docs.google.com/presentation/d/1T3lxvrgauPcpKyM31RYYDEfTDfUCgJVXkqpqUQIjVRU/edit#slide=id.g4d32841109_0_0"
          target="_blank"
          >Open in Google Slides</a
        >
      </p>
    </b-container>
  </div>
</template>

<script>
import TimeAgo from "../components/TimeAgo";
import axios from "axios";
import { get } from "lodash";
const DESCRIPTION = {
  broken: "Jump drive broken, pending engineers to perform fixing tasks.",
  cooldown:
    "Cooling down, coordinates cannot be entered yet. May be skipped if desired.",
  ready_to_prep: "Ready to enter coordinates in jump UI.",
  calculating:
    "Entered coordinates need GM approval. May be approved or rejected.",
  preparation:
    "Engineers to perform jump preparation tasks before jump can be performed.",
  prep_complete:
    "Ready to perform breaking / non-regulation jump (lots of stuff will break if jump performed).",
  ready: "Ready to perform non-breaking / regulation jump.",
  jump_initiated:
    "Jump countdown has been initiated.  GMs may still abort the jump.",
  jumping:
    "Ship is jumping. GMs can change whether this is a breaking or non-breaking jump (preferably during first 5 min of jump).",
};

const MOODS = {
  1: "Heroic",
  2: "Cautious",
  3: "Melancholy",
};

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

const SAFE_JUMP_LIMIT = 2 * HOUR + 47 * MIN;

export default {
  components: { TimeAgo },
  data() {
    return {
      jumpLength: undefined,
      odysseus: null,
      jumpCrystalCount: 0,
      fetchAgo: 0,
      fetchTimestamp: Date.now(),
    };
  },
  computed: {
    jump() {
      return this.$store.state.dataBlobs.find(
        (blob) => blob.type === "ship" && blob.id === "jump",
      );
    },
    jumpstate() {
      return this.$store.state.dataBlobs.find(
        (blob) => blob.type === "ship" && blob.id === "jumpstate",
      );
    },
    jumpCoordinates() {
      const coordinates = this.jump ? this.jump.coordinates : null;
      if (!coordinates) return "Not defined";
      const { sub_sector, sector, sub_quadrant, planet_orbit } = coordinates;
      const gridDetails = `${sub_quadrant}-${sector}-${sub_sector}`;
      return planet_orbit
        ? `${gridDetails} (Orbit ${planet_orbit})`
        : gridDetails;
    },
    statusDescription() {
      const desc = DESCRIPTION[this.jump.status];
      return desc ? desc : "Unknown state, something is wrong!";
    },
    moodDescriptions() {
      return MOODS;
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
      return `${Math.round(this.jumpstate.jump_drive_temp)} K (${desc})`;
    },
    jumpSecs() {
      return (Date.now() - this.jump.last_jump) / 1000;
    },
    jumpCrystalStatus() {
      return this.$store.state.dataBlobs.find(
        (blob) =>
          blob.type === "task" && blob.id === "jump_drive_insert_jump_crystal",
      ).status;
    },
    jumpReactorStatus() {
      return this.$store.state.dataBlobs.find(
        (blob) => blob.type === "task" && blob.id === "jump_reactor",
      ).status;
    },
    last_jump_override() {
      if (this.jumpLength) {
        return this.jump.last_jump + this.jumpLength - SAFE_JUMP_LIMIT;
      } else {
        return undefined;
      }
    },
    ready_for_safe_jump() {
      return this.jump.last_jump < Date.now() - SAFE_JUMP_LIMIT;
    },
  },
  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchJumpCrystalCount();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchJumpCrystalCount,
        this.$store.state.backend.autoRefresh * 1000,
      );
    }
    // Calculate data age every second
    this.dataAgeTimer = setInterval(() => this.calculateDataAge(), 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    clearInterval(this.dataAgeTimer);
  },
  methods: {
    write(data, no_confirm = false) {
      if (
        no_confirm ||
        confirm(
          "Do you want to update the state?\n" +
            JSON.stringify(data, undefined, 2),
        )
      ) {
        console.log("Writing jump drive state:", data);
        axios
          .patch(`/data/ship/jump?force=true`, data)
          .then((_response) => {
            console.log("Success");
            this.$notify({
              title: "State updated",
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
        this.jumpLength = undefined;
      }
    },
    writeBlob(data, no_confirm = false) {
      if (
        no_confirm ||
        confirm(
          "Do you want to update the data blob?\n" +
            JSON.stringify(data, undefined, 2),
        )
      ) {
        console.log("Writing data blob:", data);
        axios
          .patch(`/data/${data.type}/${data.id}?force=true`, data)
          .then((_response) => {
            console.log("Success");
            this.$notify({
              title: `Data blob '${data.id}' updated`,
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
      }
    },
    immediateCooldown() {
      if (
        confirm(
          "Do you want to immediately cooldown the jump drive? A safe jump will be immediately possible. Engineer tasks will still need to be performed.",
        )
      ) {
        this.write({ last_jump: Date.now() - SAFE_JUMP_LIMIT }, true);
        this.writeBlob(
          {
            type: "ship",
            id: "jumpstate",
            coherence: 100,
            jump_drive_temp_exact: this.jump.jump_drive_target_temp,
          },
          true,
        );
      }
    },
    fireJumpEndingSoonSignal(no_confirm = false) {
      if (no_confirm || confirm("Do you want to fire JumpEndingSoon signal?")) {
        return axios
          .post(`/dmx/event/JumpEndingSoon`)
          .then((response) => {
            this.$notify({
              title: `Fired DMX event JumpEndingSoon`,
              text: ``,
              type: "success",
              duration: 3000,
            });
          })
          .catch((error) => {
            console.log("Error firing event:", error);
            this.$notify({
              title: "Error firing DMX event, aborting",
              text: "" + error,
              type: "error",
            });
            throw error;
          });
      }
    },
    endJump(no_confirm = false) {
      this.write(
        { status: "broken", last_jump_override: this.last_jump_override },
        no_confirm,
      );
    },
    endJumpWithWarning() {
      const durationSecs = this.jump.jump_end_warning_secs;
      if (
        confirm(
          `Fire JumpEndingSoon signal and end jump in ${durationSecs} secs?`,
        )
      ) {
        this.fireJumpEndingSoonSignal(true).then(() => {
          setTimeout(() => {
            if (this.jump.status === "jumping") {
              this.endJump(true);
            }
          }, durationSecs * 1000);
        });
      }
    },
    initialize() {
      const minutes = prompt("Duration IN MINUTES since the previous jump:");
      if (minutes && minutes.match(/^[0-9]+$/)) {
        const mins = parseInt(minutes, 10);
        const last_jump = Date.now() - mins * 60 * 1000;
        const state = {
          status: "cooldown",
          last_jump,
          jump_at: 0,
          breaking_jump: true,
          minor_breaking_jump: true, // first jump is always minor-breaking
        };
        this.write(state);
      }
    },
    changeMood() {
      const moods = Object.keys(MOODS)
        .map((n) => `${n} = ${MOODS[n]}`)
        .join(", ");
      const nextMood = prompt(`Choose next jump mood (${moods}):`);
      if (nextMood) {
        if (MOODS[nextMood]) {
          this.write({ next_jump_mood: nextMood }, true).alert(
            `Jump mood changed to ${nextMood} (${MOODS[nextMood]})`,
          );
        } else {
          alert(`Invalid mood: ${nextMood}`);
        }
      }
    },
    changeNextJumpDuration() {
      const minutes = prompt(
        "How many MINUTES is the next jump cycle (2h 47min = 167 minutes), cancel to reset to default:",
      );
      if (minutes) {
        this.jumpLength = minutes * 60 * 1000;
      } else {
        this.jumpLength = undefined;
      }
    },
    changeCurrentJumpDuration() {
      const minutes = prompt(
        "How many MINUTES to postpone regulation jump (and cooldown, if not complete)?\nPOSITIVE will delay next jump, NEGATIVE will allow jumping earlier",
      );
      if (minutes) {
        this.write({ last_jump: this.jump.last_jump + minutes * 60 * 1000 });
      }
    },
    changeTargetTemperature() {
      const target = prompt(
        `Enter target temperature in Kelvin (current ${this.jump.jump_drive_target_temp}):`,
      );
      if (target && target.match(/^[0-9]+$/)) {
        this.write({ jump_drive_target_temp: parseInt(target, 10) }, true);
      }
    },
    async fetchJumpCrystalCount() {
      this.isLoading = true;
      await axios
        .get("/fleet/odysseus", {
          baseURL: this.$store.state.backend.uri,
        })
        .then((response) => {
          this.odysseus = response.data;
          this.fetchTimestamp = Date.now();
          this.calculateDataAge();
          this.jumpCrystalCount = get(
            this.odysseus,
            "metadata.jump_crystal_count",
            0,
          );
        })
        .catch(this.handleError);
      this.isLoading = false;
    },
    calculateDataAge() {
      this.fetchAgo = Math.ceil((Date.now() - this.fetchTimestamp) / 1000);
    },
  },
};
</script>

<style lang="scss">
.status {
  font-size: 150%;
  th,
  td {
    padding-right: 2em;
    vertical-align: top;
  }
  .label {
    white-space: nowrap;
  }
  .value {
    min-width: 10em;
    white-space: nowrap;
    .initial,
    .fixed {
      color: #29a745;
    }
    .calibrating {
      color: #ffc107;
    }
    .broken {
      color: #dc3545;
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
    color: #007bff;
  }
  &.secondary {
    color: #6d757d;
  }
  &.danger {
    color: #dc3545;
  }
}
h1 {
  margin-bottom: 1em;
}
h2 {
  margin: 1em 0;
}
</style>
