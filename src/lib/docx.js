
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export const extractTextFromDocx = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const saveAsDocx = (text, title = "document") => {
  const paragraphs = text.split('\n').map(p => 
    new Paragraph({
      children: [new TextRun(p)],
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${title}.docx`);
  });
};
