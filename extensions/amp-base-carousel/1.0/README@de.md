# Bento Carousel

Ein generisches Karussell zum Anzeigen mehrerer ähnlicher Inhalte entlang einer horizontalen oder vertikalen Achse.

Jedes der unmittelbar untergeordneten Elemente der Komponente wird als Element im Karussell behandelt. Jedes dieser Nodes kann ebenfalls beliebige untergeordnete Elemente haben.

Das Karussell besteht aus einer beliebigen Anzahl von Elementen sowie optionalen Navigationspfeilen, mit denen einzelne Elemente vor- und zurückgeblättert werden können.

Das Karussell wechselt zwischen den Elementen, wenn der Benutzer wischt oder die anpassbaren Pfeilbuttons verwendet.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-base-carousel>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Beispiel: Einbinden via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Interaktivität und API Nutzung

Bento-fähige Komponenten, die als eigenständige Webkomponenten verwendet werden, sind durch ihre API hochgradig interaktiv. Du kannst auf die API der `bento-base-carousel` Komponente zugreifen, indem du das folgende Skript Tag in dein Dokument einfügst:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Aktionen

Mithilfe der API für `bento-base-carousel` kannst du die folgenden Aktionen ausführen:

##### next()

Bewegt das Karussell um `advance-count` Folien vorwärts.

```javascript
api.next();
```

##### prev()

Bewegt das Karussell um `advance-count` Folien rückwärts.

```javascript
api.prev();
```

##### goToSlide(index: number)

Bewegt das Karussell zur Folie, die das Argument `index` angibt. Beachte: `index` wird auf eine Zahl größer oder gleich `0` und kleiner als die Anzahl der insgesamt angegebenen Folien normalisiert.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Events

Mithilfe der API für `bento-base-carousel` kannst du die folgenden Events registrieren und darauf reagieren:

##### slideChange

Dieses Event wird ausgelöst, wenn sich der vom Karussell angezeigte Index ändert. Der neue Index kann über `event.data.index` abegrufen werden.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Containertyp

Die Komponente `bento-base-carousel` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Folienwechsel von rechts nach links

`<bento-base-carousel>` erfordert, dass du angibst, ob das Karussell in einem Rechts-nach-Links (RTL) Kontext verwendet wird (z. B. auf arabischen, hebräischen Seiten). Während das Karussell grundsätzlich auch ohne diese Angabe funktioniert, könnten Fehler auftreten. Teile dem Karussell den `rtl` Kontext wie folgt mit:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Wenn sich das Karussell in einem RTL Kontext befindet, aber als LTR funktionieren soll, kannst du explizit den Wert `dir="ltr"` für das Karussell angeben.

### Folienlayout

Die Größe der Folien wird automatisch vom Karussell angepasst, wenn **keine** Angabe von `mixed-lengths` erfolgt.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Die Folien haben bei der Darstellung des Karussells eine implizite Höhe. Diese kann mit CSS problemlos geändert werden. Ist eine Höhe angegeben, so wird die Folie im Karussell vertikal zentriert.

Wenn du den Folieninhalt horizontal zentrieren möchtest, erstelle ein Wrapper Element und verwende dieses zum Zentrieren des Inhalts.

### Anzahl der sichtbaren Folien

Wenn du die Anzahl der sichtbaren Folien mithilfe von `visible-slides` als Reaktion auf eine Medienabfrage änderst, solltest du am besten auch das Seitenverhältnis des Karussells selbst ändern, damit es der neuen Anzahl sichtbarer Folien entspricht. Wenn du beispielsweise drei Folien gleichzeitig mit einem Seitenverhältnis von 1:1 anzeigen möchtest, solltest du für das Karussell selbst ein Seitenverhältnis von 3:1 verwenden. Nach demselben Prinzip brauchst du bei vier Folien gleichzeitig ein Seitenverhältnis von 4:1. Außerdem solltest du beim Ändern von `visible-slides` auch `advance-count` ändern.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Attribute

#### Medienabfragen

Die Attribute für `<bento-base-carousel>` können so konfiguriert werden, dass basierend auf einer [Medienabfrage](./../../../docs/spec/amp-html-responsive-attributes.md) unterschiedliche Optionen verwendet werden.

