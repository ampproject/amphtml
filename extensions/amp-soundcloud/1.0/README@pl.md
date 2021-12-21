# Składnik Bento Soundcloud

Osadza klip z [Soundcloud](https://soundcloud.com).

## Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-soundcloud>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Przykład: dołączanie za pomocą znacznika `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Typ kontenera

Składnik `bento-soundcloud` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Atrybuty

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Atrybut ten jest wymagany, jeżeli nie określono wartości atrybutu <code>data-playlistid</code>.<br> Wartością tego atrybutu jest identyfikator utworu, liczba całkowita.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Atrybut ten jest wymagany, jeżeli nie określono wartości atrybutu <code>data-trackid</code>.<br> Wartością tego atrybutu jest identyfikator listy odtwarzania, liczba całkowita.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (opcjonalny)</strong></td>
    <td>Tajny token ścieżki, jeśli jest ona prywatna.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (opcjonalny)</strong></td>
    <td>Jeśli ma ustawienie <code>true</code>, wyświetla pełną szerokość w trybie „Visual”; w przeciwnym razie wyświetla jako tryb „Classic”. Wartością domyślną jest <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (opcjonalny)</strong></td>
    <td>Ten atrybut jest niestandardowym zastąpieniem koloru trybu „Classic”. Atrybut ten jest ignorowany w trybie „Visual”. Określ szesnastkową wartość koloru, bez wiodącego znaku # (np. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoSoundcloud>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Układ i styl

#### Typ kontenera

Składnik `BentoSoundcloud` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Albo za pomocą atrybutu `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Właściwości

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Atrybut ten jest wymagany, jeżeli nie określono wartości atrybutu <code>data-playlistid</code>.<br> Wartością tego atrybutu jest identyfikator utworu, liczba całkowita.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Atrybut ten jest wymagany, jeżeli nie określono wartości atrybutu <code>data-trackid</code>.<br> Wartością tego atrybutu jest identyfikator listy odtwarzania, liczba całkowita.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (optional)</strong></td>
    <td>Tajny token ścieżki, jeśli jest ona prywatna.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (opcjonalny)</strong></td>
    <td>Jeśli ma ustawienie <code>true</code>, wyświetla pełną szerokość w trybie „Visual”; w przeciwnym razie wyświetla jako tryb „Classic”. Wartością domyślną jest <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (opcjonalny)</strong></td>
    <td>Ten atrybut jest niestandardowym zastąpieniem koloru trybu „Classic”. Atrybut ten jest ignorowany w trybie „Visual”. Określ szesnastkową wartość koloru, bez wiodącego znaku # (np. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
