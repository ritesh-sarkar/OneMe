"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/libs/storage";
import { useAuth } from "@/context/AuthContext";
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
    status: "",
    avatar: "",
    banner: "",
    isVerified: false,
    isPublished: false,
    skills: [],
    socials: [],
    customCta: { enabled: false, text: "", subtitle: "", url: "", style: "outline" },
  };
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const storageKey = (key) => user ? `${key}_account_${user.id}` : key;
  const [profile, setProfile] = useState(DEMO_USER);
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [experience, setExperience] = useState(DEMO_EXPERIENCE);
  const [education, setEducation] = useState(DEMO_EDUCATION);
  const [certifications, setCertifications] = useState(DEMO_CERTIFICATIONS);
  const [achievements, setAchievements] = useState(DEMO_ACHIEVEMENTS);
  const [resume, setResume] = useState(DEMO_RESUME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProfile = storage.get(storageKey("user_profile"), null);
    const savedProjects = storage.get(storageKey("user_projects"), null);
    const savedExperience = storage.get(storageKey("user_experience"), null);
    const savedEducation = storage.get(storageKey("user_education"), null);
    const savedCertifications = storage.get(storageKey("user_certifications"), null);
    const savedAchievements = storage.get(storageKey("user_achievements"), null);
    const savedResume = storage.get(storageKey("user_resume"), null);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(user
      ? { ...(savedProfile || emptyProfileForUser(user)), id: user.id, name: user.name, email: user.email, username: user.username }
      : savedProfile || DEMO_USER);
    setProjects(savedProjects || (user ? [] : DEMO_PROJECTS));
    setExperience(savedExperience || (user ? [] : DEMO_EXPERIENCE));
    setEducation(savedEducation || (user ? [] : DEMO_EDUCATION));
    setCertifications(savedCertifications || (user ? [] : DEMO_CERTIFICATIONS));
    setAchievements(savedAchievements || (user ? [] : DEMO_ACHIEVEMENTS));
    setResume(savedResume || (user ? { fileName: "", fileSize: "", summary: "", updatedAt: null, downloadCount: 0 } : DEMO_RESUME));

    setIsLoaded(true);
  }, [user]);

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
    : user
      ? { fileName: "", fileSize: "", summary: "", updatedAt: null, downloadCount: 0 }
      : DEMO_RESUME;

  // Update profile attributes
  const updateProfile = (updates) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      storage.set(storageKey("user_profile"), updated);
      return updated;
    });
  };

  // Section order & visibility
  const updateSectionOrder = (newOrder) => {
    updateProfile({ sectionOrder: newOrder });
  };

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
  };

  // Project CRUD
  const addProject = (newProject) => {
    const projectWithId = {
      ...newProject,
      id: `proj_${Date.now()}`,
    };
    setProjects((prev) => {
      const updated = [projectWithId, ...prev];
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
  };

  const updateProject = (id, updates) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
  };

  const deleteProject = (id) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      storage.set(storageKey("user_projects"), updated);
      return updated;
    });
  };

  // Experience CRUD
  const addExperience = (newExp) => {
    const item = { ...newExp, id: `exp_${Date.now()}` };
    setExperience((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
  };

  const updateExperience = (id, updates) => {
    setExperience((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
  };

  const deleteExperience = (id) => {
    setExperience((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      storage.set(storageKey("user_experience"), updated);
      return updated;
    });
  };

  // Education CRUD
  const addEducation = (newEdu) => {
    const item = { ...newEdu, id: `edu_${Date.now()}` };
    setEducation((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
  };

  const updateEducation = (id, updates) => {
    setEducation((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
  };

  const deleteEducation = (id) => {
    setEducation((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      storage.set(storageKey("user_education"), updated);
      return updated;
    });
  };

  // Certifications CRUD
  const addCertification = (newCert) => {
    const item = { ...newCert, id: `cert_${Date.now()}` };
    setCertifications((prev) => {
      const updated = [item, ...prev];
      storage.set(storageKey("user_certifications"), updated);
      return updated;
    });
  };

  const deleteCertification = (id) => {
    setCertifications((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.set(storageKey("user_certifications"), updated);
      return updated;
    });
  };

  const resetToDemo = () => {
    setProfile(user ? emptyProfileForUser(user) : DEMO_USER);
    setProjects(user ? [] : DEMO_PROJECTS);
    setExperience(user ? [] : DEMO_EXPERIENCE);
    setEducation(user ? [] : DEMO_EDUCATION);
    setCertifications(user ? [] : DEMO_CERTIFICATIONS);
    setAchievements(user ? [] : DEMO_ACHIEVEMENTS);
    setResume(user ? { fileName: "", fileSize: "", summary: "", updatedAt: null, downloadCount: 0 } : DEMO_RESUME);

    ["user_profile", "user_projects", "user_experience", "user_education", "user_certifications", "user_achievements", "user_resume"]
      .forEach((key) => storage.remove(storageKey(key)));
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
        deleteCertification,
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
