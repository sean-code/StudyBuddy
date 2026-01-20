<template>
  <v-row class="ga-6">
    <!-- HERO -->
    <v-col cols="12">
      <v-card rounded="xl" class="pa-6 pa-md-10 hero" elevation="0">
        <v-row class="align-center">
          <v-col cols="12" md="7">
            <div class="d-flex align-center ga-2 mb-3">
              <v-chip size="small" variant="tonal" prepend-icon="mdi-shield-check">
                Offline • Private
              </v-chip>
              <v-chip size="small" variant="tonal" prepend-icon="mdi-database">
                IndexedDB
              </v-chip>
            </div>

            <div class="text-h3 font-weight-bold hero-title">
              StudyBuddy Offline
            </div>

            <div class="text-body-1 mt-3 text-medium-emphasis">
              Turn PDFs and notes into flashcards and quizzes, then study with spaced repetition, 
              <span class="font-weight-bold">Right in your Browser</span>.
            </div>

            <div class="mt-5 d-flex ga-3 flex-wrap">
              <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-plus" @click="openCreate = true">
                Create Deck
              </v-btn>

              <v-btn variant="outlined" size="large" rounded="lg" prepend-icon="mdi-cards-outline" to="/decks">
                Open Decks
              </v-btn>

              <v-btn v-if="resumeDeckId" variant="tonal" size="large" rounded="lg" prepend-icon="mdi-play-circle"
                @click="resumeStudy">
                Resume Study
              </v-btn>
            </div>

            <v-alert class="mt-6" type="info" variant="tonal" rounded="lg">
              No accounts. No uploads. No backend. Your files never leave your device.
            </v-alert>
          </v-col>

          <v-col cols="12" md="5">
            <v-card rounded="xl" class="pa-5 glass" elevation="0">
              <div class="text-subtitle-1 font-weight-bold">Today</div>

              <v-row class="mt-3" dense>
                <v-col cols="6">
                  <v-card rounded="lg" class="pa-4" variant="tonal">
                    <div class="text-caption text-medium-emphasis">Decks</div>
                    <div class="text-h5 font-weight-bold">{{ stats.decks }}</div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card rounded="lg" class="pa-4" variant="tonal">
                    <div class="text-caption text-medium-emphasis">Flashcards</div>
                    <div class="text-h5 font-weight-bold">{{ stats.cards }}</div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card rounded="lg" class="pa-4" :variant="stats.due > 0 ? 'flat' : 'tonal'"
                    :color="stats.due > 0 ? 'primary' : undefined">
                    <div class="text-caption" :class="stats.due > 0 ? 'text-white' : 'text-medium-emphasis'">
                      Due now
                    </div>
                    <div class="text-h5 font-weight-bold" :class="stats.due > 0 ? 'text-white' : ''">
                      {{ stats.due }}
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card rounded="lg" class="pa-4" variant="tonal">
                    <div class="text-caption text-medium-emphasis">Quiz Qs</div>
                    <div class="text-h5 font-weight-bold">{{ stats.quiz }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="d-flex align-center justify-space-between">
                <div class="text-body-2 text-medium-emphasis">
                  Last deck:
                  <span class="font-weight-medium">{{ lastDeckTitle || "—" }}</span>
                </div>

                <v-btn size="small" variant="text" prepend-icon="mdi-refresh" @click="refreshStats">
                  Refresh
                </v-btn>
              </div>

              <v-btn class="mt-4" block rounded="lg" :disabled="!resumeDeckId" color="primary"
                prepend-icon="mdi-book-open-variant" @click="resumeStudy">
                Study Due Cards
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- FEATURES -->
    <v-col cols="12" md="8">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <div class="text-h6 font-weight-bold">How it works</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Import → Generate → Study. Everything stays local.
            </div>
          </div>
          <v-chip size="small" variant="tonal" prepend-icon="mdi-lock-outline">
            Privacy-first
          </v-chip>
        </div>

        <v-row class="mt-4" dense>
          <v-col cols="12" md="4">
            <v-card rounded="xl" class="pa-5" variant="tonal">
              <v-icon icon="mdi-file-import-outline" size="28" class="mb-2" />
              <div class="text-subtitle-1 font-weight-bold">Import</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                PDFs and notes are parsed locally and saved to IndexedDB.
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="xl" class="pa-5" variant="tonal">
              <v-icon icon="mdi-auto-fix" size="28" class="mb-2" />
              <div class="text-subtitle-1 font-weight-bold">Generate</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Smart heuristics create definition, cloze, and concept cards.
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="xl" class="pa-5" variant="tonal">
              <v-icon icon="mdi-timer-outline" size="28" class="mb-2" />
              <div class="text-subtitle-1 font-weight-bold">Study</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Spaced repetition schedules reviews to maximize retention.
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- ROADMAP (POLISHED) -->
    <v-col cols="12" md="4">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="text-h6 font-weight-bold">Built features</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Everything below already works offline.
        </div>

        <v-divider class="my-4" />

        <v-list density="compact" lines="two">
          <v-list-item prepend-icon="mdi-check-circle-outline" title="Decks + local storage"
            subtitle="IndexedDB via Dexie" />
          <v-list-item prepend-icon="mdi-check-circle-outline" title="PDF/Text import + chunking"
            subtitle="Extract and structure notes" />
          <v-list-item prepend-icon="mdi-check-circle-outline" title="Flashcards generator"
            subtitle="Definition • Cloze • Concept" />
          <v-list-item prepend-icon="mdi-check-circle-outline" title="Study mode (SRS)"
            subtitle="Again • Hard • Good • Easy" />
          <v-list-item prepend-icon="mdi-check-circle-outline" title="Quiz generator + runner"
            subtitle="MCQ + Fill-in-the-blank" />
        </v-list>

        <!-- <v-alert class="mt-4" type="success" variant="tonal" rounded="lg">
          You can deploy this as a static site (GitHub Pages / Cloudflare Pages).
        </v-alert> -->
      </v-card>
    </v-col>

    <!-- Create Deck Dialog -->
    <v-dialog v-model="openCreate" max-width="520">
      <v-card rounded="xl" class="pa-4">
        <div class="text-h6 font-weight-bold">Create Deck</div>

        <v-text-field class="mt-4" label="Deck title" v-model="form.title" placeholder="e.g., CSC 722 - Midterm Notes"
          variant="outlined" rounded="lg" />

        <v-select label="Source type" v-model="form.sourceType" :items="['pdf', 'text']" variant="outlined"
          rounded="lg" />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="openCreate = false">Cancel</v-btn>
          <v-btn color="primary" @click="createDeck">Create</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { db } from "../db";
import { useDecksStore } from "../stores/decks";

export default {
  data() {
    return {
      decksStore: useDecksStore(),

      stats: { decks: 0, cards: 0, due: 0, quiz: 0 },
      lastDeckTitle: "",
      resumeDeckId: null,

      openCreate: false,
      form: { title: "", sourceType: "pdf" },
    };
  },

  async mounted() {
    await this.decksStore.loadDecks();
    await this.decksStore.seedIfEmpty();
    await this.decksStore.loadDecks();
    await this.refreshStats();

    // Start Drawer auto-collapsed / closed on mobile screens
    this.drawer = window.innerWidth >= 960;

  },

  methods: {
    async refreshStats() {
      const [decksCount, cardsCount, quizCount] = await Promise.all([
        db.decks.count(),
        db.cards.count(),
        db.quizzes.count(),
      ]);

      // Due count requires reading reviews
      const now = Date.now();
      const dueCount = await db.reviews
        .where("nextReviewAt")
        .belowOrEqual(now)
        .count();

      this.stats = {
        decks: decksCount,
        cards: cardsCount,
        due: dueCount,
        quiz: quizCount,
      };

      // last deck
      const lastDeck = await db.decks.orderBy("createdAt").reverse().first();
      this.resumeDeckId = lastDeck?.id || null;
      this.lastDeckTitle = lastDeck?.title || "";
    },

    async createDeck() {
      const deck = await this.decksStore.createDeck(this.form);
      this.openCreate = false;
      this.form = { title: "", sourceType: "pdf" };
      this.$router.push(`/decks/${deck.id}`);
    },

    resumeStudy() {
      if (!this.resumeDeckId) return;
      this.$router.push(`/study/${this.resumeDeckId}`);
    },
  },
};
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(800px 400px at 20% 10%, rgba(25, 118, 210, 0.20), transparent 60%),
    radial-gradient(600px 400px at 90% 0%, rgba(156, 39, 176, 0.18), transparent 55%),
    radial-gradient(700px 500px at 70% 90%, rgba(0, 200, 83, 0.10), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
}

.hero-title {
  letter-spacing: -0.5px;
}

.glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
}
</style>
