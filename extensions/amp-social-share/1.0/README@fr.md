# Bento Social Share

Affiche un bouton de partage pour les réseaux sociaux ou le partage système.

Actuellement, aucun des boutons générés par Bento Social Share (y compris ceux pour les fournisseurs préconfigurés) n'a d'étiquette ou de nom accessible qui est exposé aux technologies d'assistance (comme les lecteurs d'écran). Assurez-vous d'inclure une `aria-label` avec une étiquette descriptive, sinon ces contrôles seront simplement annoncés comme des éléments « bouton » non étiquetés.

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-social-share>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Exemple: inclusion via `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Type de conteneur

Le composant `bento-social-share` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Styles par défaut

Par défaut, `bento-social-share` comprend certains fournisseurs préconfigurés populaires. Les boutons de ces fournisseurs portent la couleur et le logo officiels du fournisseur. La largeur par défaut est de 60px et la hauteur par défaut est de 44px.

#### Styles personnalisés

Parfois, vous voulez appliquer votre propre style. Vous pouvez simplement écraser les styles fournis comme suit :

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Lors de la personnalisation du style d'une icône `bento-social-share`, veuillez vous assurer que l'icône personnalisée respecte les directives de marque définies par le fournisseur (par exemple, Twitter, Facebook, etc.)

### Accessibilité

#### Indication de focus

L'élément `bento-social-share` porte par défaut un contour bleu comme indicateur de focus visible. Il porte également par défaut la valeur `tabindex=0`, ce qui facilite le suivi pour l'utilisateur lorsqu'il parcourt plusieurs éléments `bento-social-share` utilisés ensemble sur une page.

L'indicateur de focus par défaut est obtenu avec le jeu de règles CSS suivant.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

L'indicateur de focus par défaut peut être écrasé en définissant des styles CSS pour le focus et en les incluant dans une balise `style`. Dans l'exemple ci-dessous, le premier jeu de règles CSS supprime l'indicateur de focus sur tous les éléments `bento-social-share` en définissant la propriété `outline` sur `none`. Le deuxième ensemble de règles spécifie un contour rouge (au lieu du bleu par défaut) et définit également le `outline-offset` sur `3px` pour tous les éléments `bento-social-share` avec la classe `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Avec ces règles CSS, les éléments `bento-social-share` n'afficheraient pas l'indicateur de focus visible à moins qu'ils n'incluent la classe `custom-focus`, auquel cas ils auraient l'indicateur à contour rouge.

#### Contraste de couleur

Notez que `bento-social-share` avec une valeur `type` de `twitter` , `whatsapp` ou `line` affichera un bouton avec une combinaison de couleurs d'avant-plan/arrière-plan qui tombe en dessous du seuil 3:1 recommandé pour le contenu non textuel défini dans [WCAG 2.1 SC 1.4. 11 Contraste non textuel](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Sans contraste suffisant, le contenu peut être difficile à percevoir et donc difficile à identifier. Dans les cas extrêmes, le contenu à faible contraste peut ne pas être visible du tout pour les personnes ayant des troubles de la perception des couleurs. Dans le cas des boutons de partage ci-dessus, les utilisateurs peuvent avoir du mal à percevoir/comprendre correctement les contrôles de partage et à quel service ils se rapportent.

### Fournisseurs préconfigurés

Le composant `bento-social-share` offre quelques [fournisseurs préconfigurés](./social-share-config.js) qui connaissent leurs points de terminaison de partage ainsi que certains paramètres par défaut.

