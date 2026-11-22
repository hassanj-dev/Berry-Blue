import type { PageSection } from "@/components/layout/StaticPage";
import { siteConfig } from "@/lib/site";

const name = siteConfig.name;

export const DRAFT_NOTICE = "This page is a draft and will be reviewed before launch.";
export const LAST_UPDATED = "Last updated: 22 November 2026";

export const about = {
  intro: `${name} is a place to play free games instantly, right in your browser.`,
  sections: [
    {
      heading: `What is ${name}?`,
      paragraphs: [
        "Free online games you can play on your phone, tablet or computer. There is nothing to download or install: pick a game, press Play and start.",
      ],
    },
    {
      heading: "How it works",
      paragraphs: [
        "Browse the catalogue by popularity, by what is new, or by category. Each game opens inside its own page, and the game runs in a protected frame separate from the rest of the site.",
      ],
    },
    {
      heading: "Where we are now",
      paragraphs: [
        "We are still building the site. The games you see at the moment are samples we use for testing. Later we plan to add games from game providers, only with their permission and under their terms.",
      ],
    },
  ] satisfies PageSection[],
};

export const contact = {
  intro: "Questions, feedback or a problem with a game? We would like to hear from you.",
  sections: [
    {
      heading: "What to include",
      paragraphs: [
        "If a game does not work, please tell us the game name, your device and browser, and what happened. That helps us find the problem faster.",
      ],
    },
    {
      heading: "Game owners and providers",
      paragraphs: [
        "If you own a game or represent a provider and want to talk about adding games, or about removing one, write to us at the address below.",
      ],
    },
  ] satisfies PageSection[],
  emailLabel: "Email",
};

export const privacy = {
  intro: `This page explains what ${name} does with information when you visit.`,
  sections: [
    {
      heading: "In short",
      paragraphs: [
        "At this stage you do not need an account, and we do not ask you for personal details such as your name or email address.",
      ],
    },
    {
      heading: "What we receive",
      paragraphs: [
        "Like any website, our hosting and infrastructure providers receive technical information when you visit, such as your IP address, browser type and the pages you open. This is used to deliver the site, keep it secure and fix problems.",
      ],
    },
    {
      heading: "Cookies and similar storage",
      paragraphs: [
        "We do not currently use advertising or analytics cookies. Games run inside a frame, and a game from another company may use its own storage. Before we add games from providers, analytics or ads, we will update this page and ask for consent where the law requires it.",
      ],
    },
    {
      heading: "Services we use",
      paragraphs: [
        "We use third-party services to run the site, including a database provider and a hosting provider. They process data on our behalf to keep the site working.",
      ],
    },
    {
      heading: "Changes and questions",
      paragraphs: [
        "We will update this page when what we do changes. For questions about privacy, use the Contact page.",
      ],
    },
  ] satisfies PageSection[],
};

export const terms = {
  intro: `These terms apply when you use ${name}.`,
  sections: [
    {
      heading: "Using the site",
      paragraphs: [
        `By using ${name} you agree to these terms. Please use the site lawfully and do not try to disrupt it, attack it, or copy it in bulk with automated tools.`,
      ],
    },
    {
      heading: "Games and ownership",
      paragraphs: [
        "Games belong to their owners and are used under their permission. You may play them on the site, but you may not copy, resell or redistribute them.",
      ],
    },
    {
      heading: "Third-party content",
      paragraphs: [
        "Some games come from other companies and run in their own frames. We do not control how those games are made, and their own terms may also apply while you play.",
      ],
    },
    {
      heading: "No guarantees",
      paragraphs: [
        "The site and games are provided as they are. They may change, stop working or be removed at any time, and we cannot promise they will always be available or free of errors. To the extent the law allows, we are not responsible for losses that come from using the site.",
      ],
    },
    {
      heading: "Changes and questions",
      paragraphs: [
        "We may update these terms. Continuing to use the site after a change means you accept the new version. Questions can be sent through the Contact page.",
      ],
    },
  ] satisfies PageSection[],
};
