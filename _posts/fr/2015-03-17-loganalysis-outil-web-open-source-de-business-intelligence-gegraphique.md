---
title: "LogAnalysis : Outil Web Open-Source De Business Intelligence Gégraphique"
lang-ref: loganalysis-open-source-web-tool-for-geographic-business-intelligence
redirect_from: /loganalysis-outil-web-open-source-de-business-intelligence-gegraphique/
---

<p class="text-center">
<img src="{{ '/data/blog/loganalysis_prev.png' | prepend: base_url }}">
</p>

## Contexte

En ASI (Architecture des Systèmes d’Information), à l’INSA de Rouen, le second semestre de 4ème année et le premier semestre de 5ème année sont l’occasion pour les étudiants de travailler sur un Projet INSA Certifié (PIC), un projet industriel type R&D commandé par une entreprise et réalisé par les étudiants.

5 sujets sont réalisés par 6 équipes de 7 à 9 étudiants durant 1 an scolaire à raison de 25 à 28h par semaine et par personne. Pour être exact, une des équipes n’existe que pendant le premier semestre de PIC et joue le rôle de sous-traitant pour une autre équipe. Cette équipe disparaît au second semestre de PIC pour permettre aux étudiants de partir à l’étranger.

## Sujet

Le sujet sur lequel mon équipe à travaillé consiste à développer un outil open-source permettant de faire de Business Intelligence géographique, et surtout, de la rendre naturelle à l’utilisateur, accessible sans connaissance de la théorie de la « GeoBI ».

Ce sujet nous a été proposé par le Centre de Recherche Publique Henri Tudor, basé au Luxembourg, maintenant nommé Luxembourg Institute for Science and Technology (LIST). L’équipe sous-traitante a travaillé avec nous sur ce sujet.

## La Business Intelligence

En très résumé, la Business Intelligence (BI) ou informatique décisionnelle, c’est le fait de pouvoir analyser des grandes quantités de données généralement structurées selon un grand nombre de dimensions. Par exemple, le chiffre d’affaire en fonction des dimensions temps, espace, client, secteur d’activité, produit, etc.

La Business Intelligence à pour but de permettre d’analyser ces masses de données structurées afin d’en faire émerger une décision éclairée.

On peut décomposer la Business Intelligence entre 3 grandes étapes :

1.  Collecte des données afin de constituer une base de données structurées
2.  Sélection et traitement des données
3.  Affichage des données à l’utilisateur

### Collecte des données

