# Bento Social Share

Sosyal platformlar veya sistem paylaşımı için bir paylaşım düğmesi görüntüler.

Şu anda, Bento Social Share (önceden yapılandırılmış sağlayıcılar için olanlar dahil) tarafından oluşturulan düğmelerin hiçbiri, yardımcı teknolojilere (ekran okuyucular gibi) açık bir etikete veya erişilebilir ada sahip değildir. Açıklayıcı bir etikete sahip bir `aria-label` eklediğinizden emin olun, aksi takdirde bu kontroller yalnızca etiketlenmemiş "button" öğeleri olarak duyurulur.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-social-share>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Örnek: `<script>` ile ekleme

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

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

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

#### Kapsayıcı tipi

`bento-social-share` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen).

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Varsayılan Stiller

Varsayılan olarak, `bento-social-share` bazı popüler önceden yapılandırılmış sağlayıcıları içerir. Bu sağlayıcılar için düğmeler, sağlayıcının resmi rengi ve logosu ile şekillendirilmiştir. Varsayılan genişlik 60 piksel ve varsayılan yükseklik 44 pikseldir.

#### Özel Stiller

Bazen kendi tarzınızı sağlamak istersiniz. Aşağıdaki gibi sağlanan stilleri basitçe geçersiz kılabilirsiniz:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

`bento-social-share` simgesinin stilini özelleştirirken, lütfen özelleştirilmiş simgenin sağlayıcı tarafından belirlenen markalama yönergelerini karşıladığından emin olun (örn. Twitter, Facebook, vb.)

### Erişilebilirlik

#### Odak göstergesi

`bento-social-share` öğesi, görünür bir odak göstergesi olarak varsayılan olarak mavi bir anahattır. Ayrıca varsayılan olarak `tabindex=0` durumundadır ve bu da kullanıcının bir sayfada birlikte kullanılan çeşitli `bento-social-share` öğeleri arasında geçiş yaparken takibini kolaylaştırır.

Varsayılan odak göstergesi, aşağıdaki CSS kural kümesiyle elde edilir.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Odak için CSS stilleri tanımlanarak ve bir `style` etiketine dahil edilerek varsayılan odak göstergesinin üzerine yazılabilir. Aşağıdaki örnekte, ilk CSS kural kümesi, `outline` özelliğini `none` olarak değiştirerek `bento-social-share` öğelerindeki odak göstergesini kaldırır. İkinci kural kümesi, (varsayılan mavi yerine) kırmızı bir anahat belirtir ve ayrıca `custom-focus` sınıfına sahip tüm `bento-social-share` öğeleri için `outline-offset`'i `3px` olacak şekilde ayarlar.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Bu CSS kurallarıyla, `bento-social-share` öğeleri, `custom-focus` dahil etmedikçe odak göstergesini göstermez, bu durumda kırmızı anahatlı göstergeye sahip olurlar.

#### Renk kontrastı

Unutmayın, `twitter`, `whatsapp` veya `line` `type` değerine sahip `bento-social-share` [WCAG 2.1 SC 1.4.11 Metin Dışı Kontrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)'da tanımlanan metin dışı içerik için önerilen 3:1 eşiğinin altına düşen ön plan/arka plan renk kombinasyonuna sahip bir düğme gösterir.

Yeterli kontrast olmadan içeriğin algılanması zor olabilir ve bu nedenle tanımlanması zor olabilir. Aşırı durumlarda, düşük kontrastlı içerik, renk algısı bozukluğu olan kişiler tarafından hiç görülmeyebilir. Yukarıdaki paylaşım düğmeleri durumunda, kullanıcılar paylaşım kontrollerinin ne olduğunu, hangi hizmetle ilgili olduklarını uygun şekilde algılayamayabilir/anlayamayabilir.

### Önceden yapılandırılmış sağlayıcılar

`bento-social-share` bileşeni, bazı varsayılan parametrelerin yanı sıra paylaşım uç noktalarını bilen [önceden yapılandırılmış bazı sağlayıcılar](./social-share-config.js) sunar.

<table>
  <tr>
    <th class="col-twenty">Sağlayıcı</th>
    <th class="col-twenty">Type</th>
    <th>Parametreler</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (işletim sistemi paylaşımı iletişim kutusunu tetikler)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-posta</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: isteğe bağlı</li>
        <li>
<code>data-param-body</code>: isteğe bağlı</li>
        <li>
<code>data-param-recipient</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>zorunlu</strong>, varsayılan olarak: yok. Bu parametre, <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Share metin kutusu</a> için zorunlu Facebook <code>app_id</code>'dir</li>
        <li>
<code>data-param-href</code>: isteğe bağlı</li>
        <li>
