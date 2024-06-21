<template>
  <div class="about">
    <EmptyEpsilon />
  </div>
</template>

<script>
import { mapState } from "vuex";
import EmptyEpsilon from "@/components/EmptyEpsilon.vue";

export default {
  components: { EmptyEpsilon },
  computed: mapState(["backendUri"]),
};
</script>
