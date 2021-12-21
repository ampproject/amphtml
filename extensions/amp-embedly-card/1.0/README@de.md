# Bento Embedly Card

Bietet reaktionsschnelle und teilbare Embeds mit [Embedly Cards](http://docs.embed.ly/docs/cards)

Karten sind der einfachste Weg, Embedly zu nutzen. Für alle Medien bieten Karten reaktionsschnelle Embeds mit integrierter Embed Analyse.

Wenn du eine kostenpflichtige Version nutzt, verwende die Komponente `<bento-embedly-key>` oder `<BentoEmbedlyContext.Provider>`, um deinen API Schlüssel anzugeben. Du brauchst nur einen einzigen Bento Embedly Schlüssel pro Seite, um das Embedly Branding von den Karten zu entfernen. Auf deiner Seite kannst du eine oder mehrere Instanzen von Bento Embedly Cards verwenden.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-embedly-card>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### Beispiel: Einbinden via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-embedly-card {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
  ></script>
  <style>
    bento-embedly-card {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<body>
  <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
  </bento-embedly-key>

  <bento-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    data-card-theme="dark"
    data-card-controls="0"
  >
  </bento-embedly-card>

  <bento-embedly-card
    id="my-url"
    data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
  >
  </bento-embedly-card>

  <div class="buttons" style="margin-top: 8px">
    <button id="change-url">Change embed</button>
  </div>

  <script>
    (async () => {
      const embedlyCard = document.querySelector('#my-url');
      await customElements.whenDefined('bento-embedly-card');

      // set up button actions
      document.querySelector('#change-url').onclick = () => {
        embedlyCard.setAttribute(
          'data-url',
          'https://www.youtube.com/watch?v=wcJSHR0US80'
        );
      };
    })();
  </script>
</body>
```

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Containertyp

Die Komponente `bento-embedly-card` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### Attribute

#### `data-url`

Die URL zum Abrufen von Einbettungsinformationen.

#### `data-card-embed`

Die URL zu einem Video oder zu Rich Media. Verwende dies bei statischen Embeds wie Artikeln: Anstatt den statischen Seiteninhalt in der Karte zu verwenden, bettet die Karte das Video oder Rich Media Element ein.

#### `data-card-image`

Die URL zu einem Bild. Gibt an, welches Bild in Artikelkarten verwendet werden soll, wenn `data-url` auf einen Artikel verweist. Nicht alle Bild URLs werden unterstützt. Wenn das Bild nicht geladen wird, versuche es mit einem anderen Bild oder einer anderen Domain.

#### `data-card-controls`

Aktiviert die Symbole zum Teilen von Inhalten.

- `0`: Symbole zum Teilen von Inhalten deaktivieren
- `1`: Symbole zum Teilen von Inhalten aktivieren

Der Standardwert ist `1`.

#### `data-card-align`

Richtet die Karte aus. Die möglichen Werte sind `left`, `center` und `right`. Der Standardwert ist `center`.

#### `data-card-recommend`

Wenn Empfehlungen unterstützt werden, werden Embedly Empfehlungen auf Video und Rich Karten deaktiviert. Dies sind Empfehlungen, die von Embedly erstellt wurden.

- `0`: deaktiviert Embedly Empfehlungen.
- `1`: aktiviert Embedly Empfehlungen

Der Standardwert ist `1`.

#### `data-card-via` (optional)

Gibt den Via Inhalt in der Karte an. Dies ist sehr praktisch für Urheberbezeichnung.

#### `data-card-theme` (optional)

Ermöglicht das Aktivieren des `dark` Modus, der die Hintergrundfarbe des Hauptkartencontainers ändert. Verwende `dark`, um dieses Design festzulegen. Für dunkle Hintergründe ist diese Angabe empfehlenswert. Der Standardwert ist `light`, wodurch keine Hintergrundfarbe für den Hauptkartencontainer festgelegt wird.

#### title (optional)

Definiere für die Komponente das Attribut `title`, das an das `<iframe>` Element weitergegeben wird. Der Standardwert ist `"Embedly card"`.

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoEmbedlyCard>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {BentoEmbedlyCard} from '@bentoproject/embedly-card/react';
import '@bentoproject/embedly-card/styles.css';

function App() {
  return (
    <BentoEmbedlyContext.Provider
      value={{apiKey: '12af2e3543ee432ca35ac30a4b4f656a'}}
    >
      <BentoEmbedlyCard url="https://www.youtube.com/watch?v=LZcKdHinUhE"></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}
```

### Layout und Style

#### Containertyp

Die Komponente `BentoEmbedlyCard` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

Oder via `className`:

```jsx
<BentoEmbedlyCard
  className="custom-styles"
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Eigenschaften

#### `url`

Die URL zum Abrufen von Einbettungsinformationen.

#### `cardEmbed`

Die URL zu einem Video oder zu Rich Media. Verwende dies bei statischen Embeds wie Artikeln: Anstatt den statischen Seiteninhalt in der Karte zu verwenden, bettet die Karte das Video oder Rich Media Element ein.

#### `cardImage`

Die URL zu einem Bild. Gibt an, welches Bild in Artikelkarten verwendet werden soll, wenn `data-url` auf einen Artikel verweist. Nicht alle Bild URLs werden unterstützt. Wenn das Bild nicht geladen wird, versuche es mit einem anderen Bild oder einer anderen Domain.

#### `cardControls`

Aktiviert die Symbole zum Teilen von Inhalten.

- `0`: Symbole zum Teilen von Inhalten deaktivieren
- `1`: Symbole zum Teilen von Inhalten aktivieren

Der Standardwert ist `1`.

#### `cardAlign`

Richtet die Karte aus. Die möglichen Werte sind `left`, `center` und `right`. Der Standardwert ist `center`.

#### `cardRecommend`

Wenn Empfehlungen unterstützt werden, werden Embedly Empfehlungen auf Video und Rich Karten deaktiviert. Dies sind Empfehlungen, die von Embedly erstellt wurden.

- `0`: deaktiviert Embedly Empfehlungen.
- `1`: aktiviert Embedly Empfehlungen

Der Standardwert ist `1`.

#### `cardVia` (optional)

Gibt den Via Inhalt in der Karte an. Dies ist sehr praktisch für Urheberbezeichnung.

#### `cardTheme` (optional)

Ermöglicht das Aktivieren des `dark` Modus, der die Hintergrundfarbe des Hauptkartencontainers ändert. Verwende `dark`, um dieses Design festzulegen. Für dunkle Hintergründe ist diese Angabe empfehlenswert. Der Standardwert ist `light`, wodurch keine Hintergrundfarbe für den Hauptkartencontainer festgelegt wird.

#### title (optional)

Definiere für die Komponente das Attribut `title`, das an das `<iframe>` Element weitergegeben wird. Der Standardwert ist `"Embedly card"`.
