<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Infoboard</h1>
    </b-container>
    <Infoboard />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Infoboard from '@/components/Infoboard.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { Infoboard }
}
</script>