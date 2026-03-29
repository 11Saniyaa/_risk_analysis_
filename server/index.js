require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

const clientDist = path.join(__dirname, '..', 'client', 'dist');
const hasBuild = fs.existsSync(path.join(clientDist, 'index.html'));

app.use(
  cors({
    origin: hasBuild ? true : ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ui: 'react', storage: 'localStorage' });
});

if (hasBuild) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`API & static: http://localhost:${PORT}`);
  if (!hasBuild) {
    console.log('Dev UI: run `npm run dev` in repo root (Vite on :5173 → proxy /api)');
  }
});
