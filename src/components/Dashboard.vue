<template>
  <b-container fluid class="my-4">
    <h1>Dashboard</h1>
    <table class="status">
      <tr>
        <th class="label">Jump drive status:</th>
        <td class="value">{{ jump.status }}</td>
        <td class="info">{{ jumpStatusDescription }}</td>
      </tr>
      <tr>
        <th class="label">Jump ready countdown:</th>
        <td class="value">{{ jumpstate.readyT }}</td>
        <td class="info">
          Last jump started
          <time-ago :time="jump.last_jump" :warn="10020"></time-ago>
        </td>
      </tr>
      <tr>
        <th class="label">Big battery location:</th>
        <td class="value">{{ bigBatteryLocation }}</td>
        <td class="info">Where big battery is currently connected to and whether it is "active"</td>
      </tr>
      <tr>
        <th class="label">Big battery charge:</th>
        <td class="value">{{ bigBatteryCharge }}</td>
        <td class="info"></td>
      </tr>
      <tr>
        <th class="label">Big battery emergency positions:</th>
        <td v-if="bigBatteryEmergencyPositions.length" class="value">
          <div v-for="position in bigBatteryEmergencyPositions" :key="position">
            {{ position }}
          </div>
        </td>
        <td v-else class="value">None</td>
        <td class="info"></td>
      </tr>
    </table>
    <hr />
    <h2>Artifacts</h2>
    <Artifact artifactId="power_source" />
    <Artifact artifactId="jump_drive_cooldown" />
    <Artifact artifactId="calibration_slot" />
    <Artifact artifactId="scan_range_extender" />
    <Artifact artifactId="calibration_speedup" />
    <hr />
    <h2>Fuses</h2>
    <FuseStatus boxId="fusebox_bridge" />
    <FuseStatus boxId="fusebox_engineering" />
    <FuseStatus boxId="fusebox_medbay" />
    <FuseStatus boxId="fusebox_science" />
    <FuseStatus boxId="fusebox_lounge" />
  </b-container>
</template>

<script>
import TimeAgo from "../components/TimeAgo";
import Artifact from "../views/Artifact";
import FuseStatus from "../views/FuseStatus";
import { BIG_BATTERY_LOCATIONS } from '@/bigbattery';

const JUMP_DRIVE_DESCRIPTION = {
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


export default {
  components: { TimeAgo, Artifact, FuseStatus },
  computed: {
    bigBatteryLocation() {
      const box = this.$store.state.dataBlobs.find(
        (blob) => blob.type === "box" && blob.id === "bigbattery",
      );
      if (!box) {
        return "Not found";
      }
      // Find key from BIG_BATTERY_LOCATIONS using value
      const locationName = Object.keys(BIG_BATTERY_LOCATIONS).find(
        (key) => BIG_BATTERY_LOCATIONS[key] === box.connected_position,
      );
      return `${locationName || 'Unknown'} (${box.connected_position}) ${box.active ? 'ACTIVE' : ''}`
    },
    bigBatteryEmergencyPositions() {
      const box = this.$store.state.dataBlobs.find(
        (blob) => blob.type === "box" && blob.id === "bigbattery",
      );
      if (!box || !Array.isArray(box.emergency_assumed_at_positions)) {
        return "Not found";
      }
      const emergencyPositions = [];
      for (const position of box.emergency_assumed_at_positions) {
        const locationName = Object.keys(BIG_BATTERY_LOCATIONS).find(
          (key) => BIG_BATTERY_LOCATIONS[key] === position,
        );
        emergencyPositions.push(`${locationName || "Unknown"} (${position})`);
      }
      return emergencyPositions;
    },
    bigBatteryCharge() {
      const box = this.$store.state.dataBlobs.find(
        (blob) => blob.type === "box" && blob.id === "bigbattery",
      );
      if (!box) {
        return "Not found";
      }
      return `${Math.round(box.capacity_percent)} %`;
    },
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
    jumpStatusDescription() {
      return JUMP_DRIVE_DESCRIPTION[this.jump.status];
    },
  },
};
</script>

<style></style>
