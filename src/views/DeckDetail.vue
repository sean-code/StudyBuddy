<template>
    <v-card rounded="xl" class="pa-6">
        <div class="text-h5 font-weight-bold">Deck</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
            Deck ID: {{ id }}
        </div>

        <v-divider class="my-4" />

        <v-alert type="warning" variant="tonal" rounded="lg">
            Import + flashcard generation comes next. This page will host the PDF/text import flow.
        </v-alert>

        <div class="d-flex ga-2 mt-4 flex-wrap">
            <v-btn variant="tonal" prepend-icon="mdi-book-open" @click="$router.push(`/study/${id}`)">Study</v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-help-circle" @click="$router.push(`/quiz/${id}`)">Quiz</v-btn>
            <v-btn variant="outlined" prepend-icon="mdi-arrow-left" to="/decks">Back</v-btn>
        </div>
    </v-card>
</template>

<script>
export default {
    props: ["id"],
};
</script>
