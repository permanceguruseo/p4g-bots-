// ─────────────────────────────────────────────────────────────
// docGenerator.js — turns generated text into a minimal shareable
// PDF (no heavy deps) so the PPT/PDF bot always has a file to upload
// when the client hasn't supplied one. Writes to ./tmp and returns
// the path. It's a plain, valid one-page PDF.
// ─────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

function escapePdf(s){ return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }

// wrap text into lines that fit a page width (rough char count)
function wrap(text, max = 90){
  const out = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      if ((line + ' ' + word).length > max) { out.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    }
    out.push(line);
  }
  return out;
}

function makePdf(title, body, outDir = path.join(__dirname, 'tmp')) {
  fs.mkdirSync(outDir, { recursive: true });
  const lines = [title, '', ...wrap(body)];
  let y = 780, stream = 'BT /F1 12 Tf 50 800 Td (' + escapePdf(title) + ') Tj ET\n';
  stream += 'BT /F1 10 Tf\n';
  for (const ln of lines.slice(2)) {
    y -= 15; if (y < 40) break;
    stream += `1 0 0 1 50 ${y} Tm (${escapePdf(ln)}) Tj\n`;
  }
  stream += 'ET';

  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n', offsets = [];
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(o => { pdf += String(o).padStart(10, '0') + ' 00000 n \n'; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const file = path.join(outDir, `doc-${Date.now()}.pdf`);
  fs.writeFileSync(file, pdf);
  return file;
}

module.exports = { makePdf };
