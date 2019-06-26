<template>
	<b-container fluid class="my-4">
		<h2>{{box.title || boxId}}</h2>
		<ul>
			<li>Status: <b>{{box.status}}</b></li>
			<li>Pressure: <pressureRamp :rawPressure="box.pressure" :curve="box.config.pressure_curve"/></li>
			<li>Countdown: <countdown :target="box.countdown_to"/></li>
		</ul>

		Actions:
		<div class="button-group">
			<b-button variant="success" :disabled="!canPressurize" @click="setStatus('pressurizing')">Pressurize and open</b-button>
			<b-button variant="success" :disabled="!canDepressurize" @click="setStatus('depressurizing')">Close and depressurize</b-button>
		</div>

		Force state:
		<div class="button-group">
			<b-button variant="warning" :disabled="box.status === 'open'" @click="setStatus('open')">Open</b-button>
			<b-button variant="warning" :disabled="box.status === 'closed'" @click="setStatus('closed')">Closed</b-button>
			<b-button variant="warning" :disabled="box.status === 'vacuum'" @click="setStatus('vacuum')">Vacuum</b-button>
		</div>
	</b-container>
</template>

<style lang="scss">
.button-group {
	margin-top: 0;
	margin-bottom: 1em;
}
</style>

<script>
import axios from "axios";
import Countdown from "@/components/Countdown.vue";
import PressureRamp from "@/components/PressureRamp.vue";

export default {
	components: { Countdown, PressureRamp },
	props: {
		boxId: String
	},
	computed: {
		box () {
			return this.$store.state.dataBlobs.find(e => e.type === 'box' && e.id === this.boxId) || DEFAULT_BOX
		},
		canPressurize () {
      return this.box.status !== 'open' && this.box.status !== 'pressurizing'
    },
    canDepressurize () {
      return this.box.status !== 'vacuum' && this.box.status !== 'depressurizing'
    },
  },
	methods: {
		setStatus (status) {
			console.log(`Setting airlock ${this.boxId} status to ${status}...`)
			axios.patch(`/data/box/${this.boxId}?force=true`, {status: status})
				.then(() => console.log(`Airlock ${this.boxId} status set to ${status}`))
				.catch((err) => console.log(`Failed to set status airlock ${this.boxId} to ${status}:`, err))
		},
	},
};
</script>

<style>
</style>
