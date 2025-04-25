const axios = require("axios");

function getAllDatesForYear(year) {
  const dates = [];
  const date = new Date(year, 0, 1);
  const lastDate = new Date(year + 1, 0, 1);

  while (date < lastDate) {
    dates.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function processActivityData(data) {
  const activityDays = {};
  data.data.forEach((item) => {
    const date = item.completedAt.slice(0, 10);
    activityDays[date] = (activityDays[date] || 0) + 1;
  });
  return activityDays;
}

async function fetchData(username) {
  try {
    const response = await axios.get(
      `https://www.codewars.com/api/v1/users/${username}/code-challenges/completed`,
      {
        params: { page: 0 },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Erreur API:", err);
    return null;
  }
}

function generateSVG(activityData, langue = "fr", showStreak = true) {
  const translations = {
    fr: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} réalisé${
          count > 1 ? "s" : ""
        } le ${date}`,
      streak: (count) =>
        `${count} jour${count > 1 ? "s" : ""} de suite`,
      low: "Faible",
      high: "Élevé",
      locale: "fr-FR",
    },
    en: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} completed on ${date}`,
      streak: (count) =>
        `${count} day${count > 1 ? "s" : ""} in a row`,
      low: "Low",
      high: "High",
      locale: "en-US",
    },
    es: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} completado${
          count > 1 ? "s" : ""
        } el ${date}`,
      streak: (count) =>
        `${count} día${count > 1 ? "s" : ""} seguido${count > 1 ? "s" : ""}`,
      low: "Bajo",
      high: "Alto",
      locale: "es-ES",
    },
  };

  const t = translations[langue] || translations["fr"];
  const currentYear = new Date().getFullYear();
  const dayWidth = 12;
  const dayHeight = 12;
  const xSpacing = 2.5;
  let svgContent =
    '<svg width="770" height="160" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">';

  let xOffset = 0;
  let yOffset = 10;
  const allDates = getAllDatesForYear(currentYear);

  const dayLevels = [
    { threshold: 0, color: "#151b23" },
    { threshold: 1, color: "#ba9b95" },
    { threshold: 2, color: "#ba8277" },
    { threshold: 3, color: "#ba6959" },
    { threshold: 4, color: "#ba513c" },
    { threshold: 5, color: "#ba381e" },
    { threshold: 6, color: "#ba1f00" },
  ];

  allDates.forEach((date, index) => {
    const count = activityData[date] || 0;

    const level =
      dayLevels.find((level) => count <= level.threshold) ||
      dayLevels[dayLevels.length - 1];
    const fillColor = level.color;

    const formatter = new Intl.DateTimeFormat(t.locale, {
      day: "numeric",
      month: "long",
    });
    const formattedDate = formatter.format(new Date(date));

    svgContent += `<rect x="${xOffset}" y="${yOffset}" width="${dayWidth}" height="${dayHeight}" fill="${fillColor}" stroke="#ffffff3a" rx="3" ry="3">
      <title>${t.tooltip(count, formattedDate)}</title></rect>`;

    xOffset += dayWidth + xSpacing;

    if ((index + 1) % 53 === 0) {
      xOffset = 0;
      yOffset += dayHeight + 2;
    }
  });

  const legendOffset = yOffset + 30;

  const { currentStreak } = calculateStreaks(activityData);

  svgContent += `<text x="5" y="${
    legendOffset + dayHeight / 1.1
  }" fill="#ba9b95" font-family="Inter, sans-serif" font-size="14" text-anchor="start">${
    t.low
  }</text>`;
  for (let i = 0; i < dayLevels.length; i++) {
    svgContent += `<rect x="${
      50 + 15 * i
    }" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${
      dayLevels[i].color
    }" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  }
  svgContent += `<text x="160" y="${
    legendOffset + dayHeight / 1.1
  }" fill="#ba1f00" font-family="Inter, sans-serif" font-size="14" text-anchor="start">${
    t.high
  }</text>`;

  if (showStreak) {
    svgContent +=`
    <g transform="translate(720, 115)" style="cursor: default;">
        <rect width="45" height="30" fill="#151b23" stroke="#ba9b95" rx="8" ry="8"/>
        <text x="20" y="20" fill="#ba9b95" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">
          🔥${currentStreak}
          <title>${t.streak(currentStreak)}</title>
        </text>
      </g>`;
  }
    svgContent +=`</svg>`;

  return svgContent;
}

function calculateStreaks(activityDays) {
  const dates = Object.keys(activityDays).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  const today = new Date().toISOString().slice(0, 10);

  dates.forEach((dateStr) => {
    const date = new Date(dateStr);
    if (lastDate) {
      const expected = new Date(lastDate);
      expected.setDate(expected.getDate() + 1);
      if (date.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    lastDate = date;
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (!activityDays[yesterdayStr] && today !== dates[dates.length - 1]) {
    currentStreak = 0;
  }
  return { currentStreak, maxStreak };
}

async function generateActivitySVG(username, langue, showStreak) {
  const data = await fetchData(username);
  if (!data) return null;

  const processed = processActivityData(data);
  return generateSVG(processed, langue, showStreak);
}

module.exports = {
  generateActivitySVG,
};
