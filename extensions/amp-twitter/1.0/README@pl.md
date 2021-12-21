# Składnik Bento Twitter

## Sposób działania

Składnik Bento Twitter umożliwia osadzenie tweetu lub momentu. Można go stosować jako składnik internetowy [`<bento-twitter>`](#web-component) lub składnik funkcjonalny Preact/React [`<BentoTwitter>`](#preactreact-component).

### Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-twitter>`.

#### Przykład: import za pomocą narzędzia npm

[example preview="top-frame" playground="false"]

Instalacja za pomocą narzędzia npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Przykład: dołączanie za pomocą znacznika `<script>`

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

#### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Typ kontenera**

Składnik `bento-twitter` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Atrybuty

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (wymagany)</strong></td>
    <td>ID tweetu lub momentu, lub typ źródła, jeśli ma być wyświetlana oś czasu. W adresie URL takim jak https://twitter.com/joemccann/status/640300967154597888 identyfikator tweetu to <code>640300967154597888</code>. W adresie URL takim jak https://twitter.com/i/moments/1009149991452135424 identyfikator momentu to <code>1009149991452135424</code>. Prawidłowe typy źródeł osi czasu, to <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> oraz <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (opcjonalny)</strong></td>
    <td>Podczas wyświetlania osi czasu, oprócz atrybutu <code>timeline-source-type</code> należy podać dodatkowe argumenty. Na przykład <code>data-timeline-screen-name="amphtml"</code> w połączeniu z <code>data-timeline-source-type="profile"</code> spowoduje wyświetlenie osi czasu konta AMP na Twitterze. Szczegółowe informacje na temat dostępnych argumentów zawiera sekcja „Timelines” w <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter's JavaScript Factory Functions Guide</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (opcjonalny)</strong></td>
    <td>Możesz określić opcje wyglądu tweetu, momentu lub Osi czasu, ustawiając atrybuty <code>data-</code>. Na przykład, <code>data-cards="hidden"</code> dezaktywuje karty Twittera. Szczegóły na temat dostępnych opcji można znaleźć w dokumentach Twittera dotyczących <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweetów</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">momentów</a> i <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">osi czasu</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opcjonalny)</strong></td>
    <td>Zdefiniuj atrybut <code>title</code> składnika. Domyślnie jest to <code>Twitter</code>.</td>
  </tr>
</table>

### Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoTwitter>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

#### Przykład: import za pomocą narzędzia npm

[example preview="top-frame" playground="false"]

Instalacja za pomocą narzędzia npm:

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

#### Układ i styl

**Typ kontenera**

Składnik `BentoTwitter` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Albo za pomocą atrybutu `className`:

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

### Właściwości

<table>
  <tr>
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (wymagana)</strong></td>
    <td>ID tweetu lub momentu, lub typ źródła, jeśli ma być wyświetlana oś czasu. W adresie URL takim jak https://twitter.com/joemccann/status/640300967154597888 identyfikator tweetu to <code>640300967154597888</code>. W adresie URL takim jak https://twitter.com/i/moments/1009149991452135424 identyfikator momentu to <code>1009149991452135424</code>. Prawidłowe typy źródeł osi czasu, to <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> oraz <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (opcjonalna)</strong></td>
    <td>W razie wyświetlania tweetu można podać dalsze argumenty oprócz <code>tweetid</code>. Na przykład <code>cards="hidden"</code> w połączeniu z <code>conversation="none"</code> spowoduje wyświetlenie tweetu bez dodatkowych miniatur ani komentarzy.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (opcjonalna)</strong></td>
    <td>W razie wyświetlania momentu można podać dodatkowe argumenty oprócz <code>moment</code>. Na przykład <code>limit="5"</code> spowoduje wyświetlenie osadzonego momentu z maksymalnie pięcioma kartami.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (opcjonalna)</strong></td>
    <td>W razie wyświetlania osi czasu, oprócz <code>timelineSourceType</code> można podać dodatkowe argumenty. Na przykład <code>timelineScreenName="amphtml"</code> w połączeniu z <code>timelineSourceType="profile"</code> spowoduje wyświetlenie osi czasu konta AMP na Twitterze.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (opcjonalna)</strong></td>
    <td>Możesz określić opcje wyglądu tweetu, momentu lub osi czasu, przekazując obiekt do właściwości <code>options</code>. Szczegóły na temat dostępnych opcji można znaleźć w dokumentach Twittera dotyczących <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweetów</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">momentów</a> i <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">dla osi czasu</a>. Uwaga: podczas przekazywania właściwości „options” upewnij się, że optymalizujesz lub wprowadzasz do pamięci obiekt: <code> const TWITTER_OPTIONS = { // pamiętaj, aby zdefiniować je raz globalnie! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opcjonalna)</strong></td>
    <td>Zdefiniuj atrybut <code>title</code> składnika. Domyślnie jest to <code>Twitter</code>.</td>
  </tr>
</table>
