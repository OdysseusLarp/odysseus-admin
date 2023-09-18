<template>
  <span>{{ timeStr }}</span>
</template>

<script>
export default {
  props: {
    target: Number,
  },
  data: () => ({
    seconds: 0,
    timeout: null,
  }),
  computed: {
    timeStr() {
      let t = this.seconds,
        m = Math.floor(t / 60),
        s = Math.floor(t % 60);
      if (m < 10) m = "0" + m;
      if (s < 10) s = "0" + s;
      return "" + m + ":" + s;
    },
  },
  watch: {
    target() {
      this.refresh();
    },
  },
  created() {
    if (this.timeout === null) this.tick();
  },
  methods: {
    refresh() {
      if (this.timeout !== null) clearTimeout(this.timeout);
      this.tick();
    },
    tick() {
      const now = new Date().getTime(),
        target = this.target || now;
      const delta = target - now;
      const seconds = Math.round(Math.max(delta, 0) / 1000);
      this.seconds = seconds;
      if (seconds > 0) {
        this.timeout = setTimeout(this.tick, delta - (seconds - 1) * 1000);
      } else {
        this.timeout = null;
        this.$emit("countdown-completed");
      }
    },
  },
};
</script>
