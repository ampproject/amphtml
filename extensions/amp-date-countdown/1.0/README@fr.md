# Bento Date Countdown

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-date-countdown>`.

### Exemple : importation via npm

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

### Interactivité et utilisation de l'API

Le composant Bento Date Countdown n'a pas d'API impérative. Cependant, le composant Bento Date Countdown Preact/React accepte une propriétés `render` qui affiche le modèle du consommateur. Cette propriété `render` doit être une fonction que le composant Bento Date Countdown Preact/React peut utiliser pour afficher son modèle. Le rappel `render` recevra une variété de paramètres liés à la date que les consommateurs pourront utiliser pour interpoler dans le modèle rendu. Voir la <a href="#render" data-md-type="link">section propriété `render`</a> pour plus d'informations.

### Mise en page et style

Le composant Bento Date Countdown Preact/React permet aux utilisateurs d'afficher leurs propres modèles. Ces modèles peuvent utiliser des styles intégrés, des balises `<style>`, des composants Preact/React qui importent leurs propres feuilles de style.

### Propriétés

#### `datetime`

Propriété requise. Indique la date et l'heure sous la forme d'une date, d'une chaîne ou d'un nombre. Dans le cas d'une chaîne, elle doit être une chaîne de date ISO 8601 standard (par exemple 2017-08-02T15:05:05.000Z) ou la chaîne `now`. Si elle est définie sur `now`, elle utilisera le temps de chargement de la page pour afficher son modèle. Dans le cas d'un nombre, elle doit être une valeur d'époque POSIX en millisecondes.

#### `locale`

Une chaîne de langue d'internationalisation pour chaque unité de minuterie. La valeur par défaut est `en` (pour l'anglais). Cette propriété prend en charge toutes les valeurs prises en charge par le navigateur de l'utilisateur.

#### `whenEnded`

Spécifie s'il faut arrêter le minuteur lorsqu'il atteint 0 seconde. La valeur peut être définie sur `stop` (par défaut) pour indiquer que le minuteur s'arrêtera à 0 seconde et ne dépassera pas la date finale ou `continue` à indiquer que le minuteur doit continuer après avoir atteint 0 seconde.

#### `biggestUnit`

Permet au composant `bento-date-countdown` de calculer la différence de temps en fonction de la valeur `biggest-unit` spécifiée. Par exemple, supposons qu'il reste `50 days 10 hours`, si la `biggest-unit` est définie sur `hours`, le résultat affiche `1210 hours`restantes.

- Valeurs prises en charge : `days`, `hours`, `minutes`, `seconds`
- Par défaut : `days`

#### `countUp`

Ajoutez cette propriété pour inverser le sens du compte à rebours et passer au comptage ascendant. Cela est utile pour afficher le temps écoulé depuis une date cible ultérieure. Pour continuer le compte à rebours lorsque la date cible dans le passé, assurez-vous d'ajouter la propriété `when-ended` avec la valeur `continue`. Si la date cible est dans le futur, `bento-date-countdown` affichera une valeur négative par décrémentation (vers 0).

#### `render`

Rappel facultatif qui devrait afficher un modèle. Le rappel recevra un objet avec des propriétés/valeurs liées à la date exprimée en `datetime`. Par défaut, le composant Bento Date Countdown affiche la [`localeString` de la date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) pour la langue et localeOption données. Voir la [section Paramètres de temps retourné](#returned-time-parameters) pour plus de détails sur la façon dont chaque propriété sera affichée.

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

### Paramètres de temps retourné

Ce tableau répertorie le format que vous pouvez spécifier dans votre modèle Moustache :

Format | Définition
--- | ---
d | jour - 0, 1, 2,...12, 13..Infini
dd | jour - 00, 01, 02, 03..Infini
h | heure - 0, 1, 2,...12, 13..Infini
hh | heure - 01, 02, 03..Infini
m | minute - 0, 1, 2,...12, 13..Infini
mm | minute - 01, 01, 02, 03..Infini
s | seconde - 0, 1, 2,...12, 13..Infini
ss | seconde - 00, 01, 02, 03..Infini
days | chaîne d'internationalisation pour le ou les jours
hours | chaîne d'internationalisation pour l'heure ou les heures
minutes | chaîne d'internationalisation pour la minute ou les minutes
seconds | chaîne d'internationalisation pour la seconde ou les secondes

#### Exemples de valeurs formatées

Ce tableau fournit des exemples de valeurs formatées spécifiées dans un modèle Moustache, et un exemple de résultat :

Format | Exemple de résultat | Remarques
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} et  {m} {minutes} et {s} {seconds} | 4 heures, 1 minute et 45 secondes | -
{d} {days} {h}:{mm} | 1 jour 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 jours 5 heures 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 jours 5 heures 10 minutes | -
{h} {hours} {m} {minutes} | 240 heures 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
