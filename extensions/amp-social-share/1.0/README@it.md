# Bento Social Share

Permette di visualizzare un pulsante di condivisione per piattaforme social o condivisioni di sistema.

Attualmente, nessuno dei pulsanti generati da Bento Social Share (compresi quelli per i provider preconfigurati) ha un'etichetta o un nome accessibile che è riconoscibile alle assistive technologies (come le utilità di lettura schermo). Pertanto occorre includere un elemento `aria-label` con un'etichetta descrittiva, altrimenti questi controlli verranno semplicemente letti come elementi "pulsante" privi di etichetta.

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-social-share>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Esempio: inclusione tramite `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
    };
  })();
</script>
```

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Tipo di contenitore

Il componente `bento-social-share` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Stili predefiniti

Per impostazione predefinita, `bento-social-share` contiene alcuni popolari provider preconfigurati. I pulsanti di questi provider hanno uno stile con il logo e il colore ufficiali del provider in questione. La larghezza predefinita è 60 px e l'altezza predefinita è 44 px.

#### Stili personalizzati

Talvolta è necessario utilizzare il proprio stile. Basta semplicemente sovrascrivere gli stili forniti come nel seguente esempio:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Per usare stili personalizzati di un'icona `bento-social-share`, assicurarsi che l'icona personalizzata soddisfi le linee guida di branding stabilite dal provider in questione (es. Twitter, Facebook, ecc.)

### Accessibilità

#### Indicazioni di messa a fuoco

L'elemento `bento-social-share` utilizza un contorno blu come indicatore di messa a fuoco visibile predefinito. Inoltre, per impostazione predefinita, usa l'attributo `tabindex=0` che consente all'utente di seguire facilmente i contenuti mentre attraversa più elementi `bento-social-share` utilizzati insieme su una stessa pagina.

L'indicatore di messa a fuoco predefinito si ottiene con il seguente set di regole CSS.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

L'indicatore di messa a fuoco predefinito può essere sovrascritto definendo stili CSS per la messa a fuoco  e includendoli all'interno di un tag `style`. Nell'esempio seguente, il primo set di regole CSS rimuove l'indicatore di messa a fuoco su tutti gli elementi `bento-social-share` impostando la proprietà `outline` sul valore `none`. Il secondo set di regole specifica un contorno rosso (invece di quello blu predefinito) e imposta anche l'attributo `outline-offset` a `3px` per tutti gli elementi `bento-social-share` dotati della classe `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Con queste regole CSS, gli elementi `bento-social-share` non mostreranno l'indicatore di messa a fuoco visibile a meno che non includano la classe `custom-focus`, nel qual caso avranno l'indicatore con contorno rosso.

#### Contrasto di colore

