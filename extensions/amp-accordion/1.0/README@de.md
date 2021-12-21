# Bento Accordion

Zeigt Inhaltsabschnitte an, die reduziert und erweitert werden können. Diese Komponente bietet Betrachtern die Möglichkeit, einen Blick auf die Inhaltsgliederung zu werfen und zu einem beliebigen Abschnitt zu springen. Ein geschickter Einsatz dieser Komponente hilft, das Scrollen auf mobilen Geräten zu reduzieren.

-   Ein Bento Akkordeon akzeptiert ein oder mehrere Elemente vom Typ `<section>` als direkt untergeordnete Elemente.
-   Jedes `<section>` Element muss genau zwei direkt untergeordnete Elemente enthalten.
-   Das erste untergeordnete Element im Abschnitt `<section>` ist die Überschrift für diesen Abschnitt des Bento Akkordeons. Es muss ein Überschriftenelement wie `<h1>-<h6>` oder `<header>` sein.
-   Das zweite untergeordnete Element in `<section>` ist der erweiterbare/reduzierbare Inhalt.
    -   Dabei kann es sich um ein beliebiges Tag handeln, das in [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md) zulässig ist.
-   Durch Klicken oder Tippen auf eine `<section>` Überschrift wird der Abschnitt erweitert oder reduziert.
-   Ein Bento Akkordeon mit einer definierten `id` behält den reduzierten oder erweiterten Zustand jedes Abschnitts bei, während der Benutzer sich in deiner Domain bewegt.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-accordion>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Beispiel: Einbinden via `<script>`

Das folgende Beispiel enthält ein `bento-accordion` mit drei Abschnitten. Das Attribut `expanded` im dritten Abschnitt erweitert das Akkordeon beim Laden der Seite.

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

### Interaktivität und API Nutzung

Bento-fähige Komponenten, die als eigenständige Komponenten verwendet werden, sind durch ihre API hochgradig interaktiv. Du kannst auf die API der `bento-accordion` Komponente zugreifen, indem du das folgende Skript Tag in dein Dokument einfügst:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Aktionen

##### toggle()

Die Aktion `toggle` schaltet zwischen den Zuständen `expanded` und `collapsed` der Abschnitte von `bento-accordion` um. Wenn die Methode ohne Argumente aufgerufen wird, schaltet sie alle Abschnitte des Akkordeons um. Verwende das Argument `section` mit der entsprechenden `id` als Wert, um einen bestimmten Abschnitt anzugeben.

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

Die Aktion `expand` erweitert die Abschnitte von `bento-accordion`. Ist ein Abschnitt bereits erweitert, so bleibt er erweitert. Wenn die Methode ohne Argumente aufgerufen wird, erweitert sie alle Abschnitte des Akkordeons. Verwende das Argument <code>section</code> mit der entsprechenden <code>id</code> als Wert, um einen bestimmten Abschnitt anzugeben.

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

Die Aktion `collapse` reduziert die Abschnitte von `bento-accordion`. Ist der Abschnitt bereits reduziert, so bleibt er reduziert. Wenn die Methode ohne Argumente aufgerufen wird, reduziert sie alle Abschnitte des Akkordeons. Verwende das Argument <code>section</code> mit der entsprechenden <code>id</code> als Wert, um einen bestimmten Abschnitt anzugeben.

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

#### Events

Mithilfe der API für `bento-accordion` kannst du die folgenden Events registrieren und darauf reagieren:

##### expand

Dieses Ereignis wird ausgelöst, wenn ein Akkordeonabschnitt erweitert wird. Das Ereignis wird vom erweiterten Abschnitt gesendet.

Ein Beispiel findest du weiter unten.

##### collapse

Dieses Ereignis wird ausgelöst, wenn ein Akkordeonabschnitt reduziert wird. Das Ereignis wird vom reduzierten Abschnitt gesendet.

Im folgenden Beispiel wartet `section 1` auf das Ereignis `expand`. Sobald dieser Abschnitt erweitert wird, wird auch `section 2` erweitert. `section 2` wartet auf das Ereignis `collapse`. Sobald dieser Abschnitt reduziert wird, wird auch `section 1` reduziert.

Ein Beispiel findest du weiter unten.

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

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

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

### Attribute

#### animate

Verwende das Attribut `animate` in `<bento-accordion>`, um eine "Rolldown" Animation anzuzeigen, wenn der Inhalt erweitert wird, und eine "Rollup" Animation, wenn der Inhalt reduziert wird.

Dieses Attribut kann basierend auf einer [Medienabfrage](./../../../docs/spec/amp-html-responsive-attributes.md) konfiguriert werden.

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

Wende das Attribut `expanded` auf einen verschachtelten Abschnitt vom Typ `<section>` an, um diesen Abschnitt beim Laden der Seite zu erweitern.

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

Du kannst das Akkordeon so einrichten, dass jeweils nur ein einziger Abschnitt erweitert sein kann. Verwende dazu das Attribut `expand-single-section` im Element `<bento-accordion>`. Wenn ein Benutzer auf einen minimierten Abschnitt vom Typ `<section>` tippt, wird dieser erweitert und andere erweiterte `<section>` Abschnitte werden reduziert.

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

