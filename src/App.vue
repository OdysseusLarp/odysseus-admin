<template>
  <div>
    <b-navbar toggleable="sm" variant="light" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">Odysseus admin</b-navbar-brand>
      <b-collapse id="nav_collapse" is-nav>
        <b-navbar-nav tabs>
          <b-nav-item to="/data">Data stores</b-nav-item>
          <b-nav-item to="/tasks">Tasks</b-nav-item>
          <b-nav-item to="/social">Social</b-nav-item>
          <b-nav-item to="/fleet">Fleet</b-nav-item>
          <b-nav-item to="/ship-log">Ship log</b-nav-item>
          <b-nav-item to="/infoboard">Infoboard</b-nav-item>
          <b-nav-item to="/emptyepsilon">Empty Epsilon</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-text :class="$store.state.info.type" style="padding-right: 1em">{{$store.state.info.text}}</b-nav-text>
          <b-nav-form>
            <b-button v-b-modal.backendChooserModal size="sm" class="my-2 my-sm-0">{{backendUri}}</b-button>
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
@import "assets/css/global.scss";
</style>

<script>
import { mapState } from "vuex";
import BackendChooser from "@/components/BackendChooser.vue";

export default {
  components: {
    BackendChooser
  },
  computed: mapState({
    backendUri: state => state.backend.uri
  })
};
</script>
