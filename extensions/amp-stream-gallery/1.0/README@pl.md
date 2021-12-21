# Składnik Bento Stream Gallery

## Zastosowanie

Składnik Bento Stream Gallery służy do wyświetlania wielu podobnych elementów treści jednocześnie wzdłuż osi poziomej. Aby zaimplementować bardziej spersonalizowany UX, zobacz składnik [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md).

Składnik Bento  Stream Gallery można stosować jako składnik internetowy ([`<bento-stream-gallery>`](#web-component)) lub składnik funkcjonalny Preact/React ([`<BentoStreamGallery>`](#preactreact-component)).

### Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-stream-gallery>`.

#### Przykład: import za pomocą narzędzia npm

[example preview="top-frame" playground="false"]

Instalacja za pomocą narzędzia npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### Przykład: dołączanie za pomocą znacznika `<script>`

Poniższy przykład zawiera składnik `bento-stream-gallery` z trzema sekcjami. Atrybut `expanded` w trzeciej sekcji powoduje jej rozwinięcie podczas ładowania strony.

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

#### Interaktywność i wykorzystanie interfejsu API

Składniki z obsługą Bento używane samodzielnie są wysoce interaktywne dzięki swojemu interfejsowi API. Interfejs API składnika `bento-stream-gallery` jest dostępny poprzez umieszczenie w dokumencie następującego znacznika script:

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### Działania

**next()**

Przesuwa karuzelę do przodu o widoczną liczbę slajdów.

```js
api.next();
```

**prev()**

Przesuwa karuzelę wstecz o widoczną liczbę slajdów.

```js
api.prev();
```

**goToSlide(index: number)**

Przesuwa karuzelę do slajdu określonego przez argument `index`. Uwaga: wartość `index` zostanie znormalizowana do liczby większej lub równej `0`, a mniejszej od danej liczby slajdów.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Zdarzenia

Składnik Bento Stream Gallery umożliwia rejestrowanie następujących zdarzeń i reagowanie na nie:

**slideChange**

Zdarzenie to jest wyzwalane, gdy indeks wyświetlany przez karuzelę ulegnie zmianie. Nowy indeks jest dostępny poprzez `event.data.index`.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Atrybuty

##### Sposób działania

###### `controls`

Ma wartość `"always"`, `"auto"`, albo `"never"`, domyślnie `"auto"`. Określa, czy i kiedy wyświetlane są strzałki nawigacyjne wstecz/do przodu. Uwaga: jeśli `outset-arrows` ma wartość `true`, strzałki są wyświetlane zawsze (`"always"`).

- `always`: strzałki są zawsze wyświetlane.
- `auto`: strzałki są wyświetlane, gdy w karuzeli dokonano ostatnio interakcji za pomocą myszy, a nie są wyświetlane, gdy w karuzeli dokonano ostatnio interakcji za pomocą dotyku. Po pierwszym załadowaniu na urządzeniach dotykowych strzałki są wyświetlane do chwili pierwszej interakcji.
- `always`: strzałki nigdy nie są wyświetlane.

###### `extra-space`

Albo `"around"`, albo niezdefiniowany. Określa, w jaki sposób przydzielane jest dodatkowe miejsce po wyświetleniu obliczonej liczby slajdów widocznych w karuzeli. Jeśli `"around"`, białe miejsce jest równomiernie rozmieszczone wokół karuzeli za pomocą `justify-content: center`; w przeciwnym razie miejsce jest przydzielane po prawej stronie karuzeli w przypadku dokumentów LTR, a po lewej w przypadku dokumentów RTL.

###### `loop`

Albo `true`, albo `false`, domyślnie `true`. Gdy true, karuzela pozwoli użytkownikowi na przejście z pierwszego elementu z powrotem do ostatniego i odwrotnie. Aby karuzela mogła zostać zapętlona, musi zawierać co najmniej trzy slajdy.

###### `outset-arrows`

Albo `true`, albo `false`, domyślnie `false`. Gdy true, w karuzeli wyświetlane są strzałki na zewnątrz i po obu stronach slajdów. Zauważ, że w przypadku strzałek na zewnątrz kontener slajdów będzie miał efektywną długość o 100px mniejszą niż miejsce przydzielone dla danego kontenera — po 50px na strzałki po obu stronach. Gdy false, karuzela wyświetli strzałki jako wstawione i nałożone na górną część lewej i prawej krawędzi slajdów.

###### `peek`

Liczba, domyślnie `0`. Określa, jak dużo dodatkowego slajdu ma być wyświetlane (po jednej lub obu stronach bieżącego slajdu) jako zachęta dla użytkownika wskazująca, że karuzelę można przesuwać.

##### Widoczność slajdów galerii

###### `min-visible-count`

Liczba, domyślnie `1`. Określa minimalną liczbę slajdów wyświetlanych naraz. Można użyć wartości ułamkowych w celu uwidocznienia części dodatkowych slajdów.

###### `max-visible-count`

Liczba, domyślnie  [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Określa minimalną liczbę slajdów wyświetlanych naraz. Można użyć wartości ułamkowych w celu uwidocznienia części dodatkowych slajdów.

###### `min-item-width`

Liczba, domyślnie `1`. Określa minimalną szerokość każdego elementu, używaną do rozpoznawania, ile całych elementów może być wyświetlanych naraz na całej szerokości galerii.

###### `max-item-width`

Liczba, domyślnie [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Określa maksymalną szerokość każdego elementu, używaną do rozpoznawania, ile całych elementów może być wyświetlanych naraz na całej szerokości galerii.

##### Przyciąganie slajdów

###### `slide-align`

Albo `start`, albo `center`. W przypadku rozpoczęcia wyrównywania początek slajdu (np. lewa krawędź przy wyrównywaniu poziomym) jest wyrównywany do początku karuzeli. W przypadku wyrównywania do środka środek slajdu jest wyrównywany do środka karuzeli.

###### `snap`

Albo `true`, albo `false`, domyślnie `true`. Określa, czy karuzela ma się zatrzymywać na slajdach podczas przewijania.

#### Stylizacja

Za pomocą selektora elementu `bento-stream-gallery` można dowolnie stylizować element streamGallery.

### Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoStreamGallery>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

#### Przykład: import za pomocą narzędzia npm

[example preview="top-frame" playground="false"]

Instalacja za pomocą narzędzia npm:

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

#### Interaktywność i wykorzystanie interfejsu API

Składniki Bento są wysoce interaktywne poprzez ich interfejs API. Interfejs API składnika `BentoStreamGallery` jest dostępny poprzez przekazanie `ref`:

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

##### Działania

Interfejs API składnika `BentoStreamGallery` umożliwia wykonanie następujących działań:

**next()**

Przesuwa karuzelę do przodu o liczbę slajdów wyrażoną w sekcji <code>advanceCount</code>.

```javascript
ref.current.next();
```

**prev()**

Przesuwa karuzelę wstecz o liczbę slajdów wyrażoną w sekcji <code>advanceCount</code>.

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

Przesuwa karuzelę do slajdu określonego przez argument `index`. Uwaga: wartość `index` zostanie znormalizowana do liczby większej lub równej `0`, a mniejszej od danej liczby slajdów.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### Zdarzenia

**onSlideChange**

Zdarzenie to jest wyzwalane, gdy indeks wyświetlany przez karuzelę ulegnie zmianie.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### Układ i styl

**Typ kontenera**

Składnik `BentoStreamGallery` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe renderowanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `width`). Można je zastosować inline:

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

Albo za pomocą atrybutu `className`:

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

#### Właściwości

##### Wspólne właściwości

Ten składnik obsługuje [wspólne właściwości](../../../docs/spec/bento-common-props.md) składników React i Preact.

##### Sposób działania

###### `controls`

Ma wartość `"always"`, `"auto"`, albo `"never"`, domyślnie `"auto"`. Określa, czy i kiedy wyświetlane są strzałki nawigacyjne wstecz/do przodu. Uwaga: jeśli `outset-arrows` ma wartość `true`, strzałki są wyświetlane zawsze (`"always"`).

- `always`: strzałki są zawsze wyświetlane.
- `auto`: strzałki są wyświetlane, gdy w karuzeli dokonano ostatnio interakcji za pomocą myszy, a nie są wyświetlane, gdy w karuzeli dokonano ostatnio interakcji za pomocą dotyku. Po pierwszym załadowaniu na urządzeniach dotykowych strzałki są wyświetlane do chwili pierwszej interakcji.
- `always`: strzałki nigdy nie są wyświetlane.

###### `extraSpace`

Albo `"around"`, albo niezdefiniowany. Określa, w jaki sposób przydzielane jest dodatkowe miejsce po wyświetleniu obliczonej liczby slajdów widocznych w karuzeli. Jeśli `"around"`, białe miejsce jest równomiernie rozmieszczone wokół karuzeli za pomocą `justify-content: center`; w przeciwnym razie miejsce jest przydzielane po prawej stronie karuzeli w przypadku dokumentów LTR, a po lewej w przypadku dokumentów RTL.

###### `loop`

Albo `true`, albo `false`, domyślnie `true`. Gdy true, karuzela pozwoli użytkownikowi na przejście z pierwszego elementu z powrotem do ostatniego i odwrotnie. Aby karuzela mogła zostać zapętlona, musi zawierać co najmniej trzy slajdy.

###### `outsetArrows`

Albo `true`, albo `false`, domyślnie `false`. Gdy true, w karuzeli wyświetlane są strzałki na zewnątrz i po obu stronach slajdów. Zauważ, że w przypadku strzałek na zewnątrz kontener slajdów będzie miał efektywną długość o 100px mniejszą niż miejsce przydzielone dla danego kontenera — po 50px na strzałki po obu stronach. Gdy false, karuzela wyświetli strzałki jako wstawione i nałożone na górną część lewej i prawej krawędzi slajdów.

###### `peek`

Liczba, domyślnie `0`. Określa, jak dużo dodatkowego slajdu ma być wyświetlane (po jednej lub obu stronach bieżącego slajdu) jako zachęta dla użytkownika wskazująca, że karuzelę można przesuwać.

##### Widoczność slajdów galerii

###### `minVisibleCount`

Liczba, domyślnie `1`. Określa minimalną liczbę slajdów wyświetlanych naraz. Można użyć wartości ułamkowych w celu uwidocznienia części dodatkowych slajdów.

###### `maxVisibleCount`

Liczba, domyślnie  [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Określa minimalną liczbę slajdów wyświetlanych naraz. Można użyć wartości ułamkowych w celu uwidocznienia części dodatkowych slajdów.

###### `minItemWidth`

Liczba, domyślnie `1`. Określa minimalną szerokość każdego elementu, używaną do rozpoznawania, ile całych elementów może być wyświetlanych naraz na całej szerokości galerii.

###### `maxItemWidth`

Liczba, domyślnie [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Określa maksymalną szerokość każdego elementu, używaną do rozpoznawania, ile całych elementów może być wyświetlanych naraz na całej szerokości galerii.

##### Przyciąganie slajdów

###### `slideAlign`

Albo `start`, albo `center`. W przypadku rozpoczęcia wyrównywania początek slajdu (np. lewa krawędź przy wyrównywaniu poziomym) jest wyrównywany do początku karuzeli. W przypadku wyrównywania do środka środek slajdu jest wyrównywany do środka karuzeli.

###### `snap`

Albo `true`, albo `false`, domyślnie `true`. Określa, czy karuzela ma się zatrzymywać na slajdach podczas przewijania.
