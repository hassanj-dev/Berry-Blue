/**
 * Approved copy for the FAQs, Privacy Policy and Terms of Service pages.
 * The text is taken word for word from the approved content document.
 */

export type LegalBlock =
  | { type: "paragraph"; lead?: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "address"; lines: string[] };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type LegalPage = {
  title: string;
  effective: string;
  updated?: string;
  intro: string;
  sections: LegalSection[];
};

export const faqs = [
  {
    id: "1",
    question: "What is BerryBlue?",
    answer:
      "BerryBlue is a free online gaming portal where you can discover and play browser games instantly. No downloads or installations are required.",
  },
  {
    id: "2",
    question: "Do I need an account to play?",
    answer:
      "No. You can play without signing in. Favorites and Continue Playing are saved on your device.",
  },
  {
    id: "3",
    question: "Is BerryBlue free?",
    answer:
      "Yes. All games on BerryBlue are free to play. We support the platform through advertising.",
  },
  {
    id: "4",
    question: "Why is a game loading slowly or not working?",
    answer:
      "Check your internet connection first, then refresh the page. If the problem continues, try another browser or clear your cache. You can also turn on Low Internet Mode to reduce data usage on slower connections.",
  },
  {
    id: "5",
    question: "What is Low Internet Mode?",
    answer:
      "Low Internet Mode reduces heavy visuals and previews so that the site loads faster on slow or limited connections.",
  },
  {
    id: "6",
    question: "Can I install BerryBlue on my phone?",
    answer:
      'Yes. BerryBlue works as a Progressive Web App. Open the site in your mobile browser and choose "Add to Home Screen" for quick access.',
  },
  {
    id: "7",
    question: "How can I report a bug, a broken game, or a content concern?",
    answer:
      "Visit our Contact page or email us at support@berryblue.online. Please include the game name, your device, and your browser so we can resolve the issue quickly.",
  },
];

export const privacy: LegalPage = {
  title: "Privacy Policy",
  effective: "November 28, 2026",
  updated: "November 28, 2026",
  intro:
    'BerryBlue ("we", "us", "our") respects your privacy. This policy explains what information we collect, how we use it, and the choices available to you when you use https://berryblue.online.',
  sections: [
    {
      heading: "Information We Collect",
      blocks: [
        {
          type: "paragraph",
          lead: "Information you provide.",
          text: "If you contact us, we may collect your name, your email address, and the content of your message. BerryBlue does not require an account. If we add account features, we will update this policy.",
        },
        {
          type: "paragraph",
          lead: "Information collected automatically.",
          text: "When you use BerryBlue we may collect device and browser type, IP address, pages visited, games played, approximate location (country or region), and referring pages.",
        },
        {
          type: "paragraph",
          lead: "Information stored on your device.",
          text: "We use local storage and cookies to remember preferences such as Favorites, Recently Played, and Low Internet Mode.",
        },
      ],
    },
    {
      heading: "How We Use Your Information",
      blocks: [
        {
          type: "list",
          items: [
            "To operate, maintain, and improve the platform",
            "To personalize your experience, including recommendations and saved games",
            "To analyze usage and monitor performance and errors",
            "To display advertising",
            "To protect against spam, abuse, and fraud",
            "To respond to support requests",
          ],
        },
      ],
    },
    {
      heading: "Cookies and Similar Technologies",
      blocks: [
        {
          type: "paragraph",
          text: "We use essential cookies for core functionality, analytics cookies to understand how the site is used, and advertising cookies supplied by our advertising partners. You can control cookies through your browser settings. Disabling some cookies may affect certain features.",
        },
      ],
    },
    {
      heading: "Advertising",
      blocks: [
        {
          type: "paragraph",
          text: "BerryBlue displays ads from third-party advertising partners, who may use cookies or similar technologies to show relevant ads. We do not sell your personal information. Please review the privacy policies of these partners for details on their practices.",
        },
      ],
    },
    {
      heading: "Third-Party Games and Services",
      blocks: [
        {
          type: "paragraph",
          text: "Games on BerryBlue are provided by third-party game providers. When you play a game, the provider may collect information according to its own privacy policy. We also use trusted services for hosting, authentication, analytics, and error monitoring.",
        },
      ],
    },
    {
      heading: "Data Sharing",
      blocks: [
        {
          type: "paragraph",
          text: "We share information only with service providers who help us operate the platform, with advertising partners as described above, when required by law, or to protect our rights and the safety of our users. We do not sell your personal data.",
        },
      ],
    },
    {
      heading: "Data Retention and Security",
      blocks: [
        {
          type: "paragraph",
          text: "We keep information only as long as needed for the purposes described here. We use reasonable technical and organizational measures to protect your data, but no method of transmission over the internet is completely secure.",
        },
      ],
    },
    {
      heading: "Your Rights",
      blocks: [
        {
          type: "paragraph",
          text: "You may request access to, correction of, or deletion of your personal information by contacting us at privacy@berryblue.online. You may also clear locally stored data at any time through your browser.",
        },
      ],
    },
    {
      heading: "Children's Privacy",
      blocks: [
        {
          type: "paragraph",
          text: "BerryBlue is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it.",
        },
      ],
    },
    {
      heading: "Changes to This Policy",
      blocks: [
        {
          type: "paragraph",
          text: "We may update this policy from time to time. The latest version will always be available on this page with the updated date.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        {
          type: "address",
          lines: ["BerryBlue", "privacy@berryblue.online", "https://berryblue.online"],
        },
      ],
    },
  ],
};

