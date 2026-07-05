const axios = require("axios");
const {
  fetchData,
  processActivityData,
  calculateStreaks,
} = require("./activity");

const kyuColors = {
  white: "#e7e7e7",
  yellow: "#ecb613",
  blue: "#3c7eb6",
  purple: "#866cc7",
  black: "#302d2d",
  red: "#e0282e",
};

async function fetchProfile(username) {
  try {
    const response = await axios.get(
      `https://www.codewars.com/api/v1/users/${username}`
    );
    return response.data;
  } catch (err) {
    console.error("Erreur API profil:", err);
    return null;
  }
}

function getTopLanguage(ranks) {
  const languages = ranks?.languages || {};
  const entries = Object.entries(languages);
  if (entries.length === 0) return null;

  const [language, rank] = entries.reduce((best, entry) =>
    entry[1].score > best[1].score ? entry : best
  );
  return { language, rank: rank.name, color: rank.color };
}

function pillTextColor(colorKey) {
  return ["blue", "purple", "black", "red"].includes(colorKey)
    ? "#ffffff"
    : "#151b23";
}

function generateCardSVG(profile, activityData, langue = "fr") {
  const translations = {
    fr: {
      honor: "Honneur",
      completed: "Katas résolus",
      streak: "Streak actuel",
      best: (m) => `Record : ${m} jour${m > 1 ? "s" : ""}`,
      topLanguage: "Langage principal",
      noLanguage: "Pas encore de langage classé",
    },
    en: {
      honor: "Honor",
      completed: "Katas completed",
      streak: "Current streak",
      best: (m) => `Best: ${m} day${m > 1 ? "s" : ""}`,
      topLanguage: "Main language",
      noLanguage: "No ranked language yet",
    },
    es: {
      honor: "Honor",
      completed: "Katas completados",
      streak: "Racha actual",
      best: (m) => `Récord: ${m} día${m > 1 ? "s" : ""}`,
      topLanguage: "Lenguaje principal",
      noLanguage: "Aún sin lenguaje clasificado",
    },
  };
  const t = translations[langue] || translations.fr;

  const { currentStreak, maxStreak } = calculateStreaks(activityData);
  const rank = profile.ranks?.overall || { name: "Unranked", color: "white" };
  const rankColor = kyuColors[rank.color] || "#9198a1";
  const topLanguage = getTopLanguage(profile.ranks);

  const width = 420;
  const height = 200;
  const pad = 24;
  const contentRight = width - pad;

  const pillWidth = Math.max(70, rank.name.length * 8 + 24);
  const pillHeight = 26;
  const pillX = contentRight - pillWidth;
  const pillY = 22;

  const colWidth = (contentRight - pad) / 2;
  const col1X = pad;
  const col2X = pad + colWidth;

  const labelStyle = `fill="#7d8590" font-family="Inter, sans-serif" font-size="10.5" letter-spacing="0.05em"`;
  const valueStyle = `font-family="Inter, sans-serif" font-size="18" font-weight="700"`;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" rx="16" ry="16" fill="#151b23" stroke="#ffffff14"/>`;

  svg += `<text x="${pad}" y="38" fill="#ffffff" font-family="Inter, sans-serif" font-size="19" font-weight="700">${profile.username}</text>`;

  svg += `<rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="13" ry="13" fill="${rankColor}" stroke="#00000030"/>`;
  svg += `<text x="${pillX + pillWidth / 2}" y="${
    pillY + pillHeight / 2 + 4.5
  }" fill="${pillTextColor(
    rank.color
  )}" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" text-anchor="middle">${
    rank.name
  }</text>`;

  svg += `<line x1="${pad}" y1="64" x2="${contentRight}" y2="64" stroke="#ffffff14"/>`;

  svg += `<text x="${col1X}" y="84" ${labelStyle}>${t.honor.toUpperCase()}</text>`;
  svg += `<text x="${col1X}" y="108" ${valueStyle} fill="#ecb613">${profile.honor}</text>`;

  svg += `<text x="${col2X}" y="84" ${labelStyle}>${t.completed.toUpperCase()}</text>`;
  svg += `<text x="${col2X}" y="108" ${valueStyle} fill="#ffffff">${
    profile.codeChallenges?.totalCompleted ?? 0
  }</text>`;

  svg += `<text x="${col1X}" y="140" ${labelStyle}>${t.streak.toUpperCase()}</text>`;
  svg += `<text x="${col1X}" y="164" ${valueStyle} fill="#ff7a59">${currentStreak} 🔥</text>`;
  svg += `<text x="${col1X}" y="182" fill="#7d8590" font-family="Inter, sans-serif" font-size="11">${t.best(
    maxStreak
  )}</text>`;

  svg += `<text x="${col2X}" y="140" ${labelStyle}>${t.topLanguage.toUpperCase()}</text>`;
  if (topLanguage) {
    const langColor = kyuColors[topLanguage.color] || "#9198a1";
    const langLabel =
      topLanguage.language.charAt(0).toUpperCase() +
      topLanguage.language.slice(1);
    svg += `<circle cx="${col2X + 5}" cy="159" r="5" fill="${langColor}" stroke="#00000030"/>`;
    svg += `<text x="${
      col2X + 16
    }" y="164" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#ffffff">${langLabel} · ${
      topLanguage.rank
    }</text>`;
  } else {
    svg += `<text x="${col2X}" y="164" font-family="Inter, sans-serif" font-size="13" fill="#7d8590">${t.noLanguage}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

async function generateStatsCardSVG(username, langue) {
  const [profile, challenges] = await Promise.all([
    fetchProfile(username),
    fetchData(username),
  ]);
  if (!profile || !challenges) return null;

  const activityData = processActivityData(challenges);
  return generateCardSVG(profile, activityData, langue);
}

module.exports = {
  generateStatsCardSVG,
};
