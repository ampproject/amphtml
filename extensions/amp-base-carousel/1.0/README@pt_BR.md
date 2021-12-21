# Bento Carousel

Um carrossel genérico para exibir múltiplas partes similares de conteúdo ao longo de um eixo horizontal ou vertical.

Cada um dos elementos-filho imediatos é considerado um item do carrossel. Cada um desses nós também pode ter filhos arbitrários.

O carrossel consiste em um número arbitrário de itens, bem como setas de navegação opcionais para avançar ou retroceder um único item.

O carrossel avança entre os itens se o usuário deslizar o dedo na tela ou usar os botões de seta personalizáveis.

## Componente web

Você deve incluir a biblioteca CSS necessária para cada componente Bento de forma a garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style) .

Os exemplos abaixo demonstram o uso do componente web `<bento-base-carousel>`.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Exemplo: Usando include via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Interatividade e uso da API

Os componentes habilitados pelo Bento usados como componentes web standalone são altamente interativos através de sua API. O componente `bento-base-carousel` é acessível incluindo a seguinte tag de script no seu documento:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Ações

A API `bento-base-carousel` permite que você execute as seguintes ações:

##### next()

Avança o carrossel em número de slides informado em <code>advance-count</code>.

```javascript
api.next();
```

##### prev()

Retrocede o carrossel em número de slides informado em <code>advance-count</code>

```javascript
api.prev();
```

##### goToSlide(index: number)

Move o carrossel para o slide especificado pelo argumento `index`. Observação: o `index` será normalizado para um número maior ou igual a `0` e menor que o número de slides fornecidos.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Eventos

A API `bento-base-carousel` permite que você se registre e responda aos seguintes eventos:

##### slideChange

Este evento é acionado quando o índice exibido pelo carrossel é alterado. O novo índice está disponível em `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo de contêiner

O componente `bento-base-carousel` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Mudança de slide da direita para a esquerda

`<bento-base-carousel>` requer que você defina quando está num contexto de leitura da direita para a esquerda (rtl) (por exemplo, páginas escritas em árabe ou hebraico). Embora o carrossel geralmente funcione sem isto, pode haver alguns bugs. Você pode informar ao carrossel que ele deve operar como `rtl` seguinte maneira:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Se o carrossel estiver num contexto RTL e você quiser que o carrossel opere como LTR, poderá definir explicitamente o `dir="ltr"` no carrossel.

### Layout dos slides

Os slides são dimensionados automaticamente pelo carrossel quando <code>mixedLengths</code>  <strong>não</strong> for especificado.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Os slides têm uma altura implícita quando o layout do carrossel é realizado. Isto pode ser facilmente alterado com CSS. Ao especificar a altura, o slide será centralizado verticalmente no carrossel.

Se quiser centralizar o conteúdo do slide horizontalmente, você deve contê-lo num elemento pai e usar esse elemento para centralizar o conteúdo.

### Número de slides visíveis

Ao alterar o número de slides visíveis usando `visible-slides`, em resposta a uma consulta de mídia, você provavelmente vai querer alterar a proporção do próprio carrossel para corresponder ao novo número de slides visíveis. Por exemplo, se você deseja mostrar três slides por vez com uma proporção de aspecto de um para um, você deve ter uma proporção de três para um para o próprio carrossel. Da mesma forma, com quatro slides de cada vez, você usaria uma proporção de quatro por um. Além disso, ao alterar `visible-slides`, você provavelmente também vai querer alterar `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Atributos

#### Consultas de mídia

Os atributos de `<bento-base-carousel>` podem ser configurados para usar diferentes opções com base numa [consulta de mídia](./../../../docs/spec/amp-html-responsive-attributes.md) .

#### Número de slides visíveis

##### mixed-length

Ou `true` ou `false`. O default é `false`. Quando true, usa a largura existente (ou altura quando horizontal) para cada um dos slides. Isto permite que um carrossel com slides de diferentes larguras seja usado.

##### visible-count

Um número, o default é `1`. Determina quantos slides devem ser mostrados em um determinado momento. Valores fracionários podem ser usados para deixar visível parte de um(n) slide(s) adicional(is). Esta opção é ignorada quando `mixed-length` é `true`.

##### advance-count

Um número, o default é `1`. Determina quantos slides o carrossel avançará ao avançar usando as setas anterior ou seguinte. Isto é útil quando for necessário especificar o atributo `visible-count`

#### Avanço automático

##### auto-advance

Ou `true` ou `false`, o default é `false`. Avança automaticamente o carrossel para o próximo slide depois de um determinado tempo. Se o usuário alterar os slides manualmente, o avanço automático será interrompido. Observe que se o `loop` não estiver ativado, ao chegar no último item, o avanço automático irá voltar ao primeiro item.

