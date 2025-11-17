import { Canvas } from 'fabric';
import jsPDF from 'jspdf';

export const exportToPNG = (canvas: Canvas, filename: string = 'whiteboard.png') => {
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2, // Higher resolution
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToSVG = (canvas: Canvas, filename: string = 'whiteboard.svg') => {
  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (canvas: Canvas, filename: string = 'whiteboard.pdf') => {
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2,
  });

  const pdf = new jsPDF({
    orientation: canvas.width! > canvas.height! ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width!, canvas.height!],
  });

  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(dataURL, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};

export const exportToJSON = (canvas: Canvas, filename: string = 'whiteboard.json') => {
  const json = JSON.stringify(canvas.toJSON());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (canvas: Canvas, jsonString: string) => {
  canvas.loadFromJSON(jsonString, () => {
    canvas.renderAll();
  });
};
