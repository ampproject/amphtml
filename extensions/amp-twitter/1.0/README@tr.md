# Bento Twitter

## Davranış

Bento Twitter bileşeni, bir Tweet veya Moment yerleştirmenize olanak tanır. Bunu bir [`<bento-twitter>`](#web-component) web bileşeni veya bir Preact/React işlevsel bileşeni [`<BentoTwitter>`](#preactreact-component) olarak kullanın.

### Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-twitter>` web bileşeninin kullanımını göstermektedir.

#### Örnek: npm ile içe aktarma

[example preview="top-frame" playground="false"]

npm ile yükleme:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Örnek: `<script>` ile ekleme

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

#### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Kapsayıcı tipi**

`bento-twitter` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen).

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Öznitellikler

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (gerekli)</strong></td>
    <td>Tweetin veya Moment'ın Kimliği veya bir Zaman Çizelgesi görüntülenecekse kaynak türü. https://twitter.com/joemccann/status/640300967154597888 gibi bir URL'de, <code>640300967154597888</code> tweet kimliğidir. https://twitter.com/i/moments/1009149991452135424 gibi bir URL'de <code>1009149991452135424</code> Moment kimliğidir. Geçerli zaman çizelgesi kaynak türleri arasında <code>profile</code>, <code>likes</code>, <code>list</code> , <code>collection</code>, <code>url</code> ve <code>widget</code> vardır.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (isteğe bağlı)</strong></td>
    <td>Bir zaman çizelgesini görüntülerken, zaman <code>timeline-source-type</code> ek olarak başka bağımsız değişkenlerin sağlanması gerekir. Örneğin <code>data-timeline-screen-name="amphtml"</code>, <code>data-timeline-source-type="profile"</code> ile birlikte AMP Twitter hesabının bir zaman çizelgesini görüntüler. Kullanılabilir argümanlarla ilgili ayrıntılar için <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter'ın JavaScript Fabrika İşlevleri Kılavuzu'ndaki</a> "Zaman Çizelgeleri" bölümüne bakın.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (isteğe bağlı)</strong></td>
    <td>
<code>data-</code> özniteliklerini ayarlayarak Tweet, Moment veya Zaman Çizelgesi görünümü için seçenekleri belirleyebilirsiniz. Örneğin <code>data-cards="hidden"</code> Twitter kartlarını devre dışı bırakır. Kullanılabilir seçeneklerle ilgili ayrıntılar için, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweet'ler</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">moment'lar</a> ve <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">zaman çizelgeleri</a> için Twitter'ın belgelerine bakın.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (isteğe bağlı)</strong></td>
    <td>Bileşen için bir <code>title</code> özniteliği tanımlar. Varsayılan <code>Twitter</code>'dır.</td>
  </tr>
</table>

### Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoTwitter>` kullanımını gösteriyor.

#### Örnek: npm ile içe aktarma

[example preview="top-frame" playground="false"]

npm ile yükleme:

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

#### Yerleşim ve stil

**Kapsayıcı tipi**

`BentoTwitter` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Veya `className` aracılığıyla:

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

### Aksesuarlar

<table>
  <tr>
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (gerekli)</strong></td>
    <td>Tweetin veya Moment'ın Kimliği veya bir Zaman Çizelgesi görüntülenecekse kaynak türü. https://twitter.com/joemccann/status/640300967154597888 gibi bir URL'de, <code>640300967154597888</code> tweet kimliğidir. https://twitter.com/i/moments/1009149991452135424 gibi bir URL'de <code>1009149991452135424</code> Moment kimliğidir. Geçerli zaman çizelgesi kaynak türleri arasında <code>profile</code>, <code>likes</code>, <code>list</code> , <code>collection</code>, <code>url</code> ve <code>widget</code> vardır.</td>
  </tr>
  <tr>
    <td width="40%"><strong>kart / sohbetler (isteğe bağlı)</strong></td>
    <td>
<code>tweetid</code>'ye ek olarak başka bağımsız değişkenler de sağlanabilir. Örneğin, <code>conversation="none"</code> ile birlikte <code>cards="hidden"</code>, ek küçük resimler veya yorumlar olmadan bir tweet görüntüler.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (isteğe bağlı)</strong></td>
    <td>Bir moment gösterilirken, <code>moment</code>'a ek olarak başka bağımsız değişkenler de sağlanabilir. Örneğin, <code>limit="5"</code>, beş karta kadar gömülü bir moment görüntüler.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (isteğe bağlı)</strong></td>
    <td>Bir zaman çizelgesi gösterilirken, <code>timelineSourceType</code>'a ek olarak başka bağımsız değişkenler de sağlanabilir . Örneğin, <code>timelineScreenName="amphtml"</code>, <code>timelineSourceType="profile"</code> ile birlikte AMP Twitter hesabının bir zaman çizelgesini görüntüler.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (isteğe bağlı)</strong></td>
    <td>
<code>options</code> aksesuarına bir nesne ileterek Tweet, Moment veya Zaman Çizelgesi görünümü için  seçenekler belirlenebilir. Kullanılabilir seçeneklerle ilgili ayrıntılar için, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweet'ler</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">moment'lar</a> ve <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">zaman çizelgeleri</a> için Twitter'ın belgelerine bakın. Not: 'options' özelliğini geçerken, nesneyi optimize ettiğinizden veya not ettiğinizden emin olun: <code>const TWITTER_OPTIONS = { // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (isteğe bağlı)</strong></td>
    <td>Bileşen iframe için bir <code>title</code> belirler. Varsayılan <code>Twitter</code>'dır.</td>
  </tr>
</table>
