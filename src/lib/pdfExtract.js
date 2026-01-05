import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Extracts text from a PDF ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer
 * @param {(progress: {page: number, total: number}) => void} onProgress
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(arrayBuffer, onProgress = () => { }) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const total = pdf.numPages;
    let allText = [];

    for (let pageNum = 1; pageNum <= total; pageNum++) {
        onProgress({ page: pageNum, total });

        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        // Join text items with spaces; add line breaks between pages.
        const pageText = content.items.map((it) => it.str).join(" ");
        allText.push(pageText);
    }

    return allText.join("\n\n");
}
