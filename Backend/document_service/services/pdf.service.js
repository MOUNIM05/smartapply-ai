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

const getInitials = (fullName = "") =>
  String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SA";

const renderCVSimpleSidebarTemplate = (doc, documentData) => {
  const data = documentData.structuredData || {};
  const pageWidth = doc.page.width;
  const sidebarX = 40;
  const sidebarWidth = 185;
  const mainX = sidebarX + sidebarWidth + 30;
  const mainWidth = pageWidth - mainX - 40;

  doc.save();
  doc.rect(sidebarX, 40, sidebarWidth, doc.page.height - 80).fill("#1f2937");
  doc.restore();

  const avatarCenterX = sidebarX + sidebarWidth / 2;
  const avatarCenterY = 95;
  const avatarRadius = 46;
  doc.save();
  doc.circle(avatarCenterX, avatarCenterY, avatarRadius).fill("#334155");
  doc.circle(avatarCenterX, avatarCenterY, avatarRadius).lineWidth(3).stroke("#f8fafc");
  doc.fillColor("#e2e8f0").font("Helvetica-Bold").fontSize(24).text(getInitials(data.fullName), avatarCenterX - 22, avatarCenterY - 10);
  doc.restore();

  let sidebarY = 160;
  doc.fillColor("#f8fafc").font("Helvetica-Bold").fontSize(19).text(data.fullName || documentData.title, sidebarX + 14, sidebarY, {
    width: sidebarWidth - 28,
    align: "center"
  });
  sidebarY = doc.y + 4;
  doc.fillColor("#cbd5e1").font("Helvetica").fontSize(11).text(data.headline || "Professional", sidebarX + 14, sidebarY, {
    width: sidebarWidth - 28,
    align: "center"
  });
  sidebarY = doc.y + 16;

  const drawSidebarBlock = (title, lines = []) => {
    const filtered = lines.filter(Boolean);
    if (!filtered.length) return;

    doc.fillColor("#f8fafc").font("Helvetica-Bold").fontSize(12).text(title.toUpperCase(), sidebarX + 16, sidebarY, {
      width: sidebarWidth - 32
    });
    sidebarY = doc.y + 8;
    doc.fillColor("#e2e8f0").font("Helvetica").fontSize(10);
    filtered.forEach((line) => {
      doc.text(`• ${line}`, sidebarX + 16, sidebarY, { width: sidebarWidth - 32, lineGap: 2 });
      sidebarY = doc.y + 2;
    });
    sidebarY += 10;
  };

  drawSidebarBlock("Contact", [data.phone, data.email, data.address]);
  drawSidebarBlock("Skills", data.skills || []);
  drawSidebarBlock("Languages", data.languages || []);
  drawSidebarBlock("Hobbies", data.hobbies || []);

  let mainY = 56;
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(22).text("PROFILE", mainX, mainY, { width: mainWidth });
  mainY = doc.y + 10;
  doc.font("Helvetica").fontSize(10).fillColor("#374151").text(data.summary || "Profile summary is not available.", mainX, mainY, {
    width: mainWidth,
    lineGap: 4
  });
  mainY = doc.y + 18;

  const drawMainEntries = (title, entries = []) => {
    if (!entries.length) return;

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827").text(title, mainX, mainY, { width: mainWidth });
    mainY = doc.y + 8;

    entries.forEach((entry) => {
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(entry.title || "-", mainX, mainY, {
        width: mainWidth - 120
      });
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(entry.dateRange || "", mainX + mainWidth - 120, mainY, {
        width: 120,
        align: "right"
      });
      mainY = doc.y + 2;

      if (entry.subtitle) {
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#4b5563").text(entry.subtitle, mainX, mainY, { width: mainWidth });
        mainY = doc.y + 2;
      }

      if (entry.bullets?.length) {
        doc.font("Helvetica").fontSize(10).fillColor("#1f2937");
        entry.bullets.slice(0, 4).forEach((bullet) => {
          doc.text(`• ${bullet}`, mainX, mainY, { width: mainWidth, lineGap: 2 });
          mainY = doc.y + 2;
        });
      }

      mainY += 8;
    });
  };

  drawMainEntries("WORK EXPERIENCE", data.experience || []);
  drawMainEntries("EDUCATION", data.education || []);
  drawMainEntries("PROJECTS", data.projects || []);
};

