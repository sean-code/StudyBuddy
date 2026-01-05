function normalizeText(text) {
    return (text || "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// Heuristic heading detector (good enough for MVP)
function looksLikeHeading(line) {
    if (!line) return false;

    const t = line.trim();
    if (t.length < 3 || t.length > 80) return false;

    // "1. Something", "1.1 Something", "A. Something"
    if (/^(\d+(\.\d+)*|[A-Z])[\).\s]+[A-Za-z]/.test(t)) return true;

    // Ends with ":" like "Backpropagation:"
    if (t.endsWith(":") && t.length <= 60) return true;

    // ALL CAPS-ish heading (not too long)
    const capsRatio = (t.replace(/[^A-Za-z]/g, "").match(/[A-Z]/g) || []).length / Math.max(1, (t.replace(/[^A-Za-z]/g, "").length));
    if (capsRatio > 0.75 && t.length <= 60) return true;

    // Short title without period
    if (t.length <= 45 && !t.includes(".") && t.split(" ").length <= 7) return true;

    return false;
}

/**
 * Splits text into chunks grouped by headings and paragraphs.
 * Returns array of { heading, text, order }.
 */
export function chunkText(rawText) {
    const text = normalizeText(rawText);

    if (!text) return [];

    const lines = text.split("\n");
    let chunks = [];

    let currentHeading = "General";
    let buffer = [];

    const flush = () => {
        const combined = buffer.join(" ").replace(/\s+/g, " ").trim();
        if (combined) {
            chunks.push({
                heading: currentHeading,
                text: combined,
            });
        }
        buffer = [];
    };

    for (const line of lines) {
        const t = line.trim();

        // blank line => paragraph break
        if (!t) {
            flush();
            continue;
        }

        // heading line => start new section
        if (looksLikeHeading(t) && buffer.length > 0) {
            flush();
            currentHeading = t.replace(/:$/, "").trim();
            continue;
        }

        // if heading line and we haven't buffered anything, just set heading
        if (looksLikeHeading(t) && buffer.length === 0) {
            currentHeading = t.replace(/:$/, "").trim();
            continue;
        }

        buffer.push(t);
    }

    flush();

    // Add ordering
    return chunks.map((c, idx) => ({ ...c, order: idx }));
}
