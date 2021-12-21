# Bento Date Countdown

Despliega una secuencia de cuenta regresiva hasta una fecha determinada. Consulte la sección [parámetros temporales devueltos](#returned-time-parameters) para obtener información sobre los parámetros temporales disponibles.

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## El componente Preact/React

En los siguientes ejemplos se muestra el uso de `<BentoDateCountdown>` como un componente funcional que se puede utilizar en las bibliotecas Preact o React.

### Ejemplo: Importar mediante npm

```sh
npm install @bentoproject/date-countdown
```

```javascript
import React from 'react';
import {BentoDateCountdown} from '@bentoproject/date-countdown/react';
import '@bentoproject/date-countdown/styles.css';

function App() {
  return (
    <BentoDateCountdown
      datetime={200000000}
      biggestUnit={'HOURS'}
      render={(data) => (
        <div>
          <span>{`${data.days} ${data.dd} ${data.d}`}</span>
          <br />
          <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
          <br />
          <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
          <br />
          <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
        </div>
      )}
    />
  );
}
```

### Interacción y uso con la API

El componente Bento Date Countdown no dispone de una API imperativa. Sin embargo, el componente Bento Date Countdown de Preact/React acepta el prop `render` que renderiza la plantilla del consumidor. Este prop `render` debe ser una función que el componente Bento Date Countdown de Preact/React pueda utilizar para renderizar su plantilla. La función para devolver llamadas `render` recibirá una serie de parámetros relacionados con la fecha para que los consumidores puedan interpolar la plantilla renderizada. Consulte el <a href="#render" data-md-type="link">prop de la sección `render`</a> para obtener más información.

### Diseño y estilo

El componente Bento Date Countdown de Preact/React permite que los consumidores rendericen sus propias plantillas. Estas plantillas pueden utilizar estilos integrados en el código, etiquetas `<style>`, componentes Preact/React que importan sus propias hojas de estilo.

### Props

#### `datetime`

Prop obligatorio. Denota la fecha y la hora como una fecha, cadena o número. Si es una cadena, debe ser una cadena de fechas estándar ISO 8601 (por ejemplo, 2017-08-02T15:05:05.000Z) o una cadena `now`. Si se establece como `now`, se utilizará la hora en que se cargó la página para renderizar su plantilla. Si es un número, debe ser un valor de tiempo POSIX expresado en milisegundos.

#### `locale`

Una internacionalización en la cadena de idioma para cada unidad del cronómetro. El valor predeterminado es `en` (inglés). Este prop es compatible con todos los valores compatibles con el navegador del usuario.

#### `whenEnded`

Permite especificar si se detiene el cronómetro cuando llega a 0 segundos. El valor se puede establecer como `stop` (de manera predeterminada) con el fin de indicar que el cronómetro se detenga a los 0 segundos y no pase de la fecha final o `continue` para indicar que el cronómetro debe continuar después de alcanzar los 0 segundos.

#### `biggestUnit`

Permite que el componente `bento-date-countdown` calcule la diferencia de tiempo basándose en el valor específico de `biggest-unit`. Por ejemplo, supongamos que quedan `50 days y 10 hours`, si el `biggest-unit` se establece en `hours`, el resultado mostrará que quedan `1,210 hours`.

- Valores compatibles: `days`, `hours`, `minutes`, `seconds`
- Predeterminados: `days`

#### `countUp`

Incluya este accesorio para invertir la dirección de la cuenta regresiva para contar de forma ascendente. Esto es útil para mostrar el tiempo que transcurrió desde un plazo objetivo que está en el pasado. Para continuar la cuenta regresiva cuando el plazo ya se venció, asegúrese de incluir el valor `when-ended` con el valor `continue`. Si el plazo objetivo está en el futuro, `bento-date-countdown` mostrará un valor negativo descendente (hacia 0).

#### `render`

Es una devolución de llamadas opcional que se debe renderizar en una plantilla. A la devolución de llamadas se le dará un objeto con propiedades/valores relacionados con la fecha que se expresa en `datetime`. De forma predeterminada, el componente Bento Date Countdown mostrará la forma [`localeString` de la Fecha](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) para la configuración local y localeOption que se especifiquen. Consulte la sección [Parámetros temporales devueltos](#returned-time-parameters) para obtener más información sobre cómo se mostrará cada propiedad.

```typescript
(dateParams: DateParams) => JSXInternal.Element
interface DateParams {
  day: number;
  dayName: string;
  dayNameShort: string;
  dayPeriod: string;
  dayTwoDigit: string;
  hour: number;
  hour12: number;
  hour12TwoDigit: string;
  hourTwoDigit: string;
  iso: string;
  localeString: string;
  minute: number;
  minuteTwoDigit: string;
  month: number;
  monthName: string;
  monthNameShort: string;
  monthTwoDigit: string;
  second: number;
  secondTwoDigit: string;
  timeZoneName: string;
  timeZoneNameShort: string;
  year: number;
  yearTwoDi: string;
}
```

### Parámetros temporales devueltos

En esta tabla se muestran los formatos que puede establecer en su plantilla de Mustache:

Formato | Significado
--- | ---
d | día - 0, 1, 2, ... 12, 13... infinito
dd | día - 00, 01, 02, 03... infinito
h | hora - 0, 1, 2, ... 12, 13... infinito
hh | hora - 01, 02, 03... infinito
m | minuto - 0, 1, 2, ... 12, 13... infinito
mm | minuto - 01, 01, 02, 03 ... infinito
s | segundo - 0, 1, 2, ... 12, 13... infinito
ss | segundo - 00, 01, 02, 03... infinito
days | cadena de internacionalización para día o días
hours | cadena de internacionalización para hora u horas
minutes | cadena de internacionalización para minuto o minutos
seconds | cadena de internacionalización para segundo o segundos

#### Muestras de valores formateados

En esta tabla se incluyen ejemplos de valores formateados que se especifican en una plantilla de Mustache, y una muestra de la salida:

Formato | Muestra de la salida | Observaciones
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours}, {m} {minutes} y {s} {seconds} | 4 horas, 1 minuto y 45 segundos | -
{d} {days} {h}:{mm} | 1 día 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 días 5 horas 10 minutos | -
{d} {days} {h} {hours} {m} {minutes} | 20 días 5 horas 10 minutos | -
{h} {hours} {m} {minutes} | 240 horas 10 minutos | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
