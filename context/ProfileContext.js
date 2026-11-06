"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { storage } from "@/libs/storage";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  DEMO_USER,
  DEMO_PROJECTS,
  DEMO_EXPERIENCE,
  DEMO_EDUCATION,
  DEMO_CERTIFICATIONS,
  DEMO_ACHIEVEMENTS,
  DEMO_RESUME,
} from "@/libs/mock-data";

const ProfileContext = createContext(null);
const EMPTY_RESUME = {
  fileName: "",
  fileSize: "",
  fileUrl: "",
  publicId: "",
  summary: "",
  updatedAt: null,
  downloadCount: 0,
};

function emptyProfileForUser(user) {
  return {
    ...DEMO_USER,
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    title: "",
    tagline: "",
    bio: "",
    location: "",
    phone: "",
    status: "",
    avatar: "",
    banner: "",
    isVerified: false,
    isPublished: false,
    skills: [],
    socials: [],
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: false,
      showResume: false,
      searchEngineIndexing: false,
      allowDiscovery: false,
      allowContactExchange: false,
      allowAnalytics: false,
    },
    customCta: { enabled: false, text: "", subtitle: "", url: "", style: "outline" },
  };
}

function getLocalProfileData(user) {
  const storageKey = (key) => `${key}_account_${user.id}`;
  const profile = storage.get(storageKey("user_profile"), null);
  const projects = storage.get(storageKey("user_projects"), null);
  const experience = storage.get(storageKey("user_experience"), null);
  const education = storage.get(storageKey("user_education"), null);
  const certifications = storage.get(storageKey("user_certifications"), null);
  const achievements = storage.get(storageKey("user_achievements"), null);
  const resume = storage.get(storageKey("user_resume"), null);

  if (![profile, projects, experience, education, certifications, achievements, resume].some(Boolean)) {
    return null;
  }

  return {
    profile: profile || emptyProfileForUser(user),
    projects: projects || [],
    experience: experience || [],
    education: education || [],
    certifications: certifications || [],
    achievements: achievements || [],
    resume: resume || EMPTY_RESUME,
  };
}

function getDemoProfileData() {
  return {
    profile: storage.get("user_profile", null) || DEMO_USER,
    projects: storage.get("user_projects", null) || DEMO_PROJECTS,
    experience: storage.get("user_experience", null) || DEMO_EXPERIENCE,
    education: storage.get("user_education", null) || DEMO_EDUCATION,
    certifications: storage.get("user_certifications", null) || DEMO_CERTIFICATIONS,
    achievements: storage.get("user_achievements", null) || DEMO_ACHIEVEMENTS,
    resume: storage.get("user_resume", null) || DEMO_RESUME,
  };
}

function getPersistableProfile(profile) {
  const profileFields = new Set([
    "title",
    "tagline",
    "bio",
    "location",
    "status",
    "phone",
    "avatar",
    "banner",
    "isPublished",
    "themeId",
    "customTheme",
    "skills",
    "socials",
    "customCta",
    "sectionOrder",
    "sectionVisibility",
    "privacy",
  ]);
  return Object.fromEntries(
    Object.entries(profile)
      .filter(([field]) => profileFields.has(field))
      .map(([field, value]) => [
        field,
        ["avatar", "banner"].includes(field) && typeof value === "string" && value.startsWith("data:")
          ? ""
          : value,
      ]),
  );
}

function getCloudinaryImagePublicId(url, ownerId) {
  if (typeof url !== "string" || !ownerId) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "res.cloudinary.com") return null;
    const match = parsedUrl.pathname.match(/\/image\/upload\/(?:v\d+\/)?(oneme\/[a-f0-9]{24}\/profile\/[a-f0-9]{32})\.[a-z0-9]+$/i);
    return match?.[1]?.startsWith(`oneme/${ownerId}/profile/`) ? match[1] : null;
  } catch {
    return null;
  }
}

