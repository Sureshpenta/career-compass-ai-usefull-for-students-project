// Client-only resume text extraction (PDF + DOCX).
export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    let text = "";
    for (let page = 1; page <= pdf.numPages; page += 1) {
      const loaded = await pdf.getPage(page);
      const content = await loaded.getTextContent();
      text += `${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`;
    }
    return text.replace(/\s+\n/g, "\n").trim();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser.js");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }

  if (name.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX resume.");
}
