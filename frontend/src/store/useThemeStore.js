import { create } from "zustand";

// Theme color map for updating manifest.json
const themeColorMap = {
  light: "#ffffff",
  dark: "#1d232a",
  cupcake: "#faf7f5",
  bumblebee: "#FFFFFF",
  emerald: "#FFFFFF",
  corporate: "#FFFFFF",
  synthwave: "#09002f",
  retro: "#ece3ca",
  cyberpunk: "#fff248",
  valentine: "#fcf2f8",
  halloween: "#1b1816",
  garden: "#e9e7e7",
  forest: "#171212",
  aqua: "#1a368b",
  lofi: "#ffffff",
  pastel: "#ffffff",
  fantasy: "#ffffff",
  wireframe: "#ffffff",
  black: "#000000",
  luxury: "#09090b",
  dracula: "#282a36",
  cmyk: "#ffffff",
  autumn: "#F4F4F4",
  business: "#202020",
  acid: "#ffffff",
  lemonade: "#f8fdef",
  night: "#0f172a",
  coffee: "#160d05",
  winter: "#ffffff",
  dim: "#2a303c",
  nord: "#eceff4",
  sunset: "#0b151b",
};

// Function to update manifest.json dynamically
const updateManifestTheme = (theme) => {
  const themeColor = themeColorMap[theme] || themeColorMap['light']; // Default to light theme if not found
  const manifest = {
    short_name: "Stardust",
    name: "Chat Application by Abhiyendru",
    icons: [
      { src: "/stardust_appicon.png", sizes: "192x192", type: "image/png" },
      { src: "/stardust_appicon.png", sizes: "512x512", type: "image/png" },
    ],
    start_url: "/",
    background_color: themeColor,
    theme_color: themeColor,
    display: "standalone",
  };

  const stringManifest = JSON.stringify(manifest);
  const blob = new Blob([stringManifest], { type: "application/json" });
  const manifestURL = URL.createObjectURL(blob);
  const timestamp = new Date().getTime(); 
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.setAttribute("href", `${manifestURL}?v=${timestamp}`);
  }
};

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "nord",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    updateManifestTheme(theme);
    
    document.documentElement.setAttribute("data-theme", theme); 
    
    set({ theme });
  },
}));
