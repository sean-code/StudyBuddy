<template>
  <v-card rounded="xl" class="pa-6" elevation="0">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
      <div>
        <div class="text-h5 font-weight-bold">Analytics</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          My local study insights.
        </div>
      </div>

      <div class="d-flex ga-2">
        <v-btn variant="tonal" rounded="lg" prepend-icon="mdi-refresh" @click="load">
          Refresh
        </v-btn>
      </div>
    </div>

    <v-divider class="my-4" />

    <!-- Top stats -->
    <v-row dense>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="pa-4" variant="tonal">
          <div class="text-caption text-medium-emphasis">Decks</div>
          <div class="text-h5 font-weight-bold">{{ stats.decks }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="pa-4" variant="tonal">
          <div class="text-caption text-medium-emphasis">Flashcards</div>
          <div class="text-h5 font-weight-bold">{{ stats.cards }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="pa-4" variant="tonal">
          <div class="text-caption text-medium-emphasis">Quiz Questions</div>
          <div class="text-h5 font-weight-bold">{{ stats.quizzes }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          rounded="xl"
          class="pa-4"
          :variant="stats.due > 0 ? 'flat' : 'tonal'"
          :color="stats.due > 0 ? 'primary' : undefined"
        >
          <div class="text-caption" :class="stats.due > 0 ? 'text-white' : 'text-medium-emphasis'">
            Due Now
          </div>
          <div class="text-h5 font-weight-bold" :class="stats.due > 0 ? 'text-white' : ''">
            {{ stats.due }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-5" elevation="0">
          <div class="text-subtitle-1 font-weight-bold">Activity</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Based on your review history (lastReviewedAt).
          </div>

          <v-divider class="my-4" />

          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis">Studied Today</div>
              <div class="text-h6 font-weight-bold">{{ activity.today }}</div>
            </div>
            <v-icon icon="mdi-calendar-today" class="text-medium-emphasis" />
          </div>

          <v-divider class="my-4" />

          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis">Last 7 Days</div>
              <div class="text-h6 font-weight-bold">{{ activity.last7Days }}</div>
            </div>
            <v-icon icon="mdi-calendar-week" class="text-medium-emphasis" />
          </div>

          <v-divider class="my-4" />

          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis">Current Streak</div>
              <div class="text-h6 font-weight-bold">{{ activity.streak }} day(s)</div>
            </div>
            <v-icon icon="mdi-fire" class="text-medium-emphasis" />
          </div>

          <v-alert class="mt-4" type="info" variant="tonal" rounded="lg">
            Tip: Streak counts days where you reviewed at least one card.
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card rounded="xl" class="pa-5" elevation="0">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2">
            <div>
              <div class="text-subtitle-1 font-weight-bold">Due by Deck</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Find what to study next.
              </div>
            </div>

            <v-btn
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-book-open-variant"
              :disabled="!topDueDeckId"
              @click="studyTopDue"
            >
              Study Top Due
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <v-alert v-if="loading" type="info" variant="tonal" rounded="lg">
            Loading analytics…
          </v-alert>

          <v-alert v-else-if="dueByDeck.length === 0" type="success" variant="tonal" rounded="lg">
            No due cards right now 🎉
          </v-alert>

          <v-table v-else density="compact">
            <thead>
              <tr>
                <th>Deck</th>
                <th class="text-right">Due</th>
                <th class="text-right">Cards</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in dueByDeck" :key="row.deckId">
                <td>
                  <div class="font-weight-medium">{{ row.title }}</div>
                  <div class="text-caption text-medium-emphasis">Updated: {{ fmtDate(row.updatedAt) }}</div>
                </td>
                <td class="text-right">
                  <v-chip size="small" variant="tonal" :color="row.due > 0 ? 'primary' : undefined">
                    {{ row.due }}
                  </v-chip>
                </td>
                <td class="text-right">{{ row.totalCards }}</td>
                <td class="text-right">
                  <v-btn
                    size="small"
                    variant="tonal"
                    rounded="lg"
                    prepend-icon="mdi-book-open"
                    @click="$router.push(`/study/${row.deckId}`)"
                  >
                    Study
                  </v-btn>
                  <v-btn
                    class="ml-2"
                    size="small"
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-help-circle-outline"
                    @click="$router.push(`/quiz/${row.deckId}`)"
                  >
                    Quiz
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { db } from "../db";

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default {
  data() {
    return {
      loading: true,

      stats: { decks: 0, cards: 0, quizzes: 0, due: 0 },
      activity: { today: 0, last7Days: 0, streak: 0 },

      dueByDeck: [],
      topDueDeckId: null,
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {
    fmtDate(ts) {
      if (!ts) return "—";
      return new Date(ts).toLocaleDateString();
    },

    async load() {
      this.loading = true;

      const now = Date.now();
      const todayStart = startOfDay(now);
      const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;

      // totals
      const [decksCount, cardsCount, quizCount] = await Promise.all([
        db.decks.count(),
        db.cards.count(),
        db.quizzes.count(),
      ]);

      const dueCount = await db.reviews.where("nextReviewAt").belowOrEqual(now).count();

      this.stats = {
        decks: decksCount,
        cards: cardsCount,
        quizzes: quizCount,
        due: dueCount,
      };

      // activity from reviews
      const allReviews = await db.reviews.toArray();

      const studiedToday = allReviews.filter(r => r.lastReviewedAt && r.lastReviewedAt >= todayStart).length;
      const studiedLast7 = allReviews.filter(r => r.lastReviewedAt && r.lastReviewedAt >= sevenDaysAgo).length;

      // streak calculation: count consecutive days with at least one review
      const reviewedDays = new Set(
        allReviews
          .filter(r => r.lastReviewedAt)
          .map(r => startOfDay(r.lastReviewedAt))
      );

      let streak = 0;
      let cursor = todayStart;
      while (reviewedDays.has(cursor)) {
        streak += 1;
        cursor -= 24 * 60 * 60 * 1000;
      }

      this.activity = {
        today: studiedToday,
        last7Days: studiedLast7,
        streak,
      };

      // due by deck
      const decks = await db.decks.orderBy("createdAt").reverse().toArray();
      const cards = await db.cards.toArray();

      // map deckId -> cardIds
      const deckCardsMap = new Map();
      for (const c of cards) {
        if (!deckCardsMap.has(c.deckId)) deckCardsMap.set(c.deckId, []);
        deckCardsMap.get(c.deckId).push(c.id);
      }

      // reviews for due
      const dueReviews = await db.reviews.where("nextReviewAt").belowOrEqual(now).toArray();
      const dueSet = new Set(dueReviews.map(r => r.cardId));

      const rows = decks.map(d => {
        const ids = deckCardsMap.get(d.id) || [];
        const due = ids.reduce((acc, id) => acc + (dueSet.has(id) ? 1 : 0), 0);
        const updatedAt = d.createdAt;

        return {
          deckId: d.id,
          title: d.title,
          due,
          totalCards: ids.length,
          updatedAt,
        };
      })
      .filter(r => r.totalCards > 0) // only show decks with cards
      .sort((a, b) => (b.due - a.due) || (b.updatedAt - a.updatedAt));

      this.dueByDeck = rows;

      this.topDueDeckId = rows.length && rows[0].due > 0 ? rows[0].deckId : null;

      this.loading = false;
    },

    studyTopDue() {
      if (!this.topDueDeckId) return;
      this.$router.push(`/study/${this.topDueDeckId}`);
    },
  },
};
</script>
