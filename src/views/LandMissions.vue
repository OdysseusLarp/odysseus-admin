<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Land missions</h1>
    </b-container>
    <b-container fluid> nothin' here yet </b-container>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  /* components: { putSomethingHere }, */
  computed: mapState(["firebaseConfig"]),
};
</script>