Cette étape préliminaire à la Business Intelligence n’est pas traitée dans le cadre du PIC car elle est spécifique à chaque entité désirant faire de la Business Intelligence. Son but est de collecter les données venant de multiples sources afin de constituer une base de données la plus précis et complète possible. Ces données sont alors stockées dans des [data warehouses](http://fr.wikipedia.org/wiki/Entrep%C3%B4t_de_donn%C3%A9es) et [datamarts](http://fr.wikipedia.org/wiki/Datamart). Cela constitue alors des bases de données [OLAP](http://fr.wikipedia.org/wiki/Online_Analytical_Processing).

[![Data warehouse overview – Credits: Wikimedia](/data/blog/loganalysis_dw.jpg)](/data/blog/loganalysis_dw.jpg)
{:.text-center}

### Sélection et traitement des données

La première étape d’une analyse de BI est la sélection des données intéressantes à l’étude que l’utilisateur veut mener (ex : sélection des données de la France en 2014 uniquement). C’est le _slice_ OLAP.

Le traitement de données le plus courant est ensuite de choisir comment agréger les données afin d’en obtenir des résultats pertinents (ex : agrégation par mois et par département). C’est le _dice_ OLAP.

C’est – de façon réductrice bien sûr – le principe de l’OLAP : limiter le champ de données et l’agréger aux niveaux les plus pertinents.

[![Slice & Dice](/data/blog/loganalysis_slice_and_dice.png)](/data/blog/loganalysis_slice_and_dice_en.png)
{:.text-center}

### Affichage des données

La deuxième étape d’une analyse de BI est l’affichage des données à l’utilisateur. L’affichage le plus simple est l’affichage d’un tableau. Ce n’est cependant pas la façon la plus simple pour réussir à interpréter les données. On introduit alors des graphiques, des cartes choroplèthes, etc.

[![BI analysis results – Credits: http://apandre.wordpress.com/](/data/blog/loganalysis_bi.png)](/data/blog/loganalysis_bi.png)
{:.text-center}

##  Objectifs du projet & démonstration

Ce projet avait donc pour but de développer une interface web permettant de réaliser des analyses de BI géographique en s’intégrant à [GeoNode](http://geonode.org/), plateforme qui offre déjà des outils de gestion de données géographiques. Le tout a été développé sous licence Open Source (GPLv3) est est [disponible sur GitHub](https://github.com/ThomasRobertFr/analytics).

Les objectifs du projets étaient les suivants :

*   **Traitement et récupération des données** depuis la base de données OLAP [GeoMondrian](http://www.spatialytics.org/fr/projets/geomondrian/)
*   **Affichage des résultats sous la forme de divers graphiques :** carte choroplèthe, diagramme en secteur _(pie chart)_, en barres _(bar chart)_, à bulles _(bubble chart)_, tableau, nuage de mots _(word cloud)_
*   **Interaction avec les graphiques** permettant a l’utilisateur d’interroger la base de données OLAP et de réaliser son analyse de BI de façon intuitive et naturelle :
    *   Filtrage dynamique (_slice_ OLAP) au clic ;
    *   Zoom dimensionnel (_drill-down_ et _roll-up_ OLAP modifiant donc à la fois le _slice_ et le _dice_) au zoom molette. Par exemple, un drill-down sur la France affichera les régions de France. Différentes version du _drill-down_ sont possible : simple (sur 1 élément), multiple (plusieurs éléments), partiel (drill-down sur un élément tout en conservant les éléments du niveau supérieur permettant de comparer des données de différents niveaux, par exemples les régions de France et les autres pays d’Europe)

Voici une démonstration rapide de l’application permettant d’avoir un aperçu rapide des objectifs :

# Architecture

## Architecture globale

Le diagramme ci-dessous décrit l’architecture globale de la solution développée :

[![Architecture of LogAnalysis](/data/blog/loganalysis_architecture_loganalysis.png)](/data/blog/loganalysis_architecture_loganalysis.png)
{:.text-center}

On y retrouve 4 composants :

*   L’**interface web** permettant la **visualisation des données**. Elle se compose de plusieurs éléments :
    *   _[analytics.js](https://github.com/ThomasRobertFr/analytics-js)_, le package développé pour gérer l’interface
    *   _QueryAPI_, un proxy des interfaces de Mandoline, l’API SOLAP
    *   _[crossfilter](http://square.github.io/crossfilter/)_, une sorte de petit serveur OLAP côté client
    *   _[crossfilter server](https://github.com/ThomasRobertFr/crossfilter-server)_, une librairie développée pour permettre de réaliser les mêmes operations que _crossfilter_, mais déléguant les calculs OLAP au serveur via une API
    *   _[d3.js](http://d3js.org/)_, une librairie utilisée pour les rendus SVG
    *   _[dc.js](https://github.com/ThomasRobertFr/dc.js)_, une version modifiée du _[dc.js](http://dc-js.github.io/dc.js/)_ original pour réaliser des rendus de graphiques interactifs de données dimensionnelles
*   Une **application web** en Python, _[analytics](https://github.com/ThomasRobertFr/analytics)_, délivrant l’interface web, étendant l’application web existante _[GeoNode](http://geonode.org/)_
*   Une **API SOLAP** en Java nommée _[Mandoline](https://github.com/ThomasRobertFr/mandoline)_, et sa dépendance _[olap4j](http://www.olap4j.org/)_, nous permettant d’interroger GeoMondrian simplement en JSON
*   La **base de données OLAP** avec le serveur SOLAP _[GeoMondrian](http://www.spatialytics.org/projects/geomondrian/)_ récupérant les données depuis une base _[PostgreSQL](http://www.postgresql.org/)_, réalisant le **traitement des données**

## analytics.js

Le package _analytics.js_ représente la majeure partie du travail réalisé sur ce projet. Il est composé de divers « namespaces », chacun contenant diverses et « classes », ces appellation étant utilisé pour la compréhension du propos puisqu’étant en JavaScript, ces types d’éléments n’existent pas et sont dans notre cas des objets.

Voici l’architecture du package :

[![Architecture of analytics.js](/data/blog/loganalysis_architecture_analytics_js.png)](/data/blog/loganalysis_architecture_analytics_js.png)
{:.text-center}

On y trouve les namespaces :

*   _analytics.query_ qui simplifie l’interrogation de l’API SOLAP via QueryAPI en offrant des fonctions spécialisées
*   _analytics.data_ qui offre des types de données permettant de représenter les éléments OLAP, et qui stocke les données reçues
*   _analytics.state_ qui stocke et offre des fonctions permettant de modifier l’état OLAP de l’analyse en cours (pour simplifier, quels éléments de quels niveaux sont en cours d’étude)
*   _analytics.display_ gère l’interface (où est chaque graphique et qu’affiche-t-il) et les interactions avec celle-ci
*   _analytics.charts_ offre des classes pour chaque type de graphique qui peuvent être instanciées pour chaque nouveau graphique

## Cross-filtering and _crossfilter-server.js_

Une des problématiques majeures du projet est de fournir un filtrage croisé efficace sur l’interface. On peut voir cette fonctionnalité dans la vidéo de démonstration. En effet, ce filtrage est très pratique pour l’utilisateur car elle lui permet de voir simplement comment les données se distribuent parmi les divers éléments d’une dimension et d’explorer le cube OLAP.

Cette fonction de filtrage est donc fortement sollicitée et se doit d’être particulièrement efficace tout en supportant de fort volumes de données.

Il y a en fait deux solutions permettant de mettre en oeuvre cette fonctionnalité, représentées sur ce schéma :

[![Cross-filtering solutions](/data/blog/loganalysis_crossfilter.png)](/data/blog/loganalysis_crossfilter.png)
{:.text-center}

On voit sur ce graphique le cube OLAP à gauche qui stocke les données, et à droite des graphiques que l’utilisateur veut visualiser.

### Première solution : _Crossfilter_

La première possibilité est de demander au serveur OLAP, GeoMondrian, de calculer un cube de données plus petit contenant ce que l’on est en train d’étudier. Sur le diagramme, ce cube intermédiaire est situé au centre et contient les données par région de France, années et mode de transport.

Ce cube temporaire est téléchargé dans le navigateur de l’utilisateur et fourni a _crossfilter_. _Crossfilter_ pourra ensuite calculer les projections de ce cube sur chaque dimension, et ces projections seront utilisées par _dc.js_ pour réaliser les rendus.

Dans cette solution, l’interface sera très réactive au filtrage, car _crossfilter_ possède déjà toutes les données dont il a besoin pour calculer les projections en tenant compte des filtres, et pourra réaliser les calculs en moins d’une seconde.

Cependant, le défaut de cette solution est le nombre de valeurs dans le cube, qui est le produit du nombre d’éléments étudiés dans chaque dimension (par exemple pour 6 régions, 2 ans et 3 modes de transport on a 6 × 2 × 3 = 36 valeurs), et cette taille augmente donc exponentiellement. On ne pourra donc supporter que des volumes raisonnables car le cube finira par devenir trop lourd pour être téléchargé en un temps raisonnable.

### Seconde solution : _Crossfilter Server_

L’alternative consiste à demander à _GeoMondiran_ de calculer directement les projections du cube OLAP, après filtrage, sur chaque dimension étudiée sans calculer le cube temporaire.

Dans ce cas, la taille des données chargés est la somme du nombre d’éléments étudiés dans chaque dimension (par exemple pour 6 régions, 2 ans et 3 modes de transport on a 6 + 2 + 3 = 11 valeurs), et cette taille augmente linéairement. On sera donc capable de supporter des volumes importants car on charge bien moins de données (tant que _GeoMondrian_ supporte ces volumes bien sûr).

Cependant, l’inconvenient de cette solution est que quand l’utilisateur change de filtres, on doit demander à nouveau à GeoMondrian les projections sur chaque dimension en prenant en compte les nouveaux filtres. Cela ralenti donc le temps de réaction lors du filtrage car on doit interroger le serveur là ou _crossfilter_ faisait les calculs localement.

Un autre problème de cette solution est que notre librairie d’affichage, _dc.js_, est dépendante de _crossfilter_ en tant que modèle de données, on ne peut pas lui donner directement des données.

Pour répondre à ce problème et rendre cette alternative possible, nous avons développé une petite librairie nommée _Crossfilter Server_. Cette librairie a presque les même interfaces d’I/O que _Crossfilter_ (seule l’initialisation change). _Crossfilter Server_ va donc reproduire le fonctionnement de _Crossfilter_ sans posséder les données (le cube intermédiaire), il va déléguer les calculs à une API qui va, dans notre cas, interroger _GeoMondrian_.

Ainsi, nous pouvons utiliser _dc.js_ indifféremment avec _Crossfilter_ ou _Crossfilter Server._

### Récapitulatif & solution

Pour résumé, nous avons 2 solutions :

[![Cross-filtering solutions](/data/blog/loganalysis_crossfilter.png)](/data/blog/loganalysis_crossfilter.png)
{:.text-center}

**Crossfilter**

*   $$\mathcal{O}(n^p)$$ $$\left(\prod_{i \in \mathcal{D}} n_i\right)$$  
    **$$\Rightarrow$$ Volumes raisonnables**
*   Filtrage & agrégats côté client rapide (< 10 ms)  
    **$$\Rightarrow$$ Excellente réactivité**

**Crossfilter Server**

*   $$\mathcal{O}(n\times p)$$ $$\left(\sum_{i \in \mathcal{D}} n_i\right)$$  
    **$$\Rightarrow$$ Volumes importants**
*   Filtrage & agrégats côté serveur, rechargement (≈≈\\approx 1s)  
    **$$\Rightarrow$$ Réactivité réduite**


Notre solution définitive consiste a utiliser ces deux solutions, en utilisant l’une ou l’autre selon le volume de données en cours d’étude, en passant dynamiquement de l’une à l’autre selon les besoin.

# Conclusion

Cet article est bien sûr un résumé rapide d’un projet conséquent. Si vous voulez davantage d’informations, vous pouvez consulter l documentation du projet disponible sur le [wiki du dépôt GitHub](https://github.com/ThomasRobertFr/analytics/wiki) ou jeter un oeil au code des composants listés précédemment. Si vous voulez, vous pouvez même contribuer à ce projet en faisant une pull-request !


<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

<!-- The loading of KaTeX is deferred to speed up page rendering -->
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>

<!-- To automatically render math in text elements, include the auto-render extension: -->
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous"
    onload="renderMathInElement(document.body);"></script>
