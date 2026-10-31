import { z } from 'zod';

const text = (max = 500) => z.string().trim().max(max);
const identifier = z.string().trim().min(1).max(80);

const safeLink = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value, 'https://oneme.invalid');
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}, 'Enter a valid HTTP, HTTPS, or email link.');

const safeImage = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Images must use a secure HTTPS URL.');

const skillSchema = z.object({
  name: text(80),
  category: text(60).default(''),
  level: text(40),
}).strict();

const socialSchema = z.object({
  id: identifier,
  platform: text(40),
  label: text(80),
  url: safeLink,
  handle: text(120),
  icon: text(60).default(""),
  featured: z.boolean().default(false),
}).strict();

const projectSchema = z.object({
  id: identifier,
  title: text(120),
  description: text(2000),
  technologies: z.array(text(40)).max(30),
  image: safeImage,
  githubUrl: safeLink,
  liveUrl: safeLink,
  status: text(80),
  featured: z.boolean().default(false),
  metrics: text(200),
  stars: z.number().int().min(0).max(1_000_000).default(0),
}).strict();

const experienceSchema = z.object({
  id: identifier,
  role: text(120),
  company: text(120),
  location: text(120),
  period: text(80),
  description: text(2000),
  highlights: z.array(text(300)).max(20),
}).strict();

const educationSchema = z.object({
  id: identifier,
  institution: text(160),
  degree: text(160),
  period: text(80),
  location: text(120),
  grade: text(80),
  description: text(2000),
}).strict();

const certificationSchema = z.object({
  id: identifier,
  name: text(160),
  issuer: text(120),
  issueDate: text(80),
  credentialId: text(120),
  verifyUrl: safeLink,
  badge: text(100),
}).strict();

const achievementSchema = z.object({
  id: identifier,
  title: text(160),
  organization: text(120),
  date: text(80),
  description: text(2000),
}).strict();

const customThemeSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  cardStyle: z.enum(['glass', 'solid', 'minimal', 'bordered']).optional(),
  fontFamily: z.string().regex(/^font-[a-z0-9-]{1,40}$/).optional(),
  borderRadius: z.enum(['0px', '8px', '12px', '16px', '20px', '24px', '32px']).optional(),
  glowIntensity: z.enum(['none', 'low', 'medium', 'high']).optional(),
}).strict();

const customCtaSchema = z.object({
  enabled: z.boolean(),
  text: text(100),
  subtitle: text(200),
  url: safeLink,
  style: z.enum(['solid', 'gradient', 'glow', 'outline']),
}).strict();

const sectionNames = [
  'about',
  'cta',
  'socials',
  'projects',
  'skills',
  'experience',
  'education',
  'certifications',
  'achievements',
  'resume',
  'contact',
];

export const profileDataSchema = z.object({
  profile: z.object({
    title: text(120).optional(),
    tagline: text(200).optional(),
    bio: text(4000).optional(),
    location: text(120).optional(),
    status: text(120).optional(),
    phone: text(40).optional(),
    avatar: safeImage.optional(),
    banner: safeImage.optional(),
    isPublished: z.boolean().optional(),
    themeId: z.enum(['cyberpunk', 'arctic', 'synthwave', 'neoacid', 'emerald', 'luxurygold', 'nebula', 'tokyo']).optional(),
    customTheme: customThemeSchema.optional(),
    skills: z.array(skillSchema).max(100).optional(),
    socials: z.array(socialSchema).max(50).optional(),
    customCta: customCtaSchema.optional(),
    sectionOrder: z.array(z.enum(sectionNames)).max(sectionNames.length).optional(),
    sectionVisibility: z.object(
      Object.fromEntries(sectionNames.map((name) => [name, z.boolean().optional()])),
    ).strict().optional(),
    privacy: z.object({
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      showResume: z.boolean().optional(),
      searchEngineIndexing: z.boolean().optional(),
      allowDiscovery: z.boolean().optional(),
      allowContactExchange: z.boolean().optional(),
      allowAnalytics: z.boolean().optional(),
    }).strict().optional(),
  }).strict(),
  projects: z.array(projectSchema).max(100),
  experience: z.array(experienceSchema).max(100),
  education: z.array(educationSchema).max(100),
  certifications: z.array(certificationSchema).max(100),
  achievements: z.array(achievementSchema).max(100),
  resume: z.object({
    fileName: text(180),
    fileSize: text(40),
    fileUrl: safeLink.default(''),
    publicId: z.string().regex(/^$|^oneme\/[a-f0-9]{24}\/resume\/[a-f0-9]{32}\.pdf$/).default(''),
    updatedAt: z.union([
      z.string().datetime(),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ]).nullable(),
    summary: text(4000),
    downloadCount: z.number().int().min(0).max(1_000_000_000),
  }).strict(),
}).strict();

export function createEmptyProfileData() {
  return {
    profile: {
      title: '',
      tagline: '',
      bio: '',
      location: '',
      status: '',
      avatar: '',
      banner: '',
      isPublished: false,
      skills: [],
      socials: [],
      customCta: { enabled: false, text: '', subtitle: '', url: '', style: 'outline' },
      sectionOrder: sectionNames,
      sectionVisibility: Object.fromEntries(sectionNames.map((name) => [name, true])),
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
    },
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: [],
    resume: {
      fileName: '',
      fileSize: '',
      fileUrl: '',
      publicId: '',
      updatedAt: null,
      summary: '',
      downloadCount: 0,
    },
  };
}
