// Runs a simple end-to-end smoke test across SmartApplyAI backend services.
const baseUrls = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:5000",
  profile: process.env.PROFILE_SERVICE_URL || "http://localhost:5001",
  job: process.env.JOB_SERVICE_URL || "http://localhost:5002",
  ai: process.env.AI_SERVICE_URL || "http://localhost:5003",
  document: process.env.DOCUMENT_SERVICE_URL || "http://localhost:5004",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5005"
};

const createdAt = Date.now();
const testUser = {
  first_name: "Demo",
  last_name: "User",
  email: `demo.smartapply.${createdAt}@example.com`,
  password: "123456"
};

const summary = [];

const logStep = (label, passed, details) => {
  const icon = passed ? "PASS" : "FAIL";
  console.log(`${icon} - ${label}${details ? ` -> ${details}` : ""}`);
  summary.push({ label, passed, details });
};

const getJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await getJson(response);

  return {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    body
  };
};

const jsonRequest = (url, method, payload, headers = {}) =>
  request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(payload)
  });

const assertOk = (result, expectedStatuses, label) => {
  if (!expectedStatuses.includes(result.status)) {
    const details = typeof result.body === "string"
      ? result.body
      : result.body?.message || JSON.stringify(result.body);
    throw new Error(`${label} failed with ${result.status}${details ? `: ${details}` : ""}`);
  }
};

const main = async () => {
  console.log("SmartApplyAI service smoke test");
  console.log("--------------------------------");

  let token = "";
  let userId = "";
  let profileId = "";
  let jobOfferId = "";

  try {
    const registerResult = await jsonRequest(
      `${baseUrls.auth}/auth/register`,
      "POST",
      testUser
    );
    assertOk(registerResult, [201], "Auth register");
    userId = registerResult.body?.user?.id || "";
    logStep("auth_service register", true, `user=${testUser.email}`);

    const loginResult = await jsonRequest(
      `${baseUrls.auth}/auth/login`,
      "POST",
      {
        email: testUser.email,
        password: testUser.password
      }
    );
    assertOk(loginResult, [200], "Auth login");
    token = loginResult.body?.access_token || "";
    if (!token) {
      throw new Error("Auth login did not return access_token");
    }
    logStep("auth_service login", true, "token received");

    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    const meResult = await request(`${baseUrls.auth}/users/me`, {
      method: "GET",
      headers: authHeaders
    });
    assertOk(meResult, [200], "Get current user");
    userId = meResult.body?.user?.id || userId;
    logStep("auth_service /users/me", true, meResult.body?.user?.email || "current user loaded");

    const profileCreateResult = await jsonRequest(
      `${baseUrls.profile}/profiles`,
      "POST",
      {
        professional_title: "Full Stack Developer",
        summary: "Smoke test profile for SmartApplyAI presentation.",
        phone: "0600000000",
        address: "Casablanca, Morocco",
        linkedin_url: "https://linkedin.com/in/demo-user",
        github_url: "https://github.com/demo-user",
        portfolio_url: "https://demo-user.dev"
      },
      authHeaders
    );
    assertOk(profileCreateResult, [201], "Create profile");
    profileId = profileCreateResult.body?.profile?.id || "";
    logStep("profile_service create profile", true, profileId || "profile created");

    const profileMeResult = await request(`${baseUrls.profile}/profiles/me`, {
      method: "GET",
      headers: authHeaders
    });
    assertOk(profileMeResult, [200], "Get my profile");
    profileId = profileMeResult.body?.profile?.id || profileId;
    logStep("profile_service /profiles/me", true, profileMeResult.body?.profile?.professional_title || "profile loaded");

    const jobCreateResult = await jsonRequest(
      `${baseUrls.job}/job-offers`,
      "POST",
      {
        jobTitle: "Software Engineer",
        company: "SmartApply Demo Company",
        description: "Build and improve SmartApplyAI features.",
        location: "Casablanca",
        employmentType: "Full-time"
      },
      authHeaders
    );
    assertOk(jobCreateResult, [201], "Create job offer");
    jobOfferId = jobCreateResult.body?.jobOffer?.id || "";
    logStep("job_service create job offer", true, jobOfferId || "job offer created");

    const jobsResult = await request(`${baseUrls.job}/job-offers`, {
      method: "GET",
      headers: authHeaders
    });
    assertOk(jobsResult, [200], "List job offers");
    logStep("job_service list job offers", true, `${jobsResult.body?.jobOffers?.length || 0} offers`);

    const aiModelsResult = await request(`${baseUrls.ai}/ai-models`, {
      method: "GET",
      headers: authHeaders
    });
    assertOk(aiModelsResult, [200], "List AI models");
    logStep("ai_service list models", true, `${aiModelsResult.body?.aiModels?.length || 0} models`);

    const templatesResult = await request(`${baseUrls.document}/api/templates`, {
      method: "GET"
    });
    assertOk(templatesResult, [200], "Get CV templates");
    logStep("document_service list templates", true, `${templatesResult.body?.data?.length || 0} templates`);

    const cvCreateResult = await jsonRequest(
      `${baseUrls.document}/api/documents/cv`,
      "POST",
      {
        fullName: "Demo User",
        email: testUser.email,
        phone: "0600000000",
        address: "Casablanca, Morocco",
        professionalTitle: "Full Stack Developer",
        summary: "Generated for smoke testing.",
        skills: ["React", "Node.js", "MongoDB"],
        languages: ["French", "English"],
        experience: [
          {
            jobTitle: "Frontend Developer",
            company: "SmartApply",
            startDate: "2024",
            endDate: "Present",
            bullets: ["Built a polished dashboard", "Integrated notifications"]
          }
        ],
        education: [
          {
            title: "Engineering Degree",
            school: "ENSA",
            period: "2020 - 2025"
          }
        ],
        ownerUserId: userId,
        targetPosition: "Software Engineer"
      }
    );
    assertOk(cvCreateResult, [201], "Create CV document");
    logStep("document_service generate CV", true, cvCreateResult.headers.get("x-document-id") || "pdf generated");

    const notificationsResult = await request(`${baseUrls.notification}/notifications/me`, {
      method: "GET",
      headers: authHeaders
    });
    assertOk(notificationsResult, [200], "List my notifications");
    logStep("notification_service list notifications", true, `${notificationsResult.body?.notifications?.length || 0} notifications`);

    console.log("--------------------------------");
    console.log("RESULT: ALL SERVICES PASSED");
    console.log(`Test user email: ${testUser.email}`);
    console.log("You can take a screenshot of this terminal output.");
  } catch (error) {
    logStep("global test run", false, error.message);
    console.log("--------------------------------");
    console.log("RESULT: TEST FAILED");
    console.log("Make sure docker compose services are running before retrying.");
    process.exitCode = 1;
  }
};

main();
