import PDFParser from "pdf2json";

interface PDFData {
  Pages: {
    Texts: {
      R: {
        T: string;
      }[];
    }[];
  }[];
}

const parsePDF = (file: string): Promise<PDFData> => {
  return new Promise((resolve, reject) => {
    let pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", reject);
    pdfParser.on("pdfParser_dataReady", resolve);
    pdfParser.loadPDF(file);
  });
};

const comparePDFs = async (file1: string, file2: string) => {
  try {
    const [pdf1Data, pdf2Data] = await Promise.all([
      parsePDF(file1),
      parsePDF(file2),
    ]);

    let pdf1Text = pdf1Data.Pages.map((page) =>
      page.Texts.map((text) => decodeURIComponent(text.R[0].T))
    ).join(" ");
    let pdf2Text = pdf2Data.Pages.map((page) =>
      page.Texts.map((text) => decodeURIComponent(text.R[0].T))
    ).join(" ");

    // Removing non-alphanumeric characters and extra whitespace
    pdf1Text = pdf1Text.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");
    pdf2Text = pdf2Text.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");

    let pdf1Words = pdf1Text.split(" ");
    let pdf2Words = pdf2Text.split(" ");

    let identical = true;
    if (pdf1Words.length !== pdf2Words.length) {
      console.log("Files are different");
      identical = false;
    } else {
      for (let i = 0; i < pdf1Words.length; i++) {
        if (pdf1Words[i] !== pdf2Words[i]) {
          identical = false;
          break;
        }
      }
    }

    if (identical) {
      console.log("Files are identical");
    } else {
      console.log("Files are different.");
      console.log("Differences:");
      pdf1Words.forEach((word, i) => {
        if (word !== pdf2Words[i]) {
          console.log(`Word ${i + 1}:`);
          console.log(`File 1: ${word}`);
          console.log(`File 2: ${pdf2Words[i]}`);
        }
      });
    }
  } catch (error) {
    console.error(`Error while comparing PDFs: ${error}`);
  }
};

comparePDFs("./pdf_1.pdf", "./pdf_2.pdf");
