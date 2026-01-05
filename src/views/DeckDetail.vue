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
              <v-file-input
                label="Select PDF"
                accept="application/pdf"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                rounded="lg"
                v-model="pdfFile"
                :disabled="busy"
              />

              <div class="d-flex ga-2 mt-2">
                <v-btn
                  color="primary"
                  :loading="busy"
                  :disabled="!pdfFile || busy"
                  prepend-icon="mdi-file-import"
                  @click="handlePdfImport"
                >
                  Extract & Save
                </v-btn>

                <v-btn variant="outlined" :disabled="busy" prepend-icon="mdi-eye" @click="showPreview = !showPreview">
                  Preview
                </v-btn>
              </div>

              <v-progress-linear
                v-if="busy"
                class="mt-3"
                :model-value="progressPct"
                height="8"
                rounded
              />
              <div v-if="busy" class="text-caption mt-1 text-medium-emphasis">
                Extracting page {{ progress.page }} / {{ progress.total }}
              </div>
            </v-window-item>

            <!-- TEXT -->
            <v-window-item value="text">
              <v-textarea
                label="Paste notes"
                variant="outlined"
                rounded="lg"
                rows="10"
                v-model="rawText"
                :disabled="busy"
                placeholder="Paste your notes here…"
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn
                  color="primary"
                  :loading="busy"
                  :disabled="!rawText.trim() || busy"
                  prepend-icon="mdi-content-save"
                  @click="handleTextImport"
                >
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

          <v-text-field
            v-model="filter"
            label="Filter chunks"
            variant="outlined"
            rounded="lg"
            density="compact"
            prepend-inner-icon="mdi-magnify"
          />

          <div class="mt-3" style="max-height: 360px; overflow:auto;">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="c in filteredChunks"
                :key="c.id"
              >
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

export default {
  props: ["id"],

  data() {
    return {
      tab: "pdf",
      pdfFile: null,
      rawText: "",
      previewText: "",
      showPreview: false,

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
  },

  async mounted() {
    // ensure deck exists
    const deck = await db.decks.get(this.id);
    if (!deck) {
      this.$router.push("/decks");
      return;
    }

    await this.contentStore.loadChunks(this.id);
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
  },
};
</script>
