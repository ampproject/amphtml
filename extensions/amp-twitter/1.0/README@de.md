# Bento Twitter

## Verhalten

Mit der Bento Twitter Komponente kannst du einen Tweet oder Moment einbetten. Verwende sie als Webkomponente [`<bento-twitter>`](#web-component) oder als Preact/React Funktionskomponente [`<BentoTwitter>`](#preactreact-component).

### Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-twitter>`.

#### Beispiel: Import via npm

[example preview="top-frame" playground="false"]

Installiere sie via npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Beispiel: Einbinden via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Containertyp**

Die Komponente `bento-twitter` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Attribute

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (erforderlich)</strong></td>
    <td>Die ID des Tweets oder Moments oder der Quelltyp, wenn eine Timeline angezeigt werden soll. In einer URL wie https://twitter.com/joemccann/status/640300967154597888 ist <code>640300967154597888</code> die Tweet-ID. In einer URL wie https://twitter.com/i/moments/1009149991452135424 ist <code>1009149991452135424</code> die Moment-ID. Gültige Timeline Quelltypen sind <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> und <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (optional)</strong></td>
    <td>Beim Anzeigen einer Timeline müssen neben <code>timeline-source-type</code> weitere Argumente angegeben werden. Beispielsweise zeigt <code>data-timeline-screen-name="amphtml"</code> in Kombination mit <code>data-timeline-source-type="profile"</code> eine Timeline des AMP Twitter Kontos an. Einzelheiten zu den verfügbaren Argumenten findest du im Abschnitt "Timelines" im <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">JavaScript Factory Functions Guide von Twitter</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (optional)</strong></td>
    <td>Du kannst Optionen für die Darstellung des Tweets, des Moments oder der Timeline festlegen, indem du Attribute vom Typ <code>data-</code> angibst. So deaktiviert zum Beispiel <code>data-cards="hidden"</code> Twitter Cards. Einzelheiten zu den verfügbaren Optionen findest du in der Twitter Dokumentation <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">für Tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">für Momente</a> und <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">für Timelines</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Lege ein <code>title</code> Attribut für die Komponente fest. Der Standardwert ist <code>Twitter</code>.</td>
  </tr>
</table>

### Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoTwitter>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

#### Beispiel: Import via npm

[example preview="top-frame" playground="false"]

Installiere sie via npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### Layout und Style

**Containertyp**

Die Komponente `BentoTwitter` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen (Folien) eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `height`, `width`, `aspect-ratio` oder ähnlichen Eigenschaften definiert wird):

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Oder via `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (erforderlich)</strong></td>
    <td>Die ID des Tweets oder Moments oder der Quelltyp, wenn eine Timeline angezeigt werden soll. In einer URL wie https://twitter.com/joemccann/status/640300967154597888 ist <code>640300967154597888</code> die Tweet-ID. In einer URL wie https://twitter.com/i/moments/1009149991452135424 ist <code>1009149991452135424</code> die Moment-ID. Gültige Timeline Quelltypen sind <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> und <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (optional)</strong></td>
    <td>Bei der Anzeige eines Tweets können neben <code>tweetid</code> noch weitere Argumente angegeben werden. Beispielsweise zeigt <code>cards="hidden"</code> in Kombination mit <code>conversation="none"</code> einen Tweet ohne zusätzliche Thumbnails oder Kommentare an.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (optional)</strong></td>
    <td>Bei der Anzeige eines Moments können neben <code>moment</code> noch weitere Argumente angegeben werden. <code>limit="5"</code> zeigt beispielsweise einen eingebetteten Moment mit bis zu fünf Karten an.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (optional)</strong></td>
    <td>Beim Anzeigen einer Timeline müssen neben <code>timelineSourceType</code> weitere Argumente angegeben werden. Beispielsweise zeigt <code>timelineScreenName="amphtml"</code> in Kombination mit <code>timelineSourceType="profile"</code> eine Timeline des AMP Twitter Kontos an.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (optional)</strong></td>
    <td>Du kannst Optionen für die Darstellung des Tweets, des Moments oder der Timeline angeben, indem du ein Objekt an die Eigenschaft <code>options</code> übergibst. Einzelheiten zu den verfügbaren Optionen findest du in der Twitter Dokumentation <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">für Tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">für Moments</a> und <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">für Timelines</a>. Hinweis: Achte bei der Übergabe der Eigenschaft `options` darauf, das Objekt zu optimieren oder zu memoisieren: <code> const TWITTER_OPTIONS = { // vergiss nicht, diese einmal global zu definieren! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Lege ein <code>title</code> Attribut für das iframe der Komponente fest. Der Standardwert ist <code>Twitter</code>.</td>
  </tr>
</table>
