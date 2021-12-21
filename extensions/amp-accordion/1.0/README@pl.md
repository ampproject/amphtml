# Składnik Bento Accordion

Umożliwia wyświetlanie zwijanych i rozwijanych sekcji treści. Składnik ten umożliwia wyświetlającym stronę przeglądanie konspektu treści i przechodzenie do dowolnej sekcji. Efektywne użycie zmniejsza potrzebę przewijania na urządzeniach mobilnych.

- Składnik Bento Accordion akceptuje jeden lub wiele elementów `<section>` jako swoje bezpośrednie elementy podrzędne.
- Każdy element `<section>` musi zawierać dokładnie dwa elementy podrzędne.
- Pierwszy element podrzędny `<section>` jest nagłówkiem tej sekcji Bento Accordion. Musi to być element nagłówka, taki jak `<h1>–<h6>` lub `<header>`.
- Drugim elementem podrzędnym `<section>` jest rozwijana/zwijana treść.
    - Może to być dowolny znacznik dozwolony w [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
- Kliknięcie lub dotknięcie nagłówka `<section>` powoduje rozwinięcie lub zwinięcie sekcji.
- Składnik Bento Accordion ze zdefiniowanym `id` zachowuje stan zwinięcia lub rozwinięcia każdej sekcji, gdy użytkownik pozostaje na Twojej domenie.

## Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-accordion>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Przykład: dołączanie za pomocą znacznika `<script>`

Poniższy przykład zawiera składnik `bento-accordion` z trzema sekcjami. Atrybut `expanded` w trzeciej sekcji powoduje jej rozwinięcie podczas ładowania strony.

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

### Interaktywność i wykorzystanie interfejsu API

Składniki z obsługą Bento używane samodzielnie są wysoce interaktywne dzięki swojemu interfejsowi API. Interfejs API składnika `bento-accordion` jest dostępny poprzez umieszczenie w dokumencie następującego znacznika script:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Działania

##### toggle()

Działanie `toggle` przełącza stany `expanded` i  `collapsed` sekcji składnika `bento-accordion`. Jeśli zostanie wywołane bez argumentów, przełącza wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

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

Działanie `expand` przełącza sekcje składnika `bento-accordion`. Jeśli sekcja jest już rozwinięta, zostaje zwinięta. Jeśli działanie zostanie wywołane bez argumentów, rozwija wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

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

Działanie `collapse` zwija sekcje składnika `bento-accordion`. Jeśli sekcja jest już zwinięta, zostaje rozwinięta. Jeśli działanie zostanie wywołane bez argumentów, zwija wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

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

#### Zdarzenia

Interfejs API składnika `bento-accordion` umożliwia rejestrowanie następujących zdarzeń i reagowanie na nie:

##### expand

To zdarzenie jest wyzwalane, gdy sekcja akordeonu zostanie rozwinięta i jest wysyłane z rozwiniętej sekcji.

Przykład widnieje poniżej.

##### collapse

To zdarzenie jest wyzwalane, gdy sekcja akordeonu zostanie zwinięta i jest wysyłane ze zwiniętej sekcji.

W poniższym przykładzie element `section 1` nasłuchuje zdarzenia `expand` i rozwija sekcję `section 2` w razie jej rozwinięcia. Element `section 2` nasłuchuje zdarzenia `collapse` i zwija sekcję `section 1` w razie jej zwinięcia.

Przykład widnieje poniżej.

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

### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

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

### Atrybuty

#### animate

Dołącz atrybut `animate` do składnika `<bento-accordion>`, aby dodać animację „rozwijania w dół”, gdy zawartość jest rozwijana i animację „zwijania w górę”, gdy jest zwinięta.

Ten atrybut można konfigurować na podstawie [zapytania o multimedia](./../../../docs/spec/amp-html-responsive-attributes.md).

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

Zastosuj atrybut `expanded` do zagnieżdżonego elementu `<section>`, aby rozwinąć tę sekcję podczas ładowania strony.

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

Aby umożliwić rozwijanie tylko jednej sekcji, należy zastosować atrybut `expand-single-section` do elementu `<bento-accordion>`. Wówczas, jeśli użytkownik dotknie zwiniętego elementu `<section>`, spowoduje to jej rozwinięcie i zwinięcie innych rozwiniętych elementów `<section>`.

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

### Stylizacja

Za pomocą selektora elementu `bento-accordion` można dowolnie stylizować akordeon.

Podczas stylizacji składnika amp-accordion należy pamiętać o następujących kwestiach:

- Elementy `bento-accordion` są zawsze typu `display: block`.
- Za pomocą właściwości `float` nie można stylizować elementu `<section>`, nagłówka ani elementów treści.
- Rozwinięta sekcja stosuje atrybut `expanded` do elementu `<section>`.
- Element content jest czyszczony techniką clearfix za pomocą właściwości `overflow: hidden` i dlatego nie może mieć pasków przewijania.
- Marginesy elementów `<bento-accordion>`, `<section>`, nagłówka i treści są ustawiane na `0`, ale można je zastąpić w stylach niestandardowych.
- Zarówno nagłówek, jak i elementy treści mają właściwość `position: relative`.

---

## Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoAccordion>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

### Przykład: import za pomocą narzędzia npm

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

### Interaktywność i wykorzystanie interfejsu API

Składniki Bento są wysoce interaktywne poprzez ich interfejs API. Interfejs API składnika `BentoAccordion` jest dostępny poprzez przekazanie `ref`:

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

#### Działania

Interfejs API składnika `BentoAccordion` umożliwia wykonanie następujących działań:

##### toggle()

Działanie `toggle` przełącza stany `expanded` i  `collapsed` sekcji składnika `bento-accordion`. Jeśli zostanie wywołane bez argumentów, przełącza wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

Działanie `expand` przełącza sekcje składnika `bento-accordion`. Jeśli sekcja jest już rozwinięta, zostaje zwinięta. Jeśli działanie zostanie wywołane bez argumentów, rozwija wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

Działanie `collapse` zwija sekcje składnika `bento-accordion`. Jeśli sekcja jest już zwinięta, zostaje rozwinięta. Jeśli działanie zostanie wywołane bez argumentów, zwija wszystkie sekcje akordeonu. Aby określić daną sekcję, dodaj argument `section` i jako wartości użyj odpowiadającego mu `id`.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Zdarzenia

Interfejs API składnika Bento Accordion umożliwia reagowanie na następujące zdarzenia:

##### onExpandStateChange

To zdarzenie jest wyzwalane w sekcji, gdy sekcja akordeonu zostanie rozwinięta lub zwinięta i jest wysyłane z rozwiniętej sekcji.

Przykład widnieje poniżej.

##### onCollapse

To zdarzenie jest wyzwalane, gdy sekcja akordeonu zostanie zwinięta i jest wysyłane ze zwiniętej sekcji.

W poniższym przykładzie element `section 1` nasłuchuje zdarzenia `expand` i rozwija sekcję `section 2` w razie jej rozwinięcia. Element `section 2` nasłuchuje zdarzenia `collapse` i zwija sekcję `section 1` w razie jej zwinięcia.

Przykład widnieje poniżej.

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

### Układ i styl

#### Typ kontenera

Składnik `BentoAccordion` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju). Można je zastosować inline:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Albo za pomocą atrybutu `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Właściwości

#### BentoAccordion

##### animate

Jeśli ma wartość true, stosuje animację „rozwijania w dół” / „zwijania w górę” podczas rozwijania i zwijania każdej sekcji Domyślnie: `false`

##### expandSingleSection

Jeśli ma wartość true, rozwinięcie jednej sekcji spowoduje automatyczne zwinięcie wszystkich pozostałych sekcji: Domyślnie: `false`

#### BentoAccordionSection

##### animate

Jeśli ma wartość true, stosuje animację „rozwijania w dół” / „zwijania w górę” podczas rozwijania i zwijania sekcji Domyślnie: `false`

##### expanded

Jeśli ma wartość true, rozwija sekcję. Domyślnie: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Wywołanie zwrotne do nasłuchiwania zmian stanu rozwinięcia. Pobiera jako parametr flagę boolowską wskazującą, czy sekcja została właśnie rozwinięta (wartość `false` wskazuje, że została zwinięta).

#### BentoAccordionHeader

#### Wspólne właściwości

Ten składnik obsługuje [wspólne właściwości](../../../docs/spec/bento-common-props.md) składników React i Preact.

Składnik BentoAccordionHeader nie obsługuje jeszcze żadnych właściwości niestandardowych

#### BentoAccordionContent

#### Wspólne właściwości

Ten składnik obsługuje [wspólne właściwości](../../../docs/spec/bento-common-props.md) składników React i Preact.

Składnik BentoAccordionContent nie obsługuje jeszcze żadnych właściwości niestandardowych
