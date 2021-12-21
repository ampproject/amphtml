# Bento Social Share

Exibe um botão de compartilhamento para plataformas sociais ou compartilhamento de sistema.

Atualmente, nenhum dos botões gerados pelo Bento Social Share (incluindo os dos provedores pré-configurados) tem um rótulo ou nome acessível que é exposto a tecnologias assistivas (como leitores de tela). Certifique-se de incluir um `aria-label` com um rótulo descritivo, caso contrário, esses controles serão apenas anunciados como elementos de "botão" sem rótulo.

## Componente web

Você deve incluir a biblioteca CSS necessária para cada componente Bento de forma a garantir o carregamento adequado e antes de adicionar estilos personalizados. Ou use os estilos leves pré-upgrade disponíveis incorporados dentro da página (inline). Veja [Layout e estilo](#layout-and-style) .

Os exemplos abaixo demonstram o uso do componente web `<bento-social-share>`

### Exemplo: Usando import via npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Exemplo: Usando include via `<script>`

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

### Layout e estilo

Cada componente Bento possui uma pequena biblioteca CSS que você precisa incluir para garantir o carregamento adequado sem [alterações na posição do conteúdo](https://web.dev/cls/). Devido ao funcionamento que depende da ordem de carregamento, você deve garantir manualmente que as folhas de estilo sejam incluídas antes de qualquer estilo personalizado.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Como alternativa, você pode incorporar os estilos de leves pré-upgrade:

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

#### Tipo de contêiner

O componente `bento-social-share` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de definir um tamanho para o componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width` , `aspect-ratio` ou outras propriedades):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Estilos default

Por default, o `bento-social-share` inclui alguns provedores populares pré-configurados. Os botões para esses provedores são estilizados com a cor e o logotipo oficiais do provedor. A largura default é 60px e a altura default é 44px.

#### Estilos personalizados

Às vezes você deseja fornecer seu próprio estilo. Você pode simplesmente substituir os estilos fornecidos como o seguinte:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Ao personalizar o estilo de um ícone `bento-social-share`, certifique-se de que o ícone personalizado atenda às diretrizes de marca definidas pelo provedor (por exemplo, Twitter, Facebook, etc.)

### Acessibilidade

#### Indicação de foco

O elemento `bento-social-share` é, por default, um contorno azul como um indicador de foco visível. Ele também usa como default `tabindex=0` tornando mais fácil para o usuário acompanhar à medida em que ele percorre as abas de múltiplos elementos `bento-social-share` usados juntos numa página.

O indicador de foco default é obtido com o seguinte conjunto de regras CSS.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

O indicador de foco default pode ser sobreposto com estilos CSS definidos para focus e incluindo-os numa tag `style`. No exemplo abaixo, o primeiro conjunto de regras CSS remove o indicador de foco em todos os elementos `bento-social-share` definindo a propriedade `outline` para `none`. O segundo conjunto de regras especifica um contorno vermelho (em vez do azul default) e também define o `outline-offset` do contorno com o valor `3px` para todos os elementos `bento-social-share` com a classe `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Com essas regras CSS, os elementos `bento-social-share` não mostrariam o indicador de foco visível, a menos que incluíssem a classe `custom-focus`, caso em que teriam o indicador delineado em vermelho.

#### Contraste de cor

Observe que `bento-social-share` com `type` contendo o valor `twitter`, `whatsapp` ou `line` exibirá um botão com uma combinação de cores para primeiro plano e plano de fundo que cai abaixo do limite de 3:1 recomendado para conteúdo não textual definido no [WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Sem contraste suficiente, o conteúdo pode ser difícil de perceber e, portanto, difícil de identificar. Em casos extremos, o conteúdo com baixo contraste pode não ser visível para pessoas com deficiências na percepção das cores. No caso dos botões de compartilhamento acima, os usuários podem não ser capazes de perceber/compreender apropriadamente o que são os controles de compartilhamento e a que serviço eles se relacionam.

### Provedores pré-configurados

O componente `bento-social-share` [fornece alguns provedores pré-configurados](./social-share-config.js) que conhecem seus endpoints de compartilhamento, bem como alguns parâmetros default.

<table>
  <tr>
    <th class="col-twenty">Provedor</th>
    <th class="col-twenty">Tipo</th>
    <th>Parâmetros</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API Web Share</a> (aciona a caixa de diálogo de compartilhamento do sistema operacional)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: opcional</li>
        <li>
<code>data-param-body</code>: opcional</li>
        <li>
<code>data-param-recipient</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code> : <strong>obrigatório</strong>, o default é: nenhum. Este parâmetro é o <code>app_id</code> do Facebook necessário para a <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">caixa de diálogo Compartilhar</a> do Facebook.</li>
        <li>
<code>data-param-href</code>: opcional</li>
        <li>
<code>data-param-quote</code> : opcional, pode ser usado para compartilhar uma citação ou texto.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code> : opcional (mas altamente recomendado). URL da mídia a ser compartilhada no Pinterest. Se não for definida, o usuário final será solicitado a fazer upload de uma mídia pelo Pinterest.</li>
        <li>
<code>data-param-url</code>: opcional</li>
        <li>
<code>data-param-description</code>: opcional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcional</li>
        <li>
<code>data-param-text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcional</li>
        <li>
<code>data-param-text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opcional</li>
        <li>
<code>data-param-text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: opcional</li>
</ul>
    </td>
  </tr>
</table>

### Provedores não configurados

Além dos provedores pré-configurados, você pode usar provedores não configurados especificando atributos adicionais no componente `bento-social-share`

#### Exemplo: Criação de um botão de compartilhamento para um provedor não configurado

O exemplo a seguir cria um botão de compartilhamento por meio do Facebook Messenger, definindo o atributo `data-share-endpoint` com o endpoint correto para o protocolo personalizado do Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Como esses provedores não são pré-configurados, você precisará criar a imagem e os estilos de botão apropriados para o provedor.

### Atributos

#### type (obrigatório)

Seleciona um tipo de provedor. Isto é necessário para provedores pré-configurados e não configurados.

#### data-target

Especifica o destino onde será aberto o alvo. O default é `_blank` para todos os casos, exceto e-mail/SMS no iOS, caso em que o alvo é definido como `_top`.

#### data-share-endpoint

Este atributo é obrigatório para provedores não configurados.

Alguns provedores populares têm endpoints de compartilhamento pré-configurados. Para detalhes, consulte a seção Provedores pré-configurados. Para provedores não configurados, você precisará especificar o endpoint de compartilhamento.

#### data-param-*

Todos os atributos prefixados com `data-param-*` são transformados em parâmetros de URL e passados para o endpoint de compartilhamento.

#### aria-label

A descrição do botão para acessibilidade. Um rótulo recomendado é "Compartilhar em &lt;type&gt;".

---

## Componente Preact/React

Os exemplos abaixo demonstram o uso de `<BentoSocialShare>` como um componente funcional utilizável com as bibliotecas Preact ou React.

### Exemplo: Usando import via npm

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

### Layout e estilo

#### Tipo de contêiner

O componente `BentoSocialShare` tem um tipo de tamanho de layout definido. Para garantir que o componente seja renderizado corretamente, certifique-se de aplicar um tamanho ao componente e seus filhos imediatos (slides) através de um layout CSS desejado (como um definido com `height`, `width`, `aspect-ratio` ou outras propriedades). Eles podem ser aplicados inline:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Ou via `className` :

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

### Acessibilidade

#### Indicação de foco

O elemento `BentoSocialShare` é, por default, um contorno azul como um indicador de foco visível. Ele também usa como default `tabindex=0` tornando mais fácil para o usuário acompanhar à medida em que ele percorre as abas de múltiplos elementos `BentoSocialShare` usados juntos numa página.

O indicador de foco default é obtido com o seguinte conjunto de regras CSS.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

O indicador de foco default pode ser sobreposto com estilos CSS definidos para focus e incluindo-os numa tag `style`. No exemplo abaixo, o primeiro conjunto de regras CSS remove o indicador de foco em todos os elementos `BentoSocialShare` definindo a propriedade `outline` para `none`. O segundo conjunto de regras especifica um contorno vermelho (em vez do azul default) e também define o `outline-offset` do contorno com o valor `3px` para todos os elementos `BentoSocialShare` com a classe `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Com essas regras CSS, os elementos `BentoSocialShare` não mostrariam o indicador de foco visível, a menos que incluíssem a classe `custom-focus`, caso em que teriam o indicador delineado em vermelho.

#### Contraste de cor

Observe que `BentoSocialShare` com `type` contendo o valor `twitter`, `whatsapp` ou `line` exibirá um botão com uma combinação de cores para primeiro plano e plano de fundo que cai abaixo do limite de 3:1 recomendado para conteúdo não textual definido no [WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Sem contraste suficiente, o conteúdo pode ser difícil de perceber e, portanto, difícil de identificar. Em casos extremos, o conteúdo com baixo contraste pode não ser visível para pessoas com deficiências na percepção das cores. No caso dos botões de compartilhamento acima, os usuários podem não ser capazes de perceber/compreender apropriadamente o que são os controles de compartilhamento e a que serviço eles se relacionam.

### Provedores pré-configurados

O componente `BentoSocialShare` [fornece alguns provedores pré-configurados](./social-share-config.js) que conhecem seus endpoints de compartilhamento, bem como alguns parâmetros default.

<table>
  <tr>
    <th class="col-twenty">Provedor</th>
    <th class="col-twenty">Tipo</th>
    <th>Parâmetros através da prop <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API Web Share</a> (aciona a caixa de diálogo de compartilhamento do sistema operacional)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: opcional</li>
        <li>
<code>body</code>: opcional</li>
        <li>
<code>recipient</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code> : <strong>obrigatório</strong>, o default é: nenhum. Este parâmetro é o <code>app_id</code> do Facebook necessário para a <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">caixa de diálogo Compartilhar</a> do Facebook.</li>
        <li>
<code>href</code>: opcional</li>
        <li>
<code>quote</code> : opcional, pode ser usado para compartilhar uma citação ou texto.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: opcional (mas altamente recomendado). URL da mídia a ser compartilhada no Pinterest. Se não for definida, o usuário final será solicitado a fazer upload de uma mídia pelo Pinterest.</li>
        <li>
<code>url</code>: opcional</li>
        <li>
<code>description</code>: opcional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcional</li>
        <li>
<code>text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcional</li>
        <li>
<code>text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opcional</li>
        <li>
<code>text</code>: opcional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: opcional</li>
</ul>
    </td>
  </tr>
</table>

### Provedores não configurados

Além dos provedores pré-configurados, você pode usar provedores não configurados especificando atributos adicionais no componente `BentoSocialShare`

#### Exemplo: Criação de um botão de compartilhamento para um provedor não configurado

O exemplo a seguir cria um botão de compartilhamento por meio do Facebook Messenger, definindo o atributo `data-share-endpoint` com o endpoint correto para o protocolo personalizado do Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Como esses provedores não são pré-configurados, você precisará criar a imagem e os estilos de botão apropriados para o provedor.

### Propriedades

#### type (obrigatório)

Seleciona um tipo de provedor. Isto é necessário para provedores pré-configurados e não configurados.

#### background

Às vezes, você deseja fornecer seu próprio estilo. Você pode simplesmente sobrepor os estilos fornecidos, dando uma cor para o fundo.

Ao personalizar o estilo de um ícone `BentoSocialShare`, certifique-se de que o ícone personalizado atenda às diretrizes de marca definidas pelo provedor (por exemplo, Twitter, Facebook, etc.)

#### color

Às vezes, você deseja fornecer seu próprio estilo. Você pode simplesmente sobrepor os estilos fornecidos, dando uma cor para o preenchimento.

Ao personalizar o estilo de um ícone `BentoSocialShare`, certifique-se de que o ícone personalizado atenda às diretrizes de marca definidas pelo provedor (por exemplo, Twitter, Facebook, etc.)

#### target

Especifica o destino onde será aberto o alvo. O default é `_blank` para todos os casos, exceto e-mail/SMS no iOS, caso em que o alvo é definido como `_top`.

#### endpoint

Este atributo é obrigatório para provedores não configurados.

Alguns provedores populares têm endpoints de compartilhamento pré-configurados. Para detalhes, consulte a seção Provedores pré-configurados. Para provedores não configurados, você precisará especificar o endpoint de compartilhamento.

#### params

Todas as propriedades `param` são passadas como parâmetros de URL e repassadas para o endpoint de compartilhamento.

#### aria-label

A descrição do botão para acessibilidade. Um rótulo recomendado é "Compartilhar em &lt;type&gt;".
