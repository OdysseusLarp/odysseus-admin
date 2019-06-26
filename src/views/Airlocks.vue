<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Airlocks</h1>
    </b-container>
    <b-container fluid class="my-4">
      <b-row>
        <b-col class="border"><AirlockControl boxId="airlock_main"/></b-col>
        <b-col class="border"><AirlockControl boxId="airlock_hangarbay"/></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AirlockControl from "@/components/AirlockControl.vue";

export default {
  components: { AirlockControl },
  computed: mapState(["backendUri"])
};
</script>
