function clean(s) {
    return (s || "").replace(/\s+/g, " ").trim();
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function uniqueBy(arr, keyFn) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
        const k = keyFn(x);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(x);
    }
    return out;
}

function normalizePhrase(p) {
    return clean(p).toLowerCase();
}

/**
 * Extract candidate phrases from cards to use as MCQ options.
 * We use:
 *  - cloze answers (back)
 *  - definition term from "What is X?"
 */
function extractPhrasesFromCards(cards) {
    const phrases = [];

    for (const c of cards) {
        if (c.type === "cloze") {
            const ans = clean(c.back);
            if (ans && ans.length <= 50) phrases.push(ans);
        }

        if (c.type === "definition") {
            const m = (c.front || "").match(/What is (.*)\?/i);
            if (m?.[1]) {
                const term = clean(m[1]);
                if (term && term.length <= 50) phrases.push(term);
            }
        }

        if (c.type === "concept") {
            // use anchor term from "Explain this idea: X"
            const m = (c.front || "").match(/Explain this idea:\s*(.*)$/i);
            if (m?.[1]) {
                const term = clean(m[1]);
                if (term && term.length <= 50) phrases.push(term);
            }
        }
    }

    return uniqueBy(phrases, normalizePhrase);
}

function makeMCQFromCloze(clozeCard, phrasesPool) {
    const prompt = clean(clozeCard.front);
    const answer = clean(clozeCard.back);
    if (!prompt.includes("_____") || !answer) return null;

    // pick distractors: other phrases of similar length
    const candidates = phrasesPool
        .filter(p => normalizePhrase(p) !== normalizePhrase(answer))
        .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length))
        .slice(0, 20);

    const distractors = shuffle(candidates).slice(0, 3);
    if (distractors.length < 3) return null;

    const options = shuffle([answer, ...distractors]);

    return {
        type: "mcq",
        prompt,
        options,
        answer,
        sourceSentence: clozeCard.sourceSentence || null,
    };
}

function makeFillBlank(clozeCard) {
    const prompt = clean(clozeCard.front);
    const answer = clean(clozeCard.back);
    if (!prompt.includes("_____") || !answer) return null;

    return {
        type: "fill",
        prompt,
        answer,
        sourceSentence: clozeCard.sourceSentence || null,
    };
}

/**
 * Generate quiz questions from cards.
 * @param {Array} cards
 * @param {{maxQuestions?: number}} opts
 */
export function generateQuiz(cards, opts = {}) {
    const maxQuestions = opts.maxQuestions ?? 20;

    const phrasesPool = extractPhrasesFromCards(cards);

    // Cloze-derived questions
    const clozeCards = cards.filter(c => c.type === "cloze" && (c.front || "").includes("_____"));

    const fillQs = clozeCards
        .map(makeFillBlank)
        .filter(Boolean);

    const mcqQs = clozeCards
        .map(c => makeMCQFromCloze(c, phrasesPool))
        .filter(Boolean);

    // mix and cap
    const merged = uniqueBy([...mcqQs, ...fillQs], q => q.type + "::" + q.prompt.toLowerCase());
    const mixed = shuffle(merged).slice(0, maxQuestions);

    return mixed;
}