const renderCVClassicBalanceTemplate = (doc, documentData) => {
  const data = documentData.structuredData || {};
  const pageWidth = doc.page.width;
  const leftX = 40;
  const columnGap = 24;
  const columnWidth = (pageWidth - 80 - columnGap) / 2;
  const rightX = leftX + columnWidth + columnGap;

  doc.save();
  doc.rect(0, 0, pageWidth, 120).fill("#5b6870");
  doc.restore();

  doc.fillColor("#f8fafc").font("Helvetica-Bold").fontSize(27).text(data.fullName || documentData.title, 0, 38, { align: "center" });
  doc.font("Helvetica").fontSize(13).text(data.headline || "Professional profile", 0, 72, { align: "center" });

  const avatarCenterX = pageWidth / 2;
  const avatarCenterY = 130;
  doc.save();
  doc.circle(avatarCenterX, avatarCenterY, 40).fill("#9ca3af");
  doc.circle(avatarCenterX, avatarCenterY, 40).lineWidth(4).stroke("#e5e7eb");
  doc.fillColor("#1f2937").font("Helvetica-Bold").fontSize(22).text(getInitials(data.fullName), avatarCenterX - 20, avatarCenterY - 8);
  doc.restore();

  let leftY = 195;
  let rightY = 195;

  const drawColumnTitle = (x, y, title) => {
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#1f2937").text(title, x, y, { width: columnWidth });
    doc.moveTo(x, y + 18).lineTo(x + columnWidth, y + 18).lineWidth(1).strokeColor("#9ca3af").stroke();
    return y + 28;
  };

  const drawParagraphBlock = (x, y, title, text) => {
    let nextY = drawColumnTitle(x, y, title);
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text(text || "-", x, nextY, {
      width: columnWidth,
      lineGap: 3
    });
    return doc.y + 12;
  };

  const drawSkillBars = (x, y, skills = []) => {
    if (!skills.length) return y;
    let nextY = drawColumnTitle(x, y, "SKILLS");
    skills.slice(0, 6).forEach((skill, index) => {
      const ratio = 0.5 + ((index % 4) * 0.1);
      const barWidth = columnWidth - 20;
      doc.font("Helvetica").fontSize(10).fillColor("#1f2937").text(skill, x, nextY, { width: barWidth });
      nextY = doc.y + 4;
      doc.rect(x, nextY, barWidth, 6).fill("#d1d5db");
      doc.rect(x, nextY, barWidth * ratio, 6).fill("#6b7280");
      nextY += 12;
    });
    return nextY + 4;
  };

  const drawEntries = (x, y, title, entries = []) => {
    if (!entries.length) return y;
    let nextY = drawColumnTitle(x, y, title);
    entries.slice(0, 4).forEach((entry) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(entry.title || "-", x, nextY, { width: columnWidth });
      nextY = doc.y + 1;
      if (entry.subtitle) {
        doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(entry.subtitle, x, nextY, { width: columnWidth });
        nextY = doc.y + 1;
      }
      if (entry.dateRange) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#6b7280").text(entry.dateRange, x, nextY, { width: columnWidth });
        nextY = doc.y + 1;
      }
      if (entry.bullets?.length) {
        doc.font("Helvetica").fontSize(9).fillColor("#374151").text(entry.bullets.slice(0, 2).join(" "), x, nextY, {
          width: columnWidth,
          lineGap: 2
        });
        nextY = doc.y + 3;
      }
      nextY += 6;
    });
    return nextY;
  };

  leftY = drawParagraphBlock(leftX, leftY, "ABOUT ME", data.summary);
  leftY = drawSkillBars(leftX, leftY, data.skills || []);
  leftY = drawParagraphBlock(leftX, leftY, "AWARDS", "Top performer and project achievements.");

  rightY = drawEntries(rightX, rightY, "EDUCATION", data.education || []);
  rightY = drawEntries(rightX, rightY, "EXPERIENCE", data.experience || []);
  rightY = drawParagraphBlock(rightX, rightY, "HOBBIES", (data.hobbies || []).join(" • "));
};

const renderCVTemplate = (doc, documentData) => {
  const templateKey = documentData.templateKey || documentData.structuredData?.templateKey || "cv-modern-sidebar";

  if (templateKey === "cv-simple-sidebar") {
    renderCVSimpleSidebarTemplate(doc, documentData);
    return;
  }

  if (templateKey === "cv-classic-balance") {
    renderCVClassicBalanceTemplate(doc, documentData);
    return;
  }

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
