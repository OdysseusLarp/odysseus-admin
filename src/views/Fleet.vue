<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Fleet details</h1>
    </b-container>
    <Fleet />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Fleet from '@/components/Fleet.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { Fleet }
}
</script>