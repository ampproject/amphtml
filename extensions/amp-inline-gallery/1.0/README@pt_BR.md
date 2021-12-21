# Bento Inline Gallery

Exibe slides, com pontos de paginação opcionais e miniaturas.

Sua implementação utiliza um [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel). Ambos os componentes devem ser instalados corretamente para o ambiente (Web Component vs Preact).

## Componente web

Você precisa incluir a biblioteca CSS necessária de cada componente Bento para garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style).

Os exemplos abaixo demonstram o uso do componente web `<bento-inline-gallery>`

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Exemplo: Usando include via `<script>`

O exemplo abaixo contém um `bento-inline-gallery` que consiste de três slides com miniaturas e um indicador de paginação.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>

  <script async src="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css">

  <script async src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css">
<body>
  <bento-inline-gallery id="inline-gallery">
    <bento-inline-gallery-thumbnails style="height: 100px;" loop></bento-inline-gallery-thumbnails>

    <bento-base-carousel style="height: 200px;" snap-align="center" visible-count="3" loop>
      <img src="img1.jpeg" data-thumbnail-src="img1-thumbnail.jpeg" />
      <img src="img2.jpeg" data-thumbnail-src="img2-thumbnail.jpeg" />
      <img src="img3.jpeg" data-thumbnail-src="img3-thumbnail.jpeg" />
      <img src="img4.jpeg" data-thumbnail-src="img4-thumbnail.jpeg" />
      <img src="img5.jpeg" data-thumbnail-src="img5-thumbnail.jpeg" />
      <img src="img6.jpeg" data-thumbnail-src="img6-thumbnail.jpeg" />
    </bento-base-carousel>

    <bento-inline-gallery-pagination style="height: 20px;"></bento-inline-gallery-pagination>
  </bento-inline-gallery>
</body>
```

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style>
  bento-inline-gallery,
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    display: block;
  }
  bento-inline-gallery {
    contain: layout;
  }
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    overflow: hidden;
    position: relative;
  }
</style>
```

### Atributos em `<bento-inline-gallery-pagination>`

#### `inset`

Default: `false`

Atributo booleano que indica se o indicador de paginação deve ser exibido como inset (sobrepondo o próprio carrossel)

### Atributos em `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Opcional

Número: proporção  largura/altura em que os slides devem ser exibidos.

#### `loop`

Default: `false`

Atributo booleano que indica se as miniaturas devem repetir.

### Aplicação de estilos

Você pode usar seletores de elemento `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` e `bento-base-carousel` para estilizar livremente o indicador de paginação, miniaturas e carrossel.

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoInlineGallery>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import React from 'react';
import {BentoInlineGallery} from '@bentoproject/inline-gallery/react';
import '@bentoproject/inline-gallery/styles.css';

function App() {
  return (
    <BentoInlineGallery id="inline-gallery">
      <BentoInlineGalleryThumbnails aspect-ratio="1.5" loop />
      <BentoBaseCarousel snap-align="center" visible-count="1.2" loop>
        <img src="server.com/static/inline-examples/images/image1.jpg" />
        <img src="server.com/static/inline-examples/images/image2.jpg" />
        <img src="server.com/static/inline-examples/images/image3.jpg" />
      </BentoBaseCarousel>
      <BentoInlineGalleryPagination inset />
    </BentoInlineGallery>
  );
}
```

### Layout e estilo

#### Tipo de contêiner

O componente `BentoInlineGallery` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos através de um layout CSS desejado (como um definido com `width`). Eles podem ser aplicados inline:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Ou via `className` :

```jsx
<BentoInlineGallery className="custom-styles">...</BentoInlineGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

<!-- TODO(wg-bento): This section was empty, fix it.
### Props for `BentoInlineGallery`
-->

### Propriedades para `BentoInlineGalleryPagination`

Além das [props comuns](../../../docs/spec/bento-common-props.md), o BentoInlineGalleryPagination oferece suporte às props abaixo:

#### `inset`

Default: `false`

Atributo booleano que indica se o indicador de paginação deve ser exibido como inset (sobrepondo o próprio carrossel)

### Propriedades para `BentoInlineGalleryThumbnails`

Além das [props comuns](../../../docs/spec/bento-common-props.md), o BentoInlineGalleryThumbnails oferece suporte às props abaixo:

#### `aspectRatio`

Opcional

Número: proporção  largura/altura em que os slides devem ser exibidos.

#### `loop`

Default: `false`

Atributo booleano que indica se as miniaturas devem repetir.
