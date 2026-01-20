// Basic SM-2-ish scheduler for offline flashcards
export function initialReview(cardId) {
    const now = Date.now();
    return {
        cardId,
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        nextReviewAt: now,
        lastReviewedAt: 0,
    };
}

export function applyGrade(review, grade /* 0..3 */) {
    // 0=Again, 1=Hard, 2=Good, 3=Easy
    const now = Date.now();
    let { ease, intervalDays, repetitions } = review;

    if (grade === 0) {
        repetitions = 0;
        intervalDays = 0;
        ease = Math.max(1.3, ease - 0.2);
    } else {
        repetitions += 1;

        if (repetitions === 1) intervalDays = 1;
        else if (repetitions === 2) intervalDays = 3;
        else intervalDays = Math.round(intervalDays * ease);

        if (grade === 1) ease = Math.max(1.3, ease - 0.15);
        if (grade === 2) ease = Math.min(3.0, ease + 0.05);
        if (grade === 3) ease = Math.min(3.0, ease + 0.15);
    }

    const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;

    return {
        ...review,
        ease,
        intervalDays,
        repetitions,
        lastReviewedAt: now,
        nextReviewAt,
    };
}
