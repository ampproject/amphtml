# Bento Carousel

Un carrusel genérico para visualizar varias piezas de contenido similares a lo largo de un eje horizontal o vertical.

Cada uno de los descendientes inmediatos del componente se considera un elemento del carrusel. Cada uno de estos nodos también puede tener descendientes arbitrarios.

El carrusel está compuesto por un número arbitrario de elementos, así como por flechas de navegación optativas para avanzar o retroceder un solo elemento.

El carrusel avanza entre los elementos si el usuario pulsa o utiliza los botones de flecha personalizables.

## El componente web

Debe incluir la biblioteca CSS correspondiente para cada componente de Bento si desea garantizar que se cargue adecuadamente, y lo deberá hacer antes de incorporar estilos personalizados. O utilice los estilos precargados ligeros que estén disponibles en línea. Consulte [Diseño y estilo](#layout-and-style).

En los siguientes ejemplos se muestra el uso del componente web `<bento-base-carousel>`.

### Ejemplo: Importar mediante npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Ejemplo: Incluir mediante `<script>`

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

### Interacción y uso de la API

Los componentes de Bento que se utilizan de forma independiente son altamente interactivos gracias su API. La API del componente `bento-base-carousel` es accesible incluyendo la siguiente etiqueta del script en su documento:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Acciones

La API de `bento-base-carousel` le permite realizar las siguientes acciones:

##### next()

Desplaza el carrusel hacia adelante mediante `advance-count` en las diapositivas.

```javascript
api.next();
```

##### prev()

Desplaza el carrusel hacia atrás mediante `advance-count` en las diapositivas.

```javascript
api.prev();
```

##### goToSlide(index: number)

Desplaza el carrusel a la diapositiva especificada por el argumento `index`. Nota: `index` se normalizará a un número mayor o igual que `0` y menor que el número de diapositivas indicadas.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Eventos

La API de `bento-base-carousel` le permite registrar y responder a los siguientes eventos:

##### slideChange

Este evento se activa cuando el índice que muestra el carrusel se modifica. El nuevo índice está disponible por medio de `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Diseño y estilo

Cada componente de Bento dispone de una pequeña biblioteca CSS que debe incluir para garantizar que se cargue correctamente sin [cambios de contenido](https://web.dev/cls/). Debido a las especificaciones basadas en el orden, debe asegurarse manualmente de que las hojas de estilo se incluyan antes de los estilos personalizados.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Otra posibilidad es hacer que los estilos ligeros pre-actualizados estén disponibles en los estilos integrados en el código:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Tipo de contenedor

El componente `bento-base-carousel` tiene un formato específico para el tamaño del diseño. Para garantizar que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como el que se definió con `height`, `width`, `aspect-ratio`, u otras propiedades similares):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Modificar el desplazamiento de las diapositivas de derecha a izquierda

`<bento-base-carousel>` rrequiere que determine cuándo se encuentra en un contexto de derecha a izquierda (rtl) (por ejemplo, páginas en árabe o hebreo). Aunque el carrusel generalmente funcionará sin esto, puede haber algunos errores. Puede indicar al carrusel que debe funcionar como `rtl` de la siguiente manera:

```html
<bento-base-carousel dir="rtl" …> … </bento-base-carousel>
```

Si el carrusel está en un contexto RTL, y quiere que el carrusel funcione como LTR, puede establecer de forma explícita `dir="ltr"` en el carrusel.

### Diseño de la diapositiva

Las diapositivas se dimensionan automáticamente en el carrusel cuando **no** se especifica `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Las diapositivas presentan una altura implícita cuando el carrusel está preparado. Esto puede modificarse fácilmente con CSS. Al especificar la altura, la diapositiva se centrará verticalmente dentro del carrusel.

Si desea centrar horizontalmente el contenido de su diapositiva, deberá crear un elemento envolvente y utilizarlo para centrar el contenido.

### Número de diapositivas visibles

Al cambiar el número de diapositivas visibles mediante `visible-slides`, para responder a una consulta de medios, es probable que desee cambiar la relación de aspecto del propio carrusel para que coincida con el nuevo número de diapositivas visibles. Por ejemplo, si quiere mostrar tres diapositivas a la vez con una relación de aspecto de uno por uno, necesitará una relación de aspecto de tres por uno para el propio carrusel. Del mismo modo, con cuatro diapositivas a la vez querrá una relación de aspecto de cuatro por uno. Además, al cambiar `visible-slides`, es probable que quiera cambiar `advance-count`.

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

#### Consultas de medios

Los atributos de `<bento-base-carrusel>` se pueden configurar para utilizar diferentes opciones basadas en una [consulta de medios](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Número de diapositivas visibles

##### mixed-length

Tanto `true` como `false`, cuyo valor predeterminado es `false`. Cuando es verdadero, utiliza el ancho disponible (o la altura cuando es horizontal) para cada una de las diapositivas. Esto permite utilizar un carrusel con diapositivas de diferentes anchos.

##### visible-count

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas deben mostrarse en un momento específico. Se pueden utilizar valores fraccionarios para hacer visible parte de unas diapositivas adicionales. Esta opción se ignora cuando `mixed-length` es `true`.

##### advance-count

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas avanzará el carrusel cuando avanza utilizando las flechas anterior o siguiente. Esto es útil cuando se especifica el atributo `visible-count`.

#### Avance automático

##### auto-advance

Tanto `true` como `false`, cuyo valor predeterminado es `false`. Avanza automáticamente el carrusel a la siguiente diapositiva basándose en un retraso. Si el usuario cambia manualmente las diapositivas, el avance automático se detiene. Tenga en cuenta que si `loop` no está activo, al llegar al último elemento, el avance automático retrocederá hasta el primer elemento.

##### auto-advance-count

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas avanzará el carrusel cuando lo haga automáticamente. Esto es útil cuando se especifica el atributo `visible-count`.

##### auto-advance-interval

Es un número, cuyo valor predeterminado es `1000`. Especifica la cantidad de tiempo, en milisegundos, entre los siguientes avances automáticos del carrusel.

##### auto-advance-loops

Es un número, cuyo valor predeterminado es `∞`. El número de veces que el carrusel debe avanzar a través de las diapositivas antes de detenerse.

#### Ajustar

##### snap

Tanto `true` como `false`, cuyo valor predeterminado es `true`. Determina si el carrusel debe ajustarse a las diapositivas cuando se desplaza.

##### snap-align

Ya sea `start` o `center`. Cuando inicia la alineación, el inicio de una diapositiva (por ejemplo, el borde izquierdo, cuando la alineación es horizontal) se alinea con el inicio de un carrusel. Cuando se alinea al centro, el centro de una diapositiva se alinea con el centro de un carrusel.

##### snap-by

Es un número, cuyo valor predeterminado es `1`. Determina la granularidad del ajuste y es útil cuando se utiliza `visible-count`.

#### Observaciones

##### controls

Ya sea `"always"`, `"auto"`, o `"never"`, cuyo valor predeterminado es `"auto"`. Determina si se muestran las flechas de navegación anterior/siguiente y cuándo lo hacen. Nota: Cuando `"outet-arrows` es `true`, las flechas se muestran `"always"`.

- `always`: Las flechas siempre se muestran.
- `auto`: Las flechas se muestran cuando el carrusel recibió la última interacción por medio del mouse, y no se muestran cuando el carrusel recibió la última interacción de forma táctil. En la primera carga de los dispositivos táctiles, las flechas se muestran hasta la primera interacción.
- `never`: Las flechas nunca se muestran.

##### slide

Es un número, cuyo valor predeterminado es `0`. Determina cuál será la diapositiva inicial que se mostrará en el carrusel. Puede modificarse con `Element.setAttribute` para controlar la diapositiva que se muestra actualmente.

##### loop

Ya sea `true` o `false`, cuyo valor predeterminado es `false` cuando se omite. Cuando es verdadero, el carrusel permitirá al usuario moverse desde el primer elemento hasta el último y viceversa. Debe haber al menos tres veces el `visible-count` de diapositivas presentes para que se produzca el bucle.

##### orientation

Ya sea `horizontal` o `vertical`, cuyo valor predeterminado es `horizontal`. Si se utiliza `horizontal` el carrusel se mostrará de forma horizontal, con la posibilidad de que el usuario se desplace a la izquierda y a la derecha. Si se utiliza `vertical` el carrusel se despliega verticalmente, con la posibilidad de que el usuario se desplace hacia arriba y hacia abajo.

### Diseño

Puede utilizar el seleccionador de elementos `bento-base-carousel` para diseñar libremente el carrusel.

#### Personalización de los botones tipo flecha

Los botones tipo flecha pueden personalizarse incorporando sus propias marcas. Por ejemplo, puede recrear el estilo predeterminado con el siguiente HTML y CSS:

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

## El componente Preact/React

En los siguientes ejemplos se muestra el uso de `<BentoBaseCarousel>` como un componente funcional que puede utilizarse en las bibliotecas Preact o React.

### Ejemplo: Importar mediante npm

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

### Interacción y uso con la API

Los componentes de Bento son muy interactivos gracias a su API. La API del componente `BentoBaseCarousel` puede ser accesible a través de un `ref`:

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

#### Acciones

La API de `BentoBaseCarousel` le permite realizar las siguientes acciones:

##### next()

Desplaza el carrusel hacia adelante mediante `advanceCount` en las diapositivas.

```javascript
ref.current.next();
```

##### prev()

Desplaza el carrusel hacia atrás mediante `advanceCount` en las diapositivas.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Desplaza el carrusel a la diapositiva especificada por el argumento `index`. Nota: `index` se normalizará a un número mayor o igual que `0` y menor que el número de diapositivas indicadas.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Eventos

La API de `BentoBaseCarousel` le permite registrar y responder a los siguientes eventos:

##### onSlideChange

Este evento se activa cuando el índice que se muestra en el carrusel se modificó.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Diseño y estilo

#### Tipo de contenedor

El componente `BentoBaseCarousel` tiene un tipo de tamaño de diseño determinado. Para asegurarse de que el componente se renderiza correctamente, asegúrese de aplicar un tamaño al componente y a sus descendientes inmediatos (diapositivas) mediante el diseño CSS que desee (como uno definido con `height`, `width`, `aspect-ratio`, u otras propiedades similares). Se pueden aplicar en estilos integrados en el código:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

O mediante `className`:

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

### Modificar el desplazamiento de las diapositivas de derecha a izquierda

`<BentoBaseCarousel>` rrequiere que determine cuándo se encuentra en un contexto de derecha a izquierda (rtl) (por ejemplo, páginas en árabe o hebreo). Aunque el carrusel generalmente funcionará sin esto, puede haber algunos errores. Puede indicar al carrusel que debe funcionar como `rtl` de la siguiente manera:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Si el carrusel está en un contexto RTL, y quiere que el carrusel funcione como LTR, puede establecer de forma explícita `dir="ltr"` en el carrusel.

### Diseño de la diapositiva

Las diapositivas se dimensionan automáticamente en el carrusel cuando **no** se especifica `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Las diapositivas presentan una altura implícita cuando el carrusel está preparado. Esto puede modificarse fácilmente con CSS. Al especificar la altura, la diapositiva se centrará verticalmente dentro del carrusel.

Si desea centrar horizontalmente el contenido de su diapositiva, deberá crear un elemento envolvente y utilizarlo para centrar el contenido.

### Número de diapositivas visibles

Al cambiar el número de diapositivas visibles mediante `visibleSlides`, para responder a una consulta de medios, es probable que desee cambiar la relación de aspecto del propio carrusel para que coincida con el nuevo número de diapositivas visibles. Por ejemplo, si quiere mostrar tres diapositivas a la vez con una relación de aspecto de uno por uno, necesitará una relación de aspecto de tres por uno para el propio carrusel. Del mismo modo, con cuatro diapositivas a la vez querrá una relación de aspecto de cuatro por uno. Además, al cambiar `visible-slides`, es probable que quiera cambiar `advance-count`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel visibleCount={count} advanceCount={count}>
  <img style={{height: '100%', width: '100%'}} src="…" />…
</BentoBaseCarousel>
```

### Props

#### Número de diapositivas visibles

##### mixedLength

Tanto `true` como `false`, cuyo valor predeterminado es `false`. Cuando es verdadero, utiliza el ancho disponible (o la altura cuando es horizontal) para cada una de las diapositivas. Esto permite utilizar un carrusel con diapositivas de diferentes anchos.

##### visibleCount

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas deben mostrarse en un momento específico. Se pueden utilizar valores fraccionarios para hacer visible parte de unas diapositivas adicionales. Esta opción se ignora cuando `mixed-length` es `true`.

##### advanceCount

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas avanzará el carrusel cuando avanza utilizando las flechas anterior o siguiente. Esto es útil cuando se especifica el atributo `visibleCount`.

#### Avance automático

##### autoAdvance

Tanto `true` como `false`, cuyo valor predeterminado es `false`. Avanza automáticamente el carrusel a la siguiente diapositiva basándose en un retraso. Si el usuario cambia manualmente las diapositivas, el avance automático se detiene. Tenga en cuenta que si `loop` no está activo, al llegar al último elemento, el avance automático retrocederá hasta el primer elemento.

##### autoAdvanceCount

Es un número, cuyo valor predeterminado es `1`. Determina cuántas diapositivas avanzará el carrusel cuando lo haga automáticamente. Esto es útil cuando se especifica el atributo `visible-count`.

##### autoAdvanceInterval

Es un número, cuyo valor predeterminado es `1000`. Especifica la cantidad de tiempo, en milisegundos, entre los siguientes avances automáticos del carrusel.

##### autoAdvanceLoops

Es un número, cuyo valor predeterminado es `∞`. El número de veces que el carrusel debe avanzar a través de las diapositivas antes de detenerse.

#### Ajustar

##### snap

Tanto `true` como `false`, cuyo valor predeterminado es `true`. Determina si el carrusel debe ajustarse a las diapositivas cuando se desplaza.

##### snapAlign

Ya sea `start` o `center`. Cuando inicia la alineación, el inicio de una diapositiva (por ejemplo, el borde izquierdo, cuando la alineación es horizontal) se alinea con el inicio de un carrusel. Cuando se alinea al centro, el centro de una diapositiva se alinea con el centro de un carrusel.

##### snapBy

Es un número, cuyo valor predeterminado es `1`. Determina la granularidad del ajuste y es útil cuando se utiliza `visible-count`.

#### Observaciones

##### controls

Ya sea `"always"`, `"auto"`, o `"never"`, cuyo valor predeterminado es `"auto"`. Determina si se muestran las flechas de navegación anterior/siguiente y cuándo lo hacen. Nota: Cuando `"outet-arrows` es `true`, las flechas se muestran `"always"`.

- `always`: Las flechas siempre se muestran.
- `auto`: Las flechas se muestran cuando el carrusel recibió la última interacción por medio del mouse, y no se muestran cuando el carrusel recibió la última interacción de forma táctil. En la primera carga de los dispositivos táctiles, las flechas se muestran hasta la primera interacción.
- `never`: Las flechas nunca se muestran.

##### defaultSlide

Es un número, cuyo valor predeterminado es `0`. Determina la diapositiva inicial que se muestra en el carrusel.

##### loop

Ya sea `true` o `false`, cuyo valor predeterminado es `false` cuando se omite. Cuando es verdadero, el carrusel permitirá al usuario moverse desde el primer elemento hasta el último y viceversa. Debe haber al menos tres veces el `visible-count` de diapositivas presentes para que se produzca el bucle.

##### orientation

Ya sea `horizontal` o `vertical`, cuyo valor predeterminado es `horizontal`. Si se utiliza `horizontal` el carrusel se mostrará de forma horizontal, con la posibilidad de que el usuario se desplace a la izquierda y a la derecha. Si se utiliza `vertical` el carrusel se despliega verticalmente, con la posibilidad de que el usuario se desplace hacia arriba y hacia abajo.

### Diseño

Puede utilizar el seleccionador de elementos `BentoBaseCarousel` para diseñar libremente el carrusel.

#### Personalización de los botones tipo flecha

Los botones tipo flecha pueden personalizarse incorporando sus propias marcas. Por ejemplo, puede recrear el estilo predeterminado con el siguiente HTML y CSS:

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
