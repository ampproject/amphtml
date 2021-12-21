# Bento Accordion

Visualiza secciones de contenido que se pueden contraer y expandir. Este componente permite que los espectadores echen un vistazo al esquema del contenido y accedan a cualquier sección. Su uso eficaz reduce la necesidad de desplazarse en los dispositivos móviles.

-   Un componente Bento Accordion acepta uno o más elementos `<section>` como su descendiente directo.
-   Cada elemento `<section>` debe contener exactamente dos descendientes directos.
-   El primer descendiente en un elemento `<section>` es el título para esa sección del componente Bento Accordion. Debe ser un elemento del título como `<h1>-<h6>` o `<header>`.
-   El segundo descendiente en un elemento `<section>` es el contenido expandible/colapsable.
    -   Puede ser cualquier etiqueta permitida en [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   Si hace clic o pulsa sobre el encabezado de `<section>`, la sección se expande o se contrae.
-   Un Bento Accordion con un `id` definido conserva el estado contraído o expandido de cada sección mientras el usuario permanece en su dominio.

## El componente web

Debe incluir la biblioteca CSS correspondiente para cada componente de Bento si desea garantizar que se cargue adecuadamente, y lo deberá hacer antes de incorporar estilos personalizados. O utilice los estilos precargados ligeros que estén disponibles en línea. Consulte [Diseño y estilo](#layout-and-style).

En los siguientes ejemplos se muestra el uso del componente web `<bento-accordion>`.

### Ejemplo: Importar mediante npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Ejemplo: Incluir mediante `<script>`

El siguiente ejemplo contiene un `bento-accordion` con tres secciones. El atributo `expanded` de la tercera sección la expande cuando se carga la página.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### Interacción y uso de la API

Los componentes de Bento que se utilizan de forma independiente son altamente interactivos para su API. La API del componente `bento-accordion` es accesible incluyendo la siguiente etiqueta del script en su documento:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Acciones

##### toggle()

La acción `toggle` intercambia los estados `expanded` y `collapsed` de las secciones de <code>bento-accordion</code>. Cuando esta función se ejecuta sin argumentos, activa todas las secciones del acordeón. Para especificar una sección concreta, agregue el argumento <code>section</code> y utilice su correspondiente <code>id</code> como valor.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

La acción `expand` expande las secciones de `bento-accordion`. Si una sección ya está expandida, permanecerá expandida. Cuando se llama sin argumentos, expande todas las secciones del acordeón. Para especificar una sección, agregue el argumento <code>section</code> y utilice su correspondiente <code>id</code> como valor.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

La acción `collapse` colapsa las secciones de `bento-accordion`. Si una sección ya está colapsada, permanece colapsada. Cuando se llama sin argumentos, colapsa todas las secciones del acordeón. Para especificar una sección, agregue el argumento <code>section</code> y utilice su correspondiente <code>id</code> como valor.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Eventos

La API de `bento-accordion` le permite registrar y responder a los siguientes eventos:

##### expand

Este evento se activa cuando se expande una sección del acordeón y se envía desde la sección que se expande.

Más adelante encontrará un ejemplo.

##### collapse

Este evento se activa cuando colapsa una sección del acordeón y se envía desde la sección que se colapsa.

En el siguiente ejemplo, `section 1` pone atención al evento `expand` y expande `section 2` cuando se activa. `section 2` pone atención al evento `collapse` y colapsa la `section 1` cuando se activa.

Más adelante encontrará un ejemplo.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Diseño y estilo

Cada componente de Bento dispone de una pequeña biblioteca CSS que debe incluir para garantizar que se cargue correctamente sin [cambios en el contenido](https://web.dev/cls/). Debido a las especificaciones basadas en el orden, debe asegurarse manualmente de que las hojas de estilo se incluyan antes de que se incluyan los estilos personalizados.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Otra posibilidad es hacer que los estilos ligeros pre-actualizados estén disponibles en los estilos integrados en el código:

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Atributos

#### animate

Incluya el atributo `animate` en `<bento-accordion>` para agregar una animación "bajar" cuando el contenido se expande y una animación "subir" cuando se colapse.

Este atributo puede configurarse para basarse en una [consulta multimedia](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Aplique el atributo `expanded` a una `<section>` anidada para expandir esa sección cuando se cargue la página.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Permite que solo se expanda una sección a la vez si aplica el atributo `expand-single-section` al elemento `<bento-accordion>`. Esto significa que si un usuario pulsa sobre una `<section>` colapsada, esta se expandirá y colapsará otras `<section>` que se expandieron.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Diseño

Puede utilizar el seleccionador de elementos `bento-accordion` para diseñar libremente el acordeón.

Considere los siguientes puntos cuando diseñe un amp-accordion:

-   Los elementos `bento-accordion` siempre son `display: block`.
-   `float` no puede diseñar una `<section>`, ni un encabezado, ni los elementos de un contenido.
-   Una sección que se expande aplica el atributo `expanded` al elemento `<section>`.
-   El elemento del contenido se arregla rápidamente con `overflow: hidden` y por lo tanto no puede tener barras de desplazamiento.
-   Los márgenes de los elementos `<bento-accordion>`, `<section>`, el encabezado y el contenido se definen como `0`, pero pueden sobreponerse a los estilos personalizados.
-   Tanto los elementos del encabezado como los del contenido tienen una `position: relative`.

---

## El componente Preact/React

En los siguientes ejemplos se muestra el uso de `<BentoAccordion>` como un componente funcional que se puede utilizar en las bibliotecas Preact o React.

### Ejemplo: Importar mediante npm

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Interacción y uso con la API

Los componentes de Bento son muy interactivos gracias a su API. La API del componente `BentoAccordion` puede ser accesible a través de un `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Acciones

La API de `BentoAccordion` le permite realizar las siguientes acciones:

##### toggle()

La acción `toggle` intercambia los estados `expanded` y `collapsed` de las secciones de `bento-accordion`. Cuando esta función se ejecuta sin argumentos, activa todas las secciones del acordeón. Para especificar una sección concreta, agregue el argumento `section` y utilice su correspondiente <code>id</code> como valor.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

La acción `expand` expande las secciones de `bento-accordion`. Si una sección ya está expandida, permanecerá expandida. Cuando se llama sin argumentos, expande todas las secciones del acordeón. Para especificar una sección, agregue el argumento `section` y utilice su correspondiente <code>id</code> como valor.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

La acción `collapse` colapsa las secciones de `bento-accordion`. Si una sección ya está colapsada, permanece colapsada. Cuando se llama sin argumentos, colapsa todas las secciones del acordeón. Para especificar una sección, agregue el argumento `section` y utilice su correspondiente <code>id</code> como valor.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Eventos

La API de Bento Accordion le permite reaccionar ante los siguientes eventos:

##### onExpandStateChange

Este evento se activa cuando se expande una sección del acordeón y se envía desde la sección que se expande.

Más adelante encontrará un ejemplo.

##### onCollapse

Este evento se activa cuando colapsa una sección del acordeón y se envía desde la sección que se colapsa.

En el siguiente ejemplo, `section 1` pone atención al evento `expand` y expande `section 2` cuando se activa. `section 2` pone atención al evento `collapse` y colapsa la `section 1` cuando se activa.

Más adelante encontrará un ejemplo.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### Diseño y estilo

#### Tipo de contenedor

El componente `BentoAccordion` tiene un tipo de tamaño de diseño determinado. Para asegurarse de que el componente se visualiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos mediante el diseño CSS que desee (como uno definido con `height`, `width`, `aspect-ratio`, u otras propiedades similares). Se pueden aplicar en estilos integrados en el código:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

O mediante `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Props

#### BentoAccordion

##### animate

Si es verdadero, entonces utilizará la animación "bajar" / "subir" durante la expansión y el colapso de cada sección. Valor predeterminado: `false`

##### expandSingleSection

Si es verdadero, al expandir una sección automáticamente se contraerán todas las demás. Valor predeterminado: `false`

#### BentoAccordionSection

##### animate

Si es verdadero, entonces utilizará la animación "bajar"/"subir" durante la expansión y el colapso de la sección. Valor predeterminado: `false`

##### expanded

Si es verdadero, expande la sección. Valor predeterminado: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

La devolución de llamadas para escuchar los cambios de estado de expansión. Tome un marcador booleano como parámetro que indique si la sección se expandió recientemente (`false` indica que se colapsó)

#### BentoAccordionHeader

#### Props comunes

Este componente es compatible con los [props comunes](../../../docs/spec/bento-common-props.md) para los componentes React y Preact.

BentoAccordionHeader aún no es compatible con ningún prop personalizado

#### BentoAccordionContent

#### Props comunes

Este componente es compatible con los [props comunes](../../../docs/spec/bento-common-props.md) para los componentes React y Preact.

BentoAccordionContent aún no es compatible con ningún prop personalizado
