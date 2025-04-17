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

function generateSVG(activityData, langue = "fr") {
  const translations = {
    fr: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} réalisé${
          count > 1 ? "s" : ""
        } le ${date}`,
      low: "Faible",
      high: "Élevé",
      locale: "fr-FR",
    },
    en: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} completed on ${date}`,
      low: "Low",
      high: "High",
      locale: "en-US",
    },
    es: {
      tooltip: (count, date) =>
        `${count} kata${count > 1 ? "s" : ""} completado${
          count > 1 ? "s" : ""
        } el ${date}`,
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
    '<svg width="770" height="140" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">';

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
  }</text></svg>`;

  return svgContent;
}

async function generateActivitySVG(username, langue) {
  const data = await fetchData(username);
  if (!data) return null;

  const processed = processActivityData(data);
  return generateSVG(processed, langue);
}

module.exports = {
  generateActivitySVG,
};
