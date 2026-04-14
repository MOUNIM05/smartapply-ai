/**
 * Couche service - pdf.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import PDFDocument from "pdfkit";

const addWrappedParagraphs = (doc, paragraphs = [], options = {}) => {
  paragraphs.filter(Boolean).forEach((paragraph, index) => {
    doc.text(paragraph, options);
    if (index < paragraphs.length - 1) {
      doc.moveDown(1);
    }
  });
};

const drawSectionTitle = (doc, title, x, y, width) => {
  doc.save();
  doc.rect(x, y, width, 22).fill("#111111");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12).text(title.toUpperCase(), x + 10, y + 5, {
    width: width - 20
  });
  doc.restore();
};

const renderCVTemplate = (doc, documentData) => {
  const data = documentData.structuredData || {};
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const sidebarX = 40;
  const sidebarWidth = 170;
  const mainX = sidebarX + sidebarWidth + 28;
  const mainWidth = pageWidth - mainX - 40;
  const accentColor = data.accentColor || "#dbe8f8";

  doc.save();
  doc.rect(0, 0, pageWidth, 120).fill(accentColor);
  doc.restore();

  doc.fillColor("#111111").font("Helvetica-Bold").fontSize(26).text(data.fullName || documentData.title, mainX, 46, {
    width: mainWidth
  });
  doc.font("Helvetica-Oblique").fontSize(18).text(data.headline || documentData.targetPosition || "Professional title", mainX, 82, {
    width: mainWidth
  });
  doc.moveTo(mainX, 112).lineTo(pageWidth - 40, 112).strokeColor("#111111").lineWidth(1.5).stroke();

  let sidebarY = 150;
  drawSectionTitle(doc, "Profil", sidebarX, sidebarY, sidebarWidth);
  sidebarY += 34;
  doc.font("Helvetica").fontSize(10).fillColor("#111111");
  doc.x = sidebarX;
  doc.y = sidebarY;
  addWrappedParagraphs(doc, [
    data.address && `Adresse\n${data.address}`,
    data.email && `E-mail\n${data.email}`,
    data.phone && `Telephone\n${data.phone}`
  ].filter(Boolean), { width: sidebarWidth, align: "left" });
  sidebarY = doc.y + 18;

  if (data.skills?.length) {
    drawSectionTitle(doc, "Competences", sidebarX, sidebarY, sidebarWidth);
    sidebarY += 34;
    doc.x = sidebarX;
    doc.y = sidebarY;
    addWrappedParagraphs(doc, data.skills, { width: sidebarWidth });
    sidebarY = doc.y + 18;
  }

  if (data.languages?.length) {
    drawSectionTitle(doc, "Langues", sidebarX, sidebarY, sidebarWidth);
    sidebarY += 34;
    doc.x = sidebarX;
    doc.y = sidebarY;
    addWrappedParagraphs(doc, data.languages, { width: sidebarWidth });
    sidebarY = doc.y + 18;
  }

  if (data.hobbies?.length) {
    drawSectionTitle(doc, "Loisirs", sidebarX, sidebarY, sidebarWidth);
    sidebarY += 34;
    doc.x = sidebarX;
    doc.y = sidebarY;
    addWrappedParagraphs(doc, data.hobbies, { width: sidebarWidth });
  }

  doc.save();
  doc.moveTo(mainX - 18, 150).lineTo(mainX - 18, pageHeight - 60).strokeColor("#111111").lineWidth(1.5).stroke();
  doc.restore();

  let mainY = 150;
  doc.x = mainX;
  doc.y = mainY;
  if (data.summary) {
    doc.font("Helvetica").fontSize(11).fillColor("#222222").text(data.summary, mainX, mainY, {
      width: mainWidth,
      lineGap: 4
    });
    mainY = doc.y + 26;
  }

  const renderEntries = (title, entries = []) => {
    if (!entries.length) return;

    drawSectionTitle(doc, title, mainX + 54, mainY, mainWidth - 54);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111");
    mainY += 38;

    entries.forEach((entry) => {
      doc.font("Helvetica").fontSize(10).text(entry.dateRange || "", mainX, mainY, {
        width: 90
      });
      doc.font("Helvetica-Bold").fontSize(12).text(entry.title || "", mainX + 110, mainY, {
        width: mainWidth - 110
      });
      if (entry.subtitle) {
        doc.font("Helvetica-Bold").fontSize(10).text(entry.subtitle, mainX + 110, doc.y + 2, {
          width: mainWidth - 110
        });
      }
      if (entry.bullets?.length) {
        doc.font("Helvetica").fontSize(10).text(entry.bullets.join(" "), mainX + 110, doc.y + 2, {
          width: mainWidth - 110,
          lineGap: 3
        });
      }
      mainY = Math.max(doc.y + 18, mainY + 58);
    });
  };

  renderEntries("Experiences professionnelles", data.experience);
  renderEntries("Formations", data.education);
  renderEntries("Projects", data.projects);
};

const renderMotivationLetterTemplate = (doc, documentData) => {
  const data = documentData.structuredData || {};
  const pageWidth = doc.page.width;

  doc.font("Helvetica-Bold").fontSize(24).fillColor("#111111").text(data.senderName || "Candidate", 50, 60);
  doc.font("Helvetica").fontSize(14).text(data.senderHeadline || "", 50, 98);
  doc.font("Helvetica").fontSize(14).text(data.senderEmail || "", pageWidth - 210, 96, {
    width: 160,
    align: "right"
  });

  doc.font("Helvetica-Bold").fontSize(24).text("MOTIVATION LETTER", 0, 220, {
    align: "center"
  });

  let y = 300;
  doc.font("Helvetica-Bold").fontSize(11).text(data.date || new Date().toLocaleDateString(), 60, y);
  y += 28;
  [data.recipientName, data.recipientRole, data.recipientCompany, data.recipientAddress].filter(Boolean).forEach((line) => {
    doc.text(line, 60, y);
    y += 26;
  });

  y += 12;
  doc.font("Helvetica").fontSize(12).text(data.greeting || "Dear Hiring Manager,", 60, y);
  y += 38;
  addWrappedParagraphs(doc, [data.openingParagraph, ...(data.bodyParagraphs || []), data.closingParagraph].filter(Boolean), {
    width: pageWidth - 120,
    align: "left",
    lineGap: 6
  });
  y = doc.y + 26;

  doc.font("Helvetica").fontSize(12).text("Sincerely,", 60, y);
  y += 50;
  doc.font("Helvetica-Oblique").fontSize(20).text("Signature", 60, y);
  y += 42;
  doc.font("Helvetica-Bold").fontSize(12).text(data.signatureName || "", 60, y);
  if (data.signatureEmail) {
    doc.font("Helvetica").fontSize(12).text(data.signatureEmail, 60, y + 24);
  }
};

const renderApplicationEmailTemplate = (doc, documentData) => {
  const data = documentData.structuredData || {};
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.save();
  doc.rect(0, 0, pageWidth, 72).fill("#2f3b63");
  doc.restore();

  doc.font("Helvetica").fontSize(22).fillColor("#111111").text(data.senderName || "Primeve", 50, 110);
  doc.font("Helvetica").fontSize(14).text(`Subject: `, 50, 180, { continued: true });
  doc.font("Helvetica-Bold").fontSize(14).text(data.subject || documentData.title || "Application Email");

  let y = 250;
  addWrappedParagraphs(doc, [
    data.greeting,
    data.intro,
    ...(data.bodyParagraphs || []),
    data.callToAction,
    data.closing
  ].filter(Boolean), {
    width: pageWidth - 100,
    align: "left",
    lineGap: 6
  });
  y = doc.y + 30;

  [data.signatureName, data.signatureTitle, data.signatureEmail].filter(Boolean).forEach((line) => {
    doc.font("Helvetica").fontSize(12).text(line, 50, y);
    y += 24;
  });

  doc.save();
  doc.polygon([0, pageHeight], [0, pageHeight - 110], [190, pageHeight]).fill("#050505");
  doc.polygon([180, pageHeight], [pageWidth, pageHeight], [pageWidth, pageHeight - 120]).fill("#ff4f0f");
  doc.polygon([180, pageHeight], [pageWidth, pageHeight - 120], [pageWidth, pageHeight - 70]).fill("#ff7b24");
  doc.restore();
};

export const generatePDF = (documentData) => {
  const doc = new PDFDocument({
    margin: 40
  });

  if (documentData.type === "cv") {
    renderCVTemplate(doc, documentData);
    return doc;
  }

  if (documentData.type === "motivation_letter") {
    renderMotivationLetterTemplate(doc, documentData);
    return doc;
  }

  if (documentData.type === "application_email") {
    renderApplicationEmailTemplate(doc, documentData);
    return doc;
  }

  doc.fontSize(18).font("Helvetica-Bold").text(documentData.title, { align: "center" });
  doc.moveDown();
  doc.fontSize(12).font("Helvetica").text(documentData.content, {
    align: "left",
    lineGap: 5
  });
  return doc;
};

export const streamPDFToResponse = (doc, res, filename, statusCode = 200) => {
  res.status(statusCode);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
  doc.pipe(res);
  doc.end();
};