##### auto-advance-count

Um número, o default é `1`. Determina quantos slides o carrossel avançará quando usa o avanço automático. Isto é útil quando for necessário especificar o atributo `visible-count`.

##### auto-advance-interval

Um número, o default é `1000`. Especifica a quantidade de tempo, em milissegundos, entre os avanços automáticos subsequentes do carrossel.

##### auto-advance-loops

Um número, o default é `∞`. O número de vezes que o carrossel deve avançar pelos slides antes de parar.

#### Posicionamento automático

##### snap

Ou `true` ou `false` , o default é `true`. Determina se o carrossel deve encaixar automaticamente ou não nos slides ao rolar.

##### snap-align

Ou `start` ou `center`. Ao iniciar o alinhamento, o início de um slide (por exemplo, a borda esquerda, quando fazendo alinhamento horizontal) é alinhado com o início de um carrossel. Ao alinhar pelo centro, o centro de um slide será alinhado com o centro de um carrossel.

##### snap-by

Um número, o default é `1`. Determina a granularidade do posicionamento automático e é útil ao usar o `visible-count`.

#### Diversos

##### controls

Ou `"always"`, `"auto"` ou `"never"`, o default é `"auto"`. Determina se e quando as setas de navegação anterior/seguinte são exibidas. Observação: Quando `outset-arrows` é `true`, as setas são mostradas `"always"`.

- `always` : as setas são sempre exibidas.
- `auto` : as setas são exibidas quando a última interação do carrossel foi via mouse e não são exibidas quando a última interação do carrossel foi via toque. Na primeira carga para dispositivos de toque, as setas são exibidas até a primeira interação.
- `never` : as setas nunca são exibidas.

##### slide

Um número, o default é `0`. Determina o slide inicial mostrado no carrossel. Pode ser alterado com `Element.setAttribute` para controlar qual slide está sendo exibido no momento.

##### loop

Ou `true` ou `false`, o default é `false` quando omitido. Quando true, o carrossel permitirá que o usuário mova do primeiro item de volta para o último e vice-versa. Deve haver pelo menos três vezes a quantidade informada em `visible-count` para que o loop ocorra.

##### orientation

Ou `horizontal` ou `vertical`, o default é `horizontal`. Quando `horizontal`, o carrossel será disposto horizontalmente, com o usuário sendo capaz de deslizar para a esquerda e para a direita. Quando `vertical`, o carrossel é disposto verticalmente, com o usuário podendo deslizar para cima e para baixo.

### Aplicação de estilos

Você pode usar o `bento-base-carousel` para aplicar estilos no acordeon livremente.

#### Personalizando botões de seta

Os botões de seta podem ser personalizados incluindo sua própria marcação personalizada. Por exemplo, você pode recriar o estilo default com o seguinte HTML e CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoBaseCarousel>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Interatividade e uso da API

