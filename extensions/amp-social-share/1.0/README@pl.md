# Składnik Bento Social Share

Wyświetla przycisk udostępniania na platformach społecznościowych lub udostępniania systemowego.

Obecnie żaden z przycisków generowanych przez składnik Bento Social Share (w tym przyciski dla wstępnie skonfigurowanych dostawców) nie ma etykiety ani dostępnej nazwy, która jest widoczna dla technologii wspomagających (takich jak czytniki ekranu). Upewnij się, że dołączasz wartość `aria-label` z opisową etykietą, ponieważ w przeciwnym razie te elementy sterujące będą po prostu ogłaszane jako nieoznakowane elementy „przycisk”.

## Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-social-share>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Przykład: dołączanie za pomocą znacznika `<script>`

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

### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

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

#### Typ kontenera

Składnik `bento-social-share` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Style domyślne

Domyślnie składnik `bento-social-share` zawiera kilku popularnych, wstępnie skonfigurowanych dostawców. Przyciski tych dostawców są stylizowane za pomocą oficjalnego koloru i logotypu dostawcy. Domyślna szerokość to 60px, a domyślna wysokość to 44px.

#### Style niestandardowe

Czasami chcesz dostarczyć swój własny styl. Możesz po prostu zastąpić dostarczone style, jak w poniższym przykładzie:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Podczas dostosowywania stylu ikony `bento-social-share` należy upewnić się, że dostosowana ikona spełnia wytyczne brandingowe określone przez dostawcę (np. Twitter, Facebook itd.).

### Ułatwienia dostępu

#### Wskazanie fokusu

Element `bento-social-share` jako widoczny wskaźnik fokusu ma domyślnie niebieski kontur. Domyślnie przyjmuje on również wartość `tabindex=0`, dzięki czemu użytkownik może łatwo podążać za nim, przeglądając wiele elementów `bento-social-share` użytych razem na stronie.

