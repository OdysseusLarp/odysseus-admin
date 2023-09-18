<template>
  <span>
    <span :id="id" :class="classes">
      {{ formattedTime }}
    </span>
    <b-popover :target="id" placement="right" triggers="hover" delay="500">
      <template>{{ fullTime }}</template>
    </b-popover>
  </span>
</template>

<script>
export default {
  props: {
    time: {
      type: [String, Number, Date],
      default: "0",
    },
    warn: {
      type: Number,
      default: 600,
    },
  },
  data() {
    return {
      id: `span-${Math.random()}`,
      now: Date.now(),
      intervalId: 0,
    };
  },
  computed: {
    formattedTime() {
      const time = this.parseTime(this.$props.time);
      const mins = Math.floor((this.now - time) / 1000 / 60);
      if (mins < 1) {
        return "<1 min ago";
      } else if (mins < 60) {
        return `${mins} min ago`;
      } else if (mins < 24 * 60) {
        return `${Math.floor(mins / 60)} h ${mins % 60} min ago`;
      } else {
        return `${Math.floor(mins / 60 / 24)} d ${Math.floor(
          (mins / 60) % 24,
        )} h ago`;
      }
    },
    fullTime() {
      const time = this.parseTime(this.$props.time);
      return new Date(time).toString().replace(/\(.*\)/, "");
    },
    classes() {
      const time = this.parseTime(this.$props.time);
      const warn = this.$props.warn || 600;
      const secs = Math.floor((this.now - time) / 1000);
      if (secs > warn) {
        return "text-danger";
      }
      return "";
    },
  },
  mounted: function () {
    this.intervalId = setInterval(() => (this.now = Date.now()), 5000);
  },
  beforeDestroy: function () {
    clearInterval(this.intervalId);
  },
  methods: {
    parseTime(time) {
      if (typeof time === "number") {
        return time;
      } else if (typeof time === "string") {
        return Date.parse(time);
      } else if (time instanceof Date) {
        return time.getTime();
      } else {
        console.error("Unknown time type", time);
        return 0;
      }
    },
  },
};
</script>
