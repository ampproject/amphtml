# Bento Sidebar

Bietet eine Möglichkeit, Meta Inhalte anzuzeigen, die für temporären Zugriff gedacht sind, wie Navigation, Links, Buttons, Menüs. Die Seitenleiste kann durch Tippen auf einen Button angezeigt werden, während der Hauptinhalt optisch dahinter bleibt.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-sidebar>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Beispiel: Einbinden via `<script>`

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

Du kannst ein Bento Toolbar Element erstellen, das im `<body>` angezeigt wird, indem du das Attribut `toolbar` mit einer Medienabfrage und das Attribut `toolbar-target` mit einer Element-ID in einem `<nav>` Element angibst, das ein untergeordnetes Element von `<bento-sidebar>` ist. `toolbar` dupliziert das Element `<nav>` und seine untergeordneten Elemente und hängt es an das Element `toolbar-target` an.

#### Verhalten

- In der Seitenleiste kannst du Symbolleisten implementieren, indem du Navigationselemente mit dem Attribut `toolbar` und dem Attribut `toolbar-target` hinzufügst.
- Das Navigationselement muss ein untergeordnetes Element von `<bento-sidebar>` sein und dieses Format besitzen: `<nav toolbar="(media-query)" toolbar-target="elementID">`
    - Dies wäre beispielsweise eine gültige Verwendung der Symbolleiste: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`
- Das Verhalten der Symbolleiste wird nur angewendet, während die Medienabfrage des Attributs <br>`toolbar` gültig ist. Außerdem muss auf der Seite ein Element mit der Attribut-ID `toolbar-target` vorhanden sein, damit die Symbolleiste angewendet wird.

##### Beispiel: Einfache Symbolleiste

Im folgenden Beispiel zeigen wir eine `toolbar` an, wenn die Fensterbreite kleiner oder gleich 767px ist. Die `toolbar` enthält ein Element zur Sucheingabe. Das `toolbar` Element wird an das Element `<div id="target-element">` angehängt.

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

### Interaktivität und API Nutzung

Bento-fähige Komponenten, die als eigenständige Webkomponenten verwendet werden, sind durch ihre API hochgradig interaktiv. Du kannst auf die API der `bento-sidebar` Komponente zugreifen, indem du das folgende Skript Tag in dein Dokument einfügst:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Aktionen

Mithilfe der API für `bento-sidebar` kannst du die folgenden Aktionen ausführen:

##### open()

Öffnet die Seitenleiste.

```javascript
api.open();
```

##### close()

Schließt die Seitenleiste.

```javascript
api.close();
```

##### toggle()

Schaltet zwischen dem geöffneten und geschlossenen Zustand der Seitenleiste um.

```javascript
api.toggle(0);
```

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Eigene Stile

Die Komponente `bento-sidebar` kann mit Standard CSS gestaltet werden.

- Die Breite `width` von `bento-sidebar` kann geändert werden, wenn die voreingestellte Breite von 45px nicht erwünscht ist.
- Die Höhe von `bento-sidebar` kann bei Bedarf geändert werden, um die Höhe der Seitenleiste anzupassen. Wenn die Höhe 100vw überschreitet, hat die Seitenleiste eine vertikale Bildlaufleiste. Die voreingestellte Höhe der Seitenleiste beträgt 100vw und kann in CSS überschrieben werden, um sie zu verkürzen.
- Der aktuelle Zustand der Seitenleiste wird über das Attribut `open` angezeigt, das im Tag `bento-sidebar` festgelegt wird, wenn die Seitenleiste auf der Seite geöffnet ist.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### UX Überlegungen

Denke bei der Verwendung von `<bento-sidebar>` daran, dass deine Nutzer deine Seite häufig auf Mobilgeräten aufrufen, die möglicherweise eine Kopfzeile mit fester Position anzeigen. Darüber hinaus zeigen Browser oft einen eigenen festen Header am oberen Rand der Seite an. Das Hinzufügen eines weiteren Elements mit fester Position am oberen Bildschirmrand würde viel Platz auf einem mobilen Bildschirm beanspruchen und dabei nur Inhalte präsentieren, die dem Nutzer keine neuen Informationen liefern.

Aus diesem Grund empfehlen wir, das Element zum Öffnen der Seitenleiste nicht in einem festen Header mit voller Breite zu platzieren.

- Die Seitenleiste kann nur auf der linken oder rechten Seite einer Seite erscheinen.
- Die maximale Höhe der Seitenleiste beträgt 100vh. Wenn die Höhe 100vh überschreitet, wird eine vertikale Bildlaufleiste angezeigt. Die Standardhöhe beträgt in CSS 100vh und kann mit CSS überschrieben werden.
- Die Breite der Seitenleiste kann per CSS eingestellt und angepasst werden.
- `<bento-sidebar>` wird als direktes untergeordnetes Element von `<body>` *empfohlen*, um eine logische DOM Reihenfolge zwecks Barrierefreiheit beizubehalten und zu vermeiden, dass das Verhalten durch ein Containerelement geändert wird. Beachte, dass ein übergeordnetes Element von `bento-sidebar` mit einem festgelegten `z-index` dazu führen kann, dass die Sidebar hinter anderen Elementen (z. B. Überschriften) angezeigt wird, wodurch ihre Funktionalität beeinträchtigt wird.

### Attribute

#### side

Gibt an, ob die Seitenleiste links (`left`) oder rechts (`right`) auf der Seite geöffnet werden soll. Ist `side` nicht angegeben, wird der Wert für `side` vom Attribut `dir` des Tags `body` geerbt (`ltr` =&gt; `left` , `rtl` =&gt; `right`); falls kein `dir` angegeben wurde, erhält `side` den Standardwert `left`.

#### open

Dieses Attribut ist vorhanden, wenn die Seitenleiste geöffnet ist.

#### toolbar

Dieses Attribut ist in untergeordneten Elementen `<nav toolbar="(media-query)" toolbar-target="elementID">` vorhanden und akzeptiert eine Medienabfrage, die bestimmt, wann die Symbolleiste angezeigt werden soll. Weitere Informationen über die Verwendung der Symbolleiste findest du im Abschnitt [Symbolleiste](#bento-toolbar).

#### toolbar-target

Dieses Attribut ist im untergeordneten Element `<nav toolbar="(media-query)" toolbar-target="elementID">` vorhanden und akzeptiert die ID eines Elements auf der Seite. Das Attribut `toolbar-target` platziert die Symbolleiste ohne den standardmäßigen Symbolleistenstil in der angegebenen ID des Elements auf der Seite. Weitere Informationen über die Verwendung der Symbolleiste findest du im Abschnitt [Symbolleiste](#bento-toolbar).

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoSidebar>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

Du kannst ein Bento Toolbar Element erstellen, das im `<body>` angezeigt wird, indem du die Eigenschaft `toolbar` mit einer Medienabfrage und die Eigenschaft `toolbarTarget` mit einer Element-ID in einer `<BentoSidebarToolbar>` Komponente angibst, die ein untergeordnetes Element von `<bentoSidebar>` ist. `toolbar` dupliziert das Element `<BentoSidebarToolbar>` und seine untergeordneten Elemente und hängt es an das Element `toolbarTarget` an.

#### Verhalten

- In der Seitenleiste kannst du Symbolleisten implementieren, indem du Navigationselemente mit der Eigenschaft `toolbar` und der Eigenschaft `toolbarTarget` hinzufügst.
- Das Navigationselement muss ein untergeordnetes Element von `<BentoSidebar>` sein und dieses Format besitzen: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`
    - Dies wäre beispielsweise eine gültige Verwendung der Symbolleiste: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`
- Das Verhalten der Symbolleiste wird nur angewendet, während die Medienabfrage der Eigenschaft `toolbar` gültig ist. Außerdem muss auf der Seite ein Element mit der Eigenschaft-ID `toolbarTarget` vorhanden sein, damit die Symbolleiste angewendet wird.

##### Beispiel: Einfache Symbolleiste

Im folgenden Beispiel zeigen wir eine `toolbar` an, wenn die Fensterbreite kleiner oder gleich 767px ist. Die `toolbar` enthält ein Element zur Sucheingabe. Das `toolbar` Element wird an das Element `<div id="target-element">` angehängt.

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

### Interaktivität und API Nutzung

Bento Komponenten sind durch ihre API hochgradig interaktiv. Auf die Komponente `BentoSidebar` kann mittels Übergabe von `ref` zugegriffen werden:

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

#### Aktionen

Mithilfe der API für `BentoSidebar` kannst du die folgenden Aktionen ausführen:

##### open()

Öffnet die Seitenleiste.

```javascript
ref.current.open();
```

##### close()

Schließt die Seitenleiste.

```javascript
ref.current.close();
```

##### toggle()

Schaltet zwischen dem geöffneten und geschlossenen Zustand der Seitenleiste um.

```javascript
ref.current.toggle(0);
```

### Layout und Style

Die Komponente `BentoSidebar` kann mit Standard CSS gestaltet werden.

- Die Breite `width` von `bento-sidebar` kann geändert werden, wenn die voreingestellte Breite von 45px nicht erwünscht ist.
- Die Höhe von `bento-sidebar` kann bei Bedarf geändert werden, um die Höhe der Seitenleiste anzupassen. Wenn die Höhe 100vw überschreitet, hat die Seitenleiste eine vertikale Bildlaufleiste. Die voreingestellte Höhe der Seitenleiste beträgt 100vw und kann in CSS überschrieben werden, um sie zu verkürzen.

Um sicherzustellen, dass die Komponente wie gewünscht gerendert wird, musst du ihr eine Größe zuweisen. Das kann inline angewendet werden:

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

Oder via `className`:

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

### UX Überlegungen

Denke bei der Verwendung von `<BentoSidebar>` daran, dass deine Nutzer deine Seite häufig auf Mobilgeräten aufrufen, die möglicherweise eine Kopfzeile mit fester Position anzeigen. Darüber hinaus zeigen Browser oft einen eigenen festen Header am oberen Rand der Seite an. Das Hinzufügen eines weiteren Elements mit fester Position am oberen Bildschirmrand würde viel Platz auf einem mobilen Bildschirm beanspruchen und dabei nur Inhalte präsentieren, die dem Nutzer keine neuen Informationen liefern.

Aus diesem Grund empfehlen wir, das Element zum Öffnen der Seitenleiste nicht in einem festen Header mit voller Breite zu platzieren.

- Die Seitenleiste kann nur auf der linken oder rechten Seite einer Seite erscheinen.
- Die maximale Höhe der Seitenleiste beträgt 100vh. Wenn die Höhe 100vh überschreitet, wird eine vertikale Bildlaufleiste angezeigt. Die Standardhöhe beträgt in CSS 100vh und kann mit CSS überschrieben werden.
- Die Breite der Seitenleiste kann per CSS eingestellt und angepasst werden.
- `<BentoSidebar>` wird als direktes untergeordnetes Element von <code>&lt;body&gt;</code> <em>empfohlen</em>, um eine logische DOM Reihenfolge zwecks Barrierefreiheit beizubehalten und zu vermeiden, dass das Verhalten durch ein Containerelement geändert wird. Beachte, dass ein übergeordnetes Element von `BentoSidebar` mit einem festgelegten `z-index` dazu führen kann, dass die Sidebar hinter anderen Elementen (z. B. Überschriften) angezeigt wird, wodurch ihre Funktionalität beeinträchtigt wird.

### Eigenschaften

#### side

Gibt an, ob die Seitenleiste links (`left`) oder rechts (`right`) auf der Seite geöffnet werden soll. Ist `side` nicht angegeben, wird der Wert für `side` vom Attribut `dir` des Tags `body` geerbt (`ltr` =&gt; `left` , `rtl` =&gt; `right`); falls kein `dir` angegeben wurde, erhält `side` den Standardwert `left`.

#### toolbar

Diese Eigenschaft ist in untergeordneten Elementen `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` vorhanden und akzeptiert eine Medienabfrage, die bestimmt, wann die Symbolleiste angezeigt werden soll. Weitere Informationen über die Verwendung der Symbolleiste findest du im Abschnitt [Symbolleiste](#bento-toolbar).

#### toolbarTarget

Dieses Attribut ist im untergeordneten Element `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` vorhanden und akzeptiert die ID eines Elements auf der Seite. Die Eigenschaft `toolbarTarget` platziert die Symbolleiste ohne den standardmäßigen Symbolleistenstil in der angegebenen ID des Elements auf der Seite. Weitere Informationen über die Verwendung der Symbolleiste findest du im Abschnitt [Symbolleiste](#bento-toolbar).
