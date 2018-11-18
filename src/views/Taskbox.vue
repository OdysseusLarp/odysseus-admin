<template>
  <div class="about">
    <h1>Taskboxes</h1>
    <p>URI: {{backendUri}}</p>
  </div>
</template>


<script>
import { mapState } from 'vuex'

export default {
  computed: mapState([
    'backendUri'
  ])
}
</script>
