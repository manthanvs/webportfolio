// All personal content lives here, taken from Manthan's resumes and cover letter.
// Links verified on 2026-11-08 (GitHub/LeetCode/HackerRank via their public APIs, LinkedIn via the
// accounts linked on his GitHub, Armourr via a live request).

export const site = {
  name: "Manthan Sankpal",
  firstName: "Manthan",
  role: "Developer",
  email: "manthansankpal745@gmail.com",
  intro:
    "I build full-stack web apps, backend APIs and Android tools — software that does something useful, is properly tested, and holds up when things break.",
  about: [
    "I'm a developer from Pune, studying for my MCA at Pimpri Chinchwad College of Engineering and graduating in 2027. Before that I spent 1.5 years at Concentrix — promoted to Senior Technical Support Engineer within six months — after a web development internship at Edureka.",
    "I build across the stack, mostly in Java, Python and TypeScript: React and Node.js front ends, Django and Express APIs, data pipelines into PostgreSQL and Power BI, and Android apps in Kotlin.",
    "I care about what happens when things break. I trace problems to their root cause — on a real phone, if that's where they show up — and back my work with tests: 374 across my projects. I build with AI tools like Claude Code, and I check their output the same way.",
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
  { title: "ORBIS", kind: "Android app · Kotlin, Java NIO, Jetpack Compose", year: "2026", href: "https://github.com/manthanvs/ORBIS", hue: 272 },
  { title: "ACLAS", kind: "Developer analytics · Python, Django REST, TypeScript", year: "2026", href: "https://github.com/manthanvs/ACLAS", hue: 258 },
  { title: "Sales Data Pipeline", kind: "Data pipeline · n8n, Docker, PostgreSQL, Power BI", year: "2026", href: "https://github.com/manthanvs/powerbi-n8n-dashboard", hue: 286 },
  { title: "Armourr India", kind: "Full-stack web app · React, Node.js, Express, MongoDB", year: "2026", href: "https://armourr-india.onrender.com", hue: 266 },
];
