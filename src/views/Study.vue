<template>
    <v-card rounded="xl" class="pa-6">
        <div class="text-h5 font-weight-bold">Study Mode</div>
        <div class="text-body-2 text-medium-emphasis mt-1">Deck: {{ deckId }}</div>

        <v-divider class="my-4" />
        <v-alert type="info" variant="tonal" rounded="lg">
            Spaced repetition UI will go here.
        </v-alert>

        <v-btn class="mt-4" variant="outlined" to="/decks" prepend-icon="mdi-arrow-left">Back</v-btn>
    </v-card>
</template>

<script>
export default { props: ["deckId"] };
</script>
