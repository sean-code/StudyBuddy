# StudyBuddy Offline

StudyBuddy Offline is a privacy-first study web app that runs entirely in your browser. It converts PDFs or pasted notes into structured study material—flashcards, quizzes, and a spaced-repetition review queue—without accounts, uploads, or a backend. Everything is processed and stored locally on your device using IndexedDB.

## Why StudyBuddy
- **Offline-first & private:** no login, no tracking, no server-side storage.
- **Fast workflow:** import → generate → study.
- **Practical AI logic:** automated chunking, keyphrase extraction, cloze prompts, and quiz creation.
- **Product-grade UI:** clean Vuetify interface with deck management, study mode, and quiz runner.

## Key Features
- **Import notes**
  - Upload **PDFs** (text-based) or **paste notes**
  - Local text extraction and smart chunking into sections

- **Flashcard generation**
  - **Definition cards** (e.g., “What is X?”)
  - **Cloze cards** (fill-in-the-blank)
  - **Concept cards** (explain key ideas)

- **Study mode (Spaced Repetition)**
  - Review queue with **Again / Hard / Good / Easy**
  - Scheduling inspired by SM-2-style intervals
  - Progress saved locally

- **Quiz generation + runner**
  - **Multiple choice** questions from cloze prompts
  - **Fill-in-the-blank** questions
  - Scoring + source sentence reveal

- **Local storage**
  - Decks, chunks, cards, reviews, and quizzes stored in **IndexedDB**
  - Works even after refresh/restart

## Tech Stack
- **Vue 3** + **Vuetify**
- **NLP**
- **Pinia** (state)
- **Dexie** (IndexedDB wrapper)
- **pdfjs-dist** (PDF text extraction)

## Privacy
StudyBuddy Offline does not send your documents anywhere. All processing and storage happen on-device in your browser.

