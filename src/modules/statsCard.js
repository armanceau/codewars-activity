const axios = require("axios");
const {
  fetchData,
  processActivityData,
  calculateStreaks,
} = require("./activity");

// Design 4a "Meta / Optimistic VF" — voir card-prompt.md et
// "Codewars Stats Card Options.dc.html" (#4a) pour la référence pixel-exacte.
const COLORS = {
  cardBg: "#ffffff",
  cardBorder: "#dee3e9",
  textStrong: "#0a1317",
  textSecondary: "#1c1e21",
  textLabel: "#8595a4",
  textTertiary: "#5d6c7b",
  hairline: "#dee3e9",
  danBg: "#0a1317",
  badgeOutline: "#ced0d4",
};

// Couleur du disque de ceinture dans le badge kyu. `black` (dan) n'a pas de
// disque : le badge plein noir suffit comme signal "élite".
const KYU_DISC_COLORS = {
  white: "#ECECEC",
  yellow: "#F1C40F",
  blue: "#3498DB",
  purple: "#9B59B6",
  red: "#E74C3C",
};

const FONT = "Helvetica, Arial, sans-serif";

const i18n = {
  fr: {
    honor: "Honneur",
    katas: "Katas",
    streak: "Streak",
    record: (d) => `record ${d}j`,
    rankPrefix: "rang",
    noLanguage: "Aucun langage classé",
    locale: "fr-FR",
  },
  en: {
    honor: "Honor",
    katas: "Katas",
    streak: "Streak",
    record: (d) => `best ${d}d`,
    rankPrefix: "rank",
    noLanguage: "No ranked language yet",
    locale: "en-US",
  },
  es: {
    honor: "Honor",
    katas: "Katas",
    streak: "Racha",
    record: (d) => `récord ${d}d`,
    rankPrefix: "rango",
    noLanguage: "Sin lenguaje clasificado",
    locale: "es-ES",
  },
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Largeur approximative d'un texte en Helvetica/Arial — suffisant pour du
// dimensionnement dynamique de badges/colonnes, pas besoin d'un vrai moteur
// de layout côté serveur.
const WIDTH_FACTOR_BY_WEIGHT = { 400: 0.52, 500: 0.54, 700: 0.6 };
function estimateTextWidth(text, fontSize, weight = 400) {
  const factor = WIDTH_FACTOR_BY_WEIGHT[weight] || 0.55;
  return text.length * fontSize * factor;
}

function truncateToWidth(text, maxWidth, fontSize, weight) {
  if (estimateTextWidth(text, fontSize, weight) <= maxWidth) return text;
  let truncated = text;
  while (
    truncated.length > 1 &&
    estimateTextWidth(`${truncated}…`, fontSize, weight) > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

// Libellés courts (HONOR/KATAS/STREAK) : si une locale produit un libellé
// long (ex. "Katas résueltos"), on réduit d'un cran plutôt que de rigidifier
// la largeur des colonnes.
function labelFontSize(label) {
  return label.length > 9 ? 9.5 : 11;
}

function buildRankBadge(rankName, colorKey, isDan, contentRight) {
  const badgeY = 21;
  const badgeHeight = 26;
  const padX = 12;
  const discR = 4;
  const discGap = 6;

  if (isDan) {
    const label = rankName.toUpperCase();
    const textWidth = estimateTextWidth(label, 12, 700);
    const width = Math.round(textWidth + padX * 2);
    const x = contentRight - width;
    const cy = badgeY + badgeHeight / 2;

    return {
      x,
      svg:
        `<rect x="${x}" y="${badgeY}" width="${width}" height="${badgeHeight}" rx="${
          badgeHeight / 2
        }" fill="${COLORS.danBg}"/>` +
        `<text x="${x + width / 2}" y="${
          cy + 4
        }" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="${FONT}">${escapeXml(
          label
        )}</text>`,
    };
  }

  const textWidth = estimateTextWidth(rankName, 12, 700);
  const discDiameter = discR * 2;
  const width = Math.round(padX + discDiameter + discGap + textWidth + padX);
  const x = contentRight - width;
  const cy = badgeY + badgeHeight / 2;
  const discCx = x + padX + discR;
  const textX = x + padX + discDiameter + discGap;
  const discColor = KYU_DISC_COLORS[colorKey] || COLORS.textLabel;
  const discStroke =
    colorKey === "white" ? ` stroke="${COLORS.badgeOutline}" stroke-width="1"` : "";

  return {
    x,
    svg:
      `<rect x="${x}" y="${badgeY}" width="${width}" height="${badgeHeight}" rx="${
        badgeHeight / 2
      }" fill="none" stroke="${COLORS.badgeOutline}" stroke-width="1"/>` +
      `<circle cx="${discCx}" cy="${cy}" r="${discR}" fill="${discColor}"${discStroke}/>` +
      `<text x="${textX}" y="${
        cy + 4
      }" font-size="12" font-weight="700" fill="${
        COLORS.textSecondary
      }" font-family="${FONT}">${escapeXml(rankName)}</text>`,
  };
}

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

  const [name, rank] = entries.reduce((best, entry) =>
    entry[1].score > best[1].score ? entry : best
  );
  return { name, rank: rank.name, color: rank.color };
}

// Fonction pure : aucune dépendance réseau, entièrement testable.
function generateCard(options) {
  const {
    username,
    rank,
    honor,
    totalCompleted,
    currentStreak,
    bestStreak,
    language,
    locale = "fr",
  } = options;

  const t = i18n[locale] || i18n.fr;

  const width = 420;
  const height = 200;
  const pad = 24;
  const contentRight = width - pad;

  const rankName = rank?.name || "Unranked";
  const isDan = /dan/i.test(rankName);
  const badge = buildRankBadge(rankName, rank?.color, isDan, contentRight);

  const pseudoFontSize = 18;
  const maxPseudoWidth = badge.x - 12 - pad;
  const displayUsername = truncateToWidth(
    username,
    maxPseudoWidth,
    pseudoFontSize,
    500
  );

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">`;

  svg += `<rect x="0.5" y="0.5" width="${width - 1}" height="${
    height - 1
  }" rx="16" fill="${COLORS.cardBg}" stroke="${
    COLORS.cardBorder
  }" stroke-width="1"/>`;

  svg += `<text x="${pad}" y="38" font-size="${pseudoFontSize}" font-weight="500" fill="${
    COLORS.textStrong
  }" font-family="${FONT}">${escapeXml(displayUsername)}</text>`;
  svg += badge.svg;

  svg += `<line x1="${pad}" y1="60" x2="${contentRight}" y2="60" stroke="${COLORS.hairline}" stroke-width="1"/>`;

  svg += `<text x="24" y="84" font-size="${labelFontSize(
    t.honor
  )}" font-weight="700" fill="${
    COLORS.textLabel
  }" letter-spacing="0.3" font-family="${FONT}">${escapeXml(
    t.honor.toUpperCase()
  )}</text>`;
  svg += `<text x="24" y="114" font-size="30" font-weight="500" fill="${
    COLORS.textStrong
  }" font-family="${FONT}">${honor.toLocaleString(t.locale)}</text>`;

  svg += `<line x1="152" y1="72" x2="152" y2="122" stroke="${COLORS.hairline}" stroke-width="1"/>`;
  svg += `<text x="172" y="84" font-size="${labelFontSize(
    t.katas
  )}" font-weight="700" fill="${
    COLORS.textLabel
  }" letter-spacing="0.3" font-family="${FONT}">${escapeXml(
    t.katas.toUpperCase()
  )}</text>`;
  svg += `<text x="172" y="114" font-size="22" font-weight="500" fill="${
    COLORS.textSecondary
  }" font-family="${FONT}">${totalCompleted.toLocaleString(t.locale)}</text>`;

  svg += `<line x1="262" y1="72" x2="262" y2="122" stroke="${COLORS.hairline}" stroke-width="1"/>`;
  svg += `<text x="282" y="84" font-size="${labelFontSize(
    t.streak
  )}" font-weight="700" fill="${
    COLORS.textLabel
  }" letter-spacing="0.3" font-family="${FONT}">${escapeXml(
    t.streak.toUpperCase()
  )}</text>`;
  svg += `<text x="282" y="114" font-size="19" font-weight="500" fill="${
    COLORS.textSecondary
  }" font-family="${FONT}">🔥 ${currentStreak}</text>`;
  svg += `<text x="282" y="132" font-size="10" font-weight="400" fill="${
    COLORS.textLabel
  }" font-family="${FONT}">${escapeXml(t.record(bestStreak))}</text>`;

  svg += `<line x1="${pad}" y1="154" x2="${contentRight}" y2="154" stroke="${COLORS.hairline}" stroke-width="1"/>`;

  if (language) {
    const langColor = KYU_DISC_COLORS[language.color] || "#5b8def";
    const langName =
      language.name.charAt(0).toUpperCase() + language.name.slice(1);
    const nameFontSize = 13;
    const nameWidth = estimateTextWidth(langName, nameFontSize, 700);
    const rankX = 42 + nameWidth + 12;

    svg += `<circle cx="30" cy="172" r="4" fill="${langColor}"/>`;
    svg += `<text x="42" y="177" font-size="${nameFontSize}" font-weight="700" fill="${
      COLORS.textSecondary
    }" font-family="${FONT}">${escapeXml(langName)}</text>`;
    svg += `<text x="${rankX}" y="177" font-size="12" font-weight="400" fill="${
      COLORS.textTertiary
    }" font-family="${FONT}">${escapeXml(
      `${t.rankPrefix} ${language.rank}`
    )}</text>`;
  } else {
    svg += `<text x="${
      width / 2
    }" y="172" font-size="12" font-weight="400" fill="${
      COLORS.textLabel
    }" text-anchor="middle" font-family="${FONT}">${escapeXml(
      t.noLanguage
    )}</text>`;
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
  const { currentStreak, maxStreak } = calculateStreaks(activityData);
  const rank = profile.ranks?.overall || { name: "Unranked", color: "white" };
  const language = getTopLanguage(profile.ranks);

  return generateCard({
    username: profile.username,
    rank,
    honor: profile.honor,
    totalCompleted: profile.codeChallenges?.totalCompleted ?? 0,
    currentStreak,
    bestStreak: maxStreak,
    language,
    locale: langue,
  });
}

// Fixtures de démo (item 5 du prompt) : kyu bas rang, kyu haut rang, dan
// élite, pas de langage classé — pour valider le rendu sans appel API.
const DEMO_FIXTURES = [
  {
    title: "Kyu — bas rang",
    options: {
      username: "Baptiste_R",
      rank: { name: "5 kyu", color: "blue" },
      honor: 3240,
      totalCompleted: 184,
      currentStreak: 14,
      bestStreak: 42,
      language: { name: "JavaScript", rank: "4 kyu", color: "blue" },
      locale: "fr",
    },
  },
  {
    title: "Kyu — haut rang",
    options: {
      username: "MiraCodes",
      rank: { name: "1 kyu", color: "red" },
      honor: 24950,
      totalCompleted: 1820,
      currentStreak: 33,
      bestStreak: 88,
      language: { name: "Python", rank: "1 kyu", color: "red" },
      locale: "fr",
    },
  },
  {
    title: "Dan — élite",
    options: {
      username: "senkai_dev",
      rank: { name: "1 dan", color: "black" },
      honor: 18920,
      totalCompleted: 1402,
      currentStreak: 61,
      bestStreak: 61,
      language: { name: "Haskell", rank: "1 dan", color: "black" },
      locale: "fr",
    },
  },
  {
    title: "Pas de langage classé",
    options: {
      username: "devine_k",
      rank: { name: "7 kyu", color: "yellow" },
      honor: 890,
      totalCompleted: 56,
      currentStreak: 3,
      bestStreak: 8,
      language: null,
      locale: "fr",
    },
  },
];

function generateDemoCardsHtml() {
  const cards = DEMO_FIXTURES.map(
    (fixture) =>
      `<div><h3 style="font-family:sans-serif;font-size:14px;">${escapeXml(
        fixture.title
      )}</h3>${generateCard(fixture.options)}</div>`
  ).join("\n");

  return `<!doctype html><html><body style="background:#f3f2ef;display:flex;flex-wrap:wrap;gap:24px;padding:24px;margin:0;">${cards}</body></html>`;
}

module.exports = {
  generateCard,
  generateStatsCardSVG,
  generateDemoCardsHtml,
};