Occorre notare che l'elemento `bento-social-share` con un valore dell'attributo `type` pari a `twitter`, `whatsapp` o `line`, visualizzerà un pulsante con una combinazione di colori di primo piano/sfondo che scende al di sotto della soglia 3:1 consigliata per i contenuti non testuali nello standard [WCAG 2.1 SC 1.4. 11 Contrasto contenuti non testuali](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Senza un contrasto sufficiente, il contenuto può essere difficile da percepire e quindi difficile da individuare. In casi estremi, i contenuti a basso contrasto potrebbero non essere affatto visibili alle persone con problemi di percezione dei colori. Nel caso dei pulsanti di condivisione in questione, gli utenti potrebbero non riuscire a individuare/capire adeguatamente quali sono i controlli di condivisione e a quale servizio si riferiscono.

### Provider preconfigurati

Il componente `bento-social-share` fornisce [alcuni provider preconfigurati](./social-share-config.js) che conoscono i loro endpoint di condivisione e alcuni parametri predefiniti.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th class="col-twenty">Tipo</th>
    <th>Parametri</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API di condivisione Web</a> (attiva la finestra di dialogo di condivisione del sistema operativo)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-mail</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: opzionale</li>
        <li>
<code>data-param-body</code>: opzionale</li>
        <li>
<code>data-param-recipient</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>richiesto</strong>, valore predefinito: none. Questo parametro è l' <code>app_id</code> Facebook richiesto per la <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">finestra di dialogo Condivisione Facebook</a>.</li>
        <li>
<code>data-param-href</code>: opzionale</li>
        <li>
<code>data-param-quote</code>: opzionale, può essere utilizzato per condividere una citazione o un testo.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: facoltativo</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: opzionale (ma la sua impostazione è fortemente consigliata). URL per contenuti multimediali da condividere su Pinterest. Se non è impostato, all'utente finale verrà richiesto di caricare un contenuto multimediale da Pinterest.</li>
        <li>
<code>data-param-url</code>: opzionale</li>
        <li>
<code>data-param-description</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opzionale</li>
        <li>
<code>data-param-text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opzionale</li>
        <li>
<code>data-param-text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opzionale</li>
        <li>
<code>data-param-text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: opzionale</li>
</ul>
    </td>
  </tr>
</table>

### Provider non configurati

Oltre ai provider preconfigurati, si possono utilizzare provider non configurati specificando attributi aggiuntivi nel componente `bento-social-share`.

#### Esempio: creazione di un pulsante di condivisione per un provider non configurato

L'esempio seguente crea un pulsante di condivisione tramite Facebook Messenger impostando l'attributo `data-share-endpoint` sull'endpoint corretto per il protocollo personalizzato di Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Poiché questi provider non sono preconfigurati, occorrerà creare immagini e stili adeguati per il pulsante del provider in questione.

### Attributi

#### type (obbligatorio)

Seleziona un tipo di provider. Questo attributo è richiesto sia per i provider preconfigurati che per quelli non configurati.

#### data-target

Specifica la destinazione in cui aprire il target. L'impostazione predefinita è `_blank` per tutti i casi diversi da email/SMS su iOS, nel qual caso il target è impostato su `_top`.

#### data-share-endpoint

Questo attributo è obbligatorio per i provider non configurati.

Alcuni provider popolari hanno endpoint di condivisione preconfigurati. Per i dettagli, consultare la sezione Provider preconfigurati. Per i provider non configurati, occorre specificare l'endpoint di condivisione.

#### data-param-*

Tutti gli attributi con prefisso `data-param-*` vengono trasformati in parametri URL e passati all'endpoint di condivisione.

#### aria-label

La descrizione del pulsante per garantirne l'accessibilità. Un'etichetta consigliata è "Condividi su &lt;type&gt;".

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoSocialShare>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Layout e stile

#### Tipo di contenitore

Il componente `BentoSocialShare` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti (diapositive) tramite un layout CSS opportuno (come quelli definiti con le proprietà `height`, `width`, `aspect-ratio` o altre simili). Essi sono applicabili inline:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Oppure tramite `className`:

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Accessibilità

#### Indicazioni di messa a fuoco

L'elemento `BentoSocialShare` utilizza un contorno blu come indicatore di messa a fuoco visibile predefinito. Inoltre, per impostazione predefinita, usa l'attributo `tabindex=0` che consente all'utente di seguire facilmente i contenuti mentre attraversa più elementi `BentoSocialShare` utilizzati insieme su una stessa pagina.

L'indicatore di messa a fuoco predefinito si ottiene con il seguente set di regole CSS.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

L'indicatore di messa a fuoco predefinito può essere sovrascritto definendo stili CSS per la messa a fuoco  e includendoli all'interno di un tag `style`. Nell'esempio seguente, il primo set di regole CSS rimuove l'indicatore di messa a fuoco su tutti gli elementi `BentoSocialShare` impostando la proprietà `outline` sul valore `none`. Il secondo set di regole specifica un contorno rosso (invece di quello blu predefinito) e imposta anche l'attributo `outline-offset` a `3px` per tutti gli elementi `BentoSocialShare` dotati della classe `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Con queste regole CSS, gli elementi `BentoSocialShare` non mostreranno l'indicatore di messa a fuoco visibile a meno che non includano la classe `custom-focus`, nel qual caso avranno l'indicatore con contorno rosso.

#### Contrasto di colore

Occorre notare che l'elemento `BentoSocialShare` con un valore dell'attributo `type` pari a `twitter`, `whatsapp` o `line`, visualizzerà un pulsante con una combinazione di colori di primo piano/sfondo che scende al di sotto della soglia 3:1 consigliata per i contenuti non testuali nello standard [WCAG 2.1 SC 1.4. 11 Contrasto contenuti non testuali](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Senza un contrasto sufficiente, il contenuto può essere difficile da percepire e quindi difficile da individuare. In casi estremi, i contenuti a basso contrasto potrebbero non essere affatto visibili alle persone con problemi di percezione dei colori. Nel caso dei pulsanti di condivisione in questione, gli utenti potrebbero non riuscire a individuare/capire adeguatamente quali sono i controlli di condivisione e a quale servizio si riferiscono.

### Provider preconfigurati

Il componente `BentoSocialShare` fornisce [alcuni provider preconfigurati](./social-share-config.js) che conoscono i loro endpoint di condivisione e alcuni parametri predefiniti.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th class="col-twenty">Tipo</th>
    <th>Parametri tramite oggetto <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API di condivisione Web</a> (attiva la finestra di dialogo di condivisione del sistema operativo)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: opzionale</li>
        <li>
<code>body</code>: opzionale</li>
        <li>
<code>recipient</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>richiesto</strong>, valore predefinito: none. Questo parametro è l' <code>app_id</code> Facebook richiesto per la <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">finestra di dialogo Condivisione Facebook</a>.</li>
        <li>
<code>href</code>: opzionale</li>
        <li>
<code>quote</code>: opzionale, può essere utilizzato per condividere una citazione o un testo.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: opzionale (ma la sua impostazione è fortemente consigliata). URL per contenuti multimediali da condividere su Pinterest. Se non è impostato, all'utente finale verrà richiesto di caricare un contenuto multimediale da Pinterest.</li>
        <li>
<code>url</code>: opzionale</li>
        <li>
<code>description</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opzionale</li>
        <li>
<code>text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opzionale</li>
        <li>
<code>text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opzionale</li>
        <li>
<code>text</code>: opzionale</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: opzionale</li>
</ul>
    </td>
  </tr>
</table>

### Provider non configurati

Oltre ai provider preconfigurati, si possono utilizzare provider non configurati specificando attributi aggiuntivi nel componente `BentoSocialShare`.

#### Esempio: creazione di un pulsante di condivisione per un provider non configurato

L'esempio seguente crea un pulsante di condivisione tramite Facebook Messenger impostando l'attributo `data-share-endpoint` sull'endpoint corretto per il protocollo personalizzato di Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Poiché questi provider non sono preconfigurati, occorrerà creare immagini e stili adeguati per il pulsante del provider in questione.

### Oggetti

#### type (obbligatorio)

Seleziona un tipo di provider. Questo attributo è richiesto sia per i provider preconfigurati che per quelli non configurati.

#### background

Talvolta è necessario utilizzare il proprio stile. Basta semplicemente sovrascrivere gli stili forniti specificando un colore di sfondo.

Per usare stili personalizzati di un'icona `BentoSocialShare`, assicurarsi che l'icona personalizzata soddisfi le linee guida di branding stabilite dal provider in questione (es. Twitter, Facebook, ecc.)

#### color

Talvolta è necessario utilizzare il proprio stile. Basta semplicemente sovrascrivere gli stili forniti specificando un colore di riempimento.

Per usare stili personalizzati di un'icona `BentoSocialShare`, assicurarsi che l'icona personalizzata soddisfi le linee guida di branding stabilite dal provider in questione (es. Twitter, Facebook, ecc.)

#### target

Specifica la destinazione in cui aprire il target. L'impostazione predefinita è `_blank` per tutti i casi diversi da email/SMS su iOS, nel qual caso il target è impostato su `_top`.

#### endpoint

Questo oggetto è obbligatorio per i provider non configurati.

Alcuni provider popolari hanno endpoint di condivisione preconfigurati. Per i dettagli, consultare la sezione Provider preconfigurati. Per i provider non configurati, occorre specificare l'endpoint di condivisione.

#### params

Tutte le proprietà `param` vengono trasformate in parametri URL e passati all'endpoint di condivisione.

#### aria-label

La descrizione del pulsante per garantirne l'accessibilità. Un'etichetta consigliata è "Condividi su &lt;type&gt;".
