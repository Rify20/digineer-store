// server.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const __dirname = path.resolve();
const DATA_PATH = path.join(__dirname, "assets", "products.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, assets, etc.

function readProducts() {
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]");
  const raw = fs.readFileSync(DATA_PATH, "utf8") || "[]";
  return JSON.parse(raw);
}
function writeProducts(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

/* ===== PRODUCTS API ===== */
app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

app.post("/api/products", (req, res) => {
  const items = readProducts();
  const p = req.body;
  if (!p.id) p.id = "p" + (Date.now());
  items.push(p);
  writeProducts(items);
  res.status(201).json(p);
});

app.put("/api/products/:id", (req, res) => {
  const items = readProducts();
  const id = req.params.id;
  const i = items.findIndex(x => x.id === id);
  if (i === -1) return res.status(404).json({error:"not found"});
  items[i] = {...items[i], ...req.body, id};
  writeProducts(items);
  res.json(items[i]);
});

app.delete("/api/products/:id", (req, res) => {
  const items = readProducts();
  const id = req.params.id;
  const next = items.filter(x => x.id !== id);
  writeProducts(next);
  res.json({ok:true});
});

/* ===== AUTH SUPER SEDERHANA (DEMO) =====
 * ganti ke auth beneran kalau sudah siap.
 */
const ADMIN = { email: "admin@digineer.id", password: "admin123" };
app.post("/api/login", (req, res) => {
  const {email, password} = req.body || {};
  if (email === ADMIN.email && password === ADMIN.password) {
    return res.json({ ok:true, token:"admintoken" });
  }
  res.status(401).json({ ok:false, error:"invalid" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on http://localhost:"+PORT));