Domyślny wskaźnik fokusu jest osiągany za pomocą następującego zestawu reguł CSS.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Domyślny wskaźnik fokusu można zastąpić poprzez zdefiniowanie stylów CSS dla fokusu i umieszczenie ich w znaczniku `style`. W poniższym przykładzie, pierwszy zestaw reguł CSS usuwa wskaźnik fokusu z wszystkich elementów `bento-social-share` poprzez ustawienie właściwości `outline` na wartość `none`. Drugi zestaw reguł określa czerwony kontur (zamiast domyślnego niebieskiego), a także ustawia właściwość `outline-offset` na `3px` dla wszystkich elementów `bento-social-share` z klasą `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Dzięki tym regułom CSS elementy `bento-social-share` nie będą miały widocznego wskaźnika fokusu, chyba że będą zawierać klasę `custom-focus`, w którym to przypadku będą miały wskaźnik, czerwony kontur.

#### Kontrast kolorów

Pamiętaj, że składnik `bento-social-share` z wartością `type` `twitter`, `whatsapp` lub `line` wyświetli przycisk z połączeniem kolorów pierwszego planu i tła, która spada poniżej progu 3:1 zalecanego dla treści nietekstowych, zdefiniowanego w dokumencie [WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Bez wystarczającego kontrastu treść może być trudna w odbiorze, a tym samym trudna do zidentyfikowania. W skrajnych przypadkach treści o niskim kontraście mogą w ogóle nie być widoczne dla osób z zaburzeniami percepcji kolorów. W przypadku powyższych przycisków udostępniania użytkownicy mogą nie być w stanie odpowiednio dostrzec elementów sterujących udostępnianiem lub zrozumieć, czym są i do której usługi się odnoszą.

### Wstępnie skonfigurowani dostawcy

Składnik `bento-social-share` oferuje [kilku wstępnie skonfigurowanych dostawców](./social-share-config.js), którzy znają swoje punkty końcowe udostępniania, jak również pewne parametry domyślne.

<table>
  <tr>
    <th class="col-twenty">Dostawca</th>
    <th class="col-twenty">Typ</th>
    <th>Parametry</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Interfejs API Web Share</a> (uruchamia okno dialogowe udostępniania systemu operacyjnego)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Poczta elektroniczna</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: opcjonalny</li>
        <li>
<code>data-param-body</code>: opcjonalny</li>
        <li>
<code>data-param-recipient</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>required</strong>, wartość domyślna: none. Ten parametr jest identyfikatorem aplikacji Facebook <code>app_id</code>, wymaganym dla <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">okna dialogowego udostępniania Facebooka</a>.</li>
        <li>
<code>data-param-href</code>: opcjonalny</li>
        <li>
<code>data-param-quote</code>: opcjonalny, można go używać do udostępniania cytatów lub tekstu.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: opcjonalny (ale jego ustawienie jest zdecydowanie zalecane). Adres URL multimediów, które mają być udostępnione w serwisie Pinterest. Jeśli nie jest ustawiony, użytkownik końcowy zostanie poproszony o przesłanie multimediów przez Pinterest.</li>
        <li>
<code>data-param-url</code>: opcjonalny</li>
        <li>
<code>data-param-description</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcjonalny</li>
        <li>
<code>data-param-text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcjonalny</li>
        <li>
<code>data-param-text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcjonalny</li>
        <li>
<code>data-param-text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: opcjonalny</li>
</ul>
    </td>
  </tr>
</table>

### Nieskonfigurowani dostawcy

Oprócz wstępnie skonfigurowanych dostawców można używać nieskonfigurowanych dostawców poprzez określenie dodatkowych atrybutów w składniku `bento-social-share`.

#### Przykład: tworzenie przycisku udostępniania dla nieskonfigurowanego dostawcy

W poniższym przykładzie tworzony jest przycisk udostępniania przez aplikację Facebook Messenger poprzez ustawienie atrybutu `data-share-endpoint` na właściwy punkt końcowy niestandardowego protokołu Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Jako że dostawcy ci nie są wstępnie skonfigurowani, trzeba utworzyć odpowiedni obraz przycisku i style.

### Atrybuty

#### type (wymagany)

Wybiera typ dostawcy. Jest to wymagane zarówno w przypadku wstępnie skonfigurowanych, jak i nieskonfigurowanych dostawców.

#### data-target

Określa lokalizację docelową, w której ma zostać otwarty element docelowy. Domyślnie jest to `_blank` dla wszystkich przypadków poza typami email/SMS w systemie iOS, w którym to przypadku ustawiana jest lokalizacja docelowa `_top`.

#### data-share-endpoint

Ten atrybut jest wymagany w przypadku nieskonfigurowanych dostawców.

Niektórzy popularni dostawcy mają wstępnie skonfigurowane punkty końcowe udostępniania. Szczegółowe informacje na ten temat można znaleźć w sekcji Wstępnie skonfigurowani dostawcy. W przypadku nieskonfigurowanych dostawców należy określić punkt końcowy udostępniania.

#### data-param-\*

Wszystkie atrybuty z prefiksem `data-param-*` są zamieniane na parametry adresu URL i przekazywane do punktu końcowego udostępniania.

#### aria-label

Opis przycisku dla funkcji ułatwień dostępu. Zalecana etykieta to „Udostępnij na &lt;typ&gt;”.

---

## Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoSocialShare>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

### Przykład: import za pomocą narzędzia npm

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

### Układ i styl

#### Typ kontenera

Składnik `BentoSocialShare` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe wyświetlanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych (slajdów) za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `height`, `width`, `aspect-ratio` lub innych właściwości tego rodzaju):

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Albo za pomocą atrybutu `className`:

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

### Ułatwienia dostępu

#### Wskazanie fokusu

Element `BentoSocialShare` jako widoczny wskaźnik fokusu ma domyślnie niebieski kontur. Domyślnie przyjmuje on również wartość `tabindex=0`, dzięki czemu użytkownik może łatwo podążać za nim, przeglądając wiele elementów `BentoSocialShare` użytych razem na stronie.

Domyślny wskaźnik fokusu jest osiągany za pomocą następującego zestawu reguł CSS.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Domyślny wskaźnik fokusu można zastąpić poprzez zdefiniowanie stylów CSS dla fokusu i umieszczenie ich w znaczniku `style` na stronie AMP HTML. W poniższym przykładzie, pierwszy zestaw reguł CSS usuwa wskaźnik fokusu z wszystkich elementów `BentoSocialShare` poprzez ustawienie właściwości `outline` na wartość `none`. Drugi zestaw reguł określa czerwony kontur (zamiast domyślnego niebieskiego), a także ustawia właściwość `outline-offset` na `3px` dla wszystkich elementów `BentoSocialShare` z klasą `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Dzięki tym regułom CSS elementy `BentoSocialShare` nie będą miały widocznego wskaźnika fokusu, chyba że będą zawierać klasę `custom-focus`, w którym to przypadku będą miały wskaźnik, czerwony kontur.

#### Kontrast kolorów

