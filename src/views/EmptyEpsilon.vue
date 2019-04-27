<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Empty Epsilon</h1>
    </b-container>
    <EmptyEpsilon />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EmptyEpsilon from '@/components/EmptyEpsilon.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { EmptyEpsilon }
}
</script>