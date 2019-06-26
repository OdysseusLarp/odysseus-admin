<template>
	<span>{{pressurePercent}} ({{curveName}} scaling, raw = {{Number(pressure).toFixed(3)}})</span>
</template>

<script>
// apply a non-linear function to the player-visible pressure percentage
const curves = {
	linear: x => x,
	sigmoid: x => 3 * x**2 - 2 * x**3,
	sqrt: x => x**(0.5),
}
const defaultCurve = 'sigmoid'

export default {
	props: [ 'rawPressure', 'curve' ],
	data: () => 1 && {
		pressure: 0,  // updated via timer
		pressureUpdateTimer: undefined,
	},
	computed: {
		pressureRamp () {
			const pressure = this.rawPressure
			if (typeof pressure === 'number') return { t0: 0, p0: pressure, t1: 0, p1: pressure }
			else return pressure  // assume it's already in the format above!
		},
		curveName () {
			return curves[this.curve] ? this.curve : defaultCurve
		},
		scaledPressure () {
			return curves[this.curveName](this.pressure)
		},
		pressurePercent () {
			return Math.round(this.scaledPressure * 100) + '%'
		},
	},
	methods: {
		updatePressure () {
			const ramp = this.pressureRamp
			const now = new Date().getTime()
			if (now < ramp.t0) {
				this.pressure = ramp.p0
				this.pressureUpdateTimer = setTimeout(() => this.updatePressure(), Math.max(ramp.t0 - now, 100))
			} else if (now >= ramp.t1) {
				this.pressure = ramp.p1
				this.pressureUpdateTimer = undefined  // no more updates needed
			} else {
				const x = (now - ramp.t0) / (ramp.t1 - ramp.t0)
				this.pressure = ramp.p0 + x * (ramp.p1 - ramp.p0)
				this.pressureUpdateTimer = setTimeout(() => this.updatePressure(), 100 + 300 * Math.random())
			}
			this.$emit('pressureChange', { unscaled: this.pressure, scaled: this.scaledPressure })
		},
	},
	watch: {
		pressureRamp () {
			if (this.pressureUpdateTimer) clearInterval(this.pressureUpdateTimer)
			this.updatePressure()
		},
	},
};
</script>
