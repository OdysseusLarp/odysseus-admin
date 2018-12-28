<template>
    <span>
        <span
          :id="id"
          :class="classes">
            {{formattedTime}}
        </span>
        <b-popover :target="id"
                   placement="right"
                   triggers="hover"
                   delay="500">
          <template>{{fullTime}}</template>
        </b-popover>
    </span>
</template>

<script>
export default {
    props: [ 'time', 'warn' ],
    data () {
        return {
            id: `span-${Math.random()}`
        }
    },
    computed: {
        formattedTime () {
            const time = this.parseTime(this.$props.time)
            const now = Date.now()
            const mins = Math.floor((now - time)/1000/60)
            if (mins < 1) {
                return `<1 min ago`
            } else if (mins < 60) {
                return `${mins} min ago`
            } else if (mins < 24*60) {
                return `${Math.floor(mins/60)} h ${mins%60} min ago`
            } else {
                return `${Math.floor(mins/60/24)} d ${Math.floor(mins/60%24)} h ago`
            }
        },
        fullTime () {
            const time = this.parseTime(this.$props.time)
            return new Date(time).toString().replace(/\(.*\)/, "")
        },
        classes () {
            const time = this.parseTime(this.$props.time)
            const warn = this.$props.warn || 600
            const now = Date.now()
            const secs = Math.floor((now - time)/1000)
            if (secs > warn) {
                return "text-danger"
            }
            return ""
        }
    },
    methods: {
        parseTime (time) {
            if (typeof(time) === 'number') {
                return time
            } else if (typeof(time) === 'string') {
                return Date.parse(time)
            } else if (time instanceof Date) {
                return time.getTime()
            } else {
                console.error("Unknown time type", time)
                return 0
            }
        }
    }
}
</script>