<table>
  <tr>
    <th class="col-twenty">Fournisseur</th>
    <th class="col-twenty">Type</th>
    <th>Paramètres</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API de partage Web</a> (déclenche la boîte de dialogue de partage du système d'exploitation)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-mail</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: facultatif</li>
        <li>
<code>data-param-body</code>: facultatif</li>
        <li>
<code>data-param-recipient</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code> : <strong>requis</strong>, valeur par défaut : none. Ce paramètre est l'ID Facebook <code>app_id</code> requis pour la <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">boîte de dialogue de partage Facebook</a>.</li>
        <li>
<code>data-param-href</code>: facultatif</li>
        <li>
<code>data-param-quote</code> : facultatif, peut être utilisé pour partager une citation ou un texte.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code> : facultatif (mais fortement recommandé). URL du fichier multimédia à partager sur Pinterest. S'il n'est pas défini, l'utilisateur final sera invité à télécharger un média par Pinterest.</li>
        <li>
<code>data-param-url</code>: facultatif</li>
        <li>
<code>data-param-description</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: facultatif</li>
        <li>
<code>data-param-text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: facultatif</li>
        <li>
<code>data-param-text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: facultatif</li>
        <li>
<code>data-param-text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: facultatif</li>
</ul>
    </td>
  </tr>
</table>

### Fournisseurs non configurés

En plus des fournisseurs préconfigurés, vous pouvez utiliser des fournisseurs non configurés en spécifiant des attributs supplémentaires dans le composant `bento-social-share`.

#### Exemple : Création d'un bouton de partage pour un fournisseur non configuré

L'exemple suivant crée un bouton de partage via Facebook Messenger en définissant l'attribut `data-share-endpoint` sur le bon point de terminaison pour le protocole personnalisé de Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Ces fournisseurs n'étant pas préconfigurés, vous devrez créer l'image et les styles de bouton appropriés pour le fournisseur.

### Attributs

#### type (obligatoire)

Sélectionne un type de fournisseur. Requis pour les fournisseurs préconfigurés et non configurés.

#### data-target

Spécifie la cible dans laquelle ouvrir la cible. La valeur par défaut est `_blank` pour tous les cas autres que les e-mails/SMS sur iOS, auquel cas la cible est définie sur `_top`.

#### data-share-endpoint

Cet attribut est obligatoire pour les fournisseurs non configurés.

Certains fournisseurs populaires ont des points de terminaison de partage préconfigurés. Pour plus de détails, consultez la section Fournisseurs préconfigurés. Pour les fournisseurs non configurés, vous devrez spécifier le point de terminaison de partage.

#### data-param-\*

Tous les attributs portant le préfixe `data-param-*` sont transformés en paramètres d'URL et transmis au point de terminaison de partage.

#### aria-label

La description du bouton d'accessibilité. Une étiquette recommandée est « Partager sur &lt;type&gt; ».

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoSocialShare>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoSocialShare` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Ou via `className` :

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Accessibilité

#### Indication de focus

L'élément `BentoSocialShare` porte par défaut un contour bleu comme indicateur de focus visible. Il porte également par défaut la valeur `tabindex=0`, ce qui facilite le suivi pour l'utilisateur lorsqu'il parcourt plusieurs éléments `BentoSocialShare` utilisés ensemble sur une page.

L'indicateur de focus par défaut est obtenu avec le jeu de règles CSS suivant.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

L'indicateur de focus par défaut peut être écrasé en définissant des styles CSS pour le focus et en les incluant dans une balise `style`. Dans l'exemple ci-dessous, le premier jeu de règles CSS supprime l'indicateur de focus sur tous les éléments `BentoSocialShare` en définissant la propriété `outline` sur `none`. Le deuxième ensemble de règles spécifie un contour rouge (au lieu du bleu par défaut) et définit également le `outline-offset` sur `3px` pour tous les éléments `BentoSocialShare` avec la classe `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Avec ces règles CSS, les éléments `BentoSocialShare` n'afficheraient pas l'indicateur de focus visible à moins qu'ils n'incluent la classe `custom-focus`, auquel cas ils auraient l'indicateur à contour rouge.

#### Contraste de couleur

Notez que `BentoSocialShare` avec une valeur `type` de `twitter` , `whatsapp` ou `line` affichera un bouton avec une combinaison de couleurs d'avant-plan/arrière-plan qui tombe en dessous du seuil 3:1 recommandé pour le contenu non textuel défini dans [WCAG 2.1 SC 1.4. 11 Contraste non textuel](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Sans contraste suffisant, le contenu peut être difficile à percevoir et donc difficile à identifier. Dans les cas extrêmes, le contenu à faible contraste peut ne pas être visible du tout pour les personnes ayant des troubles de la perception des couleurs. Dans le cas des boutons de partage ci-dessus, les utilisateurs peuvent avoir du mal à percevoir/comprendre correctement les contrôles de partage et à quel service ils se rapportent.

### Fournisseurs préconfigurés

Le composant `BentoSocialShare` offre quelques [fournisseurs préconfigurés](./social-share-config.js) qui connaissent leurs points de terminaison de partage ainsi que certains paramètres par défaut.

<table>
  <tr>
    <th class="col-twenty">Fournisseur</th>
    <th class="col-twenty">Type</th>
    <th>Paramètres via la propriété <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API de partage Web</a> (déclenche la boîte de dialogue de partage du système d'exploitation)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-mail</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: facultatif</li>
        <li>
<code>body</code>: facultatif</li>
        <li>
<code>recipient</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code> : <strong>requis</strong>, valeur par défaut : none. Ce paramètre est l'ID Facebook <code>app_id</code> requis pour la <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">boîte de dialogue de partage Facebook</a>.</li>
        <li>
<code>href</code>: facultatif</li>
        <li>
<code>quote</code> : facultatif, peut être utilisé pour partager une citation ou un texte.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code> : facultatif (mais fortement recommandé). URL du fichier multimédia à partager sur Pinterest. S'il n'est pas défini, l'utilisateur final sera invité à télécharger un média par Pinterest.</li>
        <li>
<code>url</code>: facultatif</li>
        <li>
<code>description</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: facultatif</li>
        <li>
<code>text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: facultatif</li>
        <li>
<code>text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: facultatif</li>
        <li>
<code>text</code>: facultatif</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: facultatif</li>
</ul>
    </td>
  </tr>
</table>

### Fournisseurs non configurés

En plus des fournisseurs préconfigurés, vous pouvez utiliser des fournisseurs non configurés en spécifiant des attributs supplémentaires dans le composant `BentoSocialShare`.

#### Exemple : Création d'un bouton de partage pour un fournisseur non configuré

L'exemple suivant crée un bouton de partage via Facebook Messenger en définissant l'attribut `data-share-endpoint` sur le bon point de terminaison pour le protocole personnalisé de Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Ces fournisseurs n'étant pas préconfigurés, vous devrez créer l'image et les styles de bouton appropriés pour le fournisseur.

### Propriétés

#### type (obligatoire)

Sélectionne un type de fournisseur. Requis pour les fournisseurs préconfigurés et non configurés.

#### background

Parfois, vous voulez appliquer votre propre style. Vous pouvez simplement écraser les styles fournis en donnant une couleur d'arrière-plan.

Lors de la personnalisation du style d'une icône `BentoSocialShare`, veuillez vous assurer que l'icône personnalisée respecte les directives de marque définies par le fournisseur (par exemple, Twitter, Facebook, etc.)

#### color

Parfois, vous voulez appliquer votre propre style. Vous pouvez simplement écraser les styles fournis en donnant une couleur de remplissage.

Lors de la personnalisation du style d'une icône `BentoSocialShare`, veuillez vous assurer que l'icône personnalisée respecte les directives de marque définies par le fournisseur (par exemple, Twitter, Facebook, etc.)

#### target

Spécifie la cible dans laquelle ouvrir la cible. La valeur par défaut est `_blank` pour tous les cas autres que les e-mails/SMS sur iOS, auquel cas la cible est définie sur `_top`.

#### endpoint

Cette propriété est obligatoire pour les fournisseurs non configurés.

Certains fournisseurs populaires ont des points de terminaison de partage préconfigurés. Pour plus de détails, consultez la section Fournisseurs préconfigurés. Pour les fournisseurs non configurés, vous devrez spécifier le point de terminaison de partage.

#### params

Toutes les propriétés `param` sont transmises en tant que paramètres d'URL et transmises au point de terminaison de partage.

#### aria-label

La description du bouton d'accessibilité. Une étiquette recommandée est « Partager sur &lt;type&gt; ».
