# Bento WordPress Embed

## Cómo se utiliza

En un iframe se mostrará el [fragmento](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) de una publicación o una página de WordPress. Utilice Bento WordPress Embed como un componente web [`<bento-wordpress-embed>`](#web-component), o un componente funcional Preact/React [`<BentoWordPressEmbed>`](#preactreact-component).

### El componente web

Debe incluir la biblioteca CSS correspondiente para cada componente de Bento si desea garantizar una carga adecuada, y debe hacerlo antes de incorporar estilos personalizados. O utilice los estilos precargados ligeros que estén disponibles en línea. Para obtener más información, consulte la sección [Diseño y estilo](#layout-and-style).

En los siguientes ejemplos se muestra el uso del componente web `<bento-wordpress-embed>`.

#### Ejemplo: Importar mediante npm

[example preview="top-frame" playground="false"]

Instalar mediante npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### Ejemplo: Incluir mediante `<script>`

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

#### Diseño y estilo

Cada componente de Bento dispone de una pequeña biblioteca CSS que debe incluir para garantizar que se cargue correctamente sin [cambios en el contenido](https://web.dev/cls/). Sin embargo, debido a las especificaciones basadas en el orden, debe asegurarse manualmente de que las hojas de estilo se incluyan antes que los estilos personalizados.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

Otra posibilidad es hacer que los estilos ligeros previamente actualizados estén disponibles en los estilos integrados en el código:

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Tipo de contenedor**

El componente `bento-wordpress-embed` tiene un formato específico para el tamaño del diseño. Para garantizar que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como el que se definió con `height`, `width`, `aspect-ratio`, u otras propiedades similares):

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### Atributos

##### data-url (obligatorio)

Es la URL que se integrará en la publicación.

### El componente Preact/React

En los siguientes ejemplos se muestra el uso de `<BentoWordPressEmbed>` como un componente funcional que puede utilizarse en las bibliotecas Preact o React.

#### Ejemplo: Importar mediante npm

[example preview="top-frame" playground="false"]

Instalar mediante npm:

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

#### Diseño y estilo

**Tipo de contenedor**

El componente `BentoWordPressEmbed` tiene un formato específico para el tamaño del diseño. Para garantizar que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como el que se definió con `height`, `width`, `aspect-ratio`, u otras propiedades similares). Estos pueden aplicarse en estilos integrados en el código:

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

O mediante `className`:

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

#### Props

##### URL (obligatoria)

Es la URL que se integrará en la publicación.
