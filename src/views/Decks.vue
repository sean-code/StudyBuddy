<template>
    <v-row class="align-center mb-3">
        <v-col cols="12" md="6">
            <div class="text-h5 font-weight-bold">Decks</div>
            <div class="text-body-2 text-medium-emphasis">Create decks, then import notes to generate study content.
            </div>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end ga-2">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate = true">
                New Deck
            </v-btn>
        </v-col>
    </v-row>

    <v-row>
        <v-col cols="12" md="6" lg="4" v-for="deck in decksStore.decks" :key="deck.id">
            <v-card rounded="xl" class="pa-4" @click="goDeck(deck.id)" style="cursor:pointer;">
                <div class="d-flex align-start justify-space-between">
                    <div>
                        <div class="text-subtitle-1 font-weight-bold">{{ deck.title }}</div>
                        <div class="text-caption text-medium-emphasis">
                            Source: {{ deck.sourceType.toUpperCase() }} • Created {{ formatDate(deck.createdAt) }}
                        </div>
                    </div>

                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
                        </template>
                        <v-list density="compact">
                            <v-list-item prepend-icon="mdi-delete" title="Delete" @click.stop="remove(deck.id)" />
                        </v-list>
                    </v-menu>
                </div>

                <v-divider class="my-3" />

                <div class="d-flex ga-2 flex-wrap">
                    <v-btn size="small" variant="tonal" prepend-icon="mdi-book-open" @click.stop="goStudy(deck.id)">
                        Study
                    </v-btn>
                    <v-btn size="small" variant="tonal" prepend-icon="mdi-help-circle" @click.stop="goQuiz(deck.id)">
                        Quiz
                    </v-btn>
                    <v-btn size="small" variant="outlined" prepend-icon="mdi-file-import" @click.stop="goDeck(deck.id)">
                        Import (next)
                    </v-btn>
                </div>
            </v-card>
        </v-col>
    </v-row>

    <!-- Create Deck Dialog -->
    <v-dialog v-model="openCreate" max-width="520">
        <v-card rounded="xl" class="pa-4">
            <div class="text-h6 font-weight-bold">Create Deck</div>

            <v-text-field class="mt-4" label="Deck title" v-model="form.title"
                placeholder="e.g., CSC 722 - Midterm Notes" variant="outlined" rounded="lg" />

            <v-select label="Source type" v-model="form.sourceType" :items="['pdf', 'text']" variant="outlined"
                rounded="lg" />

            <div class="d-flex justify-end ga-2 mt-4">
                <v-btn variant="text" @click="openCreate = false">Cancel</v-btn>
                <v-btn color="primary" @click="create">Create</v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
import { useDecksStore } from "../stores/decks";

export default {
    data() {
        return {
            decksStore: useDecksStore(),
            openCreate: false,
            form: { title: "", sourceType: "pdf" },
        };
    },

    async mounted() {
        await this.decksStore.loadDecks();
        await this.decksStore.seedIfEmpty();
        await this.decksStore.loadDecks();
    },

    methods: {
        formatDate(ts) {
            return new Date(ts).toLocaleDateString();
        },
        goDeck(id) {
            this.$router.push(`/decks/${id}`);
        },
        goStudy(id) {
            this.$router.push(`/study/${id}`);
        },
        goQuiz(id) {
            this.$router.push(`/quiz/${id}`);
        },
        async create() {
            const deck = await this.decksStore.createDeck(this.form);
            this.openCreate = false;
            this.form = { title: "", sourceType: "pdf" };
            this.goDeck(deck.id);
        },
        async remove(id) {
            await this.decksStore.deleteDeck(id);
        },
    },
};
</script>
