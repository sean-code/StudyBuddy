import { defineStore } from "pinia";
import { db } from "../db";

export const useQuizzesStore = defineStore("quizzes", {
    state: () => ({
        questions: [],
        loadedDeckId: null,
    }),

    actions: {
        async load(deckId) {
            this.questions = await db.quizzes.where("deckId").equals(deckId).toArray();
            // Keep stable order: createdAt or id order
            this.questions.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            this.loadedDeckId = deckId;
            return this.questions;
        },

        async replace(deckId, questions) {
            await db.transaction("rw", db.quizzes, async () => {
                await db.quizzes.where("deckId").equals(deckId).delete();

                const now = Date.now();
                const rows = (questions || []).map((q, idx) => ({
                    deckId,
                    type: q.type,
                    prompt: q.prompt,
                    options: q.options || null,
                    answer: q.answer,
                    sourceSentence: q.sourceSentence || null,
                    createdAt: now + idx, // preserve order
                }));

                if (rows.length) await db.quizzes.bulkAdd(rows);
            });

            await this.load(deckId);
        },

        async clear(deckId) {
            await db.quizzes.where("deckId").equals(deckId).delete();
            if (this.loadedDeckId === deckId) this.questions = [];
        },
    },
});
