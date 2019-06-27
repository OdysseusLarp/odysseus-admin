<template>
	<b-container fluid class="my-4">
		<h2>{{boxId}}</h2>
		<ul>
			<li>Status: <b>{{box.status}}</b></li>
			<li>Last command: {{box.last_command || 'none'}} ({{timeString(box.last_command_at)}})</li>
			<li>Pressure: <pressureRamp :rawPressure="box.pressure" :curve="box.config.pressure_curve"/></li>
			<li>Countdown: <countdown :target="box.countdown_to"/></li>
			<li>Linked task: {{linkedBox.id}} (type: {{linkedBox.type}}, status: {{linkedBox.status}})</li>
		</ul>

		Actions:
		<div class="button-group">
			<b-button variant="success" @click="sendCommand('open')">Open</b-button>
			<b-button variant="success" @click="sendCommand('close')">Close</b-button>
			<b-button variant="success" @click="sendCommand('pressurize')">Pressurize</b-button>
			<b-button variant="success" @click="sendCommand('depressurize')">Depressurize</b-button>
			<b-button variant="warning" @click="sendCommand('stop')">Stop</b-button>
			<b-button variant="warning" @click="sendCommand('malfunction')">Malfunction</b-button>
		</div>

		Force status (does not fire DMX events!):
		<div class="button-group">
			<b-button variant="danger" @click="forceStatus('open')">Open</b-button>
			<b-button variant="danger" @click="forceStatus('closed')">Closed</b-button>
			<b-button variant="danger" @click="forceStatus('vacuum')">Vacuum</b-button>
		</div>

	</b-container>
</template>

<style lang="scss">
.button-group {
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
			return this.getBlob('box', this.boxId) || DEFAULT_BOX
		},
		linkedBox () {
			const config = this.box.config || {}
			const type = config.linked_task_type || 'box', id = config.linked_task_id
			if (!id) return { type: type, id: 'none', status: 'n/a' }
			return this.getBlob(type, id) || { type: type, id: id, status: 'NOT FOUND' }
		},
  },
	methods: {
		getBlob (type, id) {
			return this.$store.state.dataBlobs.find(e => e.type === type && e.id === id)
		},
		sendCommand (command) {
			console.log(`Send command ${command} to ${this.boxId}...`)
			axios.patch(`/data/box/${this.boxId}?force=true`, {command: command})
				.then(() => console.log(`Command ${command} sent to ${this.boxId}`))
				.catch((err) => console.log(`Command ${command} to ${this.boxId} failed:`, err))
		},
		forceStatus (status) {
			console.log(`Forcing ${this.boxId} to state ${status}...`)
			axios.patch(`/data/box/${this.boxId}?force=true`, {status: status, command: 'stop'})
				.then(() => console.log(`Forced ${this.boxId} to state ${status}`))
				.catch((err) => console.log(`Forcing ${this.boxId} to state ${status} failed:`, err))
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
