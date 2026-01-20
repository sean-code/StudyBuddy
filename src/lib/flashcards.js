const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","else","when","while","for","to","of","in","on","at","by","with",
  "as","is","are","was","were","be","been","being","this","that","these","those","it","its","from","into","over",
  "we","you","they","he","she","i","me","my","our","your","their","them","us","can","could","should","would",
  "may","might","will","just","not","no","yes","do","does","did","done","than","such","also","very","more","most"
]);

function clean(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function splitSentences(text) {
  const t = clean(text)
    .replace(/\s+/g, " ")
    .replace(/([.?!])\s+/g, "$1\n");
  return t.split("\n").map(s => s.trim()).filter(Boolean);
}

function tokenize(text) {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w && w.length >= 3 && !STOPWORDS.has(w));
}

function topKeyphrases(chunks, limit = 30) {
  // Simple frequency-based keyphrases: unigrams + bigrams
  const uni = new Map();
  const bi = new Map();

  for (const c of chunks) {
    const words = tokenize(c.text);
    for (let i = 0; i < words.length; i++) {
      uni.set(words[i], (uni.get(words[i]) || 0) + 1);
      if (i < words.length - 1) {
        const b = `${words[i]} ${words[i + 1]}`;
        bi.set(b, (bi.get(b) || 0) + 1);
      }
    }
  }

  const scored = [];

  for (const [k, v] of uni.entries()) scored.push({ phrase: k, score: v });
  for (const [k, v] of bi.entries()) scored.push({ phrase: k, score: v * 1.4 }); // slight boost to bigrams

  // remove very generic phrases
  const filtered = scored
    .filter(x => x.phrase.length <= 40)
    .filter(x => !/^(data|system|model|method|process)$/.test(x.phrase));

  filtered.sort((a, b) => b.score - a.score);
  return filtered.slice(0, limit).map(x => x.phrase);
}

function findDefinitionCards(sentences) {
  // patterns like: "X is ...", "X refers to ...", "X means ...", "X is defined as ..."
  const patterns = [
    /^(.*?)\s+(is|are)\s+(defined as|known as)\s+(.*)\.?$/i,
    /^(.*?)\s+(refers to|means)\s+(.*)\.?$/i,
    /^In simple terms,\s*(.*?)\s+(is|means)\s+(.*)\.?$/i,
  ];

  const cards = [];

  for (const s of sentences) {
    const sent = clean(s);
    if (sent.length < 35 || sent.length > 220) continue;

    for (const p of patterns) {
      const m = sent.match(p);
      if (!m) continue;

      const term = clean(m[1]).replace(/^\W+|\W+$/g, "");
      const rhs = clean(m[m.length - 1]);

      // term quality
      if (!term || term.length < 3 || term.length > 60) continue;
      if (term.split(" ").length > 8) continue;

      cards.push({
        type: "definition",
        front: `What is ${term}?`,
        back: rhs,
        sourceSentence: sent
      });
      break;
    }
  }

  return cards;
}

function makeClozeCard(sentence, phrase) {
  const sent = clean(sentence);
  const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (!re.test(sent)) return null;

  const blanked = sent.replace(re, "_____");
  // Avoid cloze if blank becomes trivial or sentence too short
  if (blanked.length < 25 || blanked.length > 220) return null;

  return {
    type: "cloze",
    front: blanked,
    back: phrase,
    sourceSentence: sent
  };
}

function findClozeCards(sentences, phrases, max = 25) {
  const cards = [];
  const used = new Set();

  for (const phrase of phrases) {
    if (cards.length >= max) break;
    if (phrase.length < 4) continue;
    if (used.has(phrase)) continue;

    // pick best sentence containing it
    const candidates = sentences
      .filter(s => s.toLowerCase().includes(phrase.toLowerCase()))
      .sort((a, b) => b.length - a.length);

    for (const s of candidates) {
      const c = makeClozeCard(s, phrase);
      if (c) {
        cards.push(c);
        used.add(phrase);
        break;
      }
    }
  }

  return cards;
}

function conceptCardsFromTopSentences(sentences, phrases, max = 15) {
  // Turn a strong sentence into a "Explain/Describe" style prompt
  const cards = [];
  const phraseSet = phrases.map(p => p.toLowerCase());

  const scored = sentences.map(s => {
    const t = tokenize(s).join(" ");
    const hits = phraseSet.reduce((acc, p) => acc + (t.includes(p) ? 1 : 0), 0);
    return { s, hits, len: s.length };
  });

  scored.sort((a, b) => (b.hits - a.hits) || (b.len - a.len));

  for (const { s, hits } of scored) {
    if (cards.length >= max) break;
    const sent = clean(s);
    if (sent.length < 45 || sent.length > 220) continue;
    if (hits < 2) continue;

    // choose an anchor phrase
    const anchor = phrases.find(p => sent.toLowerCase().includes(p.toLowerCase()));
    if (!anchor) continue;

    cards.push({
      type: "concept",
      front: `Explain this idea: ${anchor}`,
      back: sent,
      sourceSentence: sent
    });
  }

  return cards;
}

/**
 * Generate flashcards from chunks.
 * @param {{heading?: string, text: string}[]} chunks
 * @param {{maxCards?: number}} opts
 */
export function generateFlashcards(chunks, opts = {}) {
  const maxCards = opts.maxCards ?? 45;

  const allText = chunks.map(c => c.text).join("\n\n");
  const sentences = splitSentences(allText);

  const phrases = topKeyphrases(chunks, 40);

  const defs = findDefinitionCards(sentences);
  const clozes = findClozeCards(sentences, phrases, 25);
  const concepts = conceptCardsFromTopSentences(sentences, phrases, 15);

  // merge with de-dup
  const seenFront = new Set();
  const merged = [...defs, ...clozes, ...concepts]
    .map(c => ({
      ...c,
      front: clean(c.front),
      back: clean(c.back),
    }))
    .filter(c => c.front && c.back)
    .filter(c => {
      const key = c.front.toLowerCase();
      if (seenFront.has(key)) return false;
      seenFront.add(key);
      return true;
    });

  // Prefer definitions, then cloze, then concept; cap total
  merged.sort((a, b) => {
    const w = (t) => (t === "definition" ? 0 : t === "cloze" ? 1 : 2);
    return w(a.type) - w(b.type);
  });

  return merged.slice(0, maxCards);
}
