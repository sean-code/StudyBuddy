import Dexie from "dexie";

export const db = new Dexie("studybuddy_offline");

db.version(1).stores({
    decks: "id, title, sourceType, createdAt",
    chunks: "++id, deckId, order",
    cards: "++id, deckId, type, createdAt",
    quizzes: "++id, deckId, type, createdAt",
    reviews: "++id, cardId, nextReviewAt",
});
