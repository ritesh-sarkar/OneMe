"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/libs/storage";
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

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEMO_USER);
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [experience, setExperience] = useState(DEMO_EXPERIENCE);
  const [education, setEducation] = useState(DEMO_EDUCATION);
  const [certifications, setCertifications] = useState(DEMO_CERTIFICATIONS);
  const [achievements, setAchievements] = useState(DEMO_ACHIEVEMENTS);
  const [resume, setResume] = useState(DEMO_RESUME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = storage.get("user_profile", null);
    const savedProjects = storage.get("user_projects", null);
    const savedExperience = storage.get("user_experience", null);
    const savedEducation = storage.get("user_education", null);
    const savedCertifications = storage.get("user_certifications", null);
    const savedAchievements = storage.get("user_achievements", null);
    const savedResume = storage.get("user_resume", null);

    if (savedProfile) setProfile(savedProfile);
    if (savedProjects) setProjects(savedProjects);
    if (savedExperience) setExperience(savedExperience);
    if (savedEducation) setEducation(savedEducation);
    if (savedCertifications) setCertifications(savedCertifications);
    if (savedAchievements) setAchievements(savedAchievements);
    if (savedResume) setResume(savedResume);

    setIsLoaded(true);
  }, []);

  // Update profile attributes
  const updateProfile = (updates) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      storage.set("user_profile", updated);
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
        ...prev.sectionVisibility,
        [sectionKey]: !prev.sectionVisibility?.[sectionKey],
      };
      const updated = { ...prev, sectionVisibility: newVisibility };
      storage.set("user_profile", updated);
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
      storage.set("user_projects", updated);
      return updated;
    });
  };

  const updateProject = (id, updates) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      storage.set("user_projects", updated);
      return updated;
    });
  };

  const deleteProject = (id) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      storage.set("user_projects", updated);
      return updated;
    });
  };

  // Experience CRUD
  const addExperience = (newExp) => {
    const item = { ...newExp, id: `exp_${Date.now()}` };
    setExperience((prev) => {
      const updated = [item, ...prev];
      storage.set("user_experience", updated);
      return updated;
    });
  };

  const updateExperience = (id, updates) => {
    setExperience((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      storage.set("user_experience", updated);
      return updated;
    });
  };

  const deleteExperience = (id) => {
    setExperience((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      storage.set("user_experience", updated);
      return updated;
    });
  };

  // Education CRUD
  const addEducation = (newEdu) => {
    const item = { ...newEdu, id: `edu_${Date.now()}` };
    setEducation((prev) => {
      const updated = [item, ...prev];
      storage.set("user_education", updated);
      return updated;
    });
  };

  const updateEducation = (id, updates) => {
    setEducation((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      storage.set("user_education", updated);
      return updated;
    });
  };

  const deleteEducation = (id) => {
    setEducation((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      storage.set("user_education", updated);
      return updated;
    });
  };

  // Certifications CRUD
  const addCertification = (newCert) => {
    const item = { ...newCert, id: `cert_${Date.now()}` };
    setCertifications((prev) => {
      const updated = [item, ...prev];
      storage.set("user_certifications", updated);
      return updated;
    });
  };

  const deleteCertification = (id) => {
    setCertifications((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.set("user_certifications", updated);
      return updated;
    });
  };

  // Reset to original demo
  const resetToDemo = () => {
    setProfile(DEMO_USER);
    setProjects(DEMO_PROJECTS);
    setExperience(DEMO_EXPERIENCE);
    setEducation(DEMO_EDUCATION);
    setCertifications(DEMO_CERTIFICATIONS);
    setAchievements(DEMO_ACHIEVEMENTS);
    setResume(DEMO_RESUME);

    storage.remove("user_profile");
    storage.remove("user_projects");
    storage.remove("user_experience");
    storage.remove("user_education");
    storage.remove("user_certifications");
    storage.remove("user_achievements");
    storage.remove("user_resume");
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        projects,
        experience,
        education,
        certifications,
        achievements,
        resume,
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
