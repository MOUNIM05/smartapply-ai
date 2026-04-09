const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
    .filter(Boolean);
};

const validateCreateExperienceRequest = (payload) => {
  const jobTitle = payload?.jobTitle?.trim();
  const company = payload?.company?.trim();
  const startDate = payload?.startDate?.trim() || "";
  const endDate = payload?.endDate?.trim() || "";
  const description = payload?.description?.trim() || "";
  const skills = normalizeSkills(payload?.skills);

  if (!jobTitle) {
    const error = new Error("Job title is required");
    error.statusCode = 422;
    throw error;
  }

  if (!company) {
    const error = new Error("Company is required");
    error.statusCode = 422;
    throw error;
  }

  return {
    jobTitle,
    company,
    startDate,
    endDate,
    description,
    skills
  };
};

const validateUpdateExperienceRequest = (payload) => {
  const updates = {};

  if (typeof payload?.jobTitle === "string" && payload.jobTitle.trim()) {
    updates.jobTitle = payload.jobTitle.trim();
  }

  if (typeof payload?.company === "string" && payload.company.trim()) {
    updates.company = payload.company.trim();
  }

  if (typeof payload?.startDate === "string") {
    updates.startDate = payload.startDate.trim();
  }

  if (typeof payload?.endDate === "string") {
    updates.endDate = payload.endDate.trim();
  }

  if (typeof payload?.description === "string") {
    updates.description = payload.description.trim();
  }

  if (Array.isArray(payload?.skills)) {
    updates.skills = normalizeSkills(payload.skills);
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid experience fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

module.exports = {
  validateCreateExperienceRequest,
  validateUpdateExperienceRequest
};
