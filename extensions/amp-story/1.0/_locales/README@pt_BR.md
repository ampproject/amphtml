# Idiomas suportados

Para ver uma lista dos idiomas suportados, consulte a lista de arquivos `*.js` [no diretório `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) .

# Fallbacks de idioma

Os idiomas voltarão para suas variantes mais gerais e, por fim, para o idioma `default`. As variantes são indicadas por um hífen no código do idioma.

Por exemplo, o código de idioma `en-GB` verificará os seguintes idiomas (nesta ordem):

- `en-GB` (inglês, Grã-Bretanha)
- `en` (inglês)
- `default` (Default)

O código de idioma `default` é um fallback usado caso o código de idioma especificado pelo editor não exista. Ele usa uma quantidade mínima de strings em inglês, para que o documento possa ser exibido principalmente em seu idioma principal. Quaisquer rótulos que descrevem iconografia familiar ou inteligível podem ser totalmente descartados. Por exemplo, como os ícones de compartilhamento mostram o logotipo da rede de compartilhamento (por exemplo, o logotipo do Twitter), a string "Twitter" é redundante e pode ser omitida do idioma `default`.

# Visualizando as strings atuais

Você pode ver as traduções fornecidas para cada idioma [nesta planilha](https://bit.ly/amp-story-strings). Quaisquer células com o texto `undefined` significam que a string não será exibida no idioma especificado e os idiomas de fallback serão usados em seu lugar.

# Adicionando novas strings (inglês)

1. Adicione um novo ID de string em [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Mantenha a `LocalizedStringId` em ordem alfabética e certifique-se de que o nome do seu ID seja claro sobre o que ele representa semanticamente.
2. Abra o [arquivo `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Adicione uma nova chave de objeto com `LocalizedStringId` como chave associada a um objeto contendo a string e sua descrição como seu valor. Por exemplo:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Envie uma solicitação pull com suas alterações

# Adicionando novas traduções (strings em outros idiomas)

1. Descubra quais strings estão faltando olhando [a planilha de strings](https://bit.ly/amp-story-strings).
2. Abra o arquivo `*.js` [do diretório `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) para o idioma para o qual deseja adicionar uma tradução.
3. Adicione uma nova chave de objeto com `LocalizedStringId` como chave associada a um objeto contendo a string e sua descrição como seu valor. Por exemplo:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Envie uma solicitação pull com suas alterações

OBSERVAÇÃO: Mantenha os IDs de string em ordem alfabética e não inclua a chave `description` em seu objeto de string para outros idiomas além do inglês.
