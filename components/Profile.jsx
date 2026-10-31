"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

//icons
import {
  FiUser,
  FiFileText,
  FiGlobe,
  FiCode,
  FiLayers,
  FiZap,
  FiSave,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiArrowUp,
  FiArrowDown,
  FiCpu,
  FiUploadCloud,
  FiImage,
} from "react-icons/fi";

//Custom Components and libs
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { Tabs } from "@/components/Tabs";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { PublicProfileView } from "@/components/PublicProfileView";

const EDITOR_TABS = [
  { id: "personal", label: "Personal", icon: FiUser },
  { id: "bio", label: "Bio & About", icon: FiFileText },
  { id: "socials", label: "Socials", icon: FiGlobe },
  { id: "skills", label: "Skills", icon: FiCode },
  { id: "cta", label: "Custom CTA", icon: FiZap },
  { id: "builder", label: "Page Builder", icon: FiLayers },
];

export default function ProfileEditorPage() {
  const {
    profile,
    projects,
    experience,
    education,
    certifications,
    achievements,
    resume,
    updateProfile,
    updateSectionOrder,
    toggleSectionVisibility,
    resetToDemo,
  } = useProfile();
  const { success, info, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Expert");
  const [uploadingImage, setUploadingImage] = useState("");

  // File upload refs
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // AI Profile Assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Form handlers
  const handleInputChange = (field, value) => {
    updateProfile({ [field]: value });
  };
  const handleCustomCtaChange = (field, value) => {
    updateProfile({
      customCta: {
        ...profile.customCta,
        [field]: value,
      },
    });
  };

  const handleImageUpload = async (event, kind) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      info("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      info("Please select an image smaller than 5MB.");
      return;
    }

    setUploadingImage(kind);
    try {
      const signatureResponse = await fetch("/api/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const signature = await signatureResponse.json();
      if (!signatureResponse.ok) {
        throw new Error(signature.error || "Image upload is unavailable.");
      }

      const formData = new FormData();
      Object.entries(signature.params).forEach(([key, value]) => formData.append(key, String(value)));
      formData.append("api_key", signature.apiKey);
      formData.append("signature", signature.signature);
      formData.append("file", file);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
        { method: "POST", body: formData },
      );
      const uploadResult = await uploadResponse.json();
      const uploadedUrl = new URL(uploadResult.secure_url || "");
      if (
        !uploadResponse.ok ||
        uploadedUrl.protocol !== "https:" ||
        uploadedUrl.hostname !== "res.cloudinary.com" ||
        !uploadResult.public_id?.startsWith(`oneme/${profile.id}/profile/`)
      ) {
        throw new Error("The image provider rejected the upload.");
      }

      updateProfile({ [kind]: uploadedUrl.toString() });
      success(kind === "avatar" ? "Avatar photo updated." : "Banner image updated.");
    } catch (uploadError) {
      toastError(uploadError.message || "Image upload failed. Please try again.");
    } finally {
      setUploadingImage("");
    }
  };
  const handleAvatarUpload = (event) => handleImageUpload(event, "avatar");
  const handleBannerUpload = (event) => handleImageUpload(event, "banner");
  const handleAddSocial = () => {
    const newSocial = {
      id: `soc_${Date.now()}`,
      platform: "website",
      label: "Portfolio Website",
      url: "https://mywebsite.dev",
      handle: "mywebsite.dev",
      featured: true,
    };
    const updated = [...(profile.socials || []), newSocial];
    updateProfile({ socials: updated });
    success("New social link added.");
  };
  const handleUpdateSocial = (id, field, value) => {
    const updated = (profile.socials || []).map((s) =>
      s.id === id ? { ...s, [field]: value } : s,
    );
    updateProfile({ socials: updated });
  };
  const handleDeleteSocial = (id) => {
    const updated = (profile.socials || []).filter((s) => s.id !== id);
    updateProfile({ socials: updated });
    info("Social link removed.");
  };
  const handleAddSkill = (e) => {
    e?.preventDefault();
    if (!newSkillName.trim()) return;
    const newSkill = { name: newSkillName.trim(), level: newSkillLevel };
    const updated = [...(profile.skills || []), newSkill];
    updateProfile({ skills: updated });
    setNewSkillName("");
    success(`Added skill: ${newSkill.name}`);
  };
  const handleDeleteSkill = (index) => {
    const updated = (profile.skills || []).filter((_, i) => i !== index);
    updateProfile({ skills: updated });
  };

  // Section Ordering
  const moveSection = (index, direction) => {
    const order = [...(profile.sectionOrder || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;
    updateSectionOrder(order);
  };

  const handleGenerateWithAi = async () => {
    if (aiPrompt.trim().length < 20) {
      info("Describe your background in at least 20 characters.");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/ai/profile-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI suggestions could not be generated.");

      updateProfile({
        bio: result.suggestions.bio,
        tagline: result.suggestions.tagline,
        customCta: {
          ...profile.customCta,
          text: result.suggestions.cta,
        },
      });
      setAiModalOpen(false);
      success("AI-generated profile copy was applied. Review it before publishing.");
    } catch (error) {
      toastError(error.message || "AI suggestions could not be generated.");
    } finally {
      setAiGenerating(false);
    }
  };
  return (
    <div
      className="
                        space-y-8
                      "
    >
      {/* Header */}
      <div
        className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        justify-between
                        gap-4
                      "
      >
        <div>
          <h1
            className="
                        text-2xl
                        sm:text-3xl
                        font-black
                        text-primary
                        tracking-tight
                      "
          >
            Profile Editor
          </h1>
          <p
            className="
                        text-xs
                        sm:text-sm
                        text-secondary
                      "
          >
            Real-time identity editor with individual section saves and instant
            live synchronization.
          </p>
        </div>
        <div
          className="
                        flex
                        items-center
                        gap-2
                      "
        >
          <Button
            onClick={() => setAiModalOpen(true)}
            variant="glow"
            size="sm"
            icon={FiCpu}
          >
            AI Assistant
          </Button>
          <Button
            onClick={() => {
              resetToDemo();
              success("Profile reset to original demo data.");
            }}
            variant="outline"
            size="sm"
            icon={FiRefreshCw}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Editor & Live Preview Split-View Grid */}
      <div
        className="
                        grid
                        grid-cols-1
                        lg:grid-cols-12
                        gap-8
                        items-start
                      "
      >
        {/* Left Column: Form Tabs & Controls */}
        <div
          className="
                        lg:col-span-7
                        space-y-6
                      "
        >
          <Tabs
            tabs={EDITOR_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <div
            className="
                        p-6
                        sm:p-8
                        rounded-3xl
                        bg-glass
                        border
                        border-subtle
                        backdrop-blur-xl
                        shadow-xl
                        space-y-6
                      "
          >
            {/* Tab: Personal */}
            {activeTab === "personal" && (
              <div
                className="
                        space-y-6
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <h3
                    className="
                        text-sm
                        font-bold
                        text-primary
                      "
                  >
                    Personal Information & Media
                  </h3>
                  <Button
                    onClick={() =>
                      success(
                        "Personal information saved successfully!",
                        "Saved",
                      )
                    }
                    variant="primary"
                    size="sm"
                    icon={FiSave}
                  >
                    Save Personal Info
                  </Button>
                </div>

                {/* Avatar & Banner Upload Area */}
                <div
                  className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                >
                  {/* Avatar Upload */}
                  <div
                    className="
                        p-4
                        rounded-2xl
                        bg-surface-dark/80
                        border
                        border-subtle
                        space-y-3
                      "
                  >
                    <label
                      className="
                        text-xs
                        font-semibold
                        text-secondary
                        block
                      "
                    >
                      Profile Avatar
                    </label>
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <img
                        src={
                          profile.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                        }
                        alt="Avatar Preview"
                        className="
                        w-14
                        h-14
                        rounded-full
                        object-cover
                        border-2
                        border-accent/40
                        shrink-0
                      "
                      />
                      <div
                        className="
                        space-y-1.5
                        flex-1
                      "
                      >
                        <input
                          type="file"
                          ref={avatarInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="
                        hidden
                      "
                        />
                        <Button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          isLoading={uploadingImage === "avatar"}
                          icon={FiUploadCloud}
                          className="
                        w-full
                        text-xs
                      "
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div
                    className="
                        p-4
                        rounded-2xl
                        bg-surface-dark/80
                        border
                        border-subtle
                        space-y-3
                      "
                  >
                    <label
                      className="
                        text-xs
                        font-semibold
                        text-secondary
                        block
                      "
                    >
                      Cover Banner
                    </label>
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                        w-20
                        h-14
                        rounded-xl
                        overflow-hidden
                        bg-surface-deep
                        border
                        border-subtle
                        shrink-0
                      "
                      >
                        <img
                          src={
                            profile.banner ||
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
                          }
                          alt="Banner Preview"
                          className="
                        w-full
                        h-full
                        object-cover
                      "
                        />
                      </div>
                      <div
                        className="
                        space-y-1.5
                        flex-1
                      "
                      >
                        <input
                          type="file"
                          ref={bannerInputRef}
                          onChange={handleBannerUpload}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="
                        hidden
                      "
                        />
                        <Button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          isLoading={uploadingImage === "banner"}
                          icon={FiImage}
                          className="
                        w-full
                        text-xs
                      "
                        >
                          Upload Banner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                >
                  <Input
                    label="Full Name"
                    value={profile.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ritesh Sarkar"
                  />
                  <Input
                    label="Username / Slug"
                    value={profile.username || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "username",
                        e.target.value.toLowerCase().replace(/\s+/g, ""),
                      )
                    }
                    placeholder="ritesh"
                  />
                </div>
                <Input
                  label="Professional Title"
                  value={profile.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Full-Stack Developer"
                />
                <Input
                  label="Tagline (Subheader)"
                  value={profile.tagline || ""}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="Building useful things with code."
                />
                <div
                  className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                >
                  <Input
                    label="Location"
                    value={profile.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Dhaka, Bangladesh"
                  />
                  <Input
                    label="Availability Status"
                    value={profile.status || ""}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    placeholder="Open to freelance work"
                  />
                </div>
                <div
                  className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                >
                  <Input
                    label="Email Address"
                    value={profile.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ritesh@sarkar.dev"
                  />
                  <Input
                    label="Phone Number"
                    value={profile.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+880 1712-345678"
                  />
                </div>
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success(
                        "Personal information saved successfully!",
                        "Saved",
                      )
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save Personal Info
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Bio & About */}
            {activeTab === "bio" && (
              <div
                className="
                        space-y-5
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <h3
                    className="
                        text-sm
                        font-bold
                        text-primary
                      "
                  >
                    About & Bio
                  </h3>
                  <div
                    className="
                        flex
                        items-center
                        gap-2
                      "
                  >
                    <button
                      type="button"
                      onClick={() => setAiModalOpen(true)}
                      className="
                        text-xs
                        text-accent
                        hover:text-accent
                        flex
                        items-center
                        gap-1
                        font-semibold
                      "
                    >
                      <FiCpu
                        className="
                        w-3.5
                        h-3.5
                      "
                      />
                      <span>Generate with AI</span>
                    </button>
                    <Button
                      onClick={() =>
                        success("Bio & executive summary saved!", "Saved")
                      }
                      variant="primary"
                      size="sm"
                      icon={FiSave}
                    >
                      Save Bio
                    </Button>
                  </div>
                </div>
                <Textarea
                  label="Executive Summary & Bio"
                  rows={6}
                  value={profile.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a compelling story about your career, goals, and passions..."
                />
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success("Bio & executive summary saved!", "Saved")
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save Bio & About
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Socials */}
            {activeTab === "socials" && (
              <div
                className="
                        space-y-5
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <h3
                    className="
                        text-sm
                        font-bold
                        text-primary
                      "
                  >
                    Socials & Direct Links
                  </h3>
                  <div
                    className="
                        flex
                        items-center
                        gap-2
                      "
                  >
                    <Button
                      onClick={handleAddSocial}
                      variant="outline"
                      size="sm"
                      icon={FiPlus}
                    >
                      Add Link
                    </Button>
                    <Button
                      onClick={() =>
                        success("Social links saved successfully!", "Saved")
                      }
                      variant="primary"
                      size="sm"
                      icon={FiSave}
                    >
                      Save Socials
                    </Button>
                  </div>
                </div>
                <div
                  className="
                        space-y-3
                      "
                >
                  {(profile.socials || []).map((soc) => (
                    <div
                      key={soc.id}
                      className="
                        p-4
                        rounded-2xl
                        bg-surface-dark/70
                        border
                        border-subtle
                        space-y-3
                      "
                    >
                      <div
                        className="
                        grid
                        grid-cols-1
                        sm:grid-cols-3
                        gap-3
                      "
                      >
                        <Input
                          label="Platform Label"
                          value={soc.label}
                          onChange={(e) =>
                            handleUpdateSocial(soc.id, "label", e.target.value)
                          }
                        />
                        <Input
                          label="Handle / Display"
                          value={soc.handle}
                          onChange={(e) =>
                            handleUpdateSocial(soc.id, "handle", e.target.value)
                          }
                        />
                        <div
                          className="
                        flex
                        items-end
                        gap-2
                      "
                        >
                          <div
                            className="
                        flex-1
                      "
                          >
                            <Input
                              label="Profile URL"
                              value={soc.url}
                              onChange={(e) =>
                                handleUpdateSocial(
                                  soc.id,
                                  "url",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSocial(soc.id)}
                            className="
                        p-2.5
                        rounded-xl
                        bg-danger-soft
                        text-danger
                        hover:bg-danger-soft
                        transition-colors
                        mb-0.5
                      "
                            title="Remove Link"
                          >
                            <FiTrash2
                              className="
                        w-4
                        h-4
                      "
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success("Social links saved successfully!", "Saved")
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save Social Links
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Skills */}
            {activeTab === "skills" && (
              <div
                className="
                        space-y-5
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <h3
                    className="
                        text-sm
                        font-bold
                        text-primary
                      "
                  >
                    Skills & Technical Stack
                  </h3>
                  <Button
                    onClick={() =>
                      success("Skills list saved successfully!", "Saved")
                    }
                    variant="primary"
                    size="sm"
                    icon={FiSave}
                  >
                    Save Skills
                  </Button>
                </div>
                <form
                  onSubmit={handleAddSkill}
                  className="
                        flex
                        gap-2
                      "
                >
                  <div
                    className="
                        flex-1
                      "
                  >
                    <Input
                      placeholder="e.g. TypeScript, GraphQL, Docker..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="
                        rounded-xl
                        bg-surface-deep
                        border
                        border-subtle
                        px-3
                        py-2
                        text-xs
                        text-primary
                      "
                  >
                    <option value="Expert">Expert</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                  </select>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={FiPlus}
                  >
                    Add
                  </Button>
                </form>
                <div
                  className="
                        flex
                        flex-wrap
                        gap-2
                        pt-2
                      "
                >
                  {(profile.skills || []).map((skill, index) => {
                    const name = typeof skill === "string" ? skill : skill.name;
                    const level =
                      typeof skill === "object" ? skill.level : null;
                    return (
                      <div
                        key={index}
                        className="
                        inline-flex
                        items-center
                        gap-2
                        px-3
                        py-1.5
                        rounded-xl
                        bg-surface-dark
                        border
                        border-subtle
                        text-xs
                        text-primary
                      "
                      >
                        <span>{name}</span>
                        {level && (
                          <span
                            className="
                        text-[10px]
                        text-accent
                        font-mono
                      "
                          >
                            {level}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(index)}
                          className="
                        text-muted
                        hover:text-danger
                        ml-1
                      "
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success("Skills list saved successfully!", "Saved")
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save Skills
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Custom CTA */}
            {activeTab === "cta" && (
              <div
                className="
                        space-y-5
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <h3
                    className="
                        text-sm
                        font-bold
                        text-primary
                      "
                  >
                    Custom Call-to-Action
                  </h3>
                  <Button
                    onClick={() =>
                      success("Custom CTA settings saved!", "Saved")
                    }
                    variant="primary"
                    size="sm"
                    icon={FiSave}
                  >
                    Save CTA
                  </Button>
                </div>
                <Toggle
                  label="Enable Custom CTA Banner"
                  checked={profile.customCta?.enabled !== false}
                  onChange={(checked) =>
                    handleCustomCtaChange("enabled", checked)
                  }
                />
                <div
                  className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                >
                  <Input
                    label="Button Text"
                    value={profile.customCta?.text || ""}
                    onChange={(e) =>
                      handleCustomCtaChange("text", e.target.value)
                    }
                    placeholder="Hire Me for Projects"
                  />
                  <Input
                    label="Subtitle"
                    value={profile.customCta?.subtitle || ""}
                    onChange={(e) =>
                      handleCustomCtaChange("subtitle", e.target.value)
                    }
                    placeholder="Available for freelance & full-time"
                  />
                </div>
                <Input
                  label="Destination URL / Mailto link"
                  value={profile.customCta?.url || ""}
                  onChange={(e) => handleCustomCtaChange("url", e.target.value)}
                  placeholder="mailto:ritesh@sarkar.dev?subject=Project"
                />
                <div
                  className="
                        space-y-1.5
                      "
                >
                  <label
                    className="
                        text-xs
                        font-medium
                        text-secondary
                      "
                  >
                    CTA Visual Style
                  </label>
                  <div
                    className="
                        grid
                        grid-cols-3
                        gap-3
                      "
                  >
                    {["glow", "gradient", "solid"].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleCustomCtaChange("style", style)}
                        className={`
                          py-2
                          px-3
                          rounded-xl
                          border
                          text-xs
                          font-semibold
                          capitalize
                          transition-all
                          ${
                            profile.customCta?.style === style
                              ? "bg-accent border-accent text-primary shadow-md"
                              : "bg-surface-dark border-subtle text-secondary hover:text-primary"
                          }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success("Custom CTA settings saved!", "Saved")
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save CTA Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Page Builder / Reorder Sections */}
            {activeTab === "builder" && (
              <div
                className="
                        space-y-5
                      "
              >
                <div
                  className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-subtle
                        pb-3
                      "
                >
                  <div>
                    <h3
                      className="
                        text-sm
                        font-bold
                        text-primary
                      "
                    >
                      Page Builder & Reordering
                    </h3>
                    <p
                      className="
                        text-xs
                        text-secondary
                        mt-0.5
                      "
                    >
                      Reorder and toggle sections to construct your ideal layout
                      hierarchy.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      success("Section layout hierarchy saved!", "Saved")
                    }
                    variant="primary"
                    size="sm"
                    icon={FiSave}
                  >
                    Save Layout
                  </Button>
                </div>
                <div
                  className="
                        space-y-2.5
                      "
                >
                  {(profile.sectionOrder || []).map((sectionKey, index) => {
                    const isVisible =
                      profile.sectionVisibility?.[sectionKey] !== false;
                    return (
                      <div
                        key={sectionKey}
                        className={`
                          p-3.5
                          rounded-2xl
                          border
                          transition-all
                          flex
                          items-center
                          justify-between
                          gap-4
                          ${
                            isVisible
                              ? "bg-surface-dark/80 border-subtle"
                              : "bg-surface-dark/40 border-subtle opacity-60"
                          }`}
                      >
                        <div
                          className="
                        flex
                        items-center
                        gap-3
                      "
                        >
                          <span
                            className="
                        text-xs
                        font-mono
                        text-muted
                        w-5
                      "
                          >
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <span
                            className="
                        text-xs
                        font-bold
                        text-primary
                        capitalize
                      "
                          >
                            {sectionKey} Section
                          </span>
                        </div>
                        <div
                          className="
                        flex
                        items-center
                        gap-1.5
                      "
                        >
                          <button
                            type="button"
                            onClick={() => moveSection(index, -1)}
                            disabled={index === 0}
                            className="
                        p-1.5
                        rounded-lg
                        bg-surface-deep
                        hover:bg-surface-panel
                        disabled:opacity-30
                        text-secondary
                        hover:text-primary
                        transition-colors
                      "
                            title="Move Up"
                          >
                            <FiArrowUp
                              className="
                        w-3.5
                        h-3.5
                      "
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, 1)}
                            disabled={
                              index === (profile.sectionOrder?.length || 0) - 1
                            }
                            className="
                        p-1.5
                        rounded-lg
                        bg-surface-deep
                        hover:bg-surface-panel
                        disabled:opacity-30
                        text-secondary
                        hover:text-primary
                        transition-colors
                      "
                            title="Move Down"
                          >
                            <FiArrowDown
                              className="
                        w-3.5
                        h-3.5
                      "
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(sectionKey)}
                            className={`
                              p-1.5
                              rounded-lg
                              transition-colors
                              ml-2
                              ${
                                isVisible
                                  ? "bg-success-soft text-success hover:bg-success-soft"
                                  : "bg-surface-deep text-muted hover:bg-surface-panel"
                              }`}
                            title={isVisible ? "Hide Section" : "Show Section"}
                          >
                            {isVisible ? (
                              <FiEye
                                className="
                        w-3.5
                        h-3.5
                      "
                              />
                            ) : (
                              <FiEyeOff
                                className="
                        w-3.5
                        h-3.5
                      "
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="
                        pt-2
                        border-t
                        border-subtle
                        flex
                        justify-end
                      "
                >
                  <Button
                    onClick={() =>
                      success("Section layout hierarchy saved!", "Saved")
                    }
                    variant="primary"
                    size="md"
                    icon={FiSave}
                  >
                    Save Section Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instant Live Preview */}
        <div
          className="
                        lg:col-span-5
                        space-y-3
                        sticky
                        top-24
                      "
        >
          <div
            className="
                        flex
                        items-center
                        justify-between
                        px-1
                      "
          >
            <span
              className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-secondary
                        font-mono
                        flex
                        items-center
                        gap-1.5
                      "
            >
              <span
                className="
                        w-2
                        h-2
                        rounded-full
                        bg-success
                        animate-pulse
                      "
              />
              Live Output Preview
            </span>
          </div>
          <div
            className="
                        rounded-[32px]
                        p-3
                        bg-surface-dark
                        border
                        border-subtle
                        shadow-2xl
                      "
          >
            <div
              className="
                        h-[620px]
                        overflow-y-auto
                        rounded-[22px]
                        bg-surface-dark
                        border
                        border-subtle
                        scrollbar-none
                        shadow-inner
                      "
            >
              <PublicProfileView
                user={profile}
                projects={projects}
                experience={experience}
                education={education}
                certifications={certifications}
                achievements={achievements}
                resume={resume}
                themeId={profile.themeId}
                isLivePreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div
          className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        p-4
                        bg-black/80
                        backdrop-blur-md
                      "
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
                        w-full
                        max-w-md
                        rounded-2xl
                        bg-surface-deep
                        border
                        border-subtle
                        p-6
                        space-y-4
                        shadow-2xl
                      "
          >
            <div
              className="
                        flex
                        items-center
                        gap-3
                      "
            >
              <div
                className="
                        p-2.5
                        rounded-xl
                        bg-accent-soft
                        text-accent
                      "
              >
                <FiCpu
                  className="
                        w-6
                        h-6
                        animate-pulse
                      "
                />
              </div>
              <div>
                <h3
                  className="
                        text-base
                        font-bold
                        text-primary
                      "
                >
                  AI Profile Assistant
                </h3>
                <p
                  className="
                        text-xs
                        text-secondary
                      "
                >
                  Generate bio, tagline, and CTA customized to your role
                </p>
              </div>
            </div>
            <Textarea
              label="Describe your background or focus"
              placeholder="e.g. I am a full-stack developer who builds React & Next.js applications and leads design systems..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              maxLength={2000}
              rows={3}
            />
            <p className="text-xs leading-relaxed text-tertiary">
              Your prompt is sent to Google Gemini. Do not include passwords or sensitive personal information.
            </p>
            <div
              className="
                        flex
                        items-center
                        justify-end
                        gap-3
                        pt-2
                      "
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                isLoading={aiGenerating}
                disabled={aiPrompt.trim().length < 20}
                onClick={handleGenerateWithAi}
                icon={FiCpu}
              >
                Generate & Apply
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
