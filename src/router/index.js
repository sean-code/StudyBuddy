import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Decks from "../views/Decks.vue";
import DeckDetail from "../views/DeckDetail.vue";
import Study from "../views/Study.vue";
import Quiz from "../views/Quiz.vue";
import Analytics from "../views/Analytics.vue";

const routes = [
    { 
        path: "/", 
        name: "home", 
        component: Home 
},
    { path: "/decks", name: "decks", component: Decks },
    { path: "/decks/:id", name: "deck-detail", component: DeckDetail, props: true },
    { path: "/study/:deckId", name: "study", component: Study, props: true },
    { path: "/quiz/:deckId", name: "quiz", component: Quiz, props: true },
    { path: "/analytics", name: "analytics", component: Analytics },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
