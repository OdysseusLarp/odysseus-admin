<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Taskboxes</h1>
    </b-container>
    <TaskboxList></TaskboxList>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import TaskboxList from '@/components/TaskboxList.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { TaskboxList }
}
</script>
