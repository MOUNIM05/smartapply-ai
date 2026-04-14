/**
 * Couche service - skill.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Profile } = require("../models/profile.model");
const { Skill } = require("../models/skill.model");
const { sendNotification } = require("./notification-client.service");

const serializeSkill = (skill) => ({
  id: skill._id,
  profile_id: skill.profile_id,
  name: skill.name,
  createdAt: skill.createdAt,
  updatedAt: skill.updatedAt
});

const getProfileByUserIdOrThrow = async (userId) => {
  const profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

const getSkillByIdForProfileOrThrow = async (profileId, skillId) => {
  const skill = await Skill.findOne({
    _id: skillId,
    profile_id: profileId
  });

  if (!skill) {
    const error = new Error("Skill not found");
    error.statusCode = 404;
    throw error;
  }

  return skill;
};

const listMySkills = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const skills = await Skill.find({ profile_id: profile._id }).sort({
    createdAt: -1
  });

  return {
    skills: skills.map(serializeSkill)
  };
};

const createSkill = async (userId, payload) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const skill = await Skill.create({
    profile_id: profile._id,
    ...payload
  });

  await sendNotification({
    userId: String(userId),
    title: "Competence ajoutee",
    message: `La competence ${skill.name} a ete ajoutee a votre profil.`,
    type: "skill",
    event: "skill_created",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      skillId: String(skill._id)
    }
  });

  return {
    message: "Skill created successfully",
    skill: serializeSkill(skill)
  };
};

const updateSkill = async (userId, skillId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const skill = await getSkillByIdForProfileOrThrow(profile._id, skillId);

  Object.assign(skill, updates);
  await skill.save();

  await sendNotification({
    userId: String(userId),
    title: "Competence mise a jour",
    message: `La competence ${skill.name} a ete mise a jour.`,
    type: "skill",
    event: "skill_updated",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      skillId: String(skill._id),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Skill updated successfully",
    skill: serializeSkill(skill)
  };
};

const deleteSkill = async (userId, skillId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const skill = await getSkillByIdForProfileOrThrow(profile._id, skillId);
  await Skill.findByIdAndDelete(skillId);

  await sendNotification({
    userId: String(userId),
    title: "Competence supprimee",
    message: `La competence ${skill.name} a ete supprimee de votre profil.`,
    type: "skill",
    event: "skill_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      skillId: String(skill._id)
    }
  });

  return {
    message: "Skill deleted successfully"
  };
};

module.exports = {
  listMySkills,
  createSkill,
  updateSkill,
  deleteSkill
};

