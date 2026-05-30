const express = require('express');
const os = require('os');

const app = express();
const PORT = 3000;
let visitorCount = 0;

app.get('/', (req, res) => {
  visitorCount++;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevOps CI/CD Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 48px 56px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    h1 { font-size: 2rem; margin-bottom: 8px; color: #58d9f9; }
    .subtitle { color: #aaa; margin-bottom: 36px; font-size: 0.95rem; }
    .info-grid { display: grid; gap: 16px; text-align: left; }
    .info-item {
      background: rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .label { color: #8ecae6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-weight: 600; font-size: 0.95rem; word-break: break-all; }
    .badge {
      display: inline-block;
      background: #23c55e;
      color: #fff;
      border-radius: 20px;
      padding: 3px 14px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    footer { margin-top: 32px; color: #666; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Node.js on Kubernetes</h1>
    <p class="subtitle">Deployed via Docker · Amazon ECR · GitHub Actions CI/CD</p>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">🕐 Timestamp</span>
        <span class="value">${new Date().toISOString()}</span>
      </div>
      <div class="info-item">
        <span class="label">🖥️ Container ID</span>
        <span class="value">${os.hostname()}</span>
      </div>
      <div class="info-item">
        <span class="label">👥 Visitor Count</span>
        <span class="value">${visitorCount}</span>
      </div>
      <div class="info-item">
        <span class="label">💚 Health Status</span>
        <span class="value"><span class="badge">HEALTHY</span></span>
      </div>
    </div>
    <footer>AWS Free Tier · t2.micro · Minikube · Node.js 18</footer>
  </div>
</body>
</html>`;
  res.send(html);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    uptime: process.uptime(),
    visitors: visitorCount
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
