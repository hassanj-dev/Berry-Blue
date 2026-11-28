/**
 * Approved copy for the Game Guides page, word for word from the approved
 * content document. Only the structure (steps, lists, notes) is added here.
 */

export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: Array<{ label: string; text: string }> }
  | { type: "note"; text: string };

export type GuideSection = {
  id: string;
  title: string;
  visual?: "controls";
  blocks: GuideBlock[];
};

export const gameGuide: { title: string; intro: string; sections: GuideSection[] } = {
  title: "Game guides",
  intro: "Everything you need to get the most out of BerryBlue.",
  sections: [
    {
      id: "getting-started",
      title: "Getting started",
      blocks: [
        {
          type: "steps",
          items: [
            "Browse the home page or use search and filters to find a game.",
            "Open the game page and press Play. Most games start within seconds.",
            "Use fullscreen for a better experience. Press Esc to exit.",
          ],
        },
      ],
    },
    {
      id: "finding-the-right-game",
      title: "Finding the right game",
      blocks: [
        {
          type: "paragraph",
          text: "Use categories from the menu and filters to narrow down by genre. Trending games on the home banner are a good place to start. Rate games with the star rating to help others discover great titles.",
        },
      ],
    },
    {
      id: "favorites-and-continue-playing",
      title: "Favorites and continue playing",
      blocks: [
        {
          type: "paragraph",
          text: "Tap the favorite icon on any game page to save it. Games you play recently appear in Recently Played and Continue Playing, so you can pick up where you left off.",
        },
      ],
    },
    {
      id: "controls",
      title: "Controls",
      visual: "controls",
      blocks: [
        { type: "paragraph", text: "Controls vary by game, but most follow these standards:" },
        {
          type: "list",
          items: [
            {
              label: "Desktop",
              text: "arrow keys or WASD to move, Space to jump or act, mouse to aim and click",
            },
            { label: "Mobile", text: "touch controls, swipes, and taps are shown on screen" },
          ],
        },
        { type: "note", text: "Check the instructions inside each game for specific controls." },
      ],
    },
    {
      id: "playing-on-slow-internet",
      title: "Playing on slow internet",
      blocks: [
        {
          type: "paragraph",
          text: "Turn on Low Internet Mode to reduce data usage and speed up loading. Closing other tabs and apps also helps.",
        },
      ],
    },
    {
      id: "install-berryblue-as-an-app",
      title: "Install BerryBlue as an app",
      blocks: [
        {
          type: "list",
          items: [
            {
              label: "Android (Chrome)",
              text: "open the browser menu and tap Add to Home Screen or Install App.",
            },
            { label: "iPhone (Safari)", text: "tap the Share icon, then Add to Home Screen." },
            {
              label: "Desktop (Chrome or Edge)",
              text: "click the install icon in the address bar.",
            },
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      blocks: [
        {
          type: "list",
          items: [
            { label: "Game won't load", text: "refresh the page and check your connection." },
            {
              label: "No sound",
              text: "check your device volume and make sure the tab is not muted.",
            },
            {
              label: "Game feels laggy",
              text: "close other tabs, use a recent browser version, or try Low Internet Mode.",
            },
            {
              label: "Controls not responding",
              text: "click inside the game window once to give it focus.",
            },
          ],
        },
        {
          type: "note",
          text: "Still stuck? Contact Support at support@berryblue.online with the game name, device, and browser.",
        },
      ],
    },
  ],
};
