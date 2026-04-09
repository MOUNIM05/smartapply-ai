const validateCreateJobOfferRequest = (payload) => {
  const jobTitle = payload?.jobTitle?.trim();
  const company = payload?.company?.trim();
  const description = payload?.description?.trim() || "";
  const location = payload?.location?.trim() || "";
  const employmentType = payload?.employmentType?.trim() || "";

  if (!jobTitle || !company) {
    const error = new Error("Job title and company are required");
    error.statusCode = 422;
    throw error;
  }

  return {
    jobTitle,
    company,
    description,
    location,
    employmentType
  };
};

const validateCreateApplicationRequest = (payload) => {
  const profileId = payload?.profileId;
  const jobOfferId = payload?.jobOfferId;
  const status = payload?.status?.trim() || "draft";

  if (!profileId || !jobOfferId) {
    const error = new Error("profileId and jobOfferId are required");
    error.statusCode = 422;
    throw error;
  }

  if (!["draft", "submitted", "reviewed", "accepted", "rejected"].includes(status)) {
    const error = new Error("Invalid application status");
    error.statusCode = 422;
    throw error;
  }

  return {
    profileId,
    jobOfferId,
    status
  };
};

module.exports = {
  validateCreateJobOfferRequest,
  validateCreateApplicationRequest
};