function getCredentialImagePublicIds(certifications = [], achievements = [], ownerId) {
  const imageUrls = [...certifications, ...achievements]
    .map((item) => item?.image)
    .filter((image) => typeof image === "string");

  return imageUrls.flatMap((image) => {
    try {
      const parsedUrl = new URL(image);
      if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "res.cloudinary.com") return [];
      const match = parsedUrl.pathname.match(
        /\/image\/upload\/(?:v\d+\/)?(oneme\/[a-f0-9]{24}\/credentials\/[a-f0-9]{32})(?:\.[a-z0-9]+)?$/i,
      );
      return match?.[1]?.startsWith(`oneme/${ownerId}/credentials/`) ? [match[1]] : [];
    } catch {
      return [];
    }
  });
}

export function ProfileProvider({ children }) {
  const { user, isLoading: isAuthLoading, refreshSession } = useAuth();
  const userRef = useRef(user);
  const { error: toastError } = useToast();
  const [profile, setProfile] = useState(DEMO_USER);
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [experience, setExperience] = useState(DEMO_EXPERIENCE);
  const [education, setEducation] = useState(DEMO_EDUCATION);
  const [certifications, setCertifications] = useState(DEMO_CERTIFICATIONS);
  const [achievements, setAchievements] = useState(DEMO_ACHIEVEMENTS);
  const [resume, setResume] = useState(DEMO_RESUME);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedOwnerId, setLoadedOwnerId] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState("saved");
  const saveErrorShown = useRef(false);
  const savedImages = useRef({ avatar: "", banner: "", resume: "", credentials: [] });
  const storageKey = (key) => user ? `${key}_account_${user.id}` : key;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return undefined;
    const account = userRef.current;
    let active = true;
    // Account-specific data is loaded after authentication resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(false);
    setLoadedOwnerId(null);
    setDataVersion(0);
    setSavedVersion(0);
    setSaveStatus("saved");

    const applyData = (data, account) => {
      setProfile({
        ...(account ? emptyProfileForUser(account) : DEMO_USER),
        ...data.profile,
        ...(account ? {
          id: account.id,
          name: account.name,
          email: account.email,
          username: account.username,
        } : {}),
      });
      setProjects(data.projects);
      setExperience(data.experience);
      setEducation(data.education);
      setCertifications(data.certifications);
      setAchievements(data.achievements);
      setResume(data.resume);
    };

    async function loadProfile() {
      if (!account) {
        applyData(getDemoProfileData(), null);
        setLoadedOwnerId(DEMO_USER.id);
        setIsLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) throw new Error("Profile data could not be loaded.");
        const result = await response.json();
        const localData = result.isNew ? getLocalProfileData(account) : null;
        const data = localData || result.data;
        if (active) {
          applyData(data, account);
          savedImages.current = {
            avatar: data.profile.avatar || "",
            banner: data.profile.banner || "",
            resume: data.resume.publicId || "",
            credentials: getCredentialImagePublicIds(data.certifications, data.achievements, account.id),
          };
          setLoadedOwnerId(account.id);
          setDataVersion(localData ? 1 : 0);
          setSavedVersion(0);
        }
      } catch {
        if (active) {
          const localData = getLocalProfileData(account);
          const fallbackData = localData || {
            profile: emptyProfileForUser(account),
            projects: [],
            experience: [],
            education: [],
            certifications: [],
            achievements: [],
            resume: EMPTY_RESUME,
          };
          applyData(fallbackData, account);
          savedImages.current = {
            avatar: fallbackData.profile.avatar || "",
            banner: fallbackData.profile.banner || "",
            resume: fallbackData.resume.publicId || "",
            credentials: getCredentialImagePublicIds(
              fallbackData.certifications,
              fallbackData.achievements,
              account.id,
            ),
          };
          setLoadedOwnerId(null);
          setSaveStatus("unavailable");
          toastError("Your saved profile could not be loaded. Changes may not sync until the service is available.");
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [user?.id, isAuthLoading, toastError]);

  useEffect(() => {
    if (
      !user ||
      isAuthLoading ||
      !isLoaded ||
      loadedOwnerId !== user.id ||
      dataVersion <= savedVersion
    ) return undefined;

    const versionToSave = dataVersion;
    const profileSnapshot = {
      profile: getPersistableProfile(profile),
      projects,
      experience,
      education,
      certifications,
      achievements,
      resume,
    };
    let active = true;
    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileSnapshot),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Profile changes could not be saved.");
        if (active) {
          const nextImages = {
            avatar: profileSnapshot.profile.avatar || "",
            banner: profileSnapshot.profile.banner || "",
            resume: profileSnapshot.resume.publicId || "",
            credentials: getCredentialImagePublicIds(
              profileSnapshot.certifications,
              profileSnapshot.achievements,
              user.id,
            ),
          };
          const previousImages = savedImages.current;
          savedImages.current = nextImages;
          setSavedVersion(versionToSave);
          setSaveStatus("saved");
          saveErrorShown.current = false;
          for (const kind of ["avatar", "banner", "resume"]) {
            if (previousImages[kind] === nextImages[kind]) continue;
            const publicId = kind === "resume"
              ? previousImages.resume.startsWith(`oneme/${user.id}/resume/`) ? previousImages.resume : null
              : getCloudinaryImagePublicId(previousImages[kind], user.id);
            if (!publicId) continue;
            try {
              const deleteResponse = await fetch("/api/uploads/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId }),
              });
              if (!deleteResponse.ok) {
                throw new Error("Old profile image could not be removed.");
              }
            } catch {
              toastError("Profile saved, but an older image could not be removed.");
            }
          }
          for (const publicId of previousImages.credentials) {
            if (nextImages.credentials.includes(publicId)) continue;
            try {
              const deleteResponse = await fetch("/api/uploads/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId }),
              });
              if (!deleteResponse.ok) throw new Error("Old credential image could not be removed.");
            } catch {
              toastError("Profile saved, but an old credential image could not be removed.");
            }
          }
        }
      } catch {
        if (active) {
          setSaveStatus("error");
          if (!saveErrorShown.current) {
            toastError("Your profile changes could not be saved. Please try again when the service is available.");
            saveErrorShown.current = true;
          }
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    user,
    isAuthLoading,
    isLoaded,
    loadedOwnerId,
    dataVersion,
    savedVersion,
    profile,
    projects,
    experience,
    education,
    certifications,
    achievements,
    resume,
    toastError,
  ]);

  const markDirty = () => {
    if (user) {
      setSaveStatus("dirty");
      saveErrorShown.current = false;
      setDataVersion((version) => version + 1);
    }
  };

  const retryProfileSave = () => {
    if (!user || loadedOwnerId !== user.id) return;
    setSaveStatus("dirty");
    setDataVersion((version) => Math.max(version + 1, savedVersion + 1));
  };

  const hasActiveAccountProfile = user
    ? profile.id === user.id
    : profile.id === DEMO_USER.id;
  const visibleProfile = hasActiveAccountProfile
    ? profile
    : user ? emptyProfileForUser(user) : DEMO_USER;
  const visibleProjects = hasActiveAccountProfile ? projects : user ? [] : DEMO_PROJECTS;
  const visibleExperience = hasActiveAccountProfile ? experience : user ? [] : DEMO_EXPERIENCE;
  const visibleEducation = hasActiveAccountProfile ? education : user ? [] : DEMO_EDUCATION;
  const visibleCertifications = hasActiveAccountProfile ? certifications : user ? [] : DEMO_CERTIFICATIONS;
  const visibleAchievements = hasActiveAccountProfile ? achievements : user ? [] : DEMO_ACHIEVEMENTS;
  const visibleResume = hasActiveAccountProfile
    ? resume
    : user ? EMPTY_RESUME : DEMO_RESUME;

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      storage.set(storageKey("user_profile"), updated);
      return updated;
    });
    markDirty();
  };

  const saveAccountIdentity = async ({ name, username }) => {
    if (!user || profile.id !== user.id) {
      throw new Error("Sign in to update your account profile.");
    }

    const response = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Account profile could not be saved.");

    setProfile((current) => ({
      ...current,
      name: result.user.name,
      username: result.user.username,
    }));
    await refreshSession();
  };

  const updateSectionOrder = (newOrder) => updateProfile({ sectionOrder: newOrder });

  const toggleSectionVisibility = (sectionKey) => {
    setProfile((prev) => {
      const newVisibility = {
        ...visibleProfile.sectionVisibility,
        [sectionKey]: !visibleProfile.sectionVisibility?.[sectionKey],
      };
      const base = hasActiveAccountProfile ? prev : visibleProfile;
      const updated = { ...base, sectionVisibility: newVisibility };
      storage.set(storageKey("user_profile"), updated);
      return updated;
    });
    markDirty();
  };

  const addProject = (newProject) => {
    const projectWithId = { ...newProject, featured: false, id: `proj_${Date.now()}` };
    setProjects((prev) => {
      const updated = [projectWithId, ...prev];
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
    markDirty();
  };

  const updateProject = (id, updates) => {
    setProjects((prev) => {
      const updated = prev.map((project) => project.id === id ? { ...project, ...updates } : project);
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
    markDirty();
  };

  const deleteProject = (id) => {
    setProjects((prev) => {
      const updated = prev.filter((project) => project.id !== id);
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
    markDirty();
  };

  const addExperience = (newExperience) => {
    const item = { highlights: [], ...newExperience, id: `exp_${Date.now()}` };
    setExperience((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
    markDirty();
  };

  const updateExperience = (id, updates) => {
    setExperience((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
    markDirty();
  };

  const deleteExperience = (id) => {
    setExperience((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
    markDirty();
  };

  const addEducation = (newEducation) => {
    const item = { ...newEducation, id: `edu_${Date.now()}` };
    setEducation((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
    markDirty();
  };

  const updateEducation = (id, updates) => {
    setEducation((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
    markDirty();
  };

  const deleteEducation = (id) => {
    setEducation((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
    markDirty();
  };

  const addCertification = (newCertification) => {
    const item = { credentialId: "", image: "", ...newCertification, id: `cert_${Date.now()}` };
    setCertifications((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_certifications"), updated);
      return updated;
    });
    markDirty();
  };

  const updateCertification = (id, updates) => {
    setCertifications((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      storage.set(storageKey("user_certifications"), updated);
      return updated;
    });
    markDirty();
  };

  const deleteCertification = (id) => {
    setCertifications((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.set(storageKey("user_certifications"), updated);
      return updated;
    });
    markDirty();
  };

  const addAchievement = (newAchievement) => {
    const item = { image: "", ...newAchievement, id: `ach_${Date.now()}` };
    setAchievements((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_achievements"), updated);
      return updated;
    });
    markDirty();
  };

  const updateAchievement = (id, updates) => {
    setAchievements((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      storage.set(storageKey("user_achievements"), updated);
      return updated;
    });
    markDirty();
  };

  const updateResume = (updates) => {
    setResume((previous) => {
      const updated = { ...previous, ...updates };
      storage.set(storageKey("user_resume"), updated);
      return updated;
    });
    markDirty();
  };

  const deleteAchievement = (id) => {
    setAchievements((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.set(storageKey("user_achievements"), updated);
      return updated;
    });
    markDirty();
  };

  const resetToDemo = () => {
    const emptyProfile = user ? emptyProfileForUser(user) : DEMO_USER;
    setProfile(emptyProfile);
    setProjects(user ? [] : DEMO_PROJECTS);
    setExperience(user ? [] : DEMO_EXPERIENCE);
    setEducation(user ? [] : DEMO_EDUCATION);
    setCertifications(user ? [] : DEMO_CERTIFICATIONS);
    setAchievements(user ? [] : DEMO_ACHIEVEMENTS);
    setResume(user ? EMPTY_RESUME : DEMO_RESUME);

    [
      "user_profile",
      "user_projects",
      "user_experience",
      "user_education",
      "user_certifications",
      "user_achievements",
      "user_resume",
    ].forEach((key) => storage.remove(storageKey(key)));
    markDirty();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile: visibleProfile,
        projects: visibleProjects,
        experience: visibleExperience,
        education: visibleEducation,
        certifications: visibleCertifications,
        achievements: visibleAchievements,
        resume: visibleResume,
        isLoaded,
        saveStatus,
        retryProfileSave,
        saveAccountIdentity,
        updateProfile,
        updateSectionOrder,
        toggleSectionVisibility,
        addProject,
        updateProject,
        deleteProject,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        addCertification,
        updateCertification,
        deleteCertification,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        updateResume,
        resetToDemo,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
