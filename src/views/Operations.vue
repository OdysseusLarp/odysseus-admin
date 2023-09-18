<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Operations</h1>
    </b-container>
    <Operations />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Operations from "@/components/Operations.vue";

export default {
  components: { Operations },
  computed: mapState(["backendUri"]),
};
</script>
