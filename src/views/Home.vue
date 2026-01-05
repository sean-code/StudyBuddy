<template>
  <v-row>
    <v-col cols="12" md="7">
      <v-card rounded="xl" class="pa-6">
        <div class="text-h5 font-weight-bold">StudyBuddy Offline</div>
        <div class="text-body-1 mt-2">
          Import PDF or notes, auto-generate flashcards + quizzes, and study with spaced repetition.
          <b>All on your Device</b>.
        </div>

        <v-alert class="mt-4" type="info" variant="tonal" rounded="lg">
          No accounts. No uploads. No backend. Everything stays in your browser.
        </v-alert>

        <div class="mt-5 d-flex ga-3 flex-wrap">
          <v-btn color="primary" size="large" to="/decks" prepend-icon="mdi-cards">
            Go to Decks
          </v-btn>
          <v-btn variant="outlined" size="large" prepend-icon="mdi-file-pdf-box">
            Import PDF (next)
          </v-btn>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="5">
      <v-card rounded="xl" class="pa-6">
        <div class="text-subtitle-1 font-weight-bold">Roadmap</div>
        <v-timeline density="compact" class="mt-3">
          <v-timeline-item dot-color="primary" size="small">
            Shell + Decks (now)
          </v-timeline-item>
          <v-timeline-item dot-color="grey" size="small">
            PDF/Text import
          </v-timeline-item>
          <v-timeline-item dot-color="grey" size="small">
            Flashcards generator
          </v-timeline-item>
          <v-timeline-item dot-color="grey" size="small">
            Quiz generator
          </v-timeline-item>
          <v-timeline-item dot-color="grey" size="small">
            Study mode + analytics
          </v-timeline-item>
        </v-timeline>
      </v-card>
    </v-col>
  </v-row>
</template>
