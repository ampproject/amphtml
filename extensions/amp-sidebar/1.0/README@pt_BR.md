# Bento Sidebar

Fornece uma maneira de exibir meta conteúdo destinado a acesso temporário, como navegação, links, botões, menus. A barra lateral pode ser revelada por um toque de botão, enquanto o conteúdo principal permanece visualmente por baixo.

## Componente web

Você precisa incluir a biblioteca CSS necessária de cada componente Bento para garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style).

Os exemplos abaixo demonstram o uso do componente web `<bento-sidebar>`

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Exemplo: Usando include via `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### Bento Toolbar

Você pode criar um elemento Bento Toolbar (barra de ferramentas) que é exibido no `<body>` especificando o atributo `toolbar` com uma media query e um atributo `toolbar-target` com um id de elemento dentro de um elemento `<nav>` que é filho de `<bento-sidebar>`. O `toolbar` duplica o elemento `<nav>` e seus filhos e anexa esse elemento ao elemento `toolbar-target`.

#### Comportamento

- A barra lateral pode implementar barras de ferramentas, adicionando elementos nav com os atributos `toolbar` e `toolbar-target`.
- O elemento nav deve ser filho de `<bento-sidebar>` e obedecer o formato a seguir: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    - Por exemplo, este seria um uso válido de toolbar: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
- O comportamento da barra de ferramentas só é aplicado enquanto a media-query do atributo `toolbar` for válida. Além disso, um elemento com o ID do atributo `toolbar-target` deve existir na página para que a barra de ferramentas seja aplicada.

##### Exemplo: barra de ferramentas básica

No exemplo a seguir, exibimos uma `toolbar` se a largura da janela for menor ou igual a 767 px. A `toolbar` contém um elemento input de pesquisa. O elemento `toolbar` será anexado ao elemento `<div id="target-element">`.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### Interatividade e uso da API

Os componentes habilitados pelo Bento usados como componentes web standalone são altamente interativos através de sua API. O componente `bento-sidebar` é acessível incluindo a seguinte tag de script no seu documento:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Ações

A API `bento-sidebar` permite que você execute as seguintes ações:

##### open()

Abre a barra lateral.

```javascript
api.open();
```

##### close()

Fecha a barra lateral.

```javascript
api.close();
```

##### toggle()

Alterna o estado aberto da barra lateral.

```javascript
api.toggle(0);
```

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Estilos personalizados

O componente `bento-sidebar` pode ser estilizado com CSS padrão.

- A `width` do `bento-sidebar` do bento pode ser definida para ajustar a largura a partir do valor predefinido de 45px.
- A height da `bento-sidebar` do bento pode ser definida para ajustar a altura da barra lateral, se necessário. Se a altura exceder 100vw, a barra lateral terá uma barra de rolagem vertical. A altura predefinida da barra lateral é 100vw e pode ser substituída em CSS para deixá-la mais curta.
- O estado atual da barra lateral é exposto por meio do atributo `open` que é definido na tag `bento-sidebar` quando a barra lateral é aberta na página.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### Considerações de UX

Ao utilizar o `<bento-sidebar>`, lembre-se de que seus usuários frequentemente verão sua página no celular, que poderá exibir um cabeçalho de posição fixa. Além disso, os navegadores geralmente exibem seu próprio cabeçalho fixo no topo da página. Adicionar outro elemento de posição fixa na parte superior da tela ocuparia uma grande quantidade de espaço da tela do celular com conteúdo que não fornece ao usuário nenhuma informação nova.

Por esse motivo, recomendamos que as opções para abrir a barra lateral não sejam colocadas num cabeçalho fixo de largura total.

- A barra lateral só pode aparecer no lado esquerdo ou direito de uma página.
- A altura máxima (max-height) da barra lateral é 100vh; se a altura exceder 100vh, uma barra de rolagem vertical aparecerá. A altura default é definida como 100vh em CSS e pode ser substituída em CSS.
- A largura da barra lateral pode ser definida e ajustada usando CSS.
- *Recomenda-se* que o elemento `<bento-sidebar>` seja um filho direto de `<body>` para preservar uma ordem DOM lógica para acessibilidade, bem como para evitar a alteração de seu comportamento por um elemento de contêiner. Observe que ter um ancestral de `bento-sidebar` com um `z-index` definido pode fazer com que a barra lateral apareça abaixo de outros elementos (como cabeçalhos), quebrando sua funcionalidade.

### Atributos

#### side

Indica de que lado da página a barra lateral deve ser aberta, à esquerda (`left`) ou à direita (`right`). Se um lado (`side`) não for especificado, o `side` será herdado do atributo `dir` da tag `body` (`ltr` =&gt; `left`, `rtl` =&gt; `right`); se nenhum `dir` existir, o valor default de `side` será `left`.

#### open

Este atributo estará presente quando a barra lateral estiver aberta.

#### toolbar

Este atributo está presente nos elementos filhos `<nav toolbar="(media-query)" toolbar-target="elementID">` e aceita uma media query que define quando mostrar uma barra de ferramentas. Consulte a seção [Toolbar](#bento-toolbar) para mais informações sobre como usar barras de ferramentas.

#### toolbar-target

Este atributo está presente no elemento filho `<nav toolbar="(media-query)" toolbar-target="elementID">` e aceita um id de um elemento da página. O atributo `toolbar-target` colocará a barra de ferramentas no id especificado do elemento na página, sem o estilo default de barras de ferramentas. Veja a seção [Toolbar](#bento-toolbar) para mais informações sobre como usar barras de ferramentas.

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoSidebar>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### Bento Toolbar

Você pode criar um elemento Bento Toolbar (barra de ferramentas) que é exibido no `<body>` especificando a prop `toolbar` com uma media query e uma prop `toolbarTarget` com um id de elemento dentro de um `<BentoSidebarToolbar>`. O `toolbar` duplica o elemento `<BentoSidebarToolbar>` e seus filhos e anexa esse elemento ao elemento `toolbarTarget`.

#### Comportamento

- A barra lateral pode implementar barras de ferramentas, adicionando elementos nav com as props `toolbar` e `toolbarTarget`.
- O elemento nav deve ser filho de `<BentoSidebar>` e obedecer o formato a seguir: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` .
    - Por exemplo, este seria um uso válido de toolbar: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
