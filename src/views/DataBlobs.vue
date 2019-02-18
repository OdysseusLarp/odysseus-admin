<template>
  <div class="about">
    <b-container fluid class="my-4">
      <h1>Data stores</h1>
    </b-container>
    <DataBlobTypeChooser></DataBlobTypeChooser>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import DataBlobList from '@/components/DataBlobList.vue';
import DataBlobTypeChooser from '@/components/DataBlobTypeChooser.vue';

export default {
  computed: mapState([
    'backendUri'
  ]),
  components: { DataBlobTypeChooser }
}
</script>
