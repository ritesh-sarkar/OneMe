export const DEMO_USER = {
  id: "usr_john_doe_001",
  name: "John Doe",
  username: "johndoe",
  title: "Full-Stack Developer",
  tagline: "Building useful things with code.",
  bio: "Passionate full-stack developer dedicated to crafting modern web applications, scalable architectures, and delightful digital experiences. Deeply focused on JavaScript ecosystems, clean code, and human-centric design.",
  location: "Dhaka, Bangladesh",
  status: "Open to freelance work",
  email: "johndoe@example.com",
  phone: "+880 1712-345678",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
  banner:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  isVerified: true,
  isPublished: true,
  themeId: "cyberpunk",
  customTheme: {
    accentColor: "#00f2fe",
    bgColor: "#05050c",
    cardStyle: "glass", // 'glass' | 'solid' | 'minimal' | 'bordered'
    fontFamily: "font-mono",
    borderRadius: "16px",
    glowIntensity: "medium",
  },
  skills: [
    { name: "JavaScript", category: "Frontend", level: "Expert" },
    { name: "React", category: "Frontend", level: "Expert" },
    { name: "Next.js", category: "Frontend", level: "Advanced" },
    { name: "Node.js", category: "Backend", level: "Advanced" },
    { name: "MongoDB", category: "Database", level: "Intermediate" },
    { name: "Tailwind CSS", category: "Styling", level: "Expert" },
    { name: "REST APIs", category: "Architecture", level: "Advanced" },
    { name: "Git", category: "Tools", level: "Advanced" },
    { name: "Framer Motion", category: "Animation", level: "Advanced" },
    { name: "GraphQL", category: "Architecture", level: "Intermediate" },
    { name: "Express.js", category: "Backend", level: "Advanced" },
    { name: "Docker", category: "DevOps", level: "Intermediate" },
  ],
  socials: [
    {
      id: "soc_1",
      platform: "github",
      label: "GitHub",
      url: "/",
      handle: "@johndoe",
      icon: "FiGithub",
      featured: true,
    },

    {
      id: "soc_2",
      platform: "linkedin",
      label: "LinkedIn",
      url: "/",
      handle: "in/johndoe",
      icon: "FiLinkedin",
      featured: true,
    },

    {
      id: "soc_3",
      platform: "x",
      label: "X (Twitter)",
      url: "/",
      handle: "@johndoe",
      icon: "FiTwitter",
      featured: true,
    },

    {
      id: "soc_4",
      platform: "facebook",
      label: "Facebook",
      url: "/",
      handle: "john.doe",
      icon: "FiFacebook",
      featured: false,
    },

    {
      id: "soc_5",
      platform: "instagram",
      label: "Instagram",
      url: "/",
      handle: "@johndoe.codes",
      icon: "FiInstagram",
      featured: false,
    },

    {
      id: "soc_6",
      platform: "whatsapp",
      label: "WhatsApp",
      url: "/",
      handle: "+1 (234) 567-890",
      icon: "FaWhatsapp",
      featured: true,
    },
  ],
  customCta: {
    enabled: true,
    text: "Hire Me for Projects",
    subtitle: "Available for freelance & full-time roles",
    url: "mailto:johndoe@example.com?subject=Project%20Inquiry%20from%20OneMe",
    style: "glow", // 'solid' | 'gradient' | 'glow' | 'outline'
  },
  sectionOrder: [
    "about",
    "cta",
    "socials",
    "projects",
    "skills",
    "experience",
    "education",
    "certifications",
    "achievements",
    "resume",
    "contact",
  ],
  sectionVisibility: {
    about: true,
    cta: true,
    socials: true,
    projects: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    achievements: true,
    resume: true,
    contact: true,
  },
  privacy: {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showResume: true,
    searchEngineIndexing: true,
    allowContactExchange: true,
  },
  verifications: {
    email: true,
    github: true,
    linkedin: true,
    university: true,
  },
};

