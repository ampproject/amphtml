# Bento WordPress Embed

## Uso

Um iframe exibindo o [trecho](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) de uma postagem ou página WordPress. Use o Bento WordPress Embed como um componente web [`<bento-wordpress-embed>`](#web-component), ou um componente funcional Preact/React [`<BentoWordPressEmbed>`](#preactreact-component).

### Componente web

Você deve incluir a biblioteca CSS necessária para cada componente Bento de forma a garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style) .

Os exemplos abaixo demonstram o uso do componente web `<bento-wordpress-embed>`

#### Exemplo: Usando import via npm

[example preview="top-frame" playground="false"]

Instalação via npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### Exemplo: Usando include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Tipo de contêiner**

O componente `bento-wordpress-embed` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### Atributos

##### data-url (obrigatória)

A URL da postagem a ser incorporada.

### Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoWordPressEmbed>` como um componente funcional utilizável com as bibliotecas Preact ou React.

#### Exemplo: Usando import via npm

[example preview="top-frame" playground="false"]

Instalação via npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### Layout e estilo

**Tipo de contêiner**

O componente `BentoWordPressEmbed` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

Ou via `className` :

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Propriedades

##### url (obrigatória)

A URL da postagem a ser incorporada.