Pamiętaj, że składnik `BentoSocialShare` z wartością `type` `twitter`, `whatsapp` lub `line` wyświetli przycisk z połączeniem kolorów pierwszego planu i tła, która spada poniżej progu 3:1 zalecanego dla treści nietekstowych, zdefiniowanego w dokumencie [WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Bez wystarczającego kontrastu treść może być trudna w odbiorze, a tym samym trudna do zidentyfikowania. W skrajnych przypadkach treści o niskim kontraście mogą w ogóle nie być widoczne dla osób z zaburzeniami percepcji kolorów. W przypadku powyższych przycisków udostępniania użytkownicy mogą nie być w stanie odpowiednio dostrzec elementów sterujących udostępnianiem lub zrozumieć, czym są i do której usługi się odnoszą.

### Wstępnie skonfigurowani dostawcy

Składnik `BentoSocialShare` oferuje [kilku wstępnie skonfigurowanych dostawców](./social-share-config.js), którzy znają swoje punkty końcowe udostępniania, jak również pewne parametry domyślne.

<table>
  <tr>
    <th class="col-twenty">Dostawca</th>
    <th class="col-twenty">Typ</th>
    <th>Parametry za pomocą właściwości <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Interfejs API Web Share</a> (uruchamia okno dialogowe udostępniania systemu operacyjnego)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Poczta elektroniczna</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: opcjonalny</li>
        <li>
<code>body</code>: opcjonalny</li>
        <li>
<code>recipient</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>required</strong>, wartość domyślna: none. Ten parametr jest identyfikatorem aplikacji Facebook <code>app_id</code>, wymaganym dla <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">okna dialogowego udostępniania Facebooka</a>.</li>
        <li>
<code>subject</code>: opcjonalny</li>
        <li>
<code>quote</code>: opcjonalny, można go używać do udostępniania cytatów lub tekstu.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: opcjonalny (ale jego ustawienie jest zdecydowanie zalecane). Adres URL multimediów, które mają być udostępnione w serwisie Pinterest. Jeśli nie jest ustawiony, użytkownik końcowy zostanie poproszony o przesłanie multimediów przez Pinterest.</li>
        <li>
<code>url</code>: opcjonalny</li>
        <li>
<code>description</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcjonalny</li>
        <li>
<code>text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcjonalny</li>
        <li>
<code>text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcjonalny</li>
        <li>
<code>text</code>: opcjonalny</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: opcjonalny</li>
</ul>
    </td>
  </tr>
</table>

### Nieskonfigurowani dostawcy

Oprócz wstępnie skonfigurowanych dostawców można używać nieskonfigurowanych dostawców poprzez określenie dodatkowych atrybutów w składniku `BentoSocialShare`.

#### Przykład: tworzenie przycisku udostępniania dla nieskonfigurowanego dostawcy

W poniższym przykładzie tworzony jest przycisk udostępniania przez aplikację Facebook Messenger poprzez ustawienie atrybutu `data-share-endpoint` na właściwy punkt końcowy niestandardowego protokołu Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Jako że dostawcy ci nie są wstępnie skonfigurowani, trzeba utworzyć odpowiedni obraz przycisku i style.

### Właściwości

#### type (wymagany)

Wybiera typ dostawcy. Jest to wymagane zarówno w przypadku wstępnie skonfigurowanych, jak i nieskonfigurowanych dostawców.

#### background

Czasami chcesz dostarczyć swój własny styl. Możesz po prostu zastąpić dostarczone style, nadając kolor wypełnieniu:

Podczas dostosowywania stylu ikony `BentoSocialShare` należy upewnić się, że dostosowana ikona spełnia wytyczne brandingowe określone przez dostawcę (np. Twitter, Facebook itd.).

#### color

Czasami chcesz dostarczyć swój własny styl. Możesz po prostu zastąpić dostarczone style, nadając kolor wypełnieniu:

Podczas dostosowywania stylu ikony `BentoSocialShare` należy upewnić się, że dostosowana ikona spełnia wytyczne brandingowe określone przez dostawcę (np. Twitter, Facebook itd.).

#### target

Określa lokalizację docelową, w której ma zostać otwarty element docelowy. Domyślnie jest to `_blank` dla wszystkich przypadków poza typami email/SMS w systemie iOS, w którym to przypadku ustawiana jest lokalizacja docelowa `_top`.

#### endpoint

Ta właściwość jest wymagana w przypadku nieskonfigurowanych dostawców.

Niektórzy popularni dostawcy mają wstępnie skonfigurowane punkty końcowe udostępniania. Szczegółowe informacje na ten temat można znaleźć w sekcji Wstępnie skonfigurowani dostawcy. W przypadku nieskonfigurowanych dostawców należy określić punkt końcowy udostępniania.

#### params

Wszystkie właściwości `param` są przekazywane jako parametry adresu URL i przekazywane są do punktu końcowego udostępniania.

#### aria-label

Opis przycisku dla funkcji ułatwień dostępu. Zalecana etykieta to „Udostępnij na &lt;typ&gt;”.
