# Bento Soundcloud

Incorpora um clipe do [Soundcloud.](https://soundcloud.com)

## Componente web

Você precisa incluir a biblioteca CSS necessária de cada componente Bento para garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style).

Os exemplos abaixo demonstram o uso do componente web `<bento-soundcloud>`

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Exemplo: Usando include via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo de contêiner

O componente `bento-soundcloud` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Atributos

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Este atributo é necessário se <code>data-playlistid</code> não estiver definido.<br> O valor para este atributo é o ID de uma faixa, um inteiro.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Este atributo é necessário se <code>data-trackid</code> não estiver definido. O valor para este atributo é o ID de uma lista de reprodução, um número inteiro.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (opcional)</strong></td>
    <td>O token secreto da faixa, se for privado.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (opcional)</strong></td>
    <td>Se definido como <code>true</code>, exibe o modo "Visual" de largura total; caso contrário, ele é exibido no modo "Classic". O valor default é <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (opcional)</strong></td>
    <td>Este atributo é uma substituição de cor personalizada para o modo "Classic". O atributo é ignorado no modo "Visual". Especifique um valor de cor hexadecimal, sem o # inicial (por exemplo, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoSoundcloud>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Layout e estilo

#### Tipo de contêiner

O componente `BentoSoundcloud` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Ou via `className` :

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
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
    <td width="40%"><strong>trackId</strong></td>
    <td>Este atributo é necessário se <code>data-playlistid</code> não estiver definido.<br> O valor para este atributo é o ID de uma faixa, um inteiro.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Este atributo é necessário se <code>data-trackid</code> não estiver definido. O valor para este atributo é o ID de uma lista de reprodução, um número inteiro.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (opcional)</strong></td>
    <td>O token secreto da faixa, se for privado.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (opcional)</strong></td>
    <td>Se definido como <code>true</code>, exibe o modo "Visual" de largura total; caso contrário, ele é exibido no modo "Classic". O valor default é <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (opcional)</strong></td>
    <td>Este atributo é uma substituição de cor personalizada para o modo "Classic". O atributo é ignorado no modo "Visual". Especifique um valor de cor hexadecimal, sem o # inicial (por exemplo, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
