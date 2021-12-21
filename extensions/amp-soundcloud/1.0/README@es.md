# Bento Soundcloud

Incorpora un clip de [Soundcloud](https://soundcloud.com).

## El componente web

Debe incluir la biblioteca CSS correspondiente para cada componente de Bento si desea garantizar una carga adecuada, y lo deberá hacer antes de incorporar estilos personalizados. O utilice los estilos precargados ligeros que estén disponibles en línea. Consulte [Diseño y estilo](#layout-and-style).

En los siguientes ejemplos se muestra el uso del componente web `<bento-soundcloud>`.

### Ejemplo: Importar mediante npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Ejemplo: Incluir mediante `<script>`

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

### Diseño y estilo

Cada componente de Bento dispone de una pequeña biblioteca CSS que debe incluir para garantizar que se cargue correctamente sin [cambios de contenido](https://web.dev/cls/). Debido a las especificaciones basadas en el orden, debe asegurarse manualmente de que las hojas de estilo se incluyan antes de los estilos personalizados.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Otra posibilidad es hacer que los estilos ligeros pre-actualizados estén disponibles en los estilos integrados en el código:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo de contenedor

El componente `bento-soundcloud` tiene un tipo de tamaño de diseño determinado. Para asegurarse de que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como uno definido con `height`, `width`, `aspect-ratio`, u otras propiedades similares):

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
    <td>Este atributo es necesario si <code>data-playlistid</code> no está definido.<br> El valor de este atributo es el ID de una pista, un número entero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Este atributo es necesario si <code>data-trackid</code> no está definido.<br> El valor de este atributo es el ID de una lista de reproducción, un número entero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (opcional)</strong></td>
    <td>El token secreto de la pista, si es privada.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (opcional)</strong></td>
    <td>Si se define como <code>true</code>, muestra el modo "Visual" de tamaño completo, de lo contrario se muestra como modo "Clásico". El valor predeterminado es <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (opcional)</strong></td>
    <td>Este atributo es un color personalizado que se antepone al modo "Clásico". El atributo se ignora en el modo "Visual". Especifique un valor de color hexadecimal, sin el # principal  (por ejemplo, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## El componente Preact/React

En los siguientes ejemplos se muestra el uso de `<BentoSoundcloud>` como un componente funcional que se puede utilizar en las bibliotecas Preact o React.

### Ejemplo: Importar mediante npm

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

### Diseño y estilo

#### Tipo de contenedor

El componente `BentoSoundcloud` tiene un tipo de tamaño de diseño determinado. Para asegurarse de que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como uno definido con `height`, `width`, `aspect-ratio`, u otras propiedades similares). Se pueden aplicar en estilos integrados en el código:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

O mediante `className`:

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

### Props

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Este atributo es necesario si <code>data-playlistid</code> no está definido.<br> El valor de este atributo es el ID de una pista, un número entero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Este atributo es necesario si <code>data-trackid</code> no está definido.<br> El valor de este atributo es el ID de una lista de reproducción, un número entero.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (opcional)</strong></td>
    <td>El token secreto de la pista, si es privada.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (opcional)</strong></td>
    <td>Si se define como <code>true</code>, muestra el modo "Visual" de tamaño completo; de lo contrario, se muestra como modo "Clásico". El valor predeterminado es <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (opcional)</strong></td>
    <td>Este atributo es un color personalizado que se antepone al modo "Clásico". El atributo se ignora en el modo "Visual". Especifique un valor de color hexadecimal, sin el # principal  (por ejemplo, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
