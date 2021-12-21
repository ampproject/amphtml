# サポートされている言語

サポートされている言語のリストを確認するには、`*.js` ファイルをご覧ください。このファイルは、[`_locales` ディレクトリ](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)にあります。

# 言語のフォールバック

言語はより一般的なバリアントにフォールバックしますが、最終的には `default` 言語にフォールバックします。バリアントは、言語コードにハイフンで示されます。

たとえば、言語コード `en-GB` は以下に示される順で次の言語を確認します。

- `en-GB`（英語、英国）
- `en`（英語）
- `default`（デフォルト）

`default` 言語コードは、サイト運営者が指定した言語コードが存在しない場合に使用されるフォールバックです。最小限の英語（English）文字列を使用するため、ドキュメントはほぼその主要言語で表示されます。類似またはわかりやすい図像を説明するものでない限り、すべてのラベルは完全に無視される可能性があります。たとえば、共有するアイコンは共有するネットワークのロゴ（Twitter ロゴなど）を示すため、「Twitter」という文字列が冗長し、`default` 言語から取り除かれる場合があります。

# 現在の文字列を表示する

各言語に提供されている翻訳は、[こちらの表計算](https://bit.ly/amp-story-strings)で確認できます。セルに `undefined` が挿入されている場合、その文字列は特定の言語では表示されず、代わりにフォールバック言語が使用されることを示します。

# 新しい文字列を追加する（英語）

1. [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31) に新しい文字列 ID を追加します。`LocalizedStringId` リストはアルファベット順のままにし、ID の名前が意味的に何を表すのか明確にしてください。
2. [`en.js` ファイル](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)を開きます。
3. 新しいオブジェクトキーを追加します。キーは `LocalizedStringId` とし、文字列とその説明を含むオブジェクトを値とします。次に例を示します。

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. 変更内容でプルリクエストを送信します。

# 新しい翻訳を追加する（英語以外の文字列）

1. [文字列の表計算](https://bit.ly/amp-story-strings)を確認して、文字列が欠落しているものを探します。
2. 翻訳を追加する言語の `*.js` ファイルを [`_locales` ディレクトリ](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)から開きます。
3. キーを `LocalizedStringId`、文字列を含むオブジェクトを値とする新しいオブジェクトキーを追加します。次に例を示します。

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. 変更内容でプルリクエストを送信します。

注意: 文字列 ID はアルファベット順のままとし、英語以外の言語の文字列オブジェクトに `description` キーを含まないでください。
