import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Skill {
  id: string;
  name: string;
  offer: string;
  category: string;
  want: string;
  bio: string;
  createdAt: number;
}

// In-memory "database"
let skills: Skill[] = [
  {
    id: "1",
    name: "Alex Moreno",
    offer: "UI/UX Design",
    category: "design",
    want: "Python Programming",
    bio: "Passionate designer with 5 years of experience in Figma and Adobe Suite.",
    createdAt: Date.now()
  },
  {
    id: "2",
    name: "Sarah Chen",
    offer: "Piano Lessons",
    category: "music",
    want: "French Conversation",
    bio: "Classical pianist looking to brush up on my French for a summer trip to Lyon.",
    createdAt: Date.now()
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/skills", (req, res) => {
    res.json(skills);
  });

  app.post("/api/skills", (req, res) => {
    const { name, offer, category, want, bio } = req.body;
    
    if (!name || !offer || !category || !want) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSkill: Skill = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      offer,
      category,
      want,
      bio: bio || `${name} is offering ${offer} in exchange for ${want}.`,
      createdAt: Date.now()
    };

    skills.unshift(newSkill);
    res.status(201).json(newSkill);
  });

  app.delete("/api/skills/:id", (req, res) => {
    const { id } = req.params;
    const initialLength = skills.length;
    skills = skills.filter(s => s.id !== id);
    
    if (skills.length === initialLength) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    res.status(204).send();
  });

  // Vite middleware for development
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
