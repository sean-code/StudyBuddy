<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list density="compact" nav>
        <v-list-item title="StudyBuddy Offline" subtitle="Private • On-device" />

        <v-divider class="my-2" />

        <v-list-item to="/" prepend-icon="mdi-home" title="Home" />
        <v-list-item to="/decks" prepend-icon="mdi-cards-outline" title="Decks" />
        <v-list-item to="/analytics" prepend-icon="mdi-chart-line" title="Analytics" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>StudyBuddy</v-toolbar-title>
      <v-spacer />
      <v-chip size="small" variant="tonal" prepend-icon="mdi-shield-check">
        Offline
      </v-chip>
    </v-app-bar>

    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
    };
  },
};
</script>
