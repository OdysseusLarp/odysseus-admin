<template>
  <div>
    <b-navbar toggleable="sm" variant="light" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">Odysseus admin</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav tabs>
          <b-nav-item to="/taskbox">Taskboxes</b-nav-item>
          <b-nav-item to="/tasks">Tasks</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-button size="sm" class="my-2 my-sm-0">{{backendUri}}</b-button>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import 'assets/css/global.scss';
</style>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState([
    'backendUri'
  ])
}
</script>