<code>data-param-quote</code>: isteğe bağlıdır; bir alıntı veya metin paylaşmak için kullanılabilir.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: isteğe bağlı (ancak ayarlanması kesinlikle tavsiye edilir). Pinterest'te paylaşılacak medya için Url. Ayarlanmazsa, son kullanıcının medyayı yüklemesi Pinterest tarafından talep edilecektir.</li>
        <li>
<code>data-param-url</code>: isteğe bağlı</li>
        <li>
<code>data-param-description</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: isteğe bağlı</li>
        <li>
<code>data-param-text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: isteğe bağlı</li>
        <li>
<code>data-param-text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: isteğe bağlı</li>
        <li>
<code>data-param-text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: isteğe bağlı</li>
</ul>
    </td>
  </tr>
</table>

### Yapılandırılmamış sağlayıcılar

Önceden yapılandırılmış sağlayıcılara ek olarak, `bento-social-share` bileşeninde ek öznitelikler belirleyerek yapılandırılmamış sağlayıcıları kullanabilirsiniz.

#### Örnek: Yapılandırılmamış bir sağlayıcı için paylaşım düğmesi oluşturma

`data-share-endpoint` özniteliğini Facebook Messenger özel protokolü için doğru uç noktaya ayarlayarak Facebook Messenger aracılığıyla bir paylaşım düğmesi oluşturur.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Bu sağlayıcılar önceden yapılandırılmadığından, sağlayıcı için uygun düğme görüntüsünü ve stillerini oluşturmanız gerekir.

### Öznitellikler

#### type (zorunlu)

Bir sağlayıcı türü seçer. Bu, hem önceden yapılandırılmış hem de yapılandırılmamış sağlayıcılar için gereklidir.

#### data-target

Hedefin açılacağı hedefi belirtir. iOS'ta e-posta/SMS dışındaki tüm durumlar için varsayılan `_blank`'tir; e-posta/SMS'te ise `_top` olarak ayarlanır.

#### data-share-endpoint

Bu öznitelik, yapılandırılmamış sağlayıcılar için gereklidir.

Bazı popüler sağlayıcılar önceden yapılandırılmış paylaşım uç noktalarına sahiptir. Ayrıntılar için Önceden Yapılandırılmış Sağlayıcılar bölümüne bakın. Yapılandırılmamış sağlayıcılar için paylaşım uç noktasını belirtmeniz gerekir.

#### data-param-\*

Tüm `data-param-*` ön ekli öznitelikler, URL parametrelerine dönüştürülür ve paylaşım uç noktasına iletilir.

#### aria-label

Erişilebilirlik düğmesinin açıklaması. Önerilen bir etiket "&lt;type&gt; üzerinde paylaş"tır.

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoSocialShare>` kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

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

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoSocialShare` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Veya `className` aracılığıyla:

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

### Erişilebilirlik

#### Odak göstergesi

`BentoSocialShare` öğesi, görünür bir odak göstergesi olarak varsayılan olarak mavi bir anahattır. Ayrıca varsayılan olarak `tabindex=0` durumundadır ve bu da kullanıcının bir sayfada birlikte kullanılan çeşitli `BentoSocialShare` öğeleri arasında geçiş yaparken takibini kolaylaştırır.

Varsayılan odak göstergesi, aşağıdaki CSS kural kümesiyle elde edilir.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Odak için CSS stilleri tanımlanarak ve bir `style` etiketine dahil edilerek varsayılan odak göstergesinin üzerine yazılabilir. Aşağıdaki örnekte, ilk CSS kural kümesi, `outline` özelliğini `none` olarak değiştirerek `BentoSocialShare` öğelerindeki odak göstergesini kaldırır. İkinci kural kümesi, (varsayılan mavi yerine) kırmızı bir anahat belirtir ve ayrıca `custom-focus` sınıfına sahip tüm `BentoSocialShare` öğeleri için `outline-offset`'i `3px` olacak şekilde ayarlar.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Bu CSS kurallarıyla, `BentoSocialShare` öğeleri, `custom-focus` dahil etmedikçe odak göstergesini göstermez, bu durumda kırmızı anahatlı göstergeye sahip olurlar.

#### Renk kontrastı

Unutmayın, `twitter`, `whatsapp` veya `line` `type` değerine sahip `BentoSocialShare` [WCAG 2.1 SC 1.4.11 Metin Dışı Kontrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)'da tanımlanan metin dışı içerik için önerilen 3:1 eşiğinin altına düşen ön plan/arka plan renk kombinasyonuna sahip bir düğme gösterir.

