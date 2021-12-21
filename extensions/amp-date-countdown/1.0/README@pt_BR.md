# Bento Date Countdown

Você precisa incluir a biblioteca CSS necessária de cada componente Bento para garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso do componente web `<bento-date-countdown>`.

### Exemplo: Usando import via npm

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

### Interatividade e uso da API

O componente Bento Date Countdown não possui uma API imperativa. No entanto, o componente Preact/React Bento Date Countdown aceita uma propriedade `render` que renderiza o template do consumidor. Esta propriedade `render` deve ser uma função que o componente Bento Date Countdown Preact/React pode usar para renderizar seu modelo. O callback `render` receberá uma variedade de parâmetros relacionados a datas para os consumidores interpolarem no modelo renderizado. Veja a <a href="#render" data-md-type="link">seção sobre a propriedade `render`</a> para mais informações.

### Layout e estilo

O componente Preact/React Bento Date Countdown permite que os consumidores renderizem seus próprios modelos. Esses modelos podem usar estilos embutidos, tags `<style>` ou componentes Preact/React que importam suas próprias folhas de estilo.

### Propriedades

#### `datetime`

Propriedade obrigatória. Denota a data e a hora como um tipo Date, String ou Number. Se String, deve ser uma string de data ISO 8601 padrão (por exemplo, 2017-08-02T15:05:05.000Z) ou a string `now`. Se definido como `now`, usará o instante que a página carregou para renderizar seu modelo. Se for Number, deve ser um valor de época POSIX em milissegundos.

#### `locale`

Uma string de idioma de internacionalização para cada unidade de cronômetro. O valor padrão é `en` (inglês). Esta prop suporta todos os valores suportados pelo navegador do usuário.

#### `whenEnded`

Especifica se o cronômetro deve ser interrompido quando atingir 0 segundos. O valor pode ser definido como `stop` (default) para indicar que o cronômetro irá parar em 0 segundos e não passará da data final ou `continue` para indicar que o cronômetro deve continuar depois de atingir 0 segundos.

#### `biggestUnit`

Permite que o `bento-date-countdown` calcule a diferença de tempo com base no valor `biggest-unit` especificado. Por exemplo, suponha que faltem `50 days 10 hours`; se a `biggest-unit` for definida como `hours`, o resultado exibirá `1210 hours` restantes.

-   Valores suportados: `days`, `hours`, `minutes`, `seconds`
-   Default: `days`

#### `countUp`

Inclua esta prop para inverter a direção da contagem regressiva (para realizar uma contagem progressiva). Isto é útil para exibir o tempo decorrido desde uma determinada data do passado. Para continuar a contagem regressiva quando a data determinada estiver no passado, certifique-se de definir a prop `when-ended` com o valor de `continue`. Se a data prevista estiver no futuro, `bento-date-countdown` exibirá um valor negativo decrescente (em direção a 0).

#### `render`

Callback opcional que deve renderizar um modelo. O callback receberá um objeto com propriedades/valores relacionados à data expressa em `datetime`. Por default, o componente Bento Date Countdown exibirá o formato [`localeString` da Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) para o locale e localeOption fornecidos. Veja a [seção Parâmetros de tempo retornados](#returned-time-parameters) para mais detalhes sobre como cada propriedade será exibida.

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

### Parâmetros de tempo retornados

Esta tabela lista o formato que você pode especificar no seu modelo Mustache:

| Formato | Significado                                            |
| ------- | ------------------------------------------------------ |
| d       | dia - 0, 1, 2,...12, 13..Infinity                      |
| dd      | dia - 00, 01, 02, 03..Infinity                         |
| h       | hora - 0, 1, 2,...12, 13..Infinity                     |
| hh      | hora - 01, 02, 03..Infinity                            |
| m       | minuto - 0, 1, 2,...12, 13..Infinity                   |
| mm      | minuto - 01, 01, 02, 03..Infinity                      |
| s       | segundo - 0, 1, 2,...12, 13..Infinity                  |
| ss      | segundo - 00, 01, 02, 03..Infinity                     |
| days    | string de internacionalização para dia ou dias         |
| hours   | string de internacionalização para hora ou horas       |
| minutes | string de internacionalização para minuto ou minutos   |
| seconds | string de internacionalização para segundo ou segundos |

#### Exemplos de valores formatados

Esta tabela fornece exemplos de valores formatados especificados num modelo Mustache e uma amostra do resultado:

| Formato                                         | Exemplo de saída                     | Observações            |
| ----------------------------------------------- | ------------------------------------ | ---------------------- |
| {hh}:{mm}:{ss}                                  | 04:24:06                             | -                      |
| {h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -                      |
| {d} {days} {h}:{mm}                             | 1 day 5:03                           | -                      |
| {d} {days} {h} {hours} {m} {minutes}            | 50 days 5 hours 10 minutes           | -                      |
| {d} {days} {h} {hours} {m} {minutes}            | 20 days 5 hours 10 minutes           | -                      |
| {h} {hours} {m} {minutes}                       | 240 hours 10 minutes                 | `biggest-unit='hours'` |
| {d} {days} {h} {hours} {m} {minutes}            | 50 天 5 小时 10 分钟                 | `locale='zh-cn'`       |
