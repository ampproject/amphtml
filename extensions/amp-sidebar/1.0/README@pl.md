# Składnik Bento Sidebar

Składnik Bento Sidebar można stosować jako składnik internetowy ([`<bento-sidebar>`](#web-component)) lub składnik funkcjonalny Preact/React ([`<BentoSidebar>`](#preactreact-component)).

## Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-sidebar>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Przykład: dołączanie za pomocą znacznika `<script>`

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

### Pasek narzędzi Bento

Można utworzyć element paska narzędzi Bento wyświetlany w sekcji `<body>`, określając atrybut `toolbar` za pomocą zapytania o multimedia oraz atrybutu `toolbar-target` z identyfikatorem elementu w elemencie `<nav>`, który jest elementem podrzędnym elementu `<bento-sidebar>`. Element `toolbar` duplikuje element `<nav>` oraz jego elementy podrzędne i dołącza ten element do elementu `toolbar-target`.

#### Sposób działania

- Pasek boczny może implementować paski narzędzi poprzez dodanie elementów nav z atrybutem `toolbar` i atrybutem `toolbar-target`.
- Element nav musi być elementem podrzędnym składnika `<bento-sidebar>` i mieć następujący format: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    - Oto przykład prawidłowego użycia paska narzędzi: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
- Sposób działania paska narzędzi jest stosowany tylko wtedy, gdy atrybut media-query `toolbar` jest prawidłowy. Ponadto, aby pasek narzędzi został zastosowany, na stronie musi istnieć element z identyfikatorem atrybutu `toolbar-target`.

##### Przykład: podstawowy pasek narzędzi

W poniższym przykładzie wyświetlamy element `toolbar`, jeśli szerokość okna jest mniejsza lub równa 767px. Element `toolbar` zawiera element wprowadzania danych wyszukiwania. Element `toolbar` zostanie dołączony do elementu `<div id="target-element">`.

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

### Interaktywność i wykorzystanie interfejsu API

Składniki z obsługą Bento używane jako samodzielne składniki internetowe są wysoce interaktywne dzięki swojemu interfejsowi API. Interfejs API składnika `bento-sidebar` jest dostępny poprzez umieszczenie w dokumencie następującego znacznika script:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Działania

Interfejs API składnika `bento-sidebar` umożliwia wykonanie następujących działań:

##### open()

Otwiera pasek boczny.

```javascript
api.open();
```

##### close()

Zamyka pasek boczny.

```javascript
api.close();
```

##### toggle()

Przełącza stan otwarcia paska bocznego.

```javascript
api.toggle(0);
```

### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Style niestandardowe

Składnik `bento-sidebar` można stylizować za pomocą standardowego kodu CSS.

- Atrybut `width` składnika `bento-sidebar` można ustawić tak, aby dostosować jego wstępnie ustawioną wartość szerokości, równą 45px.
- Jeśli jest to wymagane, w celu dostosowania wysokości paska bocznego można ustawić atrybut height składnika `bento-sidebar`. Jeśli wysokość przekroczy 100vw, pasek boczny będzie miał pionowy pasek przewijania. Wstępnie ustawiona wysokość paska bocznego wynosi 100vw i można ją zastąpić w kodzie CSS, aby ją zmniejszyć.
- Bieżący stan paska bocznego jest widoczny dzięki atrybutowi `open`, ustawianemu w znaczniku `bento-sidebar`, gdy pasek boczny jest otwarty na stronie.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### Uwagi dotyczące UX

W razie stosowania składnika `<bento-sidebar>` należy pamiętać, że użytkownicy często będą wyświetlać stronę na urządzeniach mobilnych, które mogą wyświetlać nagłówek o stałej pozycji. Ponadto przeglądarki często wyświetlają swój własny stały nagłówek u góry strony. Dodanie kolejnego elementu o stałej pozycji u góry ekranu skutkowałoby zajęciem dużej ilości miejsca na ekranie urządzenia mobilnego treścią, która nie zapewnia użytkownikowi żadnych nowych informacji.

Z tego względu zalecamy, aby przycisków otwierających pasek boczny nie umieszczać w stałym nagłówku o pełnej szerokości.

- Pasek boczny może być wyświetlany jedynie po lewej albo prawej stronie ekranu strony.
- Wartość max-height paska bocznego wynosi 100vh, a jeśli wysokość przekroczy 100vh, wyświetlany jest pionowy pasek przewijania. Domyślna wysokość jest ustawiona na 100vh w kodzie CSS i można ją w nim zastąpić.
- Szerokość paska bocznego można ustawić i dostosować za pomocą kodu CSS.
- <em>Zalecane jest</em>, aby składnik <code>&lt;bento-sidebar&gt;</code> był bezpośrednim, elementem podrzędnym sekcji `<body>` w celu zachowania logicznej kolejności modelu DOM zapewniającej dostępność, jak również w celu uniknięcia zmiany jego sposobu działania przez element kontenera. Należy pamiętać, że posiadanie elementu nadrzędnego `bento-sidebar` z ustawioną właściwością `z-index` może spowodować, że pasek boczny będzie wyświetlany pod innymi elementami (np. nagłówkami), co narusza jego funkcjonalność.

### Atrybuty

#### side

Określa stronę, po której powinien otwierać się pasek boczny — albo `left`, albo `right`. Jeśli atrybut `side` nie jest określony, wartość `side` będzie dziedziczona z atrybutu `dir` znacznika `body` (`ltr` =&gt; `left` , `rtl` =&gt; `right`); jeśli nie istnieje atrybut `dir`, wartość domyślna atrybutu `side` to `left`.

#### open

Ten atrybut jest obecny, gdy pasek boczny jest otwarty.

#### toolbar

Ten atrybut jest obecny w elementach podrzędnych `<nav toolbar="(media-query)" toolbar-target="elementID">` i przyjmuje zapytanie o multimedia dotyczące tego, kiedy pokazać pasek narzędzi. Więcej informacji na temat używania pasków narzędzi zawiera sekcja [Pasek narzędzi](#bento-toolbar).

#### toolbar-target

Ten atrybut występuje w elemencie podrzędnym `<nav toolbar="(media-query)" toolbar-target="elementID">` i przyjmuje identyfikator elementu na stronie. Atrybut `toolbar-target` umieści pasek narzędzi w podanym identyfikatorze elementu na stronie, bez domyślnej stylizacji paska narzędzi. Więcej informacji na temat używania pasków narzędzi zawiera sekcja [Pasek narzędzi](#bento-toolbar).

---

## Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoSidebar>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

### Przykład: import za pomocą narzędzia npm

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

### Pasek narzędzi Bento

Można utworzyć element paska narzędzi Bento wyświetlany w sekcji `<body>`, określając właściwość `toolbar` za pomocą zapytania o multimedia oraz właściwości `toolbarTarget` z identyfikatorem elementu w składniku `<BentoSidebarToolbar>`, który jest elementem podrzędnym elementu `<BentoSidebar>`. Element `toolbar` duplikuje element `<BentoSidebarToolbar>` oraz jego elementy podrzędne i dołącza ten element do elementu `toolbarTarget`.

#### Sposób działania

- Pasek boczny może implementować paski narzędzi poprzez dodanie elementów nav z właściwością `toolbar` i właściwością `toolbarTarget`.
- Element nav musi być elementem podrzędnym składnika `<BentoSidebar>` i mieć następujący format: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    - Oto przykład prawidłowego użycia paska narzędzi: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
- Sposób działania paska narzędzi jest stosowany tylko wtedy, gdy właściwość media-query `toolbar` jest prawidłowa. Ponadto, aby pasek narzędzi został zastosowany, na stronie musi istnieć element z identyfikatorem właściwości `toolbarTarget`.

##### Przykład: podstawowy pasek narzędzi

W poniższym przykładzie wyświetlamy element `toolbar`, jeśli szerokość okna jest mniejsza lub równa 767px. Element `toolbar` zawiera element wprowadzania danych wyszukiwania. Element `toolbar` zostanie dołączony do elementu `<div id="target-element">`.

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

### Interaktywność i wykorzystanie interfejsu API

Składniki Bento są wysoce interaktywne poprzez ich interfejs API. Interfejs API składnika `BentoSidebar` jest dostępny poprzez przekazanie `ref`:

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

#### Działania

Interfejs API składnika `BentoSidebar` umożliwia wykonanie następujących działań:

##### open()

Otwiera pasek boczny.

```javascript
ref.current.open();
```

##### close()

Zamyka pasek boczny.

```javascript
ref.current.close();
```

##### toggle()

Przełącza stan otwarcia paska bocznego.

```javascript
ref.current.toggle(0);
```

### Układ i styl

Składnik `BentoSidebar` można stylizować za pomocą standardowego kodu CSS.

- Atrybut `width` składnika `bento-sidebar` można ustawić tak, aby dostosować jego wstępnie ustawioną wartość szerokości, równą 45px.
- Jeśli jest to wymagane, w celu dostosowania wysokości paska bocznego można ustawić atrybut height składnika `bento-sidebar`. Jeśli wysokość przekroczy 100vw, pasek boczny będzie miał pionowy pasek przewijania. Wstępnie ustawiona wysokość paska bocznego wynosi 100vw i można ją zastąpić w kodzie CSS, aby ją zmniejszyć.

Aby upewnić się, że składnik będzie wyświetlany w pożądany sposób, pamiętaj o zastosowaniu rozmiaru do składnika. Można jest stosować inline:

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

Albo za pomocą atrybutu `className`:

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

### Uwagi dotyczące UX

W razie stosowania składnika `<bento-sidebar>` należy pamiętać, że użytkownicy często będą wyświetlać stronę na urządzeniach mobilnych, które mogą wyświetlać nagłówek o stałej pozycji. Ponadto przeglądarki często wyświetlają swój własny stały nagłówek u góry strony. Dodanie kolejnego elementu o stałej pozycji u góry ekranu skutkowałoby zajęciem dużej ilości miejsca na ekranie urządzenia mobilnego treścią, która nie zapewnia użytkownikowi żadnych nowych informacji.

Z tego względu zalecamy, aby przycisków otwierających pasek boczny nie umieszczać w stałym nagłówku o pełnej szerokości.

- Pasek boczny może być wyświetlany jedynie po lewej albo prawej stronie ekranu strony.
- Wartość max-height paska bocznego wynosi 100vh, a jeśli wysokość przekroczy 100vh, wyświetlany jest pionowy pasek przewijania. Domyślna wysokość jest ustawiona na 100vh w kodzie CSS i można ją w nim zastąpić.
- Szerokość paska bocznego można ustawić i dostosować za pomocą kodu CSS.
- <em>Zalecane jest</em>, aby składnik <code>&lt;BentoSidebar&gt;</code> był bezpośrednim, elementem podrzędnym sekcji `<body>` w celu zachowania logicznej kolejności modelu DOM zapewniającej dostępność, jak również w celu uniknięcia zmiany jego sposobu działania przez element kontenera. Należy pamiętać, że posiadanie elementu nadrzędnego `BentoSidebar` z ustawioną właściwością `z-index` może spowodować, że pasek boczny będzie wyświetlany pod innymi elementami (np. nagłówkami), co narusza jego funkcjonalność.

### Właściwości

#### side

Określa stronę, po której powinien otwierać się pasek boczny — albo `left`, albo `right`. Jeśli atrybut `side` nie jest określony, wartość `side` będzie dziedziczona z atrybutu `dir` znacznika `body` (`ltr` =&gt; `left` , `rtl` =&gt; `right`); jeśli nie istnieje atrybut `dir`, wartość domyślna atrybutu `side` to `left`.

#### toolbar

Ta właściwość jest obecna w elementach podrzędnych `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` i przyjmuje zapytanie o multimedia dotyczące tego, kiedy pokazać pasek narzędzi. Więcej informacji na temat używania pasków narzędzi zawiera sekcja [Pasek narzędzi](#bento-toolbar).

#### toolbarTarget

Ten atrybut występuje w elemencie podrzędnym `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` i przyjmuje identyfikator elementu na stronie. Właściwość `toolbarTarget` umieści pasek narzędzi w podanym identyfikatorze elementu na stronie, bez domyślnej stylizacji paska narzędzi. Więcej informacji na temat używania pasków narzędzi zawiera sekcja [Pasek narzędzi](#bento-toolbar).
