// All personal content lives here. Email, profile links and projects come from Manthan's
// resumes, every link verified on 2026-11-08 (GitHub/LeetCode/HackerRank via their public APIs,
// LinkedIn via the accounts linked on his GitHub, Armourr via a live request).
// Anything still marked TODO is placeholder copy — replace it before publishing.

export const site = {
  name: "Manthan Sankpal",
  firstName: "Manthan",
  role: "Developer", // TODO: refine, e.g. "Creative Developer" / "Full-stack Developer"
  email: "manthansankpal745@gmail.com",
  intro:
    "I build web experiences where engineering and design meet — interfaces that feel considered, fast, and alive.", // TODO: rewrite in your own voice
  about: [
    // TODO: replace with your real story (background, focus, what you're looking for)
    "This is placeholder copy. Tell visitors who you are, what you build, and the kind of problems you enjoy solving.",
    "Add a second paragraph about how you work, or what you're currently learning.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/manthanvs" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/manthanvs/" },
    { label: "LeetCode", href: "https://leetcode.com/u/manthanvs/" },
    { label: "HackerRank", href: "https://www.hackerrank.com/profile/manthanvs" },
  ],
};

export type Project = {
  title: string;
  kind: string;
  year: string;
  href?: string;
  image?: string; // put files in /public/images/work and reference as "/images/work/x.jpg"
  hue: number; // drives the generated cover when no image is set
};

// From the resumes (names, stacks, dates). Generated covers are used until `image` is set.
export const projects: Project[] = [
  { title: "ORBIS", kind: "Android app · Kotlin, Java NIO, Jetpack Compose", year: "2026", href: "https://github.com/manthanvs/ORBIS", hue: 248 },
  { title: "ACLAS", kind: "Developer analytics · Python, Django REST, TypeScript", year: "2026", href: "https://github.com/manthanvs/ACLAS", hue: 160 },
  { title: "Sales Data Pipeline", kind: "Data pipeline · n8n, Docker, PostgreSQL, Power BI", year: "2026", href: "https://github.com/manthanvs/powerbi-n8n-dashboard", hue: 300 },
  { title: "Armourr India", kind: "Full-stack web app · React, Node.js, Express, MongoDB", year: "2026", href: "https://armourr-india.onrender.com", hue: 18 },
];
