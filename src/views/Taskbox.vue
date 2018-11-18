<template>
  <div class="about">
    <h1>Taskboxes</h1>
    <p>URI: {{backendUri}}</p>
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
