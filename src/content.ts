// All personal content lives here. Anything marked TODO is a placeholder —
// replace it with real information before publishing. Nothing here is invented
// as fact: projects are deliberately labelled as placeholders.

export const site = {
  name: "Manthan Sankpal",
  firstName: "Manthan",
  role: "Developer", // TODO: refine, e.g. "Creative Developer" / "Full-stack Developer"
  email: "", // TODO: add a public contact email — the contact button hides until set
  intro:
    "I build web experiences where engineering and design meet — interfaces that feel considered, fast, and alive.", // TODO: rewrite in your own voice
  about: [
    // TODO: replace with your real story (background, focus, what you're looking for)
    "This is placeholder copy. Tell visitors who you are, what you build, and the kind of problems you enjoy solving.",
    "Add a second paragraph about how you work, or what you're currently learning.",
  ],
  socials: [
    // TODO: real links. Entries with an empty href are hidden.
    { label: "GitHub", href: "" },
    { label: "LinkedIn", href: "" },
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

// TODO: replace with real projects. Generated covers are used until `image` is set.
export const projects: Project[] = [
  { title: "Project One", kind: "Placeholder · Design & Development", year: "—", hue: 18 },
  { title: "Project Two", kind: "Placeholder · Development", year: "—", hue: 248 },
  { title: "Project Three", kind: "Placeholder · Interaction", year: "—", hue: 160 },
  { title: "Project Four", kind: "Placeholder · Web App", year: "—", hue: 300 },
];
