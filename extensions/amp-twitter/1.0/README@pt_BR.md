# Bento Twitter

## Comportamento

O componente Bento Twitter permite que você insira um Tweet ou Moment. Use-o como um componente web [`<bento-twitter>`](#web-component) ou umcomponente funcional Preact/React [`<BentoTwitter>`](#preactreact-component).

### Componente web

Você precisa incluir a biblioteca CSS necessária de cada componente Bento para garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style).

Os exemplos abaixo demonstram o uso do componente web `<bento-twitter>`

#### Exemplo: Usando import via npm

[example preview="top-frame" playground="false"]

Instalação via npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Exemplo: Usando include via `<script>`

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

#### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Tipo de contêiner**

O componente `bento-twitter` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Atributos

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (obrigatório)</strong></td>
    <td>O ID do Tweet ou Moment, ou o tipo de fonte se deve ser exibida uma Timeline. Numa URL como https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> é o ID do tweet. Numa URL como https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> é o ID do Moment. Tipos válidos para Timeline incluem <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> e <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (opcional)</strong></td>
    <td>Ao exibir uma timeline, outros argumentos precisam ser fornecidos além de <code>timeline-source-type</code>. Por exemplo, <code>data-timeline-screen-name="amphtml"</code> em combinação com <code>data-timeline-source-type="profile"</code> exibirá uma timeline da conta Twitter do AMP. Para detalhes sobre os argumentos disponíveis, consulte a seção "Timelines" no <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">JavaScript Factory Functions Guide do Twitter</a> .</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (opcional)</strong></td>
    <td>Você pode especificar opções para o Tweet, Moment ou aparência da Timeline definindo atributos <code>data-</code>. Por exemplo, <code>data-cards="hidden"</code> desativa os Twitter cards. Para detalhes sobre as opções disponíveis, consulte a documentação do Twitter para <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">moments</a> e <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">timelines</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opcional)</strong></td>
    <td>Defina um atributo <code>title</code> para o componente. O default é <code>Twitter</code>.</td>
  </tr>
</table>

### Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoTwitter>` como um componente funcional utilizável com as bibliotecas Preact ou React.

#### Exemplo: Usando import via npm

[example preview="top-frame" playground="false"]

Instalação via npm:

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

#### Layout e estilo

**Tipo de contêiner**

O componente `BentoTwitter` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Ou via `className` :

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

### Propriedades

<table>
  <tr>
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (obrigatória)</strong></td>
    <td>O ID do Tweet ou Moment, ou o tipo de fonte se deve ser exibida uma Timeline. Numa URL como https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> é o ID do tweet. Numa URL como https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> é o ID do Moment. Tipos válidos para Timeline incluem <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> e <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (opcional)</strong></td>
    <td>Ao exibir um tweet, outros argumentos podem ser fornecidos além do <code>tweetid</code>. Por exemplo, <code>cards="hidden"</code> em combinação com <code>conversation="none"</code> exibirá um tweet sem miniaturas ou comentários adicionais.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (opcional)</strong></td>
    <td>Ao exibir um moment, outros argumentos podem ser fornecidos além do <code>moment</code>. Por exemplo, <code>limit="5"</code> exibirá um moment embutido com até cinco cards.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (opcional)</strong></td>
    <td>Ao exibir uma timeline, outros argumentos precisam ser fornecidos além de <code>timelineSourceType</code>. Por exemplo, <code>timelineScreenName="amphtml"</code> em combinação com <code>timelineSourceType="profile"</code> exibirá uma timeline da conta Twitter do AMP.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (opcional)</strong></td>
    <td>Você pode especificar opções para o Tweet, Moment ou aparência da Timeline passando um objeto para a prop <code>options</code>. Para detalhes sobre as opções disponíveis, veja a documentação do Twitter para <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">moments</a> e <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">timelines</a>. Observação: Ao passar a prop `options`, certifique-se de otimizar ou memoizar o objeto: <code>const TWITTER_OPTIONS = { // não deixe de definir estes uma vez globalmente! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opcional)</strong></td>
    <td>Define uma prop <code>title</code> for the component iframe. The default is <code>Twitter</code>.</td>
  </tr>
</table>
