# Bento Sidebar

Utilisez Bento Sidebar comme composant Web [`<bento-sidebar>`](#web-component), ou comme composant fonctionnel Preact/React [`<BentoSidebar>`](#preactreact-component).

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-sidebar>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Exemple: inclusion via `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### Bento Toolbar

Vous pouvez créer un élément Bento Toolbar qui s'affiche dans le `<body>` en spécifiant l'attribut `toolbar` avec une requête multimédia et un attribut `toolbar-target` avec un identifiant d'élément sur un élément `<nav>` qui est un enfant de `<bento-sidebar>`. La `toolbar` duplique l'élément `<nav>` et ses enfants et ajoute l'élément dans l'élément `toolbar-target`.

#### Comportement

- la barre latérale peut implémenter des barres d'outils en ajoutant des éléments de navigation avec l'attribut `toolbar` et l'attribut `toolbar-target`.
- L'élément nav doit être un enfant de `<bento-sidebar>` et suivre le format suivant : `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    - Voici un exemple d'utilisation valide de la barre d'outils : `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
- Le comportement de la barre d'outils n'est appliqué que lorsque l'attribut media-query de `toolbar` est valide. En outre, un élément portant l'attribut `toolbar-target` doit exister sur la page pour que la barre d'outils soit appliquée.

##### Exemple: barre d'outils basique

Dans l'exemple suivant, nous affichons une `toolbar` si la largeur de la fenêtre est inférieure ou égale à 767px. La `toolbar` contient un élément de saisie de recherche. L'élément `toolbar` sera ajouté à l'élément `<div id="target-element">`.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### Interactivité et utilisation de l'API

Les composants compatibles Bento en utilisation autonome sont hautement interactifs via leur API. L'API du composant `bento-sidebar` est accessible en incluant la balise de script suivante dans votre document :

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Actions

L'API `bento-sidebar` vous permet d'effectuer les actions suivantes :

##### open()

Ouvre la barre latérale.

```javascript
api.open();
```

##### close()

Ferme la barre latérale.

```javascript
api.close();
```

##### toggle()

Change l'état d'ouverture de la barre latérale.

```javascript
api.toggle(0);
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Styles personnalisés

Le composant `bento-sidebar` peut être stylisé avec le CSS standard.

- La valeur `width` de la `bento-sidebar` peut être définie pour ajuster la largeur à partir de la valeur prédéfinie de 45px.
- La hauteur de la `bento-sidebar` peut être réglée pour ajuster la hauteur de la barre latérale, si nécessaire. Si la hauteur dépasse 100vw, la barre latérale aura une barre de défilement verticale. La hauteur prédéfinie de la barre latérale est de 100vw et peut être remplacée dans le CSS pour la raccourcir.
- L'état actuel de la barre latérale est exposé via l'attribut `open` qui est défini sur la balise `bento-sidebar` lorsque la barre latérale est ouverte sur la page.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### Considérations UX

Lorsque vous utilisez `<bento-sidebar>`, gardez à l'esprit que vos utilisateurs consulteront souvent votre page sur mobile, ce qui peut afficher un en-tête à position fixe. De plus, les navigateurs affichent souvent leur propre en-tête fixe en haut de la page. L'ajout d'un autre élément à position fixe en haut de l'écran occuperait un grand espace sur l'écran mobile avec un contenu qui ne donne à l'utilisateur aucune nouvelle information.

C'est pourquoi nous recommandons que les options permettant d'ouvrir la barre latérale ne soient pas placées dans un en-tête fixe pleine largeur.

- La barre latérale ne peut apparaître que sur le côté gauche ou droit d'une page.
- La hauteur maximale de la barre latérale est de 100vh, si la hauteur dépasse 100vh, une barre de défilement verticale apparaît. La hauteur par défaut est définie sur 100vh dans le CSS et peut être modifiée.
- La largeur de la barre latérale peut être définie et ajustée à l'aide du CSS.
- Il est *recommandé* que `<bento-sidebar>` soit un enfant direct du `<body>` pour préserver un ordre DOM logique pour l'accessibilité ainsi que pour éviter de modifier son comportement par un élément conteneur. Notez que le fait d'avoir un ancêtre de `bento-sidebar` avec un `z-index` défini peut faire apparaître la barre latérale sous d'autres éléments (tels que les en-têtes), ce qui peut altérer sa fonctionnalité.

### Attributs

#### side

Indique de quel côté de la page la barre latérale doit s'ouvrir, soit `left` ou `right`. Si un attribut `side` n'est pas spécifié, la valeur `side` sera héritée de l'attribut `dir` la balise `body` `ltr` =&gt; `left`, `rtl` =&gt; `right`) ; si aucun `dir` n'existe, la valeur `side` par défaut est `left`.

#### open

Cet attribut est présent lorsque la barre latérale est ouverte.

#### toolbar

Cet attribut est présent sur les éléments enfants `<nav toolbar="(media-query)" toolbar-target="elementID">` et accepte une requête multimédia indiquant quand afficher une barre d'outils. Voir la section [Barre d'outils](#bento-toolbar) pour plus d'informations sur l'utilisation des barres d'outils.

#### toolbar-target

Cet attribut est présent sur l'enfant `<nav toolbar="(media-query)" toolbar-target="elementID">`, et accepte l'identifiant d'un élément sur la page. L'attribut `toolbar-target` placera la barre d'outils dans l'identifiant spécifié de l'élément sur la page, sans le style par défaut de la barre d'outils. Voir la section [Barre d'outils](#bento-toolbar) pour plus d'informations sur l'utilisation des barres d'outils.

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoSidebar>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### Bento Toolbar

Vous pouvez créer un élément Bento Toolbar qui s'affiche dans le `<body>` en spécifiant la propriété `toolbar` avec une requête multimédia et une propriété `toolbarTarget` avec un identifiant d'élément sur un composant `<BentoSidebarToolbar>` qui est un enfant de `<BentoSidebar>`. La propriété `toolbar` duplique l'élément `<BentoSidebarToolbar>` et ses enfants et ajoute l'élément dans l'élément `toolbarTarget`.

#### Comportement

- La barre latérale peut implémenter des barres d'outils en ajoutant des éléments nav portant les propriétés `toolbar` et `toolbarTarget`.
- L'élément nav doit être un enfant de `<BentoSidebar>` et suivre ce format : `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    - Voici un exemple valide d'utilisation de la barre d'outils : `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
- Le comportement de la barre d'outils n'est appliqué que lorsque la propriété media-query de `toolbar` est valide. En outre, un élément portant la propriété `toolbar-target` doit exister sur la page pour que la barre d'outils soit appliquée.

##### Exemple: barre d'outils basique

Dans l'exemple suivant, nous affichons une `toolbar` si la largeur de la fenêtre est inférieure ou égale à 767px. La `toolbar` contient un élément de saisie de recherche. L'élément `toolbar` sera ajouté à l'élément `<div id="target-element">`.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### Interactivité et utilisation de l'API

Les composants Bento sont hautement interactifs via leur API. L'API du composant `BentoSidebar` est accessible en passant une `ref` :

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### Actions

L'API `BentoSidebar` vous permet d'effectuer les actions suivantes :

##### open()

Ouvre la barre latérale.

```javascript
ref.current.open();
```

##### close()

Ferme la barre latérale.

```javascript
ref.current.close();
```

##### toggle()

Change l'état d'ouverture de la barre latérale.

```javascript
ref.current.toggle(0);
```

### Mise en page et style

Le composant `BentoSidebar` peut être stylisé avec le CSS standard.

- La valeur `width` de la `bento-sidebar` peut être définie pour ajuster la largeur à partir de la valeur prédéfinie de 45px.
- La hauteur de la `bento-sidebar` peut être réglée pour ajuster la hauteur de la barre latérale, si nécessaire. Si la hauteur dépasse 100vw, la barre latérale aura une barre de défilement verticale. La hauteur prédéfinie de la barre latérale est de 100vw et peut être remplacée dans le CSS pour la raccourcir.

Pour garantir le rendu du composant comme vous le souhaitez, veillez à appliquer une taille au composant. L'application peut être intégrée :

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

Ou via `className`:

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### Considérations UX

Lorsque vous utilisez `<BentoSidebar>`, gardez à l'esprit que vos utilisateurs consulteront souvent votre page sur mobile, ce qui peut afficher un en-tête à position fixe. De plus, les navigateurs affichent souvent leur propre en-tête fixe en haut de la page. L'ajout d'un autre élément à position fixe en haut de l'écran occuperait un grand espace sur l'écran mobile avec un contenu qui ne donne à l'utilisateur aucune nouvelle information.

C'est pourquoi nous recommandons que les options permettant d'ouvrir la barre latérale ne soient pas placées dans un en-tête fixe pleine largeur.

- La barre latérale ne peut apparaître que sur le côté gauche ou droit d'une page.
- La hauteur maximale de la barre latérale est de 100vh, si la hauteur dépasse 100vh, une barre de défilement verticale apparaît. La hauteur par défaut est définie sur 100vh dans le CSS et peut être modifiée.
- La largeur de la barre latérale peut être définie et ajustée à l'aide du CSS.
- Il est <em>recommandé</em> que <code>&lt;BentoSidebar&gt;</code> soit un enfant direct du `<body>` pour préserver un ordre DOM logique pour l'accessibilité ainsi que pour éviter de modifier son comportement par un élément conteneur. Notez que le fait d'avoir un ancêtre de `bento-sidebar` avec un `z-index` défini peut faire apparaître la barre latérale sous d'autres éléments (tels que les en-têtes), ce qui peut altérer sa fonctionnalité.

### Propriétés

#### side

Indique de quel côté de la page la barre latérale doit s'ouvrir, soit `left` ou `right`. Si un attribut `side` n'est pas spécifié, la valeur `side` sera héritée de l'attribut `dir` la balise `body` `ltr` =&gt; `left`, `rtl` =&gt; `right`) ; si aucun `dir` n'existe, la valeur `side` par défaut est `left`.

#### toolbar

Cette propriété est présente sur les éléments enfants `<nav toolbar="(media-query)" toolbar-target="elementID">` et accepte une requête multimédia indiquant quand afficher une barre d'outils. Voir la section [Barre d'outils](#bento-toolbar) pour plus d'informations sur l'utilisation des barres d'outils.

#### toolbarTarget

Cet attribut est présent sur l'enfant `<nav toolbar="(media-query)" toolbar-target="elementID">`, et accepte l'identifiant d'un élément sur la page. La propriété `toolbar-target` placera la barre d'outils dans l'identifiant spécifié de l'élément sur la page, sans le style par défaut de la barre d'outils. Voir la section [Barre d'outils](#bento-toolbar) pour plus d'informations sur l'utilisation des barres d'outils.
