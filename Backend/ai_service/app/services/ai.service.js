/**
 * Couche service - ai.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { AIModel } = require("../models/ai-model.model");
const { AIGenerationRequest } = require("../models/ai-generation-request.model");
const { AIGenerationResponse } = require("../models/ai-generation-response.model");
const { sendNotification } = require("./notification-client.service");

const DEFAULT_AI_MODEL = {
  name: "SmartApply Assistant",
  provider: "OpenAI",
  version: process.env.OPENAI_MODEL || "mock-v1",
  isActive: true
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const TEMPLATE_LIBRARY = {
  "cv-modern-sidebar": {
    label: "CV modern sidebar",
    description: "French-inspired CV with sidebar contact blocks and strong section headers."
  },
  "motivation-formal": {
    label: "Formal motivation letter",
    description: "Formal letter with sender header, centered title, recipient block, and signature section."
  },
  "email-prime": {
    label: "Prime style email",
    description: "Clean professional email layout with strong subject line and short persuasive paragraphs."
  }
};

const serializeAIModel = (aiModel) => ({
  id: aiModel._id,
  name: aiModel.name,
  provider: aiModel.provider,
  version: aiModel.version,
  isActive: aiModel.isActive,
  createdAt: aiModel.createdAt,
  updatedAt: aiModel.updatedAt
});

const serializeRequest = (request) => ({
  id: request._id,
  requesterId: request.requesterId,
  aiModelId: request.aiModelId,
  prompt: request.prompt,
  contextData: request.contextData,
  requestType: request.requestType,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt
});

const serializeResponse = (response) => ({
  id: response._id,
  requestId: response.requestId,
  rawOutput: response.rawOutput,
  structuredOutput: response.structuredOutput,
  status: response.status,
  generatedAt: response.generatedAt,
  createdAt: response.createdAt,
  updatedAt: response.updatedAt
});

const ensureDefaultAIModel = async () => {
  let aiModel = await AIModel.findOne({ isActive: true }).sort({ createdAt: -1 });

  if (!aiModel) {
    aiModel = await AIModel.create(DEFAULT_AI_MODEL);
  }

  return aiModel;
};

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeArray = (value) => (Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []);

const stripMarkdownCodeFence = (value) =>
  String(value || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const toParagraphArray = (value) =>
  sanitizeArray(value).flatMap((item) =>
    item.split(/\n{2,}/).map((chunk) => chunk.trim()).filter(Boolean)
  );

const buildProfileContext = (contextData = {}) => {
  const snapshot = contextData.profileSnapshot || {};
  const skillNames = sanitizeArray(snapshot.skills);
  const languages = sanitizeArray(snapshot.languages);
  const experiences = Array.isArray(snapshot.experience) ? snapshot.experience : [];
  const education = Array.isArray(snapshot.education) ? snapshot.education : [];

  return [
    `Candidate name: ${sanitizeText(snapshot.fullName) || "Unknown candidate"}`,
    `Professional title: ${sanitizeText(snapshot.professionalTitle) || "Not provided"}`,
    `Email: ${sanitizeText(snapshot.email) || "Not provided"}`,
    `Phone: ${sanitizeText(snapshot.phone) || "Not provided"}`,
    `Address: ${sanitizeText(snapshot.address) || "Not provided"}`,
    `Summary: ${sanitizeText(snapshot.summary) || "Not provided"}`,
    skillNames.length ? `Skills: ${skillNames.join(", ")}` : "Skills: Not provided",
    languages.length ? `Languages: ${languages.join(", ")}` : "Languages: Not provided",
    experiences.length
      ? `Experience: ${experiences.map((item) => [item.title, item.company, item.dateRange, sanitizeArray(item.bullets).join("; ")].filter(Boolean).join(" | ")).join(" || ")}`
      : "Experience: Not provided",
    education.length
      ? `Education: ${education.map((item) => [item.title, item.subtitle, item.dateRange].filter(Boolean).join(" | ")).join(" || ")}`
      : "Education: Not provided"
  ].join("\n");
};

const buildOutputContract = (requestType) => {
  const contracts = {
    cv_generation: `Return valid JSON with keys:
{
  "headline": string,
  "summary": string,
  "skills": string[],
  "experience": [{ "title": string, "subtitle": string, "dateRange": string, "bullets": string[] }],
  "education": [{ "title": string, "subtitle": string, "dateRange": string, "bullets": string[] }],
  "languages": string[],
  "projects": [{ "title": string, "subtitle": string, "dateRange": string, "bullets": string[] }],
  "hobbies": string[]
}`,
    motivation_letter: `Return valid JSON with keys:
{
  "date": string,
  "recipientName": string,
  "recipientRole": string,
  "recipientCompany": string,
  "recipientAddress": string,
  "greeting": string,
  "openingParagraph": string,
  "bodyParagraphs": string[],
  "closingParagraph": string,
  "signatureName": string,
  "signatureEmail": string
}`,
    application_email: `Return valid JSON with keys:
{
  "subject": string,
  "recipientName": string,
  "greeting": string,
  "intro": string,
  "bodyParagraphs": string[],
  "callToAction": string,
  "closing": string,
  "signatureName": string,
  "signatureTitle": string,
  "signatureEmail": string
}`,
    job_adaptation: `Return valid JSON with keys:
{
  "summary": string,
  "keywords": string[],
  "improvements": string[],
  "rewrittenContent": string
}`,
    other: `Return valid JSON with keys:
{
  "summary": string,
  "improvements": string[],
  "rewrittenContent": string
}`
  };

  return contracts[requestType] || contracts.other;
};

const buildOpenAIInstructions = ({ requestType, contextData }) => {
  const jobContext = sanitizeText(contextData?.jobContext) || "General opportunity";
  const templateKey = sanitizeText(contextData?.templateKey) || sanitizeText(contextData?.template) || "default";
  const templateMeta = TEMPLATE_LIBRARY[templateKey];
  const outputLanguage = sanitizeText(contextData?.outputLanguage) || "fr";

  return [
    `You are SmartApply AI, a serious career-writing assistant.`,
    `Write in ${outputLanguage}.`,
    `Respond with valid JSON only. Do not wrap the answer in markdown.`,
    `Do not use placeholders like [Your Name], lorem ipsum, or invented facts not supported by the provided profile.`,
    `Tailor the content to the target role: ${jobContext}.`,
    templateMeta ? `Respect this visual template intent: ${templateMeta.label}. ${templateMeta.description}` : "",
    `Be concrete, concise, and realistic.`,
    buildOutputContract(requestType)
  ].filter(Boolean).join("\n");
};

const buildPromptEnvelope = ({ requestType, prompt, contextData }) => {
  const templateKey = sanitizeText(contextData?.templateKey) || sanitizeText(contextData?.template) || "default";

  return [
    `Request type: ${requestType}`,
    `Template key: ${templateKey}`,
    `Job context: ${sanitizeText(contextData?.jobContext) || "General opportunity"}`,
    `Template notes: ${TEMPLATE_LIBRARY[templateKey]?.description || "No specific template metadata provided."}`,
    "",
    "Candidate profile snapshot:",
    buildProfileContext(contextData),
    "",
    "Additional user instructions / source material:",
    sanitizeText(prompt)
  ].join("\n");
};

const buildStructuredFallback = ({ requestType, prompt, contextData }) => {
  const snapshot = contextData?.profileSnapshot || {};
  const jobContext = sanitizeText(contextData?.jobContext) || "this opportunity";
  const fullName = sanitizeText(snapshot.fullName) || "Candidate";
  const title = sanitizeText(snapshot.professionalTitle) || "Professional";
  const email = sanitizeText(snapshot.email);
  const experiences = Array.isArray(snapshot.experience) ? snapshot.experience : [];
  const education = Array.isArray(snapshot.education) ? snapshot.education : [];
  const skills = sanitizeArray(snapshot.skills);
  const languages = sanitizeArray(snapshot.languages);
  const notes = sanitizeText(prompt);

  if (requestType === "cv_generation") {
    return {
      headline: title || jobContext,
      summary: sanitizeText(snapshot.summary) || `${title} with relevant experience aligned to ${jobContext}.`,
      skills: skills.slice(0, 8),
      experience: experiences.map((item) => ({
        title: sanitizeText(item.title),
        subtitle: sanitizeText(item.company),
        dateRange: sanitizeText(item.dateRange),
        bullets: sanitizeArray(item.bullets).slice(0, 3)
      })),
      education: education.map((item) => ({
        title: sanitizeText(item.title),
        subtitle: sanitizeText(item.subtitle),
        dateRange: sanitizeText(item.dateRange),
        bullets: sanitizeArray(item.bullets).slice(0, 2)
      })),
      languages,
      projects: [],
      hobbies: []
    };
  }

  if (requestType === "motivation_letter") {
    return {
      date: new Date().toLocaleDateString(),
      recipientName: "Hiring Manager",
      recipientRole: "",
      recipientCompany: jobContext,
      recipientAddress: "",
      greeting: "Dear Hiring Manager,",
      openingParagraph: `I am writing to express my interest in ${jobContext}.`,
      bodyParagraphs: [
        sanitizeText(snapshot.summary) || `${title} with a profile aligned to the role.`,
        notes || "My experience and motivation match the responsibilities of this opportunity."
      ].filter(Boolean),
      closingParagraph: "Thank you for your consideration. I would welcome the opportunity to discuss my application.",
      signatureName: fullName,
      signatureEmail: email
    };
  }

  if (requestType === "application_email") {
    return {
      subject: `Application for ${jobContext}`,
      recipientName: "Hiring Team",
      greeting: "Dear Hiring Team,",
      intro: `I am reaching out to apply for ${jobContext}.`,
      bodyParagraphs: [
        sanitizeText(snapshot.summary) || `${title} with relevant experience for the role.`,
        notes || "Please find my application and supporting documents attached."
      ].filter(Boolean),
      callToAction: "I would be glad to discuss my background and motivation in more detail.",
      closing: "Best regards,",
      signatureName: fullName,
      signatureTitle: title,
      signatureEmail: email
    };
  }

  if (requestType === "job_adaptation") {
    return {
      summary: `Adapted content for ${jobContext}`,
      keywords: tokenizeAdaptationSource(`${jobContext} ${notes}`).slice(0, 8),
      improvements: [
        "Highlight measurable impact earlier.",
        "Mirror the vocabulary of the target job offer.",
        "Keep the strongest matching skills near the top."
      ],
      rewrittenContent: notes || sanitizeText(snapshot.summary) || `${title} aligned to ${jobContext}.`
    };
  }

  return {
    summary: "Improved draft",
    improvements: [
      "Clarify the strongest value proposition.",
      "Remove repetition.",
      "Use a more direct professional tone."
    ],
    rewrittenContent: notes || sanitizeText(snapshot.summary) || "Professional content ready for refinement."
  };
};

const tokenizeAdaptationSource = (value) =>
  sanitizeText(value)
    .toLowerCase()
    .split(/[^a-zA-Z0-9+#]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 3);

const parseStructuredOutput = (requestType, text, contextData) => {
  try {
    const parsed = JSON.parse(stripMarkdownCodeFence(text));
    return parsed && typeof parsed === "object"
      ? parsed
      : buildStructuredFallback({ requestType, prompt: text, contextData });
  } catch {
    return buildStructuredFallback({ requestType, prompt: text, contextData });
  }
};

const formatStructuredOutput = (requestType, structuredOutput) => {
  if (requestType === "cv_generation") {
    return [
      structuredOutput.headline,
      "",
      structuredOutput.summary,
      "",
      structuredOutput.skills?.length ? `Skills: ${structuredOutput.skills.join(", ")}` : "",
      ...(structuredOutput.experience || []).flatMap((entry) => [
        [entry.title, entry.subtitle].filter(Boolean).join(" - "),
        ...(entry.bullets || []).map((bullet) => `- ${bullet}`),
        ""
      ])
    ].filter(Boolean).join("\n");
  }

  if (requestType === "motivation_letter") {
    return [
      structuredOutput.greeting,
      "",
      structuredOutput.openingParagraph,
      "",
      ...(structuredOutput.bodyParagraphs || []),
      "",
      structuredOutput.closingParagraph,
      "",
      structuredOutput.signatureName
    ].filter(Boolean).join("\n");
  }

  if (requestType === "application_email") {
    return [
      `Subject: ${structuredOutput.subject}`,
      "",
      structuredOutput.greeting,
      "",
      structuredOutput.intro,
      "",
      ...(structuredOutput.bodyParagraphs || []),
      "",
      structuredOutput.callToAction,
      "",
      structuredOutput.closing,
      structuredOutput.signatureName
    ].filter(Boolean).join("\n");
  }

  return structuredOutput.rewrittenContent || structuredOutput.summary || "";
};

const generateWithOpenAI = async ({ requestType, prompt, contextData }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const structuredOutput = buildStructuredFallback({ requestType, prompt, contextData });
    return {
      rawOutput: formatStructuredOutput(requestType, structuredOutput),
      structuredOutput
    };
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.2",
        instructions: buildOpenAIInstructions({ requestType, contextData }),
        input: buildPromptEnvelope({ requestType, prompt, contextData })
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    const outputText = payload?.output_text?.trim();
    const structuredOutput = parseStructuredOutput(requestType, outputText, contextData);

    return {
      rawOutput: formatStructuredOutput(requestType, structuredOutput),
      structuredOutput
    };
  } catch (error) {
    console.error("OpenAI generation failed, using structured fallback:", error.message);
    const structuredOutput = buildStructuredFallback({ requestType, prompt, contextData });
    return {
      rawOutput: formatStructuredOutput(requestType, structuredOutput),
      structuredOutput
    };
  } finally {
    clearTimeout(timeout);
  }
};

const createAIModel = async (actorUserId, payload) => {
  const aiModel = await AIModel.create(payload);

  await sendNotification({
    userId: String(actorUserId),
    title: "Modele IA ajoute",
    message: `Le modele ${aiModel.name} (${aiModel.version}) a ete ajoute.`,
    type: "system",
    event: "ai_model_created",
    sourceService: "ai-service",
    metadata: {
      aiModelId: String(aiModel._id),
      provider: aiModel.provider,
      version: aiModel.version
    }
  });

  return {
    message: "AI model created successfully",
    aiModel: serializeAIModel(aiModel)
  };
};

const listAIModels = async () => {
  await ensureDefaultAIModel();
  const aiModels = await AIModel.find().sort({ createdAt: -1 });

  return {
    aiModels: aiModels.map(serializeAIModel)
  };
};

const getAIModelById = async (aiModelId) => {
  const aiModel = await AIModel.findById(aiModelId);

  if (!aiModel) {
    const error = new Error("AI model not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    aiModel: serializeAIModel(aiModel)
  };
};

const createAIGenerationRequest = async (requesterId, payload) => {
  const aiModel = payload.aiModelId
    ? await AIModel.findById(payload.aiModelId)
    : await ensureDefaultAIModel();

  if (!aiModel) {
    const error = new Error("AI model not found");
    error.statusCode = 404;
    throw error;
  }

  const request = await AIGenerationRequest.create({
    ...payload,
    aiModelId: aiModel._id,
    requesterId
  });

  const generation = await generateWithOpenAI({
    requestType: payload.requestType,
    prompt: payload.prompt,
    contextData: payload.contextData
  });

  const response = await AIGenerationResponse.create({
    requestId: request._id,
    rawOutput: generation.rawOutput,
    structuredOutput: {
      requestType: payload.requestType,
      templateKey: payload.contextData?.templateKey || payload.contextData?.template || "default",
      jobContext: payload.contextData?.jobContext || "",
      generatedBy: process.env.OPENAI_API_KEY
        ? `${aiModel.name} via OpenAI API`
        : `${aiModel.name} structured fallback`,
      ...generation.structuredOutput
    },
    status: "completed"
  });

  await sendNotification({
    userId: String(requesterId),
    title: "Generation IA terminee",
    message: `Votre demande IA de type ${payload.requestType} a ete traitee.`,
    type: "system",
    event: "ai_generation_completed",
    sourceService: "ai-service",
    metadata: {
      requestId: String(request._id),
      responseId: String(response._id),
      requestType: payload.requestType,
      aiModelId: String(aiModel._id)
    }
  });

  return {
    message: "AI generation request created successfully",
    request: serializeRequest(request),
    response: serializeResponse(response)
  };
};

const listAIGenerationRequests = async (user) => {
  const query = user.role === "admin" ? {} : { requesterId: user.userId };
  const requests = await AIGenerationRequest.find(query).sort({ createdAt: -1 });

  return {
    requests: requests.map(serializeRequest)
  };
};

const getAIGenerationRequestById = async (requestId, user) => {
  const request = await AIGenerationRequest.findById(requestId);

  if (!request) {
    const error = new Error("AI generation request not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "admin" && String(request.requesterId) !== String(user.userId)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  return {
    request: serializeRequest(request)
  };
};

const createAIGenerationResponse = async (actorUserId, payload) => {
  const request = await AIGenerationRequest.findById(payload.requestId);

  if (!request) {
    const error = new Error("AI generation request not found");
    error.statusCode = 404;
    throw error;
  }

  const existingResponse = await AIGenerationResponse.findOne({ requestId: payload.requestId });

  if (existingResponse) {
    const error = new Error("AI generation response already exists for this request");
    error.statusCode = 409;
    throw error;
  }

  const response = await AIGenerationResponse.create(payload);

  await sendNotification({
    userId: String(request.requesterId),
    title: "Reponse IA disponible",
    message: "Une nouvelle reponse IA a ete ajoutee a votre demande.",
    type: "system",
    event: "ai_response_created",
    sourceService: "ai-service",
    metadata: {
      requestId: String(request._id),
      responseId: String(response._id),
      actorUserId: String(actorUserId)
    }
  });

  return {
    message: "AI generation response created successfully",
    response: serializeResponse(response)
  };
};

const listAIGenerationResponses = async (user) => {
  const requestsQuery = user.role === "admin" ? {} : { requesterId: user.userId };
  const requests = await AIGenerationRequest.find(requestsQuery).select("_id");
  const requestIds = requests.map((request) => request._id);
  const query = user.role === "admin" ? {} : { requestId: { $in: requestIds } };
  const responses = await AIGenerationResponse.find(query).sort({ createdAt: -1 });

  return {
    responses: responses.map(serializeResponse)
  };
};

const getAIGenerationResponseById = async (responseId, user) => {
  const response = await AIGenerationResponse.findById(responseId);

  if (!response) {
    const error = new Error("AI generation response not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "admin") {
    const request = await AIGenerationRequest.findById(response.requestId).select("requesterId");

    if (!request || String(request.requesterId) !== String(user.userId)) {
      const error = new Error("Access denied");
      error.statusCode = 403;
      throw error;
    }
  }

  return {
    response: serializeResponse(response)
  };
};

module.exports = {
  createAIModel,
  listAIModels,
  getAIModelById,
  createAIGenerationRequest,
  listAIGenerationRequests,
  getAIGenerationRequestById,
  createAIGenerationResponse,
  listAIGenerationResponses,
  getAIGenerationResponseById
};