export const DEMO_PROJECTS = [
  {
    id: "proj_1",
    title: "PulseFlow — Real-time Distributed Analytics Platform",
    description:
      "An ultra-fast real-time telemetry and web analytics visualization platform built for high-throughput metrics tracking and anomaly detection.",
    technologies: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Node.js",
      "WebSockets",
      "Chart.js",
    ],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    githubUrl: "/",
    liveUrl: "/",
    status: "Live & Active",
    featured: true,
    metrics: "100k+ events/sec",
    stars: 142,
  },
  {
    id: "proj_2",
    title: "HyperCraft UI — Modern Design System & Component Library",
    description:
      "An open-source, accessible, and themeable React UI library engineered with Framer Motion transitions, responsive tokens, and micro-interactions.",
    technologies: [
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "Radix UI",
      "JavaScript",
    ],
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
    githubUrl: "/",
    liveUrl: "/",
    status: "V2 Released",
    featured: true,
    metrics: "2.4k npm downloads",
    stars: 380,
  },
  {
    id: "proj_3",
    title: "NexusSync — Collaborative Workspace Engine",
    description:
      "A seamless browser-based document collaboration tool supporting live multi-cursor synchronization, Markdown rendering, and encrypted file sharing.",
    technologies: [
      "Next.js",
      "Express",
      "MongoDB",
      "Socket.io",
      "Tailwind CSS",
    ],
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    githubUrl: "/",
    liveUrl: "/",
    status: "In Production",
    featured: true,
    metrics: "99.9% uptime",
    stars: 215,
  },
];

export const DEMO_EXPERIENCE = [
  {
    id: "exp_1",
    role: "Lead Frontend Engineer",
    company: "Vanguard Digital Solutions",
    location: "Dhaka, Bangladesh (Hybrid)",
    period: "2023 — Present",
    description:
      "Architecting high-performance web applications, interactive dashboards, and design systems for enterprise SaaS clients across Europe and Asia.",
    highlights: [
      "Boosted Core Web Vitals performance scores across 12 client apps from 68 to 98+",
      "Built a reusable enterprise component design system adopted by 25+ developers",
      "Mentored 6 junior engineers in modern React paradigms and animation workflows",
    ],
  },
  {
    id: "exp_2",
    role: "Full-Stack Developer",
    company: "Apex CodeCraft Lab",
    location: "Dhaka, Bangladesh",
    period: "2021 — 2023",
    description:
      "Developed RESTful backend services and intuitive frontend interfaces using React, Node.js, Express, and MongoDB.",
    highlights: [
      "Engineered automated payment gateway integrations with SSLCommerz & Stripe",
      "Refactored legacy monolith into modular micro-frontends reducing build times by 40%",
      "Implemented offline-first Progressive Web App capabilities for field agents",
    ],
  },
];

export const DEMO_EDUCATION = [
  {
    id: "edu_1",
    institution: "Daffodil International University",
    degree: "Bachelor of Science in Computer Science & Engineering",
    period: "2026 — still pursuing",
    location: "Dhaka, Bangladesh",
    grade: "CGPA 3.85 / 4.00",
    description:
      "Specialized in Software Engineering, Distributed Systems, Algorithm Design, and Web Architectures. Head of Tech at Student ACM Chapter.",
  },
];

export const DEMO_CERTIFICATIONS = [
  {
    id: "cert_1",
    name: "Meta Front-End Developer Professional Certificate",
    issuer: "Meta (Coursera)",
    issueDate: "Aug 2023",
    credentialId: "META-FE-88921",
    verifyUrl: "/",
    badge: "Meta Certified",
  },
  {
    id: "cert_2",
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "Jan 2024",
    credentialId: "AWS-CCP-44021",
    verifyUrl: "/",
    badge: "AWS Certified",
  },
];

export const DEMO_ACHIEVEMENTS = [
  {
    id: "ach_1",
    title: "1st Place Winner — National Hackathon 2023",
    organization: "ICT Division Bangladesh",
    date: "Dec 2023",
    description:
      "Built an AI-powered emergency logistics coordination platform within 36 hours among 120 participating teams.",
  },
  {
    id: "ach_2",
    title: "Top Contributor Badge — Open Source Fest",
    organization: "GitHub & DEV Community",
    date: "Oct 2023",
    description:
      "Contributed 45+ merged pull requests to major JavaScript developer tools and accessibility packages.",
  },
  {
    id: "ach_3",
    title: "Dean’s Honor Award for Academic Excellence",
    organization: "Daffodil International University",
    date: "May 2022",
    description:
      "Awarded for consecutive top 1% academic merit in Computer Science & Engineering department.",
  },
];

