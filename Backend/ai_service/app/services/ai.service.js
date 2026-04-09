const { AIModel } = require("../models/ai-model.model");
const { AIGenerationRequest } = require("../models/ai-generation-request.model");
const { AIGenerationResponse } = require("../models/ai-generation-response.model");

const DEFAULT_AI_MODEL = {
  name: "SmartApply Assistant",
  provider: "OpenAI",
  version: "mock-v1",
  isActive: true
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

const buildMockOutput = ({ requestType, prompt, contextData }) => {
  const jobContext = contextData?.jobContext || "General opportunity";
  const template = contextData?.template || "Aurora";
  const shortPrompt = prompt.slice(0, 220);

  const outputs = {
    cv_generation: `Template: ${template}

Professional Summary
- Results-oriented candidate with a strong focus on delivery and clear communication.
- Tailored this CV for ${jobContext}.

Key Highlights
- Structured project work around measurable impact.
- Aligned experience with the target role and employer needs.
- Emphasized adaptability, collaboration, and execution.

Relevant Context
${shortPrompt}`,
    motivation_letter: `Dear Hiring Team,

I am writing to express my strong interest in this opportunity related to ${jobContext}. My background and motivation match the role well.

Why I am a good fit
- I adapt quickly to project needs.
- I work well in collaborative environments.
- I focus on practical and measurable results.

Main context
${shortPrompt}

Sincerely,
SmartApply AI Draft`,
    application_email: `Subject: Application for ${jobContext}

Hello,

Please find my application for the ${jobContext} opportunity. I believe my profile is relevant and I would be glad to discuss it further.

Context used
${shortPrompt}

Best regards,
SmartApply AI Draft`,
    job_adaptation: `Adapted Content for ${jobContext}

- Reframed achievements to better match the target role.
- Highlighted relevant keywords from the opportunity.
- Focused on transferable strengths and business value.

Source context
${shortPrompt}`,
    other: `Improved Draft

Context used
${shortPrompt}`
  };

  return outputs[requestType] || outputs.other;
};

const createAIModel = async (payload) => {
  const aiModel = await AIModel.create(payload);

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

  const response = await AIGenerationResponse.create({
    requestId: request._id,
    rawOutput: buildMockOutput({
      requestType: payload.requestType,
      prompt: payload.prompt,
      contextData: payload.contextData
    }),
    structuredOutput: {
      requestType: payload.requestType,
      template: payload.contextData?.template || "Aurora",
      jobContext: payload.contextData?.jobContext || "",
      generatedBy: aiModel.name
    },
    status: "completed"
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

const createAIGenerationResponse = async (payload) => {
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
