<template>
  <v-app>
    <!-- NAV DRAWER -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="308"
      class="sb-drawer"
    >
      <!-- Brand -->
      <div class="pa-4">
        <v-card rounded="xl" class="pa-4 brand" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-3">
              <v-avatar size="40" class="brand-avatar">
                <v-icon icon="mdi-brain" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">StudyBuddy</div>
                <div class="text-caption text-medium-emphasis">Offline • Private</div>
              </div>
            </div>

            <v-chip size="small" variant="tonal" prepend-icon="mdi-shield-check">
              Local
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <!-- Quick stats -->
          <v-row dense>
            <v-col cols="4">
              <v-card rounded="lg" class="pa-3" variant="tonal">
                <div class="text-caption text-medium-emphasis">Decks</div>
                <div class="text-subtitle-1 font-weight-bold">{{ stats.decks }}</div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card rounded="lg" class="pa-3" variant="tonal">
                <div class="text-caption text-medium-emphasis">Cards</div>
                <div class="text-subtitle-1 font-weight-bold">{{ stats.cards }}</div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                rounded="lg"
                class="pa-3"
                :variant="stats.due > 0 ? 'flat' : 'tonal'"
                :color="stats.due > 0 ? 'primary' : undefined"
              >
                <div class="text-caption" :class="stats.due > 0 ? 'text-white' : 'text-medium-emphasis'">
                  Due
                </div>
                <div class="text-subtitle-1 font-weight-bold" :class="stats.due > 0 ? 'text-white' : ''">
                  {{ stats.due }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Quick actions -->
          <div class="d-flex ga-2 mt-3 flex-wrap">
            <v-btn
              size="small"
              color="primary"
              rounded="lg"
              prepend-icon="mdi-plus"
              @click="openCreate = true"
            >
              New Deck
            </v-btn>

            <v-btn
              size="small"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-play-circle"
              :disabled="!resumeDeckId"
              @click="resumeStudy"
            >
              Resume
            </v-btn>

            <v-btn
              size="small"
              variant="text"
              rounded="lg"
              prepend-icon="mdi-refresh"
              @click="refreshStats"
            >
              Refresh
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Navigation -->
      <v-list density="compact" nav class="px-2">
        <v-list-subheader class="text-caption text-medium-emphasis">Navigation</v-list-subheader>

        <v-list-item
          to="/"
          title="Home"
          prepend-icon="mdi-home-outline"
          rounded="lg"
        />
        <v-list-item
          to="/decks"
          title="Decks"
          prepend-icon="mdi-cards-outline"
          rounded="lg"
        />
        <v-list-item
          to="/analytics"
          title="Analytics"
          prepend-icon="mdi-chart-line"
          rounded="lg"
        />

        <v-divider class="my-3" />

        <v-list-subheader class="text-caption text-medium-emphasis">Shortcuts</v-list-subheader>

        <v-list-item
          :to="resumeDeckId ? `/study/${resumeDeckId}` : '/decks'"
          title="Study Due"
          subtitle="Spaced repetition queue"
          prepend-icon="mdi-book-open-variant"
          rounded="lg"
          :disabled="!resumeDeckId"
        />

        <v-list-item
          :to="resumeDeckId ? `/quiz/${resumeDeckId}` : '/decks'"
          title="Quick Quiz"
          subtitle="MCQ + fill blanks"
          prepend-icon="mdi-help-circle-outline"
          rounded="lg"
          :disabled="!resumeDeckId"
        />
      </v-list>

      <!-- Footer -->
      <template #append>
        <div class="pa-4">
          <v-card rounded="xl" class="pa-4 footer" elevation="0">
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">
                Stored locally in IndexedDB
              </div>
              <v-icon icon="mdi-database" class="text-medium-emphasis" />
            </div>

            <v-btn
              class="mt-3"
              block
              rounded="lg"
              variant="outlined"
              prepend-icon="mdi-cog-outline"
              @click="openAbout = true"
            >
              About
            </v-btn>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- APP BAR -->
    <v-app-bar app elevation="0" class="sb-appbar">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="font-weight-bold">
        StudyBuddy
      </v-toolbar-title>

      <v-spacer />

      <v-chip size="small" variant="tonal" prepend-icon="mdi-shield-check">
        Offline
      </v-chip>
    </v-app-bar>

    <!-- MAIN -->
    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Create Deck Dialog (global) -->
    <v-dialog v-model="openCreate" max-width="520">
      <v-card rounded="xl" class="pa-4">
        <div class="text-h6 font-weight-bold">Create Deck</div>

        <v-text-field
          class="mt-4"
          label="Deck title"
          v-model="form.title"
          placeholder="e.g., CSC 722 - Midterm Notes"
          variant="outlined"
          rounded="lg"
        />

        <v-select
          label="Source type"
          v-model="form.sourceType"
          :items="['pdf', 'text']"
          variant="outlined"
          rounded="lg"
        />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="openCreate = false">Cancel</v-btn>
          <v-btn color="primary" @click="createDeck">Create</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- About Dialog -->
    <v-dialog v-model="openAbout" max-width="560">
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex align-center justify-space-between">
          <div class="text-h6 font-weight-bold">About</div>
          <v-btn icon="mdi-close" variant="text" @click="openAbout = false" />
        </div>

        <v-divider class="my-3" />

        <v-alert type="info" variant="tonal" rounded="lg">
          StudyBuddy Offline processes PDFs/notes locally and stores decks in IndexedDB.
          No accounts, no uploads, no backend.
        </v-alert>

        <div class="text-body-2 text-medium-emphasis mt-4">
          Tip: For best PDF extraction, use text-based PDFs (not scanned images).
        </div>

        <div class="d-flex justify-end mt-4">
          <v-btn color="primary" rounded="lg" @click="openAbout = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { db } from "./db";
import { useDecksStore } from "./stores/decks";

export default {
  data() {
    return {
      drawer: true,

      decksStore: useDecksStore(),
      stats: { decks: 0, cards: 0, due: 0 },

      resumeDeckId: null,

      openCreate: false,
      form: { title: "", sourceType: "pdf" },

      openAbout: false,
    };
  },

  async mounted() {
    await this.decksStore.loadDecks();
    await this.decksStore.seedIfEmpty();
    await this.decksStore.loadDecks();
    await this.refreshStats();
  },

  methods: {
    async refreshStats() {
      const [decksCount, cardsCount] = await Promise.all([
        db.decks.count(),
        db.cards.count(),
      ]);

      const now = Date.now();
      const dueCount = await db.reviews
        .where("nextReviewAt")
        .belowOrEqual(now)
        .count();

      this.stats = {
        decks: decksCount,
        cards: cardsCount,
        due: dueCount,
      };

      const lastDeck = await db.decks.orderBy("createdAt").reverse().first();
      this.resumeDeckId = lastDeck?.id || null;
    },

    async createDeck() {
      const deck = await this.decksStore.createDeck(this.form);
      this.openCreate = false;
      this.form = { title: "", sourceType: "pdf" };
      this.$router.push(`/decks/${deck.id}`);
      await this.refreshStats();
    },

    resumeStudy() {
      if (!this.resumeDeckId) return;
      this.$router.push(`/study/${this.resumeDeckId}`);
    },
  },
};
</script>

<style scoped>
.sb-drawer {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.sb-appbar {
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  background:
    radial-gradient(600px 250px at 20% 0%, rgba(25,118,210,0.22), transparent 60%),
    radial-gradient(450px 280px at 100% 10%, rgba(156,39,176,0.16), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.10);
}

.brand-avatar {
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.12);
}

.footer {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
</style>
