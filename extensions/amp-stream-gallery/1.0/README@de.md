# Bento Stream Gallery

## Verwendung

Die Bento Stream Gallery dient der gleichzeitigen Anzeige mehrerer ähnlicher Inhalte entlang einer horizontalen Achse. Informationen zur Implementierung einer angepassten UX findest du unter [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md).

Verwende Bento Stream Gallery als Webkomponente ([`<bento-stream-gallery>`](#web-component)) oder als Preact/React Funktionskomponente ([`<BentoStreamGallery>`](#preactreact-component)).

### Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-stream-gallery>`.

#### Beispiel: Import via npm

[example preview="top-frame" playground="false"]

Installiere sie via npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### Beispiel: Einbinden via `<script>`

Das folgende Beispiel enthält ein `bento-stream-gallery` mit drei Abschnitten. Das Attribut `expanded` im dritten Abschnitt erweitert das Akkordeon beim Laden der Seite.

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <script async src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">

</head>
<body>
  <bento-stream-gallery>
    <img src="img1.png">
    <img src="img2.png">
    <img src="img3.png">
    <img src="img4.png">
    <img src="img5.png">
    <img src="img6.png">
    <img src="img7.png">
  </bento-stream-gallery>
  <script>
    (async () => {
      const streamGallery = document.querySelector('#my-stream-gallery');
      await customElements.whenDefined('bento-stream-gallery');
      const api = await streamGallery.getApi();

      // programatically expand all sections
      api.next();
      // programatically collapse all sections
      api.prev();
      // programatically go to slide
      api.goToSlide(4);
    })();
  </script>
</body>
```

[/example]

#### Interaktivität und API Nutzung

Bento-fähige Komponenten, die als eigenständige Komponenten verwendet werden, sind durch ihre API hochgradig interaktiv. Du kannst auf die API der `bento-stream-gallery` Komponente zugreifen, indem du das folgende Skript Tag in dein Dokument einfügst:

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### Aktionen

**next()**

Bewegt das Karussell um die Anzahl der sichtbaren Folien vorwärts.

```js
api.next();
```

**prev()**

Bewegt das Karussell um die Anzahl der sichtbaren Folien rückwärts.

```js
api.prev();
```

**goToSlide(index: number)**

Bewegt das Karussell zur Folie, die das Argument `index` angibt. Hinweis: `index` wird auf eine Zahl größer oder gleich `0` und kleiner als die Anzahl der insgesamt angegebenen Folien normalisiert.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Events

Mithilfe der Komponente Bento Stream Gallery kannst du die folgenden Events registrieren und darauf reagieren:

**slideChange**

Dieses Event wird ausgelöst, wenn sich der vom Karussell angezeigte Index ändert. Der neue Index kann über `event.data.index` abegrufen werden.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attribute

##### Verhalten

###### `controls`

Entweder `"always"`, `"auto"` oder `"never"`, der Standardwert ist `"auto"`. Dieses Attribut legt fest, ob und wann Navigationspfeile für die vorherigen/nächsten Folien angezeigt werden. Beachte: Wenn `outset-arrows` gleich `true` ist, so ist die Anzeige der Pfeile gleich `"always"`.

- `always`: Die Pfeile werden immer angezeigt.
- `auto`: Die Pfeile werden angezeigt, wenn das Karussell kürzlich eine Interaktion per Maus registriert hat, und nicht angezeigt, wenn das Karussell kürzlich eine Interaktion per Berührung registriert hat. Beim ersten Laden auf Touch-Geräten werden Pfeile bis zur ersten Interaktion angezeigt.
- `never`: Die Pfeile werden nie angezeigt.

###### `extra-space`

Entweder `"around"` oder undefiniert. Das legt die Art und Weise fest, wie zusätzlicher Raum nach der Anzeige der berechneten Anzahl sichtbarer Folien im Karussell zugewiesen wird. Bei `"around"` wird Leerraum gleichmäßig um das Karussell mit `justify-content: center` verteilt. Andernfalls wird der Raum bei LTR Dokumenten der rechten Karussellseite und bei RTL Dokumenten der linken Karussellseite zugewiesen.

###### `loop`

Entweder `true` oder `false`. Der Standardwert ist `false`. Wenn "true", ermöglicht das Karussell dem Benutzer, vom ersten Element zurück zum letzten Element zu wechseln und umgekehrt. Es müssen mindestens drei Folien sichtbar sein, damit eine Schleife ablaufen kann.

###### `outset-arrows`

Entweder `true` oder `false`. Der Standardwert ist `false`. Wenn "true", zeigt das Karussell die Pfeile als Outset auf beiden Seiten der Folien an. Beachte, dass bei Outset Pfeilen die Länge des Folien Containers effektiv um 100 px kürzer ist als der dem Container zugewiesene Raum: 50 px pro Pfeil auf jeder Seite. Bei "false" zeigt das Karussell seine Pfeile als Inset an, die den linken und rechten Rand der Folien überlagern.

###### `peek`

Eine Zahl mit dem Standardwert `0`. Sie bestimmt, wie viel von der nächsten Folie (auf einer oder beiden Seiten der aktuellen Folie) angezeigt wird, um dem Benutzer deutlich zu machen, dass dieser im Karussell durch Wischen blättern kann.

##### Sichtbarkeit der Folie in der Galerie

###### `min-visible-count`

Eine Zahl mit dem Standardwert `1`. Legt fest, wie viele Folien mindestens gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen.

###### `max-visible-count`

Eine Zahl mit dem Standardwert [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Legt fest, wie viele Folien maximal gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen.

###### `min-item-width`

Eine Zahl mit dem Standardwert `1`. Legt die Mindestbreite jedes Elements fest, anhand welcher ermittelt wird, wie viele ganze Elemente gleichzeitig innerhalb der Gesamtbreite der Galerie angezeigt werden können.

###### `max-item-width`

Eine Zahl mit dem Standardwert [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Legt die Maximalbreite jedes Elements fest, anhand welcher ermittelt wird, wie viele ganze Elemente gleichzeitig innerhalb der Gesamtbreite der Galerie angezeigt werden können.

##### Einrasten von Folien

###### `slide-align`

Entweder `start` oder `center`. Beim Ausrichten mit "start" wird der Anfang einer Folie (z. B. der linke Rand beim horizontalen Ausrichten) am Karussellanfang ausgerichtet. Beim Ausrichten mit "center" wird die Mitte einer Folie an der Karussellmitte ausgerichtet.

###### `snap`

Entweder `true` oder `false`, der Standardwert ist `true`. Legt fest, ob das Karussell beim Blättern auf Folien einrasten soll oder nicht.

#### Styling

Du kannst den Selektor für `bento-stream-gallery` verwenden, um das Akkordeon frei zu gestalten.

### Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoStreamGallery>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

#### Beispiel: Import via npm

[example preview="top-frame" playground="false"]

Installiere sie via npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import React from 'react';
import { BentoStreamGallery } from '@ampproject/bento-stream-gallery/react';
import '@ampproject/bento-stream-gallery/styles.css';

function App() {
  return (
    <BentoStreamGallery>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

[/example]

#### Interaktivität und API Nutzung

Bento Komponenten sind durch ihre API hochgradig interaktiv. Auf die Komponente `BentoStreamGallery` kann mittels Übergabe von `ref` zugegriffen werden:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoStreamGallery ref={ref}>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

##### Aktionen

Mithilfe der API für `BentoStreamGallery` kannst du die folgenden Aktionen ausführen:

**next()**

Bewegt das Karussell um `advanceCount` Folien vorwärts.

```javascript
ref.current.next();
```

**prev()**

Bewegt das Karussell um `advanceCount` Folien rückwärts.

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

Bewegt das Karussell zur Folie, die das Argument `index` angibt. Hinweis: `index` wird auf eine Zahl größer oder gleich `0` und kleiner als die Anzahl der insgesamt angegebenen Folien normalisiert.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### Events

**onSlideChange**

Dieses Event wird ausgelöst, wenn sich der vom Karussell angezeigte Index ändert.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### Layout und Style

**Containertyp**

Die Komponente `BentoStreamGallery` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `width` definiert wird). Diese können inline angewendet werden:

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

Oder via `className`:

```jsx
<BentoStreamGallery className='custom-styles'>
  ...
</BentoStreamGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

#### Eigenschaften

##### Allgemeine Eigenschaften

Diese Komponente unterstützt die [allgemeinen Eigenschaften](../../../docs/spec/bento-common-props.md) von React und Preact Komponenten.

##### Verhalten

###### `controls`

Entweder `"always"`, `"auto"` oder `"never"`, der Standardwert ist `"auto"`. Dieses Attribut legt fest, ob und wann Navigationspfeile für die vorherigen/nächsten Folien angezeigt werden. Beachte: Wenn `outset-arrows` gleich `true` ist, so ist die Anzeige der Pfeile gleich `"always"`.

- `always`: Die Pfeile werden immer angezeigt.
- `auto`: Die Pfeile werden angezeigt, wenn das Karussell kürzlich eine Interaktion per Maus registriert hat, und nicht angezeigt, wenn das Karussell kürzlich eine Interaktion per Berührung registriert hat. Beim ersten Laden auf Touch-Geräten werden Pfeile bis zur ersten Interaktion angezeigt.
- `never`: Die Pfeile werden nie angezeigt.

###### `extraSpace`

Entweder `"around"` oder undefiniert. Das legt die Art und Weise fest, wie zusätzlicher Raum nach der Anzeige der berechneten Anzahl sichtbarer Folien im Karussell zugewiesen wird. Bei `"around"` wird Leerraum gleichmäßig um das Karussell mit `justify-content: center` verteilt. Andernfalls wird der Raum bei LTR Dokumenten der rechten Karussellseite und bei RTL Dokumenten der linken Karussellseite zugewiesen.

###### `loop`

Entweder `true` oder `false`. Der Standardwert ist `false`. Wenn "true", ermöglicht das Karussell dem Benutzer, vom ersten Element zurück zum letzten Element zu wechseln und umgekehrt. Es müssen mindestens drei Folien sichtbar sein, damit eine Schleife ablaufen kann.

###### `outsetArrows`

Entweder `true` oder `false`. Der Standardwert ist `false`. Wenn "true", zeigt das Karussell die Pfeile als Outset auf beiden Seiten der Folien an. Beachte, dass bei Outset Pfeilen die Länge des Folien Containers effektiv um 100 px kürzer ist als der dem Container zugewiesene Raum: 50 px pro Pfeil auf jeder Seite. Bei "false" zeigt das Karussell seine Pfeile als Inset an, die den linken und rechten Rand der Folien überlagern.

###### `peek`

Eine Zahl mit dem Standardwert `0`. Sie bestimmt, wie viel von der nächsten Folie (auf einer oder beiden Seiten der aktuellen Folie) angezeigt wird, um dem Benutzer deutlich zu machen, dass dieser im Karussell durch Wischen blättern kann.

##### Sichtbarkeit der Folie in der Galerie

###### `minVisibleCount`

Eine Zahl mit dem Standardwert `1`. Legt fest, wie viele Folien mindestens gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen.

###### `maxVisibleCount`

Eine Zahl mit dem Standardwert [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Legt fest, wie viele Folien maximal gleichzeitig angezeigt werden sollen. Bruchzahlen können verwendet werden, um einen Teil einer weiteren Folie sichtbar zu machen.

###### `minItemWidth`

Eine Zahl mit dem Standardwert `1`. Legt die Mindestbreite jedes Elements fest, anhand welcher ermittelt wird, wie viele ganze Elemente gleichzeitig innerhalb der Gesamtbreite der Galerie angezeigt werden können.

###### `maxItemWidth`

Eine Zahl mit dem Standardwert [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Legt die Maximalbreite jedes Elements fest, anhand welcher ermittelt wird, wie viele ganze Elemente gleichzeitig innerhalb der Gesamtbreite der Galerie angezeigt werden können.

##### Einrasten von Folien

###### `slideAlign`

Entweder `start` oder `center`. Beim Ausrichten mit "start" wird der Anfang einer Folie (z. B. der linke Rand beim horizontalen Ausrichten) am Karussellanfang ausgerichtet. Beim Ausrichten mit "center" wird die Mitte einer Folie an der Karussellmitte ausgerichtet.

###### `snap`

Entweder `true` oder `false`, der Standardwert ist `true`. Legt fest, ob das Karussell beim Blättern auf Folien einrasten soll oder nicht.
