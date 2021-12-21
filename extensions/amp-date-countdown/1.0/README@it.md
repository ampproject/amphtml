# Bento Date Countdown

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso del componente web `<bento-date-countdown>`.

### Esempio: importazione tramite npm

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

### Interattività e utilizzo dell'API

Il componente Bento Date Countdown non ha un'API imperativa. Tuttavia, il componente Preact/React di Bento Date Countdown permette di accettare un oggetto `render` che esegue il rendering del modello dell'utente. Quest'oggetto `render` deve essere una funzione utilizzabile dal componente Preact/React Bento Date Countdown per eseguire il rendering del suo modello. Alla richiamata di `render` verrà fornita una serie di parametri relativi alla data che gli utenti potranno interpolare nel rendering del modello. Consultare la <a href="#render" data-md-type="link">sezione dell'oggetto `render`</a> per maggiori informazioni.

### Layout e stile

Il componente Preact/React Bento Date Countdown consente agli utenti di eseguire il rendering dei propri modelli. Questi modelli possono utilizzare stili inline, tag `<style>` o componenti Preact/React che importano i propri fogli di stile.

### Oggetti

#### `datetime`

Oggetto obbligatorio. Indica la data e l'ora in formato Data, Stringa o Numero. Il formato Stringa deve essere una stringa di data standard ISO 8601 (es. 2017-08-02T15:05:05.000Z) o la stringa `now`. Se impostato su `now`, l'oggetto utilizzerà il tempo di caricamento della pagina per eseguire il rendering del suo modello. Il formato Numero deve essere un valore che indica una durata POSIX in millisecondi.

#### `locale`

Una stringa che permette di usare lingue internazionali per ogni unità del timer. Il valore predefinito è `en` (per l'inglese). Questo oggetto supporta tutti i valori consentiti dal browser dell'utente.

#### `whenEnded`

Specifica se arrestare il timer quando raggiunge 0 secondi. Il valore può essere impostato su `stop` (predefinito), che indica che il timer si ferma a 0 secondi e non supera la data finale, o `continue` che indica che il timer deve continuare dopo aver raggiunto 0 secondi.

#### `biggestUnit`

Consente al componente `bento-date-countdown` di calcolare la differenza di tempo in base al valore `biggest-unit` indicato. Ad esempio, supponiamo che rimangano `50 days 10 hours`. Se `biggest-unit` è impostato su `hours`, il risultato mostra `1210 hours` rimanenti.

-   Valori supportati: `days`, `hours`, `minutes`, `seconds`
-   Valore predefinito: `days`

#### `countUp`

Includendo questo oggetto, si inverte la direzione del conto alla rovescia, facendo procedere il conteggio in avanti. Questa opzione è utile per visualizzare il tempo trascorso da una certa data di destinazione nel passato. Per continuare il conto alla rovescia anche quando la data di destinazione è nel passato, includere l'attributo `when-ended` con valore `continue`. Se la data di destinazione è nel futuro, `bento-date-countdown` mostrerà un valore negativo decrescente (verso 0).

#### `render`

Richiamata opzionale che dovrebbe eseguire il rendering di un modello. Alla richiamata verrà fornito un oggetto con proprietà/valori relativi alla data espressa in `datetime`. Per impostazione predefinita, il componente Bento Date Countdown visualizzerà il [modulo `localeString` della data](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) per i parametri locale e localeOption specificati. Consultare la [sezione Parametri di orario restituiti](#returned-time-parameters) per maggiori dettagli sulla visualizzazione di ciascuna proprietà.

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

### Parametri di orario restituiti

Questa tabella elenca i formati che si possono indicare nel proprio modello Mustache:

| Formato | Significato                                            |
| ------- | ------------------------------------------------------ |
| d       | giorno - 0, 1, 2,...12, 13..Infinito                   |
| dd      | giorno - 00, 01, 02, 03..Infinito                      |
| h       | ora - 0, 1, 2,...12, 13..Infinito                      |
| hh      | ora - 01, 02, 03..Infinito                             |
| m       | minuti - 0, 1, 2,...12, 13..Infinito                   |
| mm      | minuti - 01, 01, 02, 03..Infinito                      |
| s       | secondi - 0, 1, 2,...12, 13..Infinito                  |
| ss      | secondi - 00, 01, 02, 03..Infinito                     |
| days    | stringa in lingue internazionali per uno o più giorni  |
| hours   | stringa in lingue internazionali per una o più ore     |
| minutes | stringa in lingue internazionali per uno o più minuti  |
| seconds | stringa in lingue internazionali per uno o più secondi |

#### Esempi di valori formattati

Questa tabella fornisce esempi di valori formattati indicati in un modello Mustache e un esempio del relativo output:

| Formato                                     | Esempio di output                    | Osservazioni           |
| ------------------------------------------- | ------------------------------------ | ---------------------- |
| {hh}:{mm}:{ss}                              | 04:24:06                             | -                      |
| {h} {hours} e {m} {minutes} e {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -                      |
| {d} {days} {h}:{mm}                         | 1 day 5:03                           | -                      |
| {d} {days} {h} {hours} {m} {minutes}        | 50 days 5 hours 10 minutes           | -                      |
| {d} {days} {h} {hours} {m} {minutes}        | 20 days 5 hours 10 minutes           | -                      |
| {h} {hours} {m} {minutes}                   | 240 hours 10 minutes                 | `biggest-unit='hours'` |
| {d} {days} {h} {hours} {m} {minutes}        | 50 天 5 小时 10 分钟                 | `locale='zh-cn'`       |
