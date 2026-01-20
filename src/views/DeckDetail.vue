<template>
  <v-card rounded="xl" class="pa-6">
    <div class="d-flex align-start justify-space-between flex-wrap ga-2">
      <div>
        <div class="text-h5 font-weight-bold">Deck</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Deck ID: {{ id }}
        </div>
      </div>

      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-arrow-left" to="/decks">Back</v-btn>
        <v-btn color="error" variant="tonal" prepend-icon="mdi-trash-can-outline" @click="clearContent">
          Clear content
        </v-btn>
      </div>
    </div>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-4" variant="tonal">
          <div class="text-subtitle-1 font-weight-bold">Import</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Everything is processed locally in your browser.
          </div>

          <v-tabs v-model="tab" class="mt-3">
            <v-tab value="pdf" prepend-icon="mdi-file-pdf-box">PDF</v-tab>
            <v-tab value="text" prepend-icon="mdi-note-text-outline">Text</v-tab>
          </v-tabs>

          <v-window v-model="tab" class="mt-3">
            <!-- PDF -->
            <v-window-item value="pdf">
              <v-file-input label="Select PDF" accept="application/pdf" prepend-icon="mdi-paperclip" variant="outlined"
                rounded="lg" v-model="pdfFile" :disabled="busy" />

              <div class="d-flex ga-2 mt-2">
                <v-btn color="primary" :loading="busy" :disabled="!pdfFile || busy" prepend-icon="mdi-file-import"
                  @click="handlePdfImport">
                  Extract & Save
                </v-btn>

                <v-btn variant="outlined" :disabled="busy" prepend-icon="mdi-eye" @click="showPreview = !showPreview">
                  Preview
                </v-btn>
              </div>

              <v-progress-linear v-if="busy" class="mt-3" :model-value="progressPct" height="8" rounded />
              <div v-if="busy" class="text-caption mt-1 text-medium-emphasis">
                Extracting page {{ progress.page }} / {{ progress.total }}
              </div>
            </v-window-item>

            <!-- TEXT -->
            <v-window-item value="text">
              <v-textarea label="Paste notes" variant="outlined" rounded="lg" rows="10" v-model="rawText"
                :disabled="busy" placeholder="Paste your notes here…" />
              <div class="d-flex ga-2 mt-2">
                <v-btn color="primary" :loading="busy" :disabled="!rawText.trim() || busy"
                  prepend-icon="mdi-content-save" @click="handleTextImport">
                  Chunk & Save
                </v-btn>

                <v-btn variant="outlined" :disabled="busy" prepend-icon="mdi-eye" @click="showPreview = !showPreview">
                  Preview
                </v-btn>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-bold">Saved Chunks</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ contentStore.chunks.length }} chunk(s)
              </div>
            </div>

            <v-chip size="small" variant="tonal" prepend-icon="mdi-database">
              IndexedDB
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <v-text-field v-model="filter" label="Filter chunks" variant="outlined" rounded="lg" density="compact"
            prepend-inner-icon="mdi-magnify" />

          <div class="mt-3" style="max-height: 360px; overflow:auto;">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel v-for="c in filteredChunks" :key="c.id">
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between w-100">
                    <div class="text-body-2 font-weight-medium">
                      {{ c.heading || "General" }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ snippet(c.text) }}
                    </div>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="text-body-2">{{ c.text }}</div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-4" />


    <v-card rounded="xl" class="pa-4 mt-4">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Flashcards</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ cardsCount }} card(s) saved
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn color="primary" :loading="generatingCards"
            :disabled="generatingCards || contentStore.chunks.length === 0" prepend-icon="mdi-auto-fix"
            @click="generateCards">
            Generate
          </v-btn>

          <v-btn variant="outlined" prepend-icon="mdi-eye" :disabled="cardsCount === 0"
            @click="cardPreviewOpen = !cardPreviewOpen">
            Preview
          </v-btn>

          <v-btn variant="tonal" prepend-icon="mdi-book-open" :disabled="cardsCount === 0"
            @click="$router.push(`/study/${id}`)">
            Study
          </v-btn>
        </div>
      </div>

      <v-expand-transition>
        <div v-if="cardPreviewOpen" class="mt-3">
          <v-divider class="mb-3" />
          <v-alert type="info" variant="tonal" rounded="lg">
            Showing the first 6 cards.
          </v-alert>

          <v-row class="mt-2">
            <v-col cols="12" md="6" v-for="c in cardsStore.cards.slice(0, 6)" :key="c.id">
              <v-card rounded="xl" class="pa-4" variant="tonal">
                <div class="text-caption text-medium-emphasis">{{ c.type.toUpperCase() }}</div>
                <div class="text-body-1 font-weight-medium mt-1">{{ c.front }}</div>
                <v-divider class="my-2" />
                <div class="text-body-2">{{ c.back }}</div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card>



    <v-card rounded="xl" class="pa-4 mt-4">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Quiz</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ quizCount }} question(s) saved
          </div>
        </div>

        <div class="d-flex ga-2 flex-wrap">
          <v-btn color="primary" :loading="generatingQuiz" :disabled="generatingQuiz || cardsStore.cards.length === 0"
            prepend-icon="mdi-help-circle-outline" @click="buildQuiz">
            Generate
          </v-btn>

          <v-btn variant="tonal" prepend-icon="mdi-play-circle" :disabled="quizCount === 0"
            @click="$router.push(`/quiz/${id}`)">
            Take Quiz
          </v-btn>

          <v-btn variant="outlined" prepend-icon="mdi-delete" :disabled="quizCount === 0" @click="clearQuiz">
            Clear
          </v-btn>
        </div>
      </div>

      <v-alert class="mt-3" type="info" variant="tonal" rounded="lg">
        Quiz is generated from your cloze cards (fill-in-the-blank + MCQs).
      </v-alert>
    </v-card>



    <v-card v-if="showPreview" rounded="xl" class="pa-4" variant="tonal">
      <div class="text-subtitle-1 font-weight-bold">Preview</div>
      <div class="text-body-2 text-medium-emphasis">
        First ~1500 characters of extracted text (not stored unless you save).
      </div>

      <v-textarea class="mt-3" :model-value="previewText" readonly rows="8" variant="outlined" rounded="lg" />
    </v-card>

    <v-snackbar v-model="toast.show" :color="toast.color" timeout="2500">
      {{ toast.msg }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { db } from "../db";
import { extractTextFromPdf } from "../lib/pdfExtract";
import { chunkText } from "../lib/chunking";
import { useContentStore } from "../stores/content";
import { useCardsStore } from "../stores/cards";
import { generateFlashcards } from "../lib/flashcards";

import { useQuizzesStore } from "../stores/quizzes";
import { generateQuiz } from "../stores/quiz";


export default {
  props: ["id"],

  data() {
    return {
      tab: "pdf",
      pdfFile: null,
      rawText: "",
      previewText: "",
      showPreview: false,

      cardsStore: useCardsStore(),
      generatingCards: false,
      cardPreviewOpen: false,

      quizzesStore: useQuizzesStore(),
      generatingQuiz: false,



      busy: false,
      progress: { page: 0, total: 0 },
      filter: "",

      contentStore: useContentStore(),

      toast: { show: false, msg: "", color: "success" },
    };
  },

  computed: {
    progressPct() {
      if (!this.progress.total) return 0;
      return Math.round((this.progress.page / this.progress.total) * 100);
    },

    filteredChunks() {
      const q = this.filter.trim().toLowerCase();
      if (!q) return this.contentStore.chunks;
      return this.contentStore.chunks.filter((c) => {
        const h = (c.heading || "").toLowerCase();
        const t = (c.text || "").toLowerCase();
        return h.includes(q) || t.includes(q);
      });
    },

    cardsCount() {
      return this.cardsStore.cards.length;
    },
    quizCount() {
      return this.quizzesStore.questions.length;
    },


  },

  async mounted() {
    // ensure deck exists
    const deck = await db.decks.get(this.id);
    if (!deck) {
      this.$router.push("/decks");
      return;
    }

    await this.contentStore.loadChunks(this.id);
    await this.cardsStore.loadCards(this.id);
    await this.quizzesStore.load(this.id);


  },

  methods: {
    snippet(text) {
      const t = (text || "").trim();
      return t.length > 40 ? t.slice(0, 40) + "…" : t;
    },

    notify(msg, color = "success") {
      this.toast = { show: true, msg, color };
    },

    async handlePdfImport() {
      if (!this.pdfFile) return;

      this.busy = true;
      this.progress = { page: 0, total: 0 };

      try {
        const buffer = await this.pdfFile.arrayBuffer();

        const text = await extractTextFromPdf(buffer, ({ page, total }) => {
          this.progress = { page, total };
        });

        this.previewText = text.slice(0, 1500);

        const chunks = chunkText(text);
        await this.contentStore.saveChunks(this.id, chunks);

        this.notify(`Saved ${chunks.length} chunks from PDF.`);
      } catch (e) {
        console.error(e);
        this.notify("Failed to extract PDF text. Try another PDF.", "error");
      } finally {
        this.busy = false;
      }
    },

    async handleTextImport() {
      const text = this.rawText.trim();
      if (!text) return;

      this.busy = true;
      try {
        this.previewText = text.slice(0, 1500);

        const chunks = chunkText(text);
        await this.contentStore.saveChunks(this.id, chunks);

        this.notify(`Saved ${chunks.length} chunks from text.`);
      } catch (e) {
        console.error(e);
        this.notify("Failed to chunk text.", "error");
      } finally {
        this.busy = false;
      }
    },

    async clearContent() {
      await this.contentStore.clearDeckContent(this.id);
      this.notify("Deck content cleared.", "info");
    },

    async generateCards() {
      this.generatingCards = true;
      try {
        // Ensure chunks loaded
        const chunks = this.contentStore.chunks || [];
        if (!chunks.length) {
          this.notify("No chunks found. Import notes first.", "error");
          return;
        }

        const generated = generateFlashcards(chunks, { maxCards: 45 });
        await this.cardsStore.replaceDeckCards(this.id, generated);
        this.cardPreviewOpen = true;

        this.notify(`Generated ${generated.length} flashcards.`);
      } catch (e) {
        console.error(e);
        this.notify("Failed to generate flashcards.", "error");
      } finally {
        this.generatingCards = false;
      }
    },

    async buildQuiz() {
  this.generatingQuiz = true;
  try {
    // Ensure cards loaded
    await this.cardsStore.loadCards(this.id);

    if (!this.cardsStore.cards.length) {
      this.notify("Generate flashcards first.", "error");
      return;
    }

    const questions = generateQuiz(this.cardsStore.cards, { maxQuestions: 20 });
    await this.quizzesStore.replace(this.id, questions);

    this.notify(`Generated ${questions.length} quiz questions.`);
  } catch (e) {
    console.error(e);
    this.notify("Failed to generate quiz.", "error");
  } finally {
    this.generatingQuiz = false;
  }
},

async clearQuiz() {
  await this.quizzesStore.clear(this.id);
  this.notify("Quiz cleared.", "info");
},


  },
};
</script>
