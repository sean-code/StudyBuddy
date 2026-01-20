<template>
  <v-card rounded="xl" class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
      <div>
        <div class="text-h5 font-weight-bold">Quiz</div>
        <div class="text-body-2 text-medium-emphasis mt-1">Deck: {{ deckId }}</div>
      </div>

      <div class="d-flex ga-2">
        <v-btn variant="outlined" to="/decks" prepend-icon="mdi-arrow-left">Back</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="restart">Restart</v-btn>
      </div>
    </div>

    <v-divider class="my-4" />

    <v-alert v-if="loading" type="info" variant="tonal" rounded="lg">
      Loading quiz…
    </v-alert>

    <v-alert v-else-if="questions.length === 0" type="warning" variant="tonal" rounded="lg">
      No quiz saved for this deck. Go back and generate it first.
    </v-alert>

    <div v-else>
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <v-chip size="small" variant="tonal" prepend-icon="mdi-format-list-numbered">
          Question {{ idx + 1 }} / {{ questions.length }}
        </v-chip>

        <v-chip size="small" variant="tonal" prepend-icon="mdi-check-circle-outline">
          Score: {{ score }}
        </v-chip>
      </div>

      <v-card rounded="xl" class="pa-6 mt-3" variant="tonal">
        <div class="text-caption text-medium-emphasis">
          {{ current.type === "mcq" ? "Multiple Choice" : "Fill in the blank" }}
        </div>

        <div class="text-h6 mt-2">{{ current.prompt }}</div>

        <!-- MCQ -->
        <div v-if="current.type === 'mcq'" class="mt-4">
          <v-radio-group v-model="selected" :disabled="submitted">
            <v-radio
              v-for="opt in current.options"
              :key="opt"
              :label="opt"
              :value="opt"
            />
          </v-radio-group>
        </div>

        <!-- Fill -->
        <div v-else class="mt-4">
          <v-text-field
            v-model="typed"
            label="Your answer"
            variant="outlined"
            rounded="lg"
            :disabled="submitted"
          />
        </div>

        <div class="d-flex ga-2 mt-4 flex-wrap">
          <v-btn
            color="primary"
            :disabled="submitted || !canSubmit"
            prepend-icon="mdi-send"
            @click="submit"
          >
            Submit
          </v-btn>

          <v-btn
            variant="outlined"
            :disabled="!submitted"
            prepend-icon="mdi-arrow-right"
            @click="next"
          >
            Next
          </v-btn>

          <v-btn
            variant="text"
            :disabled="!current.sourceSentence"
            prepend-icon="mdi-text"
            @click="showSource = !showSource"
          >
            Source
          </v-btn>
        </div>

        <v-expand-transition>
          <div v-if="submitted" class="mt-4">
            <v-divider class="mb-3" />
            <v-alert :type="isCorrect ? 'success' : 'error'" variant="tonal" rounded="lg">
              <div class="font-weight-bold">
                {{ isCorrect ? "Correct!" : "Not quite." }}
              </div>
              <div class="mt-1">
                Answer: <b>{{ current.answer }}</b>
              </div>
            </v-alert>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="showSource && current.sourceSentence" class="mt-4">
            <v-divider class="mb-3" />
            <div class="text-caption text-medium-emphasis">Source sentence</div>
            <div class="text-body-2 mt-1">{{ current.sourceSentence }}</div>
          </div>
        </v-expand-transition>
      </v-card>

      <v-alert class="mt-4" type="info" variant="tonal" rounded="lg">
        Tip: MCQs are generated from your cloze cards + distractors from key phrases.
      </v-alert>
    </div>
  </v-card>
</template>

<script>
import { useQuizzesStore } from "../stores/quizzes";

function normalize(s) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export default {
  props: ["deckId"],

  data() {
    return {
      store: useQuizzesStore(),
      loading: true,

      questions: [],
      idx: 0,

      // answer state
      selected: null,
      typed: "",
      submitted: false,
      isCorrect: false,
      score: 0,

      showSource: false,
    };
  },

  computed: {
    current() {
      return this.questions[this.idx];
    },

    canSubmit() {
      if (!this.current) return false;
      if (this.current.type === "mcq") return !!this.selected;
      return this.typed.trim().length > 0;
    },
  },

  async mounted() {
    await this.load();
  },

  methods: {
    async load() {
      this.loading = true;
      await this.store.load(this.deckId);
      this.questions = this.store.questions || [];
      this.restart();
      this.loading = false;
    },

    restart() {
      this.idx = 0;
      this.score = 0;
      this.resetAnswerState();
    },

    resetAnswerState() {
      this.selected = null;
      this.typed = "";
      this.submitted = false;
      this.isCorrect = false;
      this.showSource = false;
    },

    submit() {
      if (!this.current || !this.canSubmit) return;

      let userAns = "";
      if (this.current.type === "mcq") userAns = this.selected;
      else userAns = this.typed;

      // For fill, accept case-insensitive match; allow minor spacing differences
      const ok = normalize(userAns) === normalize(this.current.answer);

      this.isCorrect = ok;
      if (ok) this.score += 1;

      this.submitted = true;
    },

    next() {
      if (!this.submitted) return;

      if (this.idx < this.questions.length - 1) {
        this.idx += 1;
        this.resetAnswerState();
      } else {
        // end
        this.resetAnswerState();
        this.idx = this.questions.length - 1;
      }
    },
  },
};
</script>
