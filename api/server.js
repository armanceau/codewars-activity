const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/activity.svg", async (req, res) => {
  const username = "armanceau";
  const data = await fetchData(username);

  if (!data) {
    res.setHeader("Content-Type", "text/plain");
    res.send("No data was found for this user.");
    return;
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(data);
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port} 🐵`);
});

async function fetchData(username) {
  const url = `https://www.codewars.com/api/v1/users/${username}/code-challenges/completed`;
  let response;

  try {
    response = await axios.get(url, {
      params: { page: 0 },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  const activityData = processActivityData(response.data);
  return generateSVG(activityData);
}

function processActivityData(data) {
  const activityDays = {};
  data.data.forEach((item) => {
    const date = item.completedAt.slice(0, 10);
    if (!activityDays[date]) {
      activityDays[date] = 1;
    } else {
      activityDays[date]++;
    }
  });
  return activityDays;
}

function generateSVG(activityData) {
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
    if (count <= 0) {
      fillColor = "#151b23";
    } else {
      const level =
        dayLevels.find((level) => count <= level.threshold) ||
        dayLevels[dayLevels.length - 1];
      fillColor = level.color;
    }

    const formatter = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    });
    const dateStr = new Date(date);
    const formattedDate = formatter.format(dateStr);

    svgContent += `<rect x="${xOffset}" y="${yOffset}" width="${dayWidth}" height="${dayHeight}" fill="${fillColor}" stroke="#ffffff3a" rx="3" ry="3">
    <title>${count} kata${count > 1 ? "s" : ""} réalisé${
      count > 1 ? "s" : ""
    } le ${formattedDate}</title></rect>`;

    xOffset += dayWidth + xSpacing;

    if ((index + 1) % 53 === 0) {
      xOffset = 0;
      yOffset += dayHeight + 2;
    }
  });

  const legendOffset = yOffset + 30;

  svgContent += `<text x="5" y="${
    legendOffset + dayHeight / 1.1
  }" fill="#ba9b95" font-family="Inter, sans-serif" font-size="14" text-anchor="start">Faible</text>`;
  svgContent += `<rect x="50" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="#151b23" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="65" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[1].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="80" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[2].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="95" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[3].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="110" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[4].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="125" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[5].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<rect x="140" y="${legendOffset}" width="${dayWidth}" height="${dayHeight}" fill="${dayLevels[6].color}" stroke="#ffffff3a" rx="3" ry="3"></rect>`;
  svgContent += `<text x="160" y="${
    legendOffset + dayHeight / 1.1
  }" fill="#ba1f00" font-family="Inter, sans-serif" font-size="14" text-anchor="start">Élevé</text></svg>`;
  return svgContent;
}

function getAllDatesForYear(year) {
  const dates = [];
  const date = new Date(year, 0, 1);
  const lastDate = new Date(year + 1, 0, 1);

  while (date < lastDate) {
    const formattedDate = date.toISOString().slice(0, 10);
    dates.push(formattedDate);
    date.setDate(date.getDate() + 1);
  }
  return dates;
}
