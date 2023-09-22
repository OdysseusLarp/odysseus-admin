<template>
  <div class="wrapper">
    <b-container v-for="(error, i) in errors" :key="error" fluid>
      <b-alert
        variant="danger"
        show
        dismissible
        :hover="true"
        @dismissed="removeError(i)"
        ><strong>Error: </strong>{{ error }}</b-alert
      >
    </b-container>
    <p>
      <b-button variant="outline-primary" @click="fetchData()"
        >Refresh ship data (data age: {{ fetchAgo }}s)</b-button
      >
    </p>
    <h2>Odysseus ship info</h2>
    <b-card v-if="odysseus" class="card">
      <div class="card-text">
        <div>Current position: {{ odysseus.position.name }}</div>
        <div>
          <b-input-group size="sm" prepend="Probe count" class="mt-3">
            <b-form-input v-model="probeCount"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="patchMetadata('probe_count', probeCount)"
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Jump crystal count" class="mt-3">
            <b-form-input v-model="jumpCrystalCount"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="patchMetadata('jump_crystal_count', jumpCrystalCount)"
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Jump range (grid)" class="mt-3">
            <b-form-input v-model="jumpRange"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="patchMetadata('jump_range', jumpRange)"
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Scan range (grid)" class="mt-3">
            <b-form-input v-model="scanRange"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="patchMetadata('scan_range', scanRange)"
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Object scan min (s)" class="mt-3">
            <b-form-input v-model="objectScanMin"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="
                  patchMetadata(
                    'object_scan_duration.min_seconds',
                    objectScanMin,
                  )
                "
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Object scan max (s)" class="mt-3">
            <b-form-input v-model="objectScanMax"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="
                  patchMetadata(
                    'object_scan_duration.max_seconds',
                    objectScanMax,
                  )
                "
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Grid scan min (s)" class="mt-3">
            <b-form-input v-model="gridScanMin"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="
                  patchMetadata('grid_scan_duration.min_seconds', gridScanMin)
                "
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
        <div>
          <b-input-group size="sm" prepend="Grid scan max (s)" class="mt-3">
            <b-form-input v-model="gridScanMax"></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-success"
                @click="
                  patchMetadata('grid_scan_duration.max_seconds', gridScanMax)
                "
                >Patch value</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
      </div>
    </b-card>
    <h2>Actions</h2>
    <b-button
      class="batch-button"
      variant="outline-primary"
      size="md"
      @click="emitRefreshMap"
      >Refresh starmap</b-button
    >
    <div>
      <b-button
        v-b-modal.modal-set-ships-visible
        class="batch-button"
        variant="warning"
        size="md"
        >Make all ships visible</b-button
      >
      <b-modal
        id="modal-set-ships-visible"
        ref="modal"
        title="Set all ships to visible"
        @ok="handleShipsVisibleOk"
      >
        WARNING: Pressing OK will set all fleet ships to visible in EOC Datahub
        and LORA Science Voyager.
      </b-modal>
    </div>
    <div>
      <b-button
        v-b-modal.modal-set-persons-visible
        class="batch-button"
        variant="warning"
        size="md"
        >Make all persons visible</b-button
      >
      <b-modal
        id="modal-set-persons-visible"
        ref="modal"
        title="Set all persons to visible"
        @ok="handlePersonsVisibleOk"
      >
        WARNING: Pressing OK will set all persons to visible in EOC Datahub,
        except for a selected few.
      </b-modal>
    </div>
    <div>
      <h3>Ship related actions</h3>
      <div class="move-ships-wrapper">
        <div class="move-ships-checkboxes">
          <b-form-group label="Select ships">
            <b-form-checkbox-group
              v-model="selectedShips"
              :options="shipCheckboxes"
              name="flavour-1a"
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </div>
        <div class="move-ships-coordinates">
          <div>
            <h3>Move ship</h3>
            Enter coordinates
            <b-input-group
              size="sm"
              prepend="Paste grid name"
              class="mt-3 paste-grid-name"
            >
              <b-form-input v-model="pastedGridName"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-success" @click="parsePastedGridName"
                  >Parse</b-button
                >
              </b-input-group-append>
            </b-input-group>
            <div class="coordinates-wrapper">
              <b-form-input
                v-model="sub_quadrant"
                placeholder="Sub quadrant"
                trim
              ></b-form-input>
              <b-form-input
                v-model="sector"
                placeholder="Sector"
                trim
              ></b-form-input>
              <b-form-input
                v-model="sub_sector"
                placeholder="Sub Sector"
                trim
              ></b-form-input>
              <b-form-input
                v-model="planet_orbit"
                placeholder="Planet orbit"
                trim
              ></b-form-input>
            </div>
            <b-button variant="outline-primary" @click="validateCoordinates"
              >Validate coordinates</b-button
            >
            <p>
              {{ coordinateStatus }}
            </p>
            <b-button
              :disabled="!selectedShips.length"
              variant="warning"
              :v-if="areCoordinatesValid"
              @click="moveShips"
              >Move selected ships to coordinates</b-button
            >
          </div>
          <hr />
          <div>
            <h3>Destroy ships</h3>
            <div>
              <b-button
                v-b-modal.modal-destroy-ships
                :disabled="!selectedShips.length"
                class="batch-button"
                variant="warning"
                size="md"
                >Destroy selected ships and kill everyone aboard</b-button
              >
              <b-modal
                id="modal-destroy-ships"
                ref="modal"
                title="Destroy selected ships"
                @ok="handleDestroyShips"
              >
                <p>
                  WARNING: Pressing OK will destroy the following ships and set
                  status 'Killed in action' for everyone aboard
                </p>
                <ul>
                  <li v-for="ship in selectedShips" :key="ship">
                    {{ ship }}
                  </li>
                </ul>
              </b-modal>
            </div>
          </div>
        </div>
      </div>
      <h2>Data of all ships</h2>
      <b-button v-b-toggle.collapse-1 variant="primary"
        >Toggle to show data of all ships</b-button
      >
      <b-collapse id="collapse-1" class="mt-2">
        <div v-if="!!fleet.length">
          <vue-json-pretty :data="fleet" class="fleet-state"></vue-json-pretty>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import { get, isInteger } from "lodash";
