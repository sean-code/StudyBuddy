import { defineStore } from "pinia";
import { db } from "../db";

const uid = () => crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);

export const useDecksStore = defineStore("decks", {
    state: () => ({
        decks: [],
        loaded: false,
    }),

    actions: {
        async loadDecks() {
            this.decks = await db.decks.orderBy("createdAt").reverse().toArray();
            this.loaded = true;
        },

        async createDeck({ title, sourceType }) {
            const deck = {
                id: uid(),
                title: title?.trim() || "Untitled Deck",
                sourceType: sourceType || "pdf",
                createdAt: Date.now(),
            };
            await db.decks.add(deck);
            this.decks.unshift(deck);
            return deck;
        },

        async deleteDeck(deckId) {
            await db.transaction("rw", db.decks, db.chunks, db.cards, db.quizzes, db.reviews, async () => {
                await db.decks.delete(deckId);
                await db.chunks.where("deckId").equals(deckId).delete();
                await db.cards.where("deckId").equals(deckId).delete();
                await db.quizzes.where("deckId").equals(deckId).delete();
                // reviews tied to cards (we’ll clean later more precisely if needed)
            });

            this.decks = this.decks.filter(d => d.id !== deckId);
        },

        async seedIfEmpty() {
            const count = await db.decks.count();
            if (count > 0) return;

            await this.createDeck({ title: "Demo: Machine Learning Basics", sourceType: "text" });
            await this.createDeck({ title: "Demo: CSC 785 Notes", sourceType: "pdf" });
        },
    },
});