export const DEMO_RESUME = {
  fileName: "John_Doe_FullStack_Resume.pdf",
  fileSize: "1.4 MB",
  updatedAt: "2026-08-15",
  summary:
    "Full-Stack Developer with 4+ years of professional experience building scalable, high-performance web applications using React, Next.js, Node.js, and modern cloud technologies. Proven track record in frontend architecture, design systems, and developer tooling.",
  downloadCount: 428,
};

export const DEMO_ANALYTICS = {
  overview: {
    profileViews: 1284,
    qrScans: 342,
    linkClicks: 187,
    contactSaves: 73,
    contactExchanges: 45,
    resumeDownloads: 92,
    uniqueVisitors: 980,
  },
  viewsOverTime: [
    { date: "Aug 26", views: 95, scans: 22, clicks: 14 },
    { date: "Aug 27", views: 142, scans: 35, clicks: 21 },
    { date: "Aug 28", views: 188, scans: 48, clicks: 29 },
    { date: "Aug 29", views: 165, scans: 41, clicks: 25 },
    { date: "Aug 30", views: 210, scans: 56, clicks: 33 },
    { date: "Aug 31", views: 234, scans: 68, clicks: 36 },
    { date: "Sep 01", views: 250, scans: 72, clicks: 29 },
  ],
  trafficSources: [
    {
      source: "Direct & QR Code",
      count: 520,
      percentage: 40.5,
      color: "#6366f1",
    },
    { source: "LinkedIn", count: 395, percentage: 30.7, color: "#0ea5e9" },
    {
      source: "GitHub Profile",
      count: 210,
      percentage: 16.4,
      color: "#10b981",
    },
    { source: "X / Twitter", count: 115, percentage: 8.9, color: "#f59e0b" },
    {
      source: "Other / Referrals",
      count: 44,
      percentage: 3.5,
      color: "#ec4899",
    },
  ],
  topClickedLinks: [
    {
      label: "GitHub Profile",
      clicks: 84,
      url: "/",
    },
    {
      label: "PulseFlow Live Demo",
      clicks: 52,
      url: "/",
    },
    { label: "Download Resume (.pdf)", clicks: 46, url: "#resume" },
    {
      label: "LinkedIn Connection",
      clicks: 38,
      url: "/",
    },
    {
      label: "HyperCraft UI Repo",
      clicks: 27,
      url: "/",
    },
  ],
  devices: [
    { device: "Mobile (iOS & Android)", percentage: 68 },
    { device: "Desktop (macOS & Windows)", percentage: 28 },
    { device: "Tablet", percentage: 4 },
  ],
  geoDistribution: [
    { country: "Bangladesh", city: "Dhaka", views: 640 },
    { country: "United States", city: "San Francisco & NYC", views: 290 },
    { country: "United Kingdom", city: "London", views: 140 },
    { country: "Germany", city: "Berlin", views: 110 },
    { country: "Singapore", city: "Singapore", views: 104 },
  ],
};

export const DEMO_CONNECTIONS = [
  {
    id: "conn_1",
    name: "Sarah Khan",
    username: "sarahk",
    title: "Lead Product Designer",
    company: "Starlight Studio",
    location: "Singapore",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    dateConnected: "2026-08-30T14:22:00Z",
    exchangeMethod: "Radar Nearby OneMe Flow",
    email: "sarah@starlight.design",
    phone: "+65 9123 4567",
    notes:
      "Met at Design & Code Summit 2026. Interested in collaborating on design system components.",
  },
  {
    id: "conn_2",
    name: "John Doe",
    username: "johndoe",
    title: "Senior Software Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    dateConnected: "2026-08-28T09:15:00Z",
    exchangeMethod: "QR Code Scan",
    email: "john.doe@stripe.dev",
    phone: "+1 (415) 880-9214",
    notes:
      "Connected via OneMe QR at WebConf. Shared insights on payment processing microservices.",
  },
  {
    id: "conn_3",
    name: "Alex Rivera",
    username: "alexrivera",
    title: "Founder & CTO",
    company: "HyperScale AI",
    location: "Austin, TX",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    dateConnected: "2026-08-25T18:40:00Z",
    exchangeMethod: "Radar Nearby OneMe Flow",
    email: "alex@hyperscale.ai",
    phone: "+1 (512) 640-1129",
    notes:
      "Exchanged contact info at AI Founders Meetup. Looking for senior frontend consulting.",
  },
  {
    id: "conn_4",
    name: "Maya Patel",
    username: "mayapatel",
    title: "Developer Relations Engineer",
    company: "Vercel",
    location: "London, UK",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    dateConnected: "2026-08-20T11:05:00Z",
    exchangeMethod: "OneMe Profile Share",
    email: "maya@vercel.dev",
    phone: "+44 7700 900341",
    notes:
      "Connected on Next.js Conf. Recommended my PulseFlow project for developer showcase.",
  },
];

