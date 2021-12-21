# Bento Accordion

Affiche les sections de contenu qui peuvent être réduites et développées. Ce composant permet aux utilisateurs de jeter un coup d'œil au plan du contenu et de passer à n'importe quelle section. Une utilisation efficace réduit les besoins de défilement sur les appareils mobiles.

- Un Bento Accordion accepte un ou plusieurs éléments `<section>` comme ses enfants directs.
- Chaque élément `<section>` doit contenir exactement deux enfants directs.
- Le premier enfant dans un élément `<section>` est le titre de cette section de Bento Accordion. Il doit s'agir d'un élément de titre tel que `<h1>-<h6>` ou `<header>`.
- Le deuxième enfant dans un élément `<section>` est le contenu extensible/réductible.
    - Il peut s'agir d'une balise quelconque autorisée dans [HTML AMP](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
- Cliquez ou appuyez sur un titre de `<section>` pour agrandir ou réduire la section.
- Un Bento Accordion portant un `id` défini préserve l'état réduit ou développé de chaque section tant que l'utilisateur reste sur votre domaine.

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-accordion>`

### Exemple : importation via npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Exemple: inclusion via `<script>`

L'exemple ci-dessous contient un `bento-accordion` à trois sections. L'attribut `expanded` de la troisième section l'étend au chargement de la page.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### Interactivité et utilisation de l'API

Les composants compatibles Bento en utilisation autonome sont hautement interactifs via leur API. L'API du composant `bento-accordion` est accessible en incluant la balise de script suivante dans votre document :

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Actions

##### toggle()

L'action `toggle` change les états `expanded` et `collapsed` des sections `bento-accordion`. Lorsqu'elle est appelée sans argument, elle change toutes les sections de l'accordéon. Pour définir une section spécifique, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

L'action `expand` développe les sections de `bento-accordion`. Les sections déjà développées ne changent pas. Lorsqu'elle est appelée sans argument, elle développe toutes les sections de l'accordéon. Pour spécifier une section, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

L'action `collapse` réduit les sections de `bento-accordion`. Les sections déjà réduites ne changent pas. Lorsqu'elle est ouverte sans argument, elle réduit toutes les sections de l'accordéon. Pour spécifier une section, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Événements

L'API `bento-accordion` vous permet de vous inscrire et de répondre aux événements suivants :

##### expand

Cet événement est déclenché lorsqu'une section d'accordéon est développée et est distribuée à partir de la section développée.

Voir l'exemple ci-dessous.

##### collapse

Cet événement est déclenché lorsqu'une section d'accordéon est réduite et est distribuée à partir de la section réduite.

Dans l'exemple ci-dessous, la `section 1` détecte l'événement `expand` et développe la `section 2` lorsqu'elle est développée. La `section 2` détecte l'événement `collapse` et réduit la `section 1` lorsqu'elle est réduite.

Voir l'exemple ci-dessous.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Attributs

#### animate

Ajoutez l'attribut `animate` dans `<bento-accordion>` pour ajouter une animation « roll down » lorsque le contenu est développé et une animation « roll up » lorsqu'il est réduit.

Cet attribut peut être configuré en fonction d'une [requête multimédia](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Appliquez l'attribut `expanded` à une `<section>` imbriquée pour développer cette section lorsque la page se charge.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Autorisez le développement d'une seule section à la fois en appliquant l'attribut `expand-single-section` à l'élément `<bento-accordion>`. Cela signifie que si un utilisateur appuie sur une `<section>` réduite, elle se développera et réduira les autres `<section>`.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Styles

Vous pouvez utiliser l'élément `bento-accordion` pour ajouter librement des styles à l'accordéon.

Gardez les points suivants à l'esprit lorsque vous stylisez un accordéon amp :

- Les éléments `bento-accordion` sont toujours `display: block`.
- `float` ne peut pas styliser une `<section>`, un en-tête ou des éléments de contenu.
- Une section développée applique l'attribut `expanded` à l'élément `<section>`.
- L'élément de contenu est clair-fixé avec `overflow: hidden` et ne peut donc pas avoir de barres de défilement.
- Les marges des éléments `<bento-accordion>` , `<section>`, d'en-tête et de contenu sont définies sur `0`, mais peuvent être écrasées dans des styles personnalisés.
- L'en-tête et les éléments de contenu sont tous deux `position: relative`.

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoAccordion>` tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Interactivité et utilisation de l'API

Les composants Bento sont hautement interactifs via leur API. L'API du composant `BentoAccordion` est accessible en passant une `ref` :

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Actions

L'API `BentoAccordion` vous permet d'effectuer les actions suivantes :

##### toggle()

L'action `toggle` change les états `expanded` et `collapsed` des sections `bento-accordion`. Lorsqu'elle est appelée sans argument, elle change toutes les sections de l'accordéon. Pour définir une section spécifique, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

L'action `expand` développe les sections de `bento-accordion`. Les sections déjà développées ne changent pas. Lorsqu'elle est appelée sans argument, elle développe toutes les sections de l'accordéon. Pour spécifier une section, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

L'action `collapse` réduit les sections de `bento-accordion`. Les sections déjà réduites ne changent pas. Lorsqu'elle est ouverte sans argument, elle réduit toutes les sections de l'accordéon. Pour spécifier une section, ajoutez l'argument `section` et utilisez son `id` correspondant comme valeur.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Événements

L'API Bento Accordion vous permet de répondre aux événements suivants :

##### onExpandStateChange

Cet événement est déclenché sur une section lorsqu'une section d'accordéon est développée ou réduite et est distribuée à partir de la section développée.

Voir l'exemple ci-dessous.

##### onCollapse

Cet événement est déclenché sur une section lorsqu'une section d'accordéon est réduite et est distribué à partir de la section réduite.

Dans l'exemple ci-dessous, la `section 1` détecte l'événement `expand` et développe la `section 2` lorsqu'elle est développée. La `section 2` détecte l'événement `collapse` et réduit la `section 1` lorsqu'elle est réduite.

Voir l'exemple ci-dessous.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoAccordion` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Ou via `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Propriétés

#### BentoAccordion

##### animate

Si définie sur true, utilise alors l'animation « roll-down » / « roll-up » pendante développement et la réduction de chaque section. Par défaut : `false`

##### expandSingleSection

Si définie sur true, alors le développement d'une section réduira automatiquement toutes les autres sections : Par défaut : `false`

#### BentoAccordionSection

##### animate

Si définie sur true, utilise alors l'animation « roll-down » / « roll-up » pendante développement et la réduction de la section. Par défaut : `false`

##### expanded

Si définie sur true, développe la section. Par défaut : `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Rappel pour détecter les changements d'état de développement. Prend un indicateur booléen comme paramètre indiquant si la section vient d'être développée (`false` indique qu'elle a été réduite)

#### BentoAccordionHeader

#### Propriétés communes

Ce composant prend en charge les [propriétés communes](../../../docs/spec/bento-common-props.md) pour les composants React et Preact.

BentoAccordionHeader ne prend pas encore en charge les propriétés personnalisées

#### BentoAccordionContent

#### Propriétés communes

Ce composant prend en charge les [propriétés communes](../../../docs/spec/bento-common-props.md) pour les composants React et Preact.

BentoAccordionContent ne prend pas encore en charge les propriétés personnalisées
