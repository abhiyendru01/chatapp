import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "Wireframe",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
const updateManifestTheme = (theme) => {
  const manifest = {
    short_name: "Stardust",
    name: "Chat Application by Abhiyendru",
    background_color: theme === "light" ? "#000000" : "#ffffff",
    theme_color: theme === "dark" ? "#000000" : "#ffffff",
    display: "standalone",
    icons: [
      { src: "%PUBLIC_URL%/stardust_appicon.png", sizes: "192x192", type: "image/png" },
      { src: "%PUBLIC_URL%/stardust_appicon.png", sizes: "512x512", type: "image/png" }
    ]
  };

  const stringManifest = JSON.stringify(manifest);
  const blob = new Blob([stringManifest], { type: "application/json" });
  const manifestURL = URL.createObjectURL(blob);
  document.querySelector('link[rel="manifest"]').setAttribute("href", manifestURL);
};

updateManifestTheme("light"); // Call this when you switch themes
