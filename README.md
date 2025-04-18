# Codewars Activity SVG Generator

> Generate a contribution-style activity chart for your Codewars profile – similar to GitHub's contribution graph.

**Codewars Activity SVG Generator** is a lightweight Express.js application that creates a visual calendar-like heatmap (in SVG format) representing your daily coding activity on [Codewars](https://www.codewars.com). This project allows you to embed your Codewars stats in any website, GitHub README, or dashboard!

Inspired by GitHub’s contribution chart and developed with simplicity and performance in mind.

---

## 🔥 Features

- 🎯 Fetches kata completion data directly from the official [Codewars API](https://dev.codewars.com/).
- 📆 Generates a calendar-like SVG chart showing the days when katas were completed.
- 🎨 Color-coded squares represent activity intensity (number of katas solved per day).
- 🌍 Multi-language support: English, French, and Spanish.
- 🖼️ Embeddable for websites and markdown files.

---

## 📌 Live Example

Here is a real example of the SVG chart generated for a Codewars user:

![Codewars activity preview](https://codewars-activity.vercel.app/armanceau/en/activity.svg)

Embed it anywhere you want using:

```html
<iframe src="https://codewars-activity.vercel.app/armanceau/en/activity.svg" width="720" height="120" frameborder="0"></iframe>
```
Or in Markdown:
```markdown
![Codewars Activity](https://codewars-activity.vercel.app/armanceau/en/activity.svg)
```

## 🚀 Usage

To generate your own Codewars activity chart:
```pgsql
![Codewars Activity](https://codewars-activity.vercel.app/armanceau/en/activity.svg)
```

## 📥 URL Parameters

| Parameter      | Type   | Required | Description |
|------------|--------|--------------|-----------|
| `username` | STRING | Yes | Your Codewars username |
| `langue` | STRING | Yes | Language for the labels. Supported: : `fr`, `en`, `es` |


## ✅ Examples

🔹English chart:
`https://codewars-activity.vercel.app/yourUsername/en/activity.svg`

🔹French version:
`https://codewars-activity.vercel.app/yourUsername/fr/activity.svg`

🔹Spanish version:
`https://codewars-activity.vercel.app/yourUsername/es/activity.svg`

## ⚙️ Installation

_To run this project locally:_

1. Clone this repository:
```bash
git clone https://github.com/armanceau/codewars-activity.git
cd codewars-activity
```
2. Install the dependencies:

 ```bash
 npm install
 cd src
 node server.js
```
3. Your API is now running at `http://localhost:3000`.

## 🛠️ Tech Stack

- [x] Express.js – lightweight Node.js framework

- [x] Axios – for making HTTP requests to Codewars API

- [x] SVG – for generating dynamic, scalable contribution charts

## 💡 Why This Exists

There are many fun ways to visualize developer activity. This tool is designed for Codewars users who want to:

- Track their daily kata completions.
- Showcase their activity in a portfolio or GitHub README.
- Get motivated by visual feedback.

Unlike other services, this project is fully open-source, embeddable, lightweight, and can be hosted anywhere.

## 📈 SEO Keywords (for reference)

```
codewars activity graph, codewars stats svg, codewars contribution calendar, github-style activity chart for codewars, svg chart from codewars data, codewars kata tracker, open-source codewars svg chart
```

Made with ❤️ by [armanceau🐵](https://github.com/armanceau) 
