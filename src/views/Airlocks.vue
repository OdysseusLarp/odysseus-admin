<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Airlocks</h1>
    </b-container>
    <b-container fluid class="my-4 airlocks-container">
      <b-row>
        <b-col class="border airlock"><AirlockControl box-id="airlock_main" /></b-col>
        <b-col class="border airlock"
          ><AirlockControl box-id="airlock_hangarbay"
        /></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style scoped lang="scss">
.airlocks-container {
  padding: 1rem;
}
.airlock {
  margin: 1rem;
}
</style>

<script>
import { mapState } from "vuex";
import AirlockControl from "@/components/AirlockControl.vue";

export default {
  components: { AirlockControl },
  computed: mapState(["backendUri"]),
};
</script>
