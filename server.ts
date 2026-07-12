import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const CONFIG_FILE = path.join(process.cwd(), "bio_config.json");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Create uploads directory if it does not exist
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Setup multer storage for direct file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
});

// Default configuration mimicking fakecrime bio aesthetic
const DEFAULT_CONFIG = {
  title: "",
  subtitle: "",
  description: "",
  avatarUrl: "",
  backgroundType: "interactive_rain",
  backgroundUrl: "",
  viewsCount: 0,
  titleGlowColor: "white",
  discord: {
    username: "",
    status: "offline",
    avatarUrl: "",
    profileUrl: "",
    showDiscord: false,
  },
  socials: {
    twitter: "",
    tiktok: "",
    spotify: "",
    instagram: "",
    github: "",
    youtube: "",
    twitch: "",
    customLabel: "",
    customUrl: "",
  },
  music: {
    songUrl: "",
    songTitle: "",
    artistName: "",
    albumCoverUrl: "",
    showMusicPlayer: false,
  },
  entryScreen: {
    emoji: "🔑",
    text: "",
    backgroundType: "interactive_rain",
    backgroundUrl: "",
  },
  footerText: "",
  adminPassword: "admin", // Default password, can be changed in panel
};

// Helper to get or create config
function getConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
      return DEFAULT_CONFIG;
    }
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(content);
    
    let changed = false;
    // Migrate old entry screen emoji if it is still the default angel emoji
    if (parsed.entryScreen && parsed.entryScreen.emoji === "👼🏻") {
      parsed.entryScreen.emoji = "🔑";
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    
    return parsed;
  } catch (error) {
    console.error("Error reading config, using default:", error);
    return DEFAULT_CONFIG;
  }
}

// Helper to save config
function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing config:", error);
    return false;
  }
}

// API Routes

// File upload route (requires authentication token)
app.post("/api/upload", (req: any, res: any) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      console.error("Error during upload:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Erro de upload: ${err.message} (Limite: 200MB)` });
      }
      return res.status(500).json({ success: false, message: `Erro no servidor durante upload: ${err.message || err}` });
    }

    const token = req.body.token || req.query.token || req.headers.authorization?.replace("Bearer ", "");
    const config = getConfig();
    const expectedToken = "fakecrime-session-token-" + config.adminPassword;
    
    if (token !== expectedToken) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error("Error deleting unauthorized file:", unlinkErr);
        }
      }
      return res.status(403).json({ success: false, message: "Sessão expirada ou não autorizada para upload!" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Nenhum arquivo enviado!" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, originalName: req.file.originalname });
  });
});

// Get public configuration and increment view count
app.get("/api/config", (req, res) => {
  const config = getConfig();
  
  // Increment view counter
  config.viewsCount = (config.viewsCount || 0) + 1;
  saveConfig(config);

  // Return config without the password
  const { adminPassword, ...publicConfig } = config;
  res.json(publicConfig);
});

// Admin login
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const config = getConfig();
  
  if (password === config.adminPassword) {
    res.json({ success: true, token: "fakecrime-session-token-" + config.adminPassword });
  } else {
    res.status(401).json({ success: false, message: "Senha incorreta!" });
  }
});

// Update configuration (requires password verification)
app.post("/api/config", (req, res) => {
  const { token, config: newConfig, newPassword } = req.body;
  const config = getConfig();

  // Validate session token
  const expectedToken = "fakecrime-session-token-" + config.adminPassword;
  if (token !== expectedToken) {
    return res.status(403).json({ success: false, message: "Sessão expirada ou não autorizada!" });
  }

  // Preserve existing password or update with newPassword
  const updatedConfig = {
    ...config,
    ...newConfig,
    adminPassword: newPassword && newPassword.trim() !== "" ? newPassword : config.adminPassword,
    // Keep viewsCount unless explicitly updated
    viewsCount: typeof newConfig.viewsCount === 'number' ? newConfig.viewsCount : config.viewsCount,
  };

  if (saveConfig(updatedConfig)) {
    res.json({ success: true, message: "Configuração atualizada com sucesso!" });
  } else {
    res.status(500).json({ success: false, message: "Erro ao salvar no servidor." });
  }
});

// Main server logic supporting dev Vite mode or production mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
