<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>DMX events</h1>
    </b-container>
    <DmxEvents />
  </div>
</template>

<script>
import DmxEvents from "@/components/DmxEvents.vue";

export default {
  components: { DmxEvents },
};
</script>
