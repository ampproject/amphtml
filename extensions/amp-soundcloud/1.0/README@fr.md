# Bento Soundcloud

Intègre un clip [Soundcloud.](https://soundcloud.com)

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-soundcloud>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Example: Include via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Type de conteneur

Le composant `bento-soundcloud` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Attributs

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Cet attribut est obligatoire si <code>data-playlistid</code> n'est pas défini.<br> La valeur de cet attribut est l'ID d'une piste, un entier.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Cet attribut est obligatoire si <code>data-trackid</code> n'est pas défini. La valeur de cet attribut est l'ID d'une liste de lecture, un entier.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (facultatif)</strong></td>
    <td>Le jeton secret de la piste, si elle est privée.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (facultatif)</strong></td>
    <td>Si défini sur <code>true</code>, affiche le mode « Visuel » pleine largeur; sinon, il s'affiche en mode « Classique ». La valeur par défaut est <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (facultatif)</strong></td>
    <td>Cet attribut est un remplacement de couleur personnalisé pour le mode « Classique ». L'attribut est ignoré en mode « Visuel ». Spécifiez une valeur de couleur hexadécimale, sans le # de tête (par exemple, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoSoundcloud>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoSoundcloud` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Ou via `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Propriétés

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Cet attribut est obligatoire si <code>data-playlistid</code> n'est pas défini.<br> La valeur de cet attribut est l'ID d'une piste, un entier.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Cet attribut est obligatoire si <code>data-trackid</code> n'est pas défini. La valeur de cet attribut est l'ID d'une liste de lecture, un entier.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (facultatif)</strong></td>
    <td>Le jeton secret de la piste, si elle est privée.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (facultatif)</strong></td>
    <td>Si défini sur <code>true</code>, affiche le mode « Visuel » pleine largeur; sinon, il s'affiche en mode « Classique ». La valeur par défaut est <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (facultatif)</strong></td>
    <td>Cet attribut est un remplacement de couleur personnalisé pour le mode « Classique ». L'attribut est ignoré en mode « Visuel ». Spécifiez une valeur de couleur hexadécimale, sans le # de tête (par exemple, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
