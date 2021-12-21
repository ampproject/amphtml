# Bento Fit Text

Determina o melhor tamanho de fonte para caber todo o conteúdo de um determinado texto no espaço disponível.

O conteúdo esperado para Bento Fit Text é texto ou outro conteúdo inline, mas também pode conter conteúdo não incorporado.

## Componente web

Você deve incluir a biblioteca CSS necessária para cada componente Bento de forma a garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style) .

Os exemplos abaixo demonstram o uso do componente web `<bento-fit-text>`

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Exemplo: Usando include via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### Overflow de conteúdo

Se o conteúdo do `bento-fit-text` transbordar o espaço disponível, mesmo com um `min-font-size` especificado, o conteúdo transbordado é cortado e oculto. Navegadores baseados em WebKit e Blink mostram reticências para indicar conteúdo que não coube na área de visualização.

No exemplo a seguir, especificamos um `min-font-size` de `40` e adicionamos mais conteúdo dentro do elemento `bento-fit-text`. Isto faz com que o conteúdo exceda o tamanho de seu pai de bloco fixo, de modo que o texto seja truncado para caber no contêiner.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo de contêiner

O componente `bento-fit-text` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Considerações de acessibilidade em relação ao overflow de conteúdo

Embora o conteúdo que transborda uma área de visualização seja _visualmente_ truncado para caber no contêiner, observe que ele ainda está presente no documento. Não confie no comportamento de overflow para simplesmente "enfiar" grandes quantidades de conteúdo nas suas páginas. Embora isso visualmente possa parecer apropriado, pode fazer com que a página se torne excessivamente verbosa para usuários de tecnologias assistivas (como leitores de tela), já que para para esses usuários, todo o conteúdo truncado ainda será lido/anunciado na íntegra.

### Atributos

#### Media Queries

Os atributos de `<bento-fit-text>` podem ser configurados para usar diferentes opções com base numa [consulta de mídia](./../../../docs/spec/amp-html-responsive-attributes.md) .

#### `min-font-size`

Especifica o tamanho mínimo da fonte em pixels como um inteiro que o `bento-fit-text` pode usar.

#### `max-font-size`

Especifica o tamanho máximo da fonte em pixels como um inteiro que o `bento-fit-text` pode usar.

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoFitText>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### Layout e estilo

#### Tipo de contêiner

O componente `BentoFitText` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Ou via `className` :

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Propriedades

#### `minFontSize`

Especifica o tamanho mínimo da fonte em pixels como um inteiro que o `bento-fit-text` pode usar.

#### `maxFontSize`

Especifica o tamanho máximo da fonte em pixels como um inteiro que o `bento-fit-text` pode usar.
