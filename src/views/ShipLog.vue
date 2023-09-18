<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Ship log</h1>
    </b-container>
    <ShipLog />
  </div>
</template>

<script>
import { mapState } from "vuex";
import ShipLog from "@/components/ShipLog.vue";

export default {
  components: { ShipLog },
  computed: mapState(["backendUri"]),
};
</script>
