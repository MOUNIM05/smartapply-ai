import { randomUUID } from "crypto";
import { generatePDF } from "../services/pdf.service.js";

const transformDocument = (_, ret) => {
  ret.id = ret._id;
  delete ret._id;
  return ret;
};

export const GeneratedDocumentSchema = {
  _id: {
    type: String,
    default: () => randomUUID()
  },
  type: {
    type: String,
    required: true,
    enum: ["cv", "motivation_letter", "application_email"],
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  format: {
    type: String,
    required: true,
    enum: ["pdf"],
    default: "pdf",
    immutable: true
  }
};

export const generatedDocumentOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: transformDocument
  },
  toObject: {
    virtuals: true,
    transform: transformDocument
  }
};

export const applyGeneratedDocumentBehavior = (schema) => {
  schema.method("exportPDF", function exportPDF() {
    return generatePDF(this.toObject());
  });
};