import { pushError } from "../helpers";
import axios from "axios";

export default {
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      errors: [],
      isLoading: true,
      fleet: [],
      odysseus: null,
      fetchTimestamp: Date.now(),
      fetchAgo: 0,
      probeCount: 0,
      jumpCrystalCount: 0,
      jumpRange: 0,
      scanRange: 0,
      objectScanMin: 0,
      objectScanMax: 0,
      gridScanMin: 0,
      gridScanMax: 0,
      selectedShips: [],
      shipCheckboxes: [],
      sub_quadrant: "",
      sector: "",
      sub_sector: "",
      planet_orbit: "",
      coordinateStatus: "",
      areCoordinatesValid: false,
      pastedGridName: "",
    };
  },

  created() {
    // fetch the data when the view is created and the data is already being observed
    this.fetchData();
    if (this.$store.state.backend.autoRefresh > 0.5) {
      this.timer = setInterval(
        this.fetchData,
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
    handleShipsVisibleOk() {
      this.setShipsVisible();
    },
    handlePersonsVisibleOk() {
      this.setPersonsVisible();
    },
    handleDestroyShips() {
      this.destroyShips();
    },
    fetchData() {
      this.fetchFleet();
    },
    calculateDataAge() {
      this.fetchAgo = Math.ceil((Date.now() - this.fetchTimestamp) / 1000);
    },
    removeError(i) {
      this.errors.splice(i, 1);
    },
    handleError(error) {
      pushError(this.errors, error, this.$notify);
    },
    parsePastedGridName() {
      const gridName = this.pastedGridName.split("-").map((s) => s.trim());
      if (gridName.length !== 4)
        return pushError(this.errors, "Invalid grid format was copypasted");
      this.sub_quadrant = gridName[0] + "-" + gridName[1];
      this.sector = gridName[2];
      this.sub_sector = gridName[3];
      this.pastedGridName = "";
    },
    async validateCoordinates(coordinates) {
      let data;
      if (!coordinates || !coordinates.sub_sector) {
        const { sub_quadrant, sector, sub_sector, planet_orbit } = this;
        data = { sub_quadrant, sector, sub_sector };
        if (planet_orbit) data.planet_orbit = planet_orbit;
      } else {
        data = coordinates;
      }
      console.log("validating", data);
      await axios
        .post("/fleet/odysseus/jump/validate?validate_distance=false", data)
        .then((response) => {
          console.log("res =>", response);
          this.coordinateStatus = response.data.message || "Coordinates are OK";
          this.areCoordinatesValid = response.data.isValid;
        })
        .catch(this.handleError);
    },
    async moveShips() {
      const shipIds = this.selectedShips;
      const { sub_quadrant, sector, sub_sector, planet_orbit } = this;
      const jumpTarget = { sub_quadrant, sector, sub_sector };
      if (planet_orbit) jumpTarget.planet_orbit = planet_orbit;
      await this.validateCoordinates(jumpTarget);
      if (!this.areCoordinatesValid)
        return pushError(this.errors, "Invalid coordinates");
      await axios
        .post("/fleet/move", { shipIds, jumpTarget })
        .then((_response) => {
          this.sub_quadrant = "";
          this.sector = "";
          this.sub_sector = "";
          this.planet_orbit = "";
          this.coordinateStatus = "";
          this.areCoordinatesValid = false;
          this.selectedShips = [];
          this.$notify({
            title: "Success",
            text: "Ships moved",
            type: "success",
          });
        })
        .catch(this.handleError);
    },
    async destroyShips() {
      const shipIds = this.selectedShips;
      Promise.all(shipIds.map((id) => axios.post(`/fleet/${id}/destroy`)))
        .then(() => {
          this.$notify({
            title: "Success",
            text: "Ships destroyed",
            type: "success",
          });
          this.selectedShips = [];
        })
        .catch((error) => {
          pushError(this.errors, error);
          this.$notify({
            title: "Error",
            text: "Some ships failed to destroy, check error msg on top of page and see which ships failed",
            type: "success",
          });
        });
    },
    patchMetadata(key_path, value) {
      const numericValue = parseInt(value, 10);
      if (!isInteger(numericValue))
        return pushError(
          this.errors,
          `Value provided for ${key_path} is not an integer`,
        );
      axios
        .patch(`/fleet/odysseus/metadata`, { key_path, value: numericValue })
        .then(() => this.fetchFleet())
        .catch(this.handleError);
    },
    async fetchFleet() {
      this.isLoading = true;
      await axios
        .get("/fleet?show_hidden=true", {
          baseURL: this.$store.state.backend.uri,
        })
        .then((response) => {
          this.fleet = (response.data || []).sort((a, _b) =>
            a.id === "odysseus" ? -1 : 1,
          );
          this.odysseus = this.fleet.find((ship) => ship.id === "odysseus");
          this.shipCheckboxes = this.fleet.map((ship) => ({
            value: ship.id,
            text: `${ship.name} (${ship.position.name})`,
          }));
          this.fetchTimestamp = Date.now();
          this.calculateDataAge();
          this.jumpRange = get(this.odysseus, "metadata.jump_range", 0);
          this.scanRange = get(this.odysseus, "metadata.scan_range", 0);
          this.probeCount = get(this.odysseus, "metadata.probe_count", 0);
          this.jumpCrystalCount = get(
            this.odysseus,
            "metadata.jump_crystal_count",
            0,
          );
          this.objectScanMin = get(
            this.odysseus,
            "metadata.object_scan_duration.min_seconds",
            0,
          );
          this.objectScanMax = get(
            this.odysseus,
            "metadata.object_scan_duration.max_seconds",
            0,
          );
          this.gridScanMin = get(
            this.odysseus,
            "metadata.grid_scan_duration.min_seconds",
            0,
          );
          this.gridScanMax = get(
            this.odysseus,
            "metadata.grid_scan_duration.max_seconds",
            0,
          );
        })
        .catch(this.handleError);
      this.isLoading = false;
    },
    async setShipsVisible() {
      await axios
        .put("/fleet/set-visible", { baseURL: this.$store.state.backend.uri })
        .then((_response) => {
          this.$notify({
            title: "Success",
            text: "Ships set to visible",
            type: "success",
          });
        })
        .catch((err) => {
          pushError(this.errors, err, this.$notify);
        });
    },
    async setPersonsVisible() {
      await axios
        .put("/person/set-visible", { baseURL: this.$store.state.backend.uri })
        .then((_response) => {
          this.$notify({
            title: "Success",
            text: "Persons set to visible",
            type: "success",
          });
        })
        .catch(this.handleError);
    },
    async emitRefreshMap() {
      await axios
        .post("/emit/refreshMap", { baseURL: this.$store.state.backend.uri })
        .then((_response) => {
          window.alert("Emitted refreshMap event");
        })
        .catch(this.handleError);
    },
  },
};
</script>

<style lang="scss">
h1 {
  margin-bottom: 10px;
}
button {
  margin-right: 15px;
}
.wrapper {
  padding: 15px;
  margin-bottom: 40px;
}
.card {
  margin: 15px;
}
.batch-button {
  margin-bottom: 12px;
}
.paste-grid-name {
  margin-bottom: 12px;
}
.move-ships-wrapper {
  display: flex;
  flex-direction: row;
}
.move-ships-checkboxes {
  flex: 2;
}
.move-ships-coordinates {
  flex: 3;
}
.move-ships-coordinates > p {
  padding: 15px;
}
.coordinates-wrapper {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
}
.coordinates-wrapper > input {
  margin: 4px;
}
</style>
