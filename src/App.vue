<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Odysseus admin</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat class="text-transform-none">
        <span class="mr-2">BACKEND: {{backendUri}}</span>
      </v-btn>

      <v-tabs
        slot="extension"
        color="transparent">
        <v-tab to="/">
          Home
        </v-tab>
        <v-tab to="/taskbox">
          Taskboxes
        </v-tab>
        <v-tab to="/tasks">
          Tasks
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>

  </v-app>
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
