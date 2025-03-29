export default function handler(req, res) {
    const cellSize = 12;
    const gap = 2;
    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
    
    const activityData = Array.from({ length: 7 * 53 }, () => Math.floor(Math.random() * 5));

    let svg = `<svg width="${(cellSize + gap) * 53}" height="${(cellSize + gap) * 7}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>`;

    activityData.forEach((level, index) => {
        const x = Math.floor(index / 7) * (cellSize + gap);
        const y = (index % 7) * (cellSize + gap);
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colors[level]}" rx="2"/>`;
    });

    svg += `</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
}