export const terms: LegalPage = {
  title: "Terms of Service",
  effective: "November 28, 2026",
  updated: "November 28, 2026",
  intro:
    "By accessing or using BerryBlue, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  sections: [
    {
      heading: "Use of the Service",
      blocks: [
        {
          type: "paragraph",
          text: "BerryBlue provides access to free online games for personal, non-commercial entertainment. You agree to use the platform in accordance with these terms and applicable laws.",
        },
      ],
    },
    {
      heading: "Eligibility",
      blocks: [
        {
          type: "paragraph",
          text: "You must be old enough to use online services in your country, or have the permission of a parent or guardian.",
        },
      ],
    },
    {
      heading: "Accounts",
      blocks: [
        {
          type: "paragraph",
          text: "BerryBlue does not currently require an account. If we add account features, you will be responsible for keeping your login details secure and for all activity under your account. Provide accurate information and notify us of any unauthorized use.",
        },
      ],
    },
    {
      heading: "Acceptable Use",
      blocks: [
        { type: "paragraph", text: "You agree not to:" },
        {
          type: "list",
          items: [
            "Use cheats, exploits, bots, or automated tools to gain an unfair advantage or disrupt the service",
            "Attempt to hack, overload, scrape, or interfere with the platform",
            "Copy, redistribute, or resell any part of the site without permission",
            "Upload or share unlawful, harmful, or abusive content",
            "Impersonate others or misrepresent your identity",
          ],
        },
      ],
    },
    {
      heading: "Third-Party Content",
      blocks: [
        {
          type: "paragraph",
          text: "Games are supplied by third-party providers. We do not own or control all of this content and are not responsible for its accuracy, availability, or practices. Your use of a game may also be subject to the provider's own terms.",
        },
      ],
    },
    {
      heading: "Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "The BerryBlue name, logo, design, and original content are our property and are protected by applicable intellectual property laws. Game titles and content remain the property of their respective owners.",
        },
        {
          type: "paragraph",
          text: "If you believe content on BerryBlue infringes your rights, contact us at legal@berryblue.online with the relevant details and we will review it promptly.",
        },
      ],
    },
    {
      heading: "Advertising",
      blocks: [
        {
          type: "paragraph",
          text: "BerryBlue displays advertisements. You agree not to block, manipulate, or artificially interact with ads in a way that disrupts our services.",
        },
      ],
    },
    {
      heading: "Disclaimer of Warranties",
      blocks: [
        {
          type: "paragraph",
          text: 'BerryBlue is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted, error-free, or secure operation, or that games will always be available.',
        },
      ],
    },
    {
      heading: "Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by law, BerryBlue and its owners are not liable for indirect, incidental, or consequential damages arising from your use of the platform.",
        },
      ],
    },
    {
      heading: "Suspension and Termination",
      blocks: [
        {
          type: "paragraph",
          text: "We may suspend or restrict access to any user who violates these terms, without prior notice.",
        },
      ],
    },
    {
      heading: "Changes to These Terms",
      blocks: [
        {
          type: "paragraph",
          text: "We may update these terms from time to time. Continued use of BerryBlue after changes means you accept the updated terms.",
        },
      ],
    },
    {
      heading: "Governing Law",
      blocks: [{ type: "paragraph", text: "These terms are governed by the laws of Pakistan." }],
    },
    {
      heading: "Contact",
      blocks: [
        { type: "address", lines: ["support@berryblue.online", "https://berryblue.online"] },
      ],
    },
  ],
};