#### Anzahl der sichtbaren Folien

##### mixed-length

Entweder `true` oder `false`, der Standardwert ist `false`. Bei "true" wird die vorhandene Breite (oder Höhe, falls horizontal) für jede der Folien verwendet. So kann ein Karussell unterschiedlich breite Folien enthalten.

##### visible-count

Eine Zahl, der Standardwert ist `1`. Legt fest, wie viele Folien gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen. Diese Option wird ignoriert, wenn `mixed-length` den Wert `true` besitzt.

##### advance-count

Eine Zahl, der Standardwert ist `1`. Legt fest, um wie viele Folien die Vor- und Zurück-Pfeile das Karussell vor- bzw. zurückblättern. Dies ist nützlich, wenn du das Attribut `visible-count` angibst.

#### Automatisches Vorblättern

##### auto-advance

Entweder `true` oder `false`, der Standardwert ist `false`. Blättert das Karussell mit einer Verzögerung automatisch zur nächsten Folie weiter. Wenn der Benutzer die Folien manuell ändert, wird das automatische Vorblättern gestoppt. Beachte: Wenn `loop` nicht aktiviert ist, beginnt die Funktion "auto-advance" beim Erreichen des letzten Elements rückwärts zum ersten Element zu blättern.

##### auto-advance-count

Eine Zahl, der Standardwert ist `1`. Legt fest, um wie viele Folien das Karussell beim automatischen Vorblättern blättert. Dies ist nützlich, wenn du das Attribut `visible-count` angibst.

##### auto-advance-interval

Eine Zahl, der Standardwert ist `1000`. Gibt die Zeitspanne in Millisekunden zwischen aufeinanderfolgenden automatischen Vorläufen des Karussells an.

##### auto-advance-loops

Eine Zahl, der Standardwert ist `∞`. Gibt die Häufigkeit an, mit der das Karussell die Folien durchlaufen soll, bevor es anhält.

#### Einrasten

##### snap

Entweder `true` oder `false`, der Standardwert ist `true`. Legt fest, ob das Karussell beim Blättern auf Folien einrasten soll oder nicht.

##### snap-align

Entweder `start` oder `center`. Beim Ausrichten mit "start" wird der Anfang einer Folie (z. B. der linke Rand beim horizontalen Ausrichten) am Karussellanfang ausgerichtet. Beim Ausrichten mit "center" wird die Mitte einer Folie an der Karussellmitte ausgerichtet.

##### snap-by

Eine Zahl, der Standardwert ist `1`. Dies bestimmt die Granularität des Einrastens und ist bei der Verwendung von `visible-count` nützlich.

#### Sonstiges

##### controls

Entweder `"always"`, `"auto"` oder `"never"`, der Standardwert ist `"auto"`. Dieses Attribut legt fest, ob und wann Navigationspfeile für die vorherigen/nächsten Folien angezeigt werden. Beachte: Wenn `outset-arrows` gleich `true` ist, so ist die Anzeige der Pfeile gleich `"always"`.

-   `always`: Die Pfeile werden immer angezeigt.
-   `auto`: Die Pfeile werden angezeigt, wenn das Karussell kürzlich eine Interaktion per Maus registriert hat, und nicht angezeigt, wenn das Karussell kürzlich eine Interaktion per Berührung registriert hat. Beim ersten Laden auf Touch-Geräten werden Pfeile bis zur ersten Interaktion angezeigt.
-   `never`: Die Pfeile werden nie angezeigt.

##### slide

Eine Zahl, der Standardwert ist `0`. Das bestimmt die im Karussell als erstes angezeigte Folie. Kann mittels `Element.setAttribute` verändert werden, um zu steuern, welche Folie gerade angezeigt wird.

##### loop

Entweder `true` oder `false`. Der Standardwert ist `false`, falls dieses Attribut weggelassen wird. Wenn "true", ermöglicht das Karussell dem Benutzer, vom ersten Element zurück zum letzten Element zu wechseln und umgekehrt. Die Anzahl der Folien muss mindestens dem Dreifachen des Wertes von `visible-count` entsprechen, damit eine Schleife ablaufen kann.

##### orientation

