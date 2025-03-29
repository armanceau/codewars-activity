const express = require('express');
const app = express();
const PORT = 3000;

// Génération d'un tableau d'activité factice (0 à 4)
const activityData = Array.from({ length: 7 * 53 }, () => Math.floor(Math.random() * 5));

// Fonction pour générer le SVG
function generateSVG(activityData) {
    const cellSize = 12;
    const gap = 2;
    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
    let svg = `<svg width="${(cellSize + gap) * 53}" height="${(cellSize + gap) * 7}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>`;
    
    activityData.forEach((level, index) => {
        const x = Math.floor(index / 7) * (cellSize + gap);
        const y = (index % 7) * (cellSize + gap);
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colors[level]}" rx="2"/>`;
    });
    
    svg += `</svg>`;
    return svg;
}

// Route pour servir le SVG
app.get('/activity.svg', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(generateSVG(activityData));
});

app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
