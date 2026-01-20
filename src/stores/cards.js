import { defineStore } from "pinia";
import { db } from "../db";
import { initialReview } from "../lib/srs";

export const useCardsStore = defineStore("cards", {
    state: () => ({
        cards: [],
        due: [],
    }),

    actions: {
        async loadCards(deckId) {
            this.cards = await db.cards.where("deckId").equals(deckId).toArray();
            return this.cards;
        },

        async replaceDeckCards(deckId, cards) {
            await db.transaction("rw", db.cards, db.reviews, async () => {
                // delete old cards + their reviews
                const old = await db.cards.where("deckId").equals(deckId).toArray();
                const oldIds = old.map(c => c.id);

                await db.cards.where("deckId").equals(deckId).delete();
                if (oldIds.length) {
                    await db.reviews.where("cardId").anyOf(oldIds).delete();
                }

                // insert new cards
                const now = Date.now();
                const rows = cards.map((c) => ({
                    deckId,
                    type: c.type,
                    front: c.front,
                    back: c.back,
                    heading: c.heading || null,
                    sourceSentence: c.sourceSentence || null,
                    createdAt: now,
                }));

                const ids = await db.cards.bulkAdd(rows, { allKeys: true });

                // create initial reviews
                const reviews = ids.map((id) => initialReview(id));
                await db.reviews.bulkAdd(reviews);
            });

            await this.loadCards(deckId);
        },

        async loadDue(deckId) {
            const cards = await db.cards.where("deckId").equals(deckId).toArray();
            const ids = cards.map(c => c.id);

            if (!ids.length) {
                this.due = [];
                return this.due;
            }

            const now = Date.now();
            const reviews = await db.reviews.where("cardId").anyOf(ids).toArray();
            const reviewMap = new Map(reviews.map(r => [r.cardId, r]));

            const dueCards = cards
                .map(c => ({ card: c, review: reviewMap.get(c.id) }))
                .filter(x => x.review && x.review.nextReviewAt <= now)
                .sort((a, b) => a.review.nextReviewAt - b.review.nextReviewAt);

            this.due = dueCards;
            return this.due;
        },

        async updateReview(review) {
            await db.reviews.where("cardId").equals(review.cardId).modify(review);
        },
    },
});
