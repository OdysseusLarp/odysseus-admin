<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Infoboard</h1>
      <p><b>Usage instructions</b></p>
      <p>
        Current set selects the set of infoboard entries to show, ie. only those
        in the matching set will get displayed together with potential news
        entries.
      </p>
      <p>
        A ship log entry with the "show popup" value will override this for one
        minute.
      </p>
      <p>Jump initiated and ship jumping will override all of these.</p>
    </b-container>
    <Infoboard />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Infoboard from "@/components/Infoboard.vue";

export default {
  components: { Infoboard },
  computed: mapState(["backendUri"]),
};
</script>
