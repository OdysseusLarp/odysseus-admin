<template>
	<b-container fluid class="my-4">
		<h2>{{boxId}}</h2>
		<ul>
			<li>Status: <b>{{box.status}}</b></li>
			<li>Last command: {{box.last_command || 'none'}} ({{timeString(box.last_command_at)}})</li>
			<li>Pressure: <pressureRamp :rawPressure="box.pressure" :curve="box.config.pressure_curve"/></li>
			<li>Countdown: <countdown :target="box.countdown_to"/></li>
			<li>Linked task: {{linkedBox.id}} (status: {{linkedBox.status}})</li>
		</ul>

		<div class="button-group">
			<b-button variant="success" @click="sendCommand('open')">Open</b-button>
			<b-button variant="success" @click="sendCommand('close')">Close</b-button>
			<b-button variant="success" @click="sendCommand('pressurize')">Pressurize</b-button>
			<b-button variant="success" @click="sendCommand('depressurize')">Depressurize</b-button>
		</div>

	</b-container>
</template>

<style lang="scss">
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
			return this.getBox(this.boxId) || DEFAULT_BOX
		},
		linkedBox () {
			const boxId = this.box.config.linked_task_id
			if (!boxId) return { id: 'none', status: 'n/a' }
			return this.getBox() || { id: boxId, status: 'NOT FOUND' }
		},
  },
	methods: {
		getBox (boxId) {
			return this.$store.state.dataBlobs.find(e => e.type === 'box' && e.id === boxId)
		},
		sendCommand (command) {
			console.log(`Send command ${command} to ${this.boxId}...`)
			axios.patch(`/data/box/${this.boxId}?force=true`, {command: command})
				.then(() => console.log(`Command ${command} sent to ${this.boxId}`))
				.catch((err) => console.log(`Command ${command} to ${this.boxId} failed:`, err))
		},
		timeString (timestamp) {
			if (!timestamp) return 'never'
			return 'at ' + new Date(timestamp).toISOString()
		},
	},
};
</script>

<style>
</style>