- O comportamento da barra de ferramentas só é aplicado enquanto a media-query da prop `toolbar` for válida. Além disso, um elemento com o ID da prop `toolbarTarget` deve existir na página para que a barra de ferramentas seja aplicada.

##### Exemplo: barra de ferramentas básica

No exemplo a seguir, exibimos uma `toolbar` se a largura da janela for menor ou igual a 767 px. A `toolbar` contém um elemento input de pesquisa. O elemento `toolbar` será anexado ao elemento `<div id="target-element">`.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### Interatividade e uso da API

Os componentes Bento são altamente interativos através de sua API. O componente `BentoSidebar` é acessível passando uma `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### Ações

A API `BentoSidebar` permite que você execute as seguintes ações:

##### open()

Abre a barra lateral.

```javascript
ref.current.open();
```

##### close()

Fecha a barra lateral.

```javascript
ref.current.close();
```

##### toggle()

Alterna o estado aberto da barra lateral.

```javascript
ref.current.toggle(0);
```

### Layout e estilo

O componente `BentoSidebar` pode ser estilizado com CSS padrão.

- A `width` do `bento-sidebar` do bento pode ser definida para ajustar a largura a partir do valor predefinido de 45px.
- A altura (height) da `bento-sidebar` do bento pode ser definida para ajustar a altura da barra lateral, se necessário. Se a altura exceder 100vw, a barra lateral terá uma barra de rolagem vertical. A altura predefinida da barra lateral é 100vw e pode ser substituída em CSS para deixá-la mais curta.

Para garantir que o componente seja renderizado da forma que você deseja, certifique-se de aplicar uma dimensão ao componente. Elas podem ser aplicadas inline:

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

Ou via `className` :

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### Considerações de UX

Ao utilizar o `<BentoSidebar>`, lembre-se de que seus usuários frequentemente verão sua página no celular, que poderá exibir um cabeçalho de posição fixa. Além disso, os navegadores geralmente exibem seu próprio cabeçalho fixo no topo da página. Adicionar outro elemento de posição fixa na parte superior da tela ocuparia uma grande quantidade de espaço da tela do celular com conteúdo que não fornece ao usuário nenhuma informação nova.

Por esse motivo, recomendamos que as opções para abrir a barra lateral não sejam colocadas num cabeçalho fixo de largura total.

- A barra lateral só pode aparecer no lado esquerdo ou direito de uma página.
- A altura máxima (max-height) da barra lateral é 100vh; se a altura exceder 100vh, uma barra de rolagem vertical aparecerá. A altura default é definida como 100vh em CSS e pode ser substituída em CSS.
- A largura da barra lateral pode ser definida e ajustada usando CSS.
- <em>Recomenda-se</em> que o elemento <code>&lt;BentoSidebar&gt;</code> seja um filho direto de `<body>` para preservar uma ordem DOM lógica para acessibilidade, bem como para evitar a alteração de seu comportamento por um elemento de contêiner. Observe que ter um ancestral de `BentoSidebar` com um `z-index` definido pode fazer com que a barra lateral apareça abaixo de outros elementos (como cabeçalhos), quebrando sua funcionalidade.

### Propriedades

#### side

Indica de que lado da página a barra lateral deve ser aberta, à esquerda (`left`) ou à direita (`right`). Se um lado (`side`) não for especificado, o `side` será herdado do atributo `dir` da tag `body` (`ltr` =&gt; `left`, `rtl` =&gt; `right`); se nenhum `dir` existir, o valor default de `side` será `left`.

#### toolbar

Esta prop está presente nos elementos filho `<BentoSidebarToolbar toolbar="(media-query)" toolbar-target="elementID">` e aceita uma media query que define quando mostrar uma barra de ferramentas. Veja a seção [Toolbar](#bento-toolbar) para mais informações sobre como usar barras de ferramentas.

#### toolbarTarget

Este atributo está presente no elemento filho `<BentoSidebarToolbar toolbar="(media-query)" toolbar-target="elementID">` e aceita um id de um elemento da página. A prop `toolbarTarget` colocará a barra de ferramentas no id especificado do elemento na página, sem o estilo default de barras de ferramentas. Veja a seção [Toolbar](#bento-toolbar) para mais informações sobre como usar barras de ferramentas.
