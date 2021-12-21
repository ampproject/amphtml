# Bento Soundcloud

Bettet einen [Soundcloud](https://soundcloud.com) Clip ein.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-soundcloud>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Beispiel: Einbinden via `<script>`

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

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Containertyp

Die Komponente `bento-soundcloud` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Attribute

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Dieses Attribut ist erforderlich, wenn <code>data-playlistid</code> nicht definiert ist.<br> Der Wert für dieses Attribut ist die ID eines Tracks – eine ganze Zahl.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Dieses Attribut ist erforderlich, wenn <code>data-trackid</code> nicht definiert ist.<br> Der Wert für dieses Attribut ist die ID einer Playlist – eine ganze Zahl.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (optional)</strong></td>
    <td>Das geheime Token des Tracks, falls es privat ist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (optional)</strong></td>
    <td>Ist der Wert gleich <code>true</code>, so wird der Modus "Visual" in voller Breite angezeigt; andernfalls wird der Modus "Classic" verwendet. Der Standardwert ist <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (optional)</strong></td>
    <td>Dieses Attribut ist eine benutzerdefinierte Farbkorrektur für den Modus "Classic". Im Modus "Visual" wird das Attribut ignoriert. Gib einen hexadezimalen Farbwert ohne das voranstehende # an (z. B. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoSoundcloud>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

### Layout und Style

#### Containertyp

Die Komponente `BentoSoundcloud` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Oder via `className`:

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

### Eigenschaften

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Dieses Attribut ist erforderlich, wenn <code>data-playlistid</code> nicht definiert ist.<br> Der Wert für dieses Attribut ist die ID eines Tracks – eine ganze Zahl.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Dieses Attribut ist erforderlich, wenn <code>data-trackid</code> nicht definiert ist.<br> Der Wert für dieses Attribut ist die ID einer Playlist – eine ganze Zahl.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (optional)</strong></td>
    <td>Das geheime Token des Tracks, falls es privat ist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (optional)</strong></td>
    <td>Ist der Wert gleich <code>true</code>, so wird der Modus "Visual" in voller Breite angezeigt; andernfalls wird der Modus "Classic" verwendet. Der Standardwert ist <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (optional)</strong></td>
    <td>Dieses Attribut ist eine benutzerdefinierte Farbkorrektur für den Modus "Classic". Im Modus "Visual" wird das Attribut ignoriert. Gib einen hexadezimalen Farbwert ohne das voranstehende # an (z. B. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
