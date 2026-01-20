<template>
    <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
            <div>
                <div class="text-h5 font-weight-bold">Study Mode</div>
                <div class="text-body-2 text-medium-emphasis mt-1">Deck: {{ deckId }}</div>
            </div>

            <div class="d-flex ga-2">
                <v-btn variant="outlined" to="/decks" prepend-icon="mdi-arrow-left">Back</v-btn>
                <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="reload">Refresh</v-btn>
            </div>
        </div>

        <v-divider class="my-4" />

        <v-alert v-if="loading" type="info" variant="tonal" rounded="lg">
            Loading due cards…
        </v-alert>

        <v-alert v-else-if="!current" type="success" variant="tonal" rounded="lg">
            You’re done for now 🎉 No cards due.
        </v-alert>

        <div v-else>
            <div class="d-flex align-center justify-space-between">
                <v-chip size="small" variant="tonal" prepend-icon="mdi-timer-outline">
                    Due: {{ dueCount }}
                </v-chip>
                <v-chip size="small" variant="tonal">
                    {{ current.card.type.toUpperCase() }}
                </v-chip>
            </div>

            <v-card rounded="xl" class="pa-6 mt-3" variant="tonal">
                <div class="text-caption text-medium-emphasis">Front</div>
                <div class="text-h6 mt-2">{{ current.card.front }}</div>

                <v-expand-transition>
                    <div v-if="showBack" class="mt-5">
                        <v-divider class="mb-4" />
                        <div class="text-caption text-medium-emphasis">Back</div>
                        <div class="text-body-1 mt-2">{{ current.card.back }}</div>
                    </div>
                </v-expand-transition>

                <div class="d-flex ga-2 mt-5 flex-wrap">
                    <v-btn v-if="!showBack" color="primary" prepend-icon="mdi-eye" @click="showBack = true">
                        Show Answer
                    </v-btn>

                    <template v-else>
                        <v-btn color="error" variant="tonal" @click="grade(0)">Again</v-btn>
                        <v-btn color="warning" variant="tonal" @click="grade(1)">Hard</v-btn>
                        <v-btn color="primary" variant="tonal" @click="grade(2)">Good</v-btn>
                        <v-btn color="success" variant="tonal" @click="grade(3)">Easy</v-btn>
                    </template>
                </div>
            </v-card>

            <div class="text-caption text-medium-emphasis mt-3">
                Tip: “Again” resets the interval; “Easy” increases future spacing.
            </div>
        </div>

        <v-snackbar v-model="toast.show" :color="toast.color" timeout="2000">
            {{ toast.msg }}
        </v-snackbar>
    </v-card>
</template>

<script>
import { useCardsStore } from "../stores/cards";
import { applyGrade } from "../lib/srs";

export default {
    props: ["deckId"],

    data() {
        return {
            cardsStore: useCardsStore(),
            loading: true,
            showBack: false,
            toast: { show: false, msg: "", color: "success" },
        };
    },

    computed: {
        dueCount() {
            return this.cardsStore.due.length;
        },
        current() {
            return this.cardsStore.due[0] || null;
        },
    },

    async mounted() {
        await this.reload();
    },

    methods: {
        notify(msg, color = "success") {
            this.toast = { show: true, msg, color };
        },

        async reload() {
            this.loading = true;
            this.showBack = false;

            await this.cardsStore.loadCards(this.deckId);
            await this.cardsStore.loadDue(this.deckId);

            this.loading = false;
        },

        async grade(g) {
            if (!this.current) return;

            const next = applyGrade(this.current.review, g);
            await this.cardsStore.updateReview(next);

            this.notify("Saved.");
            this.showBack = false;

            // remove current card from due list locally, then refresh due list
            this.cardsStore.due.shift();
            if (this.cardsStore.due.length === 0) {
                await this.cardsStore.loadDue(this.deckId);
            }
        },
    },
};
</script>
