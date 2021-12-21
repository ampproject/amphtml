# Bento Social Share

Zeigt einen Button zum Teilen von Inhalten auf sozialen Plattformen oder im System an.

Derzeit hat keiner der von Bento Social Share generierten Buttons (einschließlich der für die vorkonfigurierten Provider) ein Label oder einen zugänglichen Namen, der Hilfstechnologien (wie Bildschirmlesegeräten) zur Verfügung gestellt wird. Stelle sicher, dass du `aria-label` mit einem aussagekräftigen Label einfügst, da solche Steuerelemente sonst nur als unbeschriftete Elemente vom Typ "Button" angesagt werden.

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-social-share>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Beispiel: Einbinden via `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Containertyp

Die Komponente `bento-social-share` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Standardstile

`bento-social-share` enthält standardmäßig einige beliebte vorkonfigurierte Provider. Die Buttons für diese Provider sind mit der offiziellen Farbe und dem Logo des Providers versehen. Die Standardbreite beträgt 60 Pixel, die Standardhöhe 44 Pixel.

#### Eigene Stile

Wenn du deinen eigenen Stil verwenden willst, kannst du die bereitgestellten Stile einfach wie folgt überschreiben:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Stelle beim Anpassen des Stils eines `bento-social-share` Symbols sicher, dass das angepasste Symbol den Branding Richtlinien des Providers entspricht (z. B. Twitter, Facebook usw.).

### Barrierefreiheit

#### Kennzeichnen von Fokus

Das `bento-social-share` Element hat standardmäßig eine blaue Umrandung als sichtbaren Fokusindikator. Außerdem legt es den Wert `tabindex=0` fest, was Benutzern erleichtert, mit der Tabulatortaste zwischen mehreren `bento-social-share` Elementen zu wechseln, die sich auf derselben Seite befinden.

Der standardmäßige Fokusindikator wird mit dem folgenden CSS Regelsatz gesetzt.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Der standardmäßige Fokusindikator kann überschrieben werden, indem CSS Styles für den Fokus definiert und in ein `style` Tag eingefügt werden. Im folgenden Beispiel entfernt der erste CSS Regelsatz den Fokusindikator von allen `bento-social-share` Elementen, indem die Eigenschaft `outline` den Wert `none` erhält. Der zweite Regelsatz spezifiziert einen roten Umriss (anstelle des standardmäßigen blauen) und legt außerdem für `outline-offset` den Wert `3px` für alle `bento-social-share` Elemente mit der Klasse `custom-focus` fest.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Mit diesen CSS Regeln würden `bento-social-share` Elemente den sichtbaren Fokusindikator nicht anzeigen, es sei denn, sie enthalten die Klasse `custom-focus`. In diesem Fall hätten sie als Indikator eine rote Umrandung.

#### Farbkontrast

Beachte, dass `bento-social-share` mit `type` als Wert für `twitter`, `whatsapp` oder `line` einen Button mit einer Kombination aus Vordergrund-/Hintergrundfarbe anzeigt, deren Kontrastverhältnis niedriger ist als 3:1 (wie in [WCAG 2.1 SC 1.4. 11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) für Nicht-Text Inhalte empfohlen).

Ohne ausreichenden Kontrast können Inhalte schwer wahrnehmbar und daher schwer zu identifizieren sein. Im Extremfall sind Inhalte mit geringem Kontrast für Personen mit eingeschränkter Farbwahrnehmung möglicherweise überhaupt nicht sichtbar. Im Fall der oben genannten Share Buttons können Benutzer möglicherweise nicht richtig erkennen oder verstehen, was die Share Buttons sind und auf welchen Dienst sie sich beziehen.

### Vorkonfigurierte Provider

Die Komponente `bento-social-share` bietet [einige vorkonfigurierte Provider](./social-share-config.js), die ihre Sharing Endpoints sowie einige Standardparameter kennen.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th class="col-twenty">Typ</th>
    <th>Parameter</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (öffnet OS Dialog zum Teilen)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-Mail</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: optional</li>
        <li>
<code>data-param-body</code>: optional</li>
        <li>
<code>data-param-recipient</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>erforderlich</strong>, Standardeinstellung: none. Dieser Parameter ist die Facebook <code>app_id</code>, die für den <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Dialog zum Teilen</a> erforderlich ist.</li>
        <li>
<code>data-param-href</code>: optional</li>
        <li>
<code>data-param-quote</code>: optional, kann verwendet werden, um ein Zitat oder einen Text zu teilen.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: optional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: optional (aber dringend empfohlen). URL für die Medien, die auf Pinterest geteilt werden sollen. Wenn nicht festgelegt, wird der Endbenutzer von Pinterest aufgefordert, einen Medieninhalt hochzuladen.</li>
        <li>
<code>data-param-url</code>: optional</li>
        <li>
<code>data-param-description</code>: optional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: optional</li>
        <li>
<code>data-param-text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: optional</li>
        <li>
<code>data-param-text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: optional</li>
        <li>
<code>data-param-text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: optional</li>
</ul>
    </td>
  </tr>
</table>

### Nicht konfigurierte Provider

Zusätzlich zu vorkonfigurierten Providern kannst du nicht konfigurierte Provider verwenden, indem du zusätzliche Attribute in der Komponente `bento-social-share` angibst.

#### Beispiel: Erstellen eines Share Buttons für einen nicht konfigurierten Provider

Im folgenden Beispiel wird ein Share Button für Facebook Messenger erstellt. Dazu muss das Attribut `data-share-endpoint` den korrekten Endpoint für das benutzerdefinierte Protokoll von Facebook Messenger als Wert erhalten.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Da diese Provider nicht vorkonfiguriert sind, musst du ein passendes Bild für den Button sowie die Styles für den Provider erstellen.

### Attribute

#### type (erforderlich)

Wählt einen Providertyp aus. Dies ist sowohl für vorkonfigurierte als auch für nicht konfigurierte Provider erforderlich.

#### data-target

Gibt das Ziel an, in dem das Ziel geöffnet werden soll. Der Standardwert ist `_blank` für alle Fälle außer E-Mail/SMS unter iOS. In diesem Fall ist das Ziel `_top`.

#### data-share-endpoint

Dieses Attribut ist für nicht konfigurierte Provider erforderlich.

Einige beliebte Provider haben vorkonfigurierte Endpoints zum Teilen. Weitere Informationen findest du im Abschnitt "Vorkonfigurierte Provider". Bei nicht konfigurierten Providern musst du den Endpoint zum Teilen angeben.

#### data-param-\*

Alle Attribute mit dem Präfix `data-param-*` werden in URL Parameter umgewandelt und an den Endpoint zum Teilen übergeben.

#### aria-label

Die Beschreibung eines Buttons für Barrierefreiheit. Ein empfohlenes Label ist "Teilen auf &lt;type&gt;".

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoSocialShare>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Layout und Style

#### Containertyp

Die Komponente `BentoSocialShare` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Oder via `className`:

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Barrierefreiheit

#### Kennzeichnen von Fokus

Das `BentoSocialShare` Element hat standardmäßig eine blaue Umrandung als sichtbaren Fokusindikator. Außerdem legt es den Wert `tabindex=0` fest, was Benutzern erleichtert, mit der Tabulatortaste zwischen mehreren `BentoSocialShare` Elementen zu wechseln, die sich auf derselben Seite befinden.

Der standardmäßige Fokusindikator wird mit dem folgenden CSS Regelsatz gesetzt.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Der standardmäßige Fokusindikator kann überschrieben werden, indem CSS Styles für den Fokus definiert und in ein `style` Tag eingefügt werden. Im folgenden Beispiel entfernt der erste CSS Regelsatz den Fokusindikator von allen `BentoSocialShare` Elementen, indem die Eigenschaft `outline` den Wert `none` erhält. Der zweite Regelsatz spezifiziert einen roten Umriss (anstelle des standardmäßigen blauen) und legt außerdem für `outline-offset` den Wert `3px` für alle `BentoSocialShare` Elemente mit der Klasse `custom-focus` fest.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Mit diesen CSS Regeln würden `BentoSocialShare` Elemente den sichtbaren Fokusindikator nicht anzeigen, es sei denn, sie enthalten die Klasse `custom-focus`. In diesem Fall hätten sie als Indikator eine rote Umrandung.

#### Farbkontrast

Beachte, dass `BentoSocialShare` mit `type` als Wert für `twitter`, `whatsapp` oder `line` einen Button mit einer Kombination aus Vordergrund-/Hintergrundfarbe anzeigt, deren Kontrastverhältnis niedriger ist als 3:1 (wie in [WCAG 2.1 SC 1.4. 11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) für Nicht-Text Inhalte empfohlen).

Ohne ausreichenden Kontrast können Inhalte schwer wahrnehmbar und daher schwer zu identifizieren sein. Im Extremfall sind Inhalte mit geringem Kontrast für Personen mit eingeschränkter Farbwahrnehmung möglicherweise überhaupt nicht sichtbar. Im Fall der oben genannten Share Buttons können Benutzer möglicherweise nicht richtig erkennen oder verstehen, was die Share Buttons sind und auf welchen Dienst sie sich beziehen.

### Vorkonfigurierte Provider

Die Komponente `BentoSocialShare` bietet [einige vorkonfigurierte Provider](./social-share-config.js), die ihre Sharing Endpoints sowie einige Standardparameter kennen.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th class="col-twenty">Typ</th>
    <th>Parameter via Eigenschaft <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (öffnet OS Dialog zum Teilen)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-Mail</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: optional</li>
        <li>
<code>body</code>: optional</li>
        <li>
<code>recipient</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>erforderlich</strong>, Standardeinstellung: none. Dieser Parameter ist die Facebook <code>app_id</code>, die für den <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Dialog zum Teilen</a> erforderlich ist.</li>
        <li>
<code>href</code>: optional</li>
        <li>
<code>quote</code>: optional, kann verwendet werden, um ein Zitat oder einen Text zu teilen.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: optional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: optional (aber dringend empfohlen). URL für die Medien, die auf Pinterest geteilt werden sollen. Wenn nicht festgelegt, wird der Endbenutzer von Pinterest aufgefordert, einen Medieninhalt hochzuladen.</li>
        <li>
<code>url</code>: optional</li>
        <li>
<code>description</code>: optional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: optional</li>
        <li>
<code>text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: optional</li>
        <li>
<code>text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: optional</li>
        <li>
<code>text</code>: optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: optional</li>
</ul>
    </td>
  </tr>
</table>

### Nicht konfigurierte Provider

Zusätzlich zu vorkonfigurierten Providern kannst du nicht konfigurierte Provider verwenden, indem du zusätzliche Attribute in der Komponente `BentoSocialShare` angibst.

#### Beispiel: Erstellen eines Share Buttons für einen nicht konfigurierten Provider

Im folgenden Beispiel wird ein Share Button für Facebook Messenger erstellt. Dazu muss das Attribut `data-share-endpoint` den korrekten Endpoint für das benutzerdefinierte Protokoll von Facebook Messenger als Wert erhalten.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Da diese Provider nicht vorkonfiguriert sind, musst du ein passendes Bild für den Button sowie die Styles für den Provider erstellen.

### Eigenschaften

#### type (erforderlich)

Wählt einen Providertyp aus. Dies ist sowohl für vorkonfigurierte als auch für nicht konfigurierte Provider erforderlich.

#### background

Wenn du deinen eigenen Stil verwenden willst, kannst du die bereitgestellten Stile überschreiben und eine Hintergrundfarbe angeben.

Stelle beim Anpassen des Stils eines `BentoSocialShare` Symbols sicher, dass das angepasste Symbol den Branding Richtlinien des Providers entspricht (z. B. Twitter, Facebook usw.).

#### color

Wenn du deinen eigenen Stil verwenden willst, kannst du die bereitgestellten Stile überschreiben und eine Füllfarbe angeben.

Stelle beim Anpassen des Stils eines `BentoSocialShare` Symbols sicher, dass das angepasste Symbol den Branding Richtlinien des Providers entspricht (z. B. Twitter, Facebook usw.).

#### target

Gibt das Ziel an, in dem das Ziel geöffnet werden soll. Der Standardwert ist `_blank` für alle Fälle außer E-Mail/SMS unter iOS. In diesem Fall ist das Ziel `_top`.

#### endpoint

Diese Eigenschaft ist für nicht konfigurierte Provider erforderlich.

Einige beliebte Provider haben vorkonfigurierte Endpoints zum Teilen. Weitere Informationen findest du im Abschnitt "Vorkonfigurierte Provider". Bei nicht konfigurierten Providern musst du den Endpoint zum Teilen angeben.

#### params

Alle `param` Eigenschaften werden in URL Parameter umgewandelt und an den Endpoint zum Teilen übergeben.

#### aria-label

Die Beschreibung eines Buttons für Barrierefreiheit. Ein empfohlenes Label ist "Teilen auf &lt;type&gt;".