export const DISCOVER_PROFILES = [
  {
    id: "disc_1",
    name: "John Doe",
    username: "johndoe",
    title: "Full-Stack Developer",
    tagline: "Building useful things with code.",
    location: "Dhaka, Bangladesh",
    university: "Daffodil International University",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    category: "Developers",
    skills: ["JavaScript", "React", "Next.js", "Node.js", "Tailwind CSS"],
    status: "Open to freelance work",
    verified: true,
    views: "1.2k",
    featured: true,
  },
  {
    id: "disc_2",
    name: "Sarah Khan",
    username: "sarahk",
    title: "Lead Product Designer",
    tagline: "Crafting minimalist, human-friendly software interfaces.",
    location: "Singapore",
    university: "National University of Singapore",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    category: "Designers",
    skills: ["Figma", "Design Systems", "UI/UX", "Framer", "User Research"],
    status: "Mentoring designers",
    verified: true,
    views: "3.4k",
    featured: true,
  },
  {
    id: "disc_3",
    name: "David Chen",
    username: "davidchen",
    title: "AI Systems Architect",
    tagline: "Training large models and building scalable ML infrastructure.",
    location: "San Francisco, CA",
    university: "Stanford University",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    category: "Founders",
    skills: ["PyTorch", "Distributed Systems", "Python", "CUDA", "LLMs"],
    status: "Hiring engineers",
    verified: true,
    views: "5.1k",
    featured: true,
  },
  {
    id: "disc_4",
    name: "Elena Rostova",
    username: "elenar",
    title: "Creative Technologist & 3D Artist",
    tagline: "Bridging WebGL, shaders, and interactive digital worlds.",
    location: "Berlin, Germany",
    university: "Bauhaus-Universität Weimar",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    category: "Creators",
    skills: ["Three.js", "WebGL", "GLSL", "Blender", "Creative Coding"],
    status: "Taking creative commissions",
    verified: true,
    views: "2.8k",
    featured: false,
  },
  {
    id: "disc_5",
    name: "Marcus Vance",
    username: "marcusv",
    title: "CSE Student & Backend Enthusiast",
    tagline: "Passionate about high-throughput Go microservices and Rust.",
    location: "Toronto, Canada",
    university: "University of Toronto",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    category: "Students",
    skills: ["Go", "Rust", "PostgreSQL", "Docker", "Kubernetes"],
    status: "Looking for Summer 2027 Internships",
    verified: false,
    views: "890",
    featured: false,
  },
  {
    id: "disc_6",
    name: "Amina Al-Mansoor",
    username: "amina",
    title: "Fintech Product Manager",
    tagline: "Scaling cross-border payments across emerging markets.",
    location: "Dubai, UAE",
    university: "American University of Sharjah",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    category: "Founders",
    skills: ["Product Strategy", "Fintech", "Agile", "Growth", "APIs"],
    status: "Angel Investing",
    verified: true,
    views: "4.2k",
    featured: false,
  },
];

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "connection",
    title: "New Contact Connection",
    message:
      "Sarah Khan accepted your contact exchange request via OneMe Flow.",
    time: "2 hours ago",
    read: false,
    icon: "FiUserCheck",
    actionUrl: "/",
  },
  {
    id: "notif_2",
    type: "milestone",
    title: "Profile Milestone Reached!",
    message: "Your OneMe identity just passed 1,200 total profile views.",
    time: "5 hours ago",
    read: false,
    icon: "FiTrendingUp",
    actionUrl: "/",
  },
  {
    id: "notif_3",
    type: "download",
    title: "Resume Downloaded",
    message: "A visitor from San Francisco downloaded your PDF resume.",
    time: "Yesterday",
    read: true,
    icon: "FiDownload",
    actionUrl: "/",
  },
  {
    id: "notif_4",
    type: "qr",
    title: "QR Code Scanned",
    message:
      "Your profile QR was scanned 18 times today at a local tech meetup.",
    time: "2 days ago",
    read: true,
    icon: "FiGrid",
    actionUrl: "/",
  },
];
