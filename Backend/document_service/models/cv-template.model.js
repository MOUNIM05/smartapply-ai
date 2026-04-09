import mongoose from "mongoose";
import { randomUUID } from "crypto";

const cvTemplateSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => randomUUID()
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  style: {
    type: String,
    required: true,
    trim: true
  },
  layoutOptions: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previewUrl: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: false,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

const CVTemplate = mongoose.model("CVTemplate", cvTemplateSchema);

export default CVTemplate;
