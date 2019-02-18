<template>
  <div>
    <b-navbar toggleable="sm" variant="light" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">Odysseus admin</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav tabs>
          <b-nav-item to="/data">Data stores</b-nav-item>
          <b-nav-item to="/tasks">Tasks</b-nav-item>
          <b-nav-item to="/social">Social</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-button size="sm" class="my-2 my-sm-0" v-b-modal.backendChooserModal>{{backendUri}}</b-button>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <backend-chooser></backend-chooser>
    <router-view></router-view>
    <notifications position="bottom right"/>
  </div>
</template>

<style lang="scss">
@import 'assets/css/global.scss';
</style>

<script>
import { mapState } from 'vuex';
import BackendChooser from '@/components/BackendChooser.vue';

export default {
  components: {
    BackendChooser,
  },
  computed: mapState({
    'backendUri': state => state.backend.uri
  })
}
</script>
