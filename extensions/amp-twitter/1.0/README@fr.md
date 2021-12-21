# Bento Twitter

## Comportement

Le composant Bento Twitter vous permet d'intégrer un tweet ou un moment. Utilisez-le comme composant Web [`<bento-twitter>`](#web-component), ou comme composant fonctionnel Preact/React [`<BentoTwitter>`](#preactreact-component).

### Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-twitter>`.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Exemple: inclusion via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Type de conteneur**

Le composant `bento-twitter` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Attributs

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (requis)</strong></td>
    <td>L'ID du Tweet ou du Moment, ou le type de source si une timeline doit être affichée. Dans une URL comme https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> est l'identifiant du tweet. Dans une URL comme https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> est l'identifiant du moment. Les types de source de timeline valides sont <code>profile</code>, <code>likes</code> , <code>list</code> , <code>collection</code>, <code>url</code> et <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (facultatif)</strong></td>
    <td>Lors de l'affichage d'une timeline, d'autres arguments doivent être fournis en plus de <code>timeline-source-type</code>. Par exemple, <code>data-timeline-screen-name="amphtml"</code> en combinaison avec <code>data-timeline-source-type="profile"</code> affichera une timeline du compte Twitter AMP. Pour plus de détails sur les arguments disponibles, consultez la section « Timelines » du <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Guide des fonctions d'usine JavaScript de Twitter</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (facultatif)</strong></td>
    <td>Vous pouvez spécifier des options pour l'apparence du Tweet, du Moment ou de la Timeline en définissant des attributs <code>data-</code>. Par exemple, <code>data-cards="hidden"</code> désactive les cartes Twitter. Pour plus de détails sur les options disponibles, consultez la documentation de Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">pour les tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">pour les moments</a> et <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">pour les timelines</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (facultatif)</strong></td>
    <td>Définissez un attribut <code>title</code> pour le composant. La valeur par défaut est <code>Twitter</code>.</td>
  </tr>
</table>

### Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoTwitter>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### Mise en page et style

**Type de conteneur**

Le composant `BentoTwitter` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Ou via `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (requis)</strong></td>
    <td>L'ID du Tweet ou du Moment, ou le type de source si une timeline doit être affichée. Dans une URL comme https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> est l'identifiant du tweet. Dans une URL comme https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> est l'identifiant du moment. Les types de source de timeoivalides sont <code>profile</code>, <code>likes</code> , <code>list</code> , <code>collection</code>, <code>url</code> et <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (facultatif)</strong></td>
    <td>Lors de l'affichage d'un tweet, d'autres arguments peuvent être fournis en plus de <code>tweetid</code>. Par exemple, <code>cards="hidden"</code> en combinaison avec <code>conversation="none"</code> affichera un tweet sans vignettes ni commentaires supplémentaires.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (facultatif)</strong></td>
    <td>Lors de l'affichage d'un moment, d'autres arguments peuvent être fournis en plus de <code>moment</code>. Par exemple, <code>limit="5"</code> affichera un moment intégré comportant jusqu'à cinq cartes.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (facultatif)</strong></td>
    <td>Lors de l'affichage d'une timeline, d'autres arguments peuvent être fournis en plus de <code>timelineSourceType</code>. Par exemple, <code>timelineScreenName="amphtml"</code> en combinaison avec <code>timelineSourceType="profile"</code> affichera une timeline du compte Twitter AMP.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (facultatif)</strong></td>
    <td>Vous pouvez spécifier des options pour l'apparence du tweet, du moment ou de la timeline en ajoutant un objet à la propriété <code>options</code>. Pour plus de détails sur les options disponibles, consultez la documentation de Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">pour les tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">pour les moments</a> et <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">pour les timelines</a>. Remarque : Lors de la transmission de la propriété `options`, assurez-vous d'optimiser ou de mémoriser l'objet : <code>const TWITTER_OPTIONS = { // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (facultatif)</strong></td>
    <td>Définissez un attribut <code>title</code> pour le composant. La valeur par défaut est <code>Twitter</code>.</td>
  </tr>
</table>