### Styling

Du kannst den Selektor für `bento-accordion` verwenden, um das Akkordeon frei zu gestalten.

Beachte die folgenden Punkte, wenn du den Style von amp-accordion anpasst:

-   `bento-accordion` Elemente besitzen immer den Wert `display: block`.
-   Überschriften vom Typ `<section>` oder darin enthaltene Elemente können nicht mit `float` angepasst werden.
-   Ein erweiterter Abschnitt wendet das Attribut `expanded` auf das Element `<section>` an.
-   Das Inhaltselement besitzt einen Clearfix mit `overflow: hidden` und kann daher keine Bildlaufleisten haben.
-   Die Ränder der Elemente `<bento-accordion>`, `<section>`, des Headers und der Inhaltselemente besitzen den Wert `0`, der aber in benutzerdefinierten Styles überschrieben werden kann.
-   Sowohl die Header als auch die Inhaltselemente haben als Position den Wert `position: relative`.

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoAccordion>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

### Interaktivität und API Nutzung

Bento Komponenten sind durch ihre API hochgradig interaktiv. Auf die Komponente `BentoAccordion` kann mittels Übergabe von `ref` zugegriffen werden:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Aktionen

Mithilfe der API für `BentoAccordion` kannst du die folgenden Aktionen ausführen:

##### toggle()

Die Aktion `toggle` schaltet zwischen den Zuständen `expanded` und `collapsed` der Abschnitte von `bento-accordion` um. Wenn die Methode ohne Argumente aufgerufen wird, schaltet sie alle Abschnitte des Akkordeons um. Verwende das Argument `section` mit der entsprechenden `id` als Wert, um einen bestimmten Abschnitt anzugeben.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

Die Aktion `expand` erweitert die Abschnitte von `bento-accordion`. Ist ein Abschnitt bereits erweitert, so bleibt er erweitert. Wenn die Methode ohne Argumente aufgerufen wird, erweitert sie alle Abschnitte des Akkordeons. Verwende das Argument `section` mit der entsprechenden `id` als Wert, um einen bestimmten Abschnitt anzugeben.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

Die Aktion `collapse` reduziert die Abschnitte von `bento-accordion`. Ist der Abschnitt bereits reduziert, so bleibt er reduziert. Wenn die Methode ohne Argumente aufgerufen wird, reduziert sie alle Abschnitte des Akkordeons. Verwende das Argument `section` mit der entsprechenden `id` als Wert, um einen bestimmten Abschnitt anzugeben.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Events

Mithilfe der API für Bento Accordion kannst du auf die folgenden Events reagieren:

##### onExpandStateChange

Dieses Ereignis wird ausgelöst, wenn ein Akkordeonabschnitt erweitert wird. Das Ereignis wird vom erweiterten Abschnitt gesendet.

Ein Beispiel findest du weiter unten.

##### onCollapse

Dieses Ereignis wird ausgelöst, wenn ein Akkordeonabschnitt reduziert wird. Das Ereignis wird vom reduzierten Abschnitt gesendet.

Im folgenden Beispiel wartet `section 1` auf das Ereignis `expand`. Sobald dieser Abschnitt erweitert wird, wird auch `section 2` erweitert. `section 2` wartet auf das Ereignis `collapse`. Sobald dieser Abschnitt reduziert wird, wird auch `section 1` reduziert.

Ein Beispiel findest du weiter unten.

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

### Layout und Style

#### Containertyp

Die Komponente `BentoAccordion` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Oder via `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Eigenschaften

#### BentoAccordion

##### animate

Bei "true" wird die Animation "Rolldown"/"Rollup" beim Erweitern und Reduzieren jedes Abschnitts verwendet. Der Standardwert ist `false`.

##### expandSingleSection

Bei "true" werden beim Erweitern von einem beliebigen Abschnitt automatisch alle anderen Abschnitte reduziert. Der Standardwert ist `false`.

#### BentoAccordionSection

##### animate

Bei "true" wird die Animation "Rolldown"/"Rollup" beim Erweitern und Reduzieren dieses Abschnitts verwendet. Der Standardwert ist `false`.

##### expanded

Bei "true" wird der Abschnitt erweitert. Der Standardwert ist `false`.

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Callback, um auf Zustandsänderungen (erweitert/reduziert) zu warten. Hat ein boolesches Flag als Parameter, das angibt, ob der Abschnitt gerade erweitert wurde (`false` zeigt an, dass er reduziert wurde).

#### BentoAccordionHeader

#### Allgemeine Eigenschaften

Diese Komponente unterstützt die [allgemeinen Eigenschaften](../../../docs/spec/bento-common-props.md) von React und Preact Komponenten.

BentoAccordionHeader unterstützt noch keine benutzerdefinierten Eigenschaften.

#### BentoAccordionContent

#### Allgemeine Eigenschaften

Diese Komponente unterstützt die [allgemeinen Eigenschaften](../../../docs/spec/bento-common-props.md) von React und Preact Komponenten.

BentoAccordionContent unterstützt noch keine benutzerdefinierten Eigenschaften.
