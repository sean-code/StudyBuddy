import { defineStore } from "pinia";
import { db } from "../db";

export const useContentStore = defineStore("content", {
    state: () => ({
        chunks: [],
        loadedDeckId: null,
    }),

    actions: {
        async loadChunks(deckId) {
            this.chunks = await db.chunks.where("deckId").equals(deckId).sortBy("order");
            this.loadedDeckId = deckId;
            return this.chunks;
        },

        async saveChunks(deckId, chunks) {
            // Replace existing chunks for that deck
            await db.transaction("rw", db.chunks, async () => {
                await db.chunks.where("deckId").equals(deckId).delete();
                if (chunks?.length) {
                    const rows = chunks.map((c) => ({
                        deckId,
                        order: c.order,
                        heading: c.heading,
                        text: c.text,
                    }));
                    await db.chunks.bulkAdd(rows);
                }
            });

            await this.loadChunks(deckId);
        },

        async clearDeckContent(deckId) {
            await db.chunks.where("deckId").equals(deckId).delete();
            if (this.loadedDeckId === deckId) this.chunks = [];
        },
    },
});
