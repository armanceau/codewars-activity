const express = require("express");
const path = require("path");
const { generateActivitySVG } = require("./modules/activity");
const {
  generateStatsCardSVG,
  generateDemoCardsHtml,
} = require("./modules/statsCard");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "pages")));

app.get("/:username/:langue/activity.svg", async (req, res) => {
  const { username, langue } = req.params;
  const showStreak = req.query.streak !== "false"
  const svg = await generateActivitySVG(username, langue, showStreak);

  if (!svg) {
    res.setHeader("Content-Type", "text/plain");
    return res.send("No data was found for this user.");
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

app.get("/:username/:langue/card.svg", async (req, res) => {
  const { username, langue } = req.params;
  const svg = await generateStatsCardSVG(username, langue);

  if (!svg) {
    res.setHeader("Content-Type", "text/plain");
    return res.send("No data was found for this user.");
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

app.get("/demo/cards", (req, res) => {
  res.send(generateDemoCardsHtml());
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} 🐵`);
});