Entweder `horizontal` oder `vertical`, der Standardwert ist `horizontal`. Bei `horizontal` wird das Karussell horizontal ausgerichtet, wobei der Benutzer nach links und rechts wischen kann. Bei `vertical` wird das Karussell vertikal ausgerichtet, wobei der Benutzer nach oben und unten wischen kann.

### Styling

Du kannst den Selektor für `bento-base-carousel` verwenden, um das Karussell frei zu gestalten.

#### Pfeilbuttons anpassen

Die Pfeilbuttons können mit deinem eigenen benutzerdefinierten Markup angepasst werden. Das standardmäßige Styling kann z.B. mit dem folgenden HTML und CSS erstellt werden:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoBaseCarousel>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Interaktivität und API Nutzung

Bento Komponenten sind durch ihre API hochgradig interaktiv. Auf die Komponente `BentoBaseCarousel` kann mittels Übergabe von `ref` zugegriffen werden:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Aktionen

Mithilfe der API für `BentoBaseCarousel` kannst du die folgenden Aktionen ausführen:

##### next()

Bewegt das Karussell um `advanceCount` Folien vorwärts.

```javascript
ref.current.next();
```

##### prev()

Bewegt das Karussell um `advanceCount` Folien rückwärts.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Bewegt das Karussell zur Folie, die das Argument `index` angibt. Beachte: `index` wird auf eine Zahl größer oder gleich `0` und kleiner als die Anzahl der insgesamt angegebenen Folien normalisiert.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Events

Mithilfe der API für `BentoBaseCarousel` kannst du die folgenden Events registrieren und darauf reagieren:

##### onSlideChange

Dieses Event wird ausgelöst, wenn sich der vom Karussell angezeigte Index ändert.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Layout und Style

#### Containertyp

Die Komponente `BentoBaseCarousel` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Oder via `className`:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Folienwechsel von rechts nach links

`<BentoBaseCarousel>` erfordert, dass du angibst, ob das Karussell in einem Rechts-nach-Links (RTL) Kontext verwendet wird (z. B. auf arabischen, hebräischen Seiten). Während das Karussell grundsätzlich auch ohne diese Angabe funktioniert, könnten Fehler auftreten. Teile dem Karussell den `rtl` Kontext wie folgt mit:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Wenn sich das Karussell in einem RTL Kontext befindet, aber als LTR funktionieren soll, kannst du explizit den Wert `dir="ltr"` für das Karussell angeben.

### Folienlayout

Die Größe der Folien wird automatisch vom Karussell angepasst, wenn **keine** Angabe von `mixedLengths` erfolgt.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Die Folien haben bei der Darstellung des Karussells eine implizite Höhe. Diese kann mit CSS problemlos geändert werden. Ist eine Höhe angegeben, so wird die Folie im Karussell vertikal zentriert.

Wenn du den Folieninhalt horizontal zentrieren möchtest, erstelle ein Wrapper Element und verwende dieses zum Zentrieren des Inhalts.

### Anzahl der sichtbaren Folien

Wenn du die Anzahl der sichtbaren Folien mithilfe von `visibleSlides` als Reaktion auf eine Medienabfrage änderst, solltest du am besten auch das Seitenverhältnis des Karussells selbst ändern, damit es der neuen Anzahl sichtbarer Folien entspricht. Wenn du beispielsweise drei Folien gleichzeitig mit einem Seitenverhältnis von 1:1 anzeigen möchtest, solltest du für das Karussell selbst ein Seitenverhältnis von 3:1 verwenden. Nach demselben Prinzip brauchst du bei vier Folien gleichzeitig ein Seitenverhältnis von 4:1. Außerdem solltest du beim Ändern von `visibleSlides` auch `advanceCount` ändern.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Eigenschaften

#### Anzahl der sichtbaren Folien

##### mixedLength

Entweder `true` oder `false`, der Standardwert ist `false`. Bei "true" wird die vorhandene Breite (oder Höhe, falls horizontal) für jede der Folien verwendet. So kann ein Karussell unterschiedlich breite Folien enthalten.

##### visibleCount

Eine Zahl, standardmäßig `1`. Legt fest, wie viele Folien gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen. Diese Option wird ignoriert, wenn `mixedLength` den Wert `true` besitzt.

##### advanceCount

