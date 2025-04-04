# Codewars-activity

_Cette application Express génère un fichier SVG représentant l'activité quotidienne sur l'année d'un utilisateur sur CodeWars._

## Fonctionnalité

- L'application récupère les données de l'utilisateur via l'API de CodeWars.
- Elle génère un fichier SVG avec des carrés colorés représentant les jours où des défis ont été résolus.
- La couleur des carrés varie en fonction du nombre de défis résolus chaque jour.

## Endpoints

- `GET /test/activity.svg`: Récupère un SVG de l'activité de l'utilisateur CodeWars spécifié.

## Installation

1. Clonez le repository.
2. Installez les dépendances :

 ```bash
 npm install
 cd api
 node server.js
```

## Technologies

- Express.js
- Axios pour les appels API
- SVG pour la génération de la grille

## Présentation

![](https://codewars-activity.vercel.app/activity.svg)
