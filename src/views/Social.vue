<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Social</h1>
    </b-container>
    <Social />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Social from '@/components/Social.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { Social }
}
</script>