Eine Zahl, der Standardwert ist `1`. Legt fest, um wie viele Folien die Vor- und Zurück-Pfeile das Karussell vor- bzw. zurückblättern. Dies ist nützlich, wenn du das Attribut `visibleCount` angibst.

#### Automatisches Vorblättern

##### autoAdvance

Entweder `true` oder `false`, der Standardwert ist `false`. Blättert das Karussell mit einer Verzögerung automatisch zur nächsten Folie weiter. Wenn der Benutzer die Folien manuell ändert, wird das automatische Vorblättern gestoppt. Beachte: Wenn `loop` nicht aktiviert ist, beginnt die Funktion "autoAdvance" beim Erreichen des letzten Elements rückwärts zum ersten Element zu blättern.

##### autoAdvanceCount

Eine Zahl, der Standardwert ist `1`. Legt fest, um wie viele Folien das Karussell beim automatischen Vorblättern blättert. Dies ist nützlich, wenn du das Attribut `visible-count` angibst.

##### autoAdvanceInterval

Eine Zahl, der Standardwert ist `1000`. Gibt die Zeitspanne in Millisekunden zwischen aufeinanderfolgenden automatischen Vorläufen des Karussells an.

##### autoAdvanceLoops

Eine Zahl, der Standardwert ist `∞`. Gibt die Häufigkeit an, mit der das Karussell die Folien durchlaufen soll, bevor es anhält.

#### Einrasten

##### snap

Entweder `true` oder `false`, der Standardwert ist `true`. Legt fest, ob das Karussell beim Blättern auf Folien einrasten soll oder nicht.

##### snapAlign

Entweder `start` oder `center`. Beim Ausrichten mit "start" wird der Anfang einer Folie (z. B. der linke Rand beim horizontalen Ausrichten) am Karussellanfang ausgerichtet. Beim Ausrichten mit "center" wird die Mitte einer Folie an der Karussellmitte ausgerichtet.

##### snapBy

Eine Zahl, der Standardwert ist `1`. Dies bestimmt die Granularität des Einrastens und ist bei der Verwendung von `visible-count` nützlich.

#### Sonstiges

##### controls

Entweder `"always"`, `"auto"` oder `"never"`, der Standardwert ist `"auto"`. Dieses Attribut legt fest, ob und wann Navigationspfeile für die vorherigen/nächsten Folien angezeigt werden. Beachte: Wenn `outset-arrows` gleich `true` ist, so ist die Anzeige der Pfeile gleich `"always"`.

-   `always`: Die Pfeile werden immer angezeigt.
-   `auto`: Die Pfeile werden angezeigt, wenn das Karussell kürzlich eine Interaktion per Maus registriert hat, und nicht angezeigt, wenn das Karussell kürzlich eine Interaktion per Berührung registriert hat. Beim ersten Laden auf Touch-Geräten werden Pfeile bis zur ersten Interaktion angezeigt.
-   `never`: Die Pfeile werden nie angezeigt.

##### defaultSlide

Eine Zahl, der Standardwert ist `0`. Das bestimmt die im Karussell als erstes angezeigte Folie.

##### loop

Entweder `true` oder `false`. Der Standardwert ist `false`, falls dieses Attribut weggelassen wird. Wenn "true", ermöglicht das Karussell dem Benutzer, vom ersten Element zurück zum letzten Element zu wechseln und umgekehrt. Die Anzahl der Folien muss mindestens dem Dreifachen des Wertes von `visible-count` entsprechen, damit eine Schleife ablaufen kann.

##### orientation

Entweder `horizontal` oder `vertical`, der Standardwert ist `horizontal`. Bei `horizontal` wird das Karussell horizontal ausgerichtet, wobei der Benutzer nach links und rechts wischen kann. Bei `vertical` wird das Karussell vertikal ausgerichtet, wobei der Benutzer nach oben und unten wischen kann.

### Styling

Du kannst den Selektor für `BentoBaseCarousel` verwenden, um das Karussell frei zu gestalten.

#### Pfeilbuttons anpassen

Die Pfeilbuttons können mit deinem eigenen benutzerdefinierten Markup angepasst werden. Das standardmäßige Styling kann z.B. mit dem folgenden HTML und CSS erstellt werden:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