Yeterli kontrast olmadan içeriğin algılanması zor olabilir ve bu nedenle tanımlanması zor olabilir. Aşırı durumlarda, düşük kontrastlı içerik, renk algısı bozukluğu olan kişiler tarafından hiç görülmeyebilir. Yukarıdaki paylaşım düğmeleri durumunda, kullanıcılar paylaşım kontrollerinin ne olduğunu, hangi hizmetle ilgili olduklarını uygun şekilde algılayamayabilir/anlayamayabilir.

### Önceden yapılandırılmış sağlayıcılar

`BentoSocialShare` bileşeni, bazı varsayılan parametrelerin yanı sıra paylaşım uç noktalarını bilen [önceden yapılandırılmış bazı sağlayıcılar](./social-share-config.js) sunar.

<table>
  <tr>
    <th class="col-twenty">Sağlayıcı</th>
    <th class="col-twenty">Type</th>
    <th>
<code>param</code> aksesuarı aracılığıyla parametreler</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (işletim sistemi paylaşımı iletişim kutusunu tetikler)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>E-posta</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: isteğe bağlı</li>
        <li>
<code>body</code>: isteğe bağlı</li>
        <li>
<code>recipient</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>:<strong>zorunlu</strong>, varsayılan olarak: yok. Bu parametre, <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Share metin kutusu</a> için zorunlu Facebook <code>app_id</code>'dir</li>
        <li>
<code>href</code>: isteğe bağlı</li>
        <li>
<code>quote</code> : isteğe bağlı; bir alıntı veya metin paylaşmak için kullanılabilir.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: isteğe bağlı (ancak ayarlanması kesinlikle tavsiye edilir). Pinterest'te paylaşılacak medya için Url. Ayarlanmazsa, son kullanıcının medyayı yüklemesi Pinterest tarafından talep edilecektir.</li>
        <li>
<code>url</code>: isteğe bağlı</li>
        <li>
<code>description</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: isteğe bağlı</li>
        <li>
<code>text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: isteğe bağlı</li>
        <li>
<code>text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: isteğe bağlı</li>
        <li>
<code>text</code>: isteğe bağlı</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: isteğe bağlı</li>
</ul>
    </td>
  </tr>
</table>

### Yapılandırılmamış sağlayıcılar

Önceden yapılandırılmış sağlayıcılara ek olarak, `BentoSocialShare` bileşeninde ek öznitelikler belirleyerek yapılandırılmamış sağlayıcıları kullanabilirsiniz.

#### Örnek: Yapılandırılmamış bir sağlayıcı için paylaşım düğmesi oluşturma

`data-share-endpoint` özniteliğini Facebook Messenger özel protokolü için doğru uç noktaya ayarlayarak Facebook Messenger aracılığıyla bir paylaşım düğmesi oluşturur.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Bu sağlayıcılar önceden yapılandırılmadığından, sağlayıcı için uygun düğme görüntüsünü ve stillerini oluşturmanız gerekir.

### Aksesuarlar

#### type (zorunlu)

Bir sağlayıcı türü seçer. Bu, hem önceden yapılandırılmış hem de yapılandırılmamış sağlayıcılar için gereklidir.

#### arka plan

Bazen kendi tarzınızı sağlamak istersiniz. Arka plan için bir renk vererek sağlanan stilleri geçersiz kılabilirsiniz.

`BentoSocialShare` simgesinin stilini özelleştirirken, lütfen özelleştirilmiş simgenin sağlayıcı tarafından belirlenen markalama yönergelerini karşıladığından emin olun (örn. Twitter, Facebook, vb.)

#### renk

Bazen kendi tarzınızı sağlamak istersiniz. Dolgu için bir renk vererek sağlanan stilleri geçersiz kılabilirsiniz.

`BentoSocialShare` simgesinin stilini özelleştirirken, lütfen özelleştirilmiş simgenin sağlayıcı tarafından belirlenen markalama yönergelerini karşıladığından emin olun (örn. Twitter, Facebook, vb.)

#### hedef

Hedefin açılacağı hedefi belirtir. iOS'ta e-posta/SMS dışındaki tüm durumlar için varsayılan `_blank`'tir; e-posta/SMS'te ise `_top` olarak ayarlanır.

#### uç nokta

Bu aksesuar, yapılandırılmamış sağlayıcılar için gereklidir.

Bazı popüler sağlayıcılar önceden yapılandırılmış paylaşım uç noktalarına sahiptir. Ayrıntılar için Önceden Yapılandırılmış Sağlayıcılar bölümüne bakın. Yapılandırılmamış sağlayıcılar için paylaşım uç noktasını belirtmeniz gerekir.

#### params

Tüm `param` özellikleri, URL parametreleri olarak geçirilir ve paylaşım uç noktasına iletilir.

#### aria-label

Erişilebilirlik düğmesinin açıklaması. Önerilen bir etiket "&lt;type&gt; üzerinde paylaş"tır.