Os componentes Bento são altamente interativos através de sua API. O componente `BentoBaseCarousel` é acessível passando uma `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Ações

A API `BentoBaseCarousel` permite que você execute as seguintes ações:

##### next()

Avança o carrossel em número de slides informado em `advanceCount`.

```javascript
ref.current.next();
```

##### prev()

Retrocede o carrossel em número de slides informado em `advanceCount`.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Move o carrossel para o slide especificado pelo argumento `index`. Observação: o `index` será normalizado para um número maior ou igual a `0` e menor que o número de slides fornecidos.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Eventos

A API `BentoBaseCarousel` permite que você se registre e responda aos seguintes eventos:

##### onSlideChange

Este evento é acionado quando o índice exibido pelo carrossel é alterado.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Layout e estilo

#### Tipo de contêiner

O componente `BentoBaseCarousel` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Ou via `className` :

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Mudança de slide da direita para a esquerda

`<BentoBaseCarousel>` requer que você defina quando está num contexto de leitura da direita para a esquerda (rtl) (por exemplo, páginas escritas em árabe ou hebraico). Embora o carrossel geralmente funcione sem isto, pode haver alguns bugs. Você pode informar ao carrossel que ele deve operar como `rtl` seguinte maneira:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Se o carrossel estiver num contexto RTL e você quiser que o carrossel opere como LTR, poderá definir explicitamente o `dir="ltr"` no carrossel.

### Layout dos slides

Os slides são dimensionados automaticamente pelo carrossel quando `mixedLengths`  **não** for especificado.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Os slides têm uma altura implícita quando o layout do carrossel é realizado. Isto pode ser facilmente alterado com CSS. Ao especificar a altura, o slide será centralizado verticalmente no carrossel.

Se quiser centralizar o conteúdo do slide horizontalmente, você deve contê-lo num elemento pai e usar esse elemento para centralizar o conteúdo.

### Número de slides visíveis

Ao alterar o número de slides visíveis usando `visibleSlides`, em resposta a uma consulta de mídia, você provavelmente vai querer alterar a proporção do próprio carrossel para corresponder ao novo número de slides visíveis. Por exemplo, se você deseja mostrar três slides por vez com uma proporção de aspecto de um para um, você deve ter uma proporção de três para um para o próprio carrossel. Da mesma forma, com quatro slides de cada vez, você usaria uma proporção de quatro por um. Além disso, ao alterar `visibleSlides`, você provavelmente também vai querer alterar `advanceCount`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Propriedades

#### Número de slides visíveis

##### mixedLength

Ou `true` ou `false`. O default é `false`. Quando true, usa a largura existente (ou altura quando horizontal) para cada um dos slides. Isto permite que um carrossel com slides de diferentes larguras seja usado.

##### visibleCount

Um número, o default é `1`. Determina quantos slides devem ser mostrados em um determinado momento. Valores fracionários podem ser usados para deixar visível parte de um(n) slide(s) adicional(is). Esta opção é ignorada quando `mixed-length` é `true`.

##### advanceCount

Um número, o default é `1`. Determina quantos slides o carrossel avançará ao avançar usando as setas anterior ou seguinte. Isto é útil quando for necessário especificar o atributo `visibleCount`

#### Avanço automático

##### autoAdvance

Ou `true` ou `false`, o default é `false`. Avança automaticamente o carrossel para o próximo slide depois de um determinado tempo. Se o usuário alterar os slides manualmente, o avanço automático será interrompido. Observe que se o `loop` não estiver ativado, ao chegar no último item, o avanço automático irá voltar ao primeiro item.

##### autoAdvanceCount

Um número, o default é `1`. Determina quantos slides o carrossel avançará quando usa o avanço automático. Isto é útil quando for necessário especificar o atributo `visible-count`.

##### autoAdvanceInterval

Um número, o default é `1000`. Especifica a quantidade de tempo, em milissegundos, entre os avanços automáticos subsequentes do carrossel.

##### autoAdvanceLoops

Um número, o default é `∞`. O número de vezes que o carrossel deve avançar pelos slides antes de parar.

#### Posicionamento automático

##### snap

Ou `true` ou `false` , o default é `true`. Determina se o carrossel deve encaixar automaticamente ou não nos slides ao rolar.

##### snapAlign

Ou `start` ou `center`. Ao iniciar o alinhamento, o início de um slide (por exemplo, a borda esquerda, quando fazendo alinhamento horizontal) é alinhado com o início de um carrossel. Ao alinhar pelo centro, o centro de um slide será alinhado com o centro de um carrossel.

##### snapBy

Um número, o default é `1`. Determina a granularidade do posicionamento automático e é útil ao usar o `visible-count`.

#### Miscellaneous

##### controls

Ou `"always"`, `"auto"` ou `"never"`, o default é `"auto"`. Determina se e quando as setas de navegação anterior/seguinte são exibidas. Observação: Quando `outset-arrows` é `true`, as setas são mostradas `"always"`.

- `always` : as setas são sempre exibidas.
- `auto` : as setas são exibidas quando a última interação do carrossel foi via mouse e não são exibidas quando a última interação do carrossel foi via toque. Na primeira carga para dispositivos de toque, as setas são exibidas até a primeira interação.
- `never` : as setas nunca são exibidas.

##### defaultSlide

Um número, o default é `0`. Determina o slide inicial mostrado no carrossel.

##### loop

Ou `true` ou `false`, o default é `false` quando omitido. Quando true, o carrossel permitirá que o usuário mova do primeiro item de volta para o último e vice-versa. Deve haver pelo menos três vezes a quantidade informada em `visible-count` para que o loop ocorra.

##### orientation

Ou `horizontal` ou `vertical`, o default é `horizontal`. Quando `horizontal`, o carrossel será disposto horizontalmente, com o usuário sendo capaz de deslizar para a esquerda e para a direita. Quando `vertical`, o carrossel é disposto verticalmente, com o usuário podendo deslizar para cima e para baixo.

### Aplicação de estilos

Você pode usar o `BentoBaseCarousel` para aplicar estilos no carrossel livremente.

#### Personalizando botões de seta

Os botões de seta podem ser personalizados incluindo sua própria marcação personalizada. Por exemplo, você pode recriar o estilo default com o seguinte HTML e CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
