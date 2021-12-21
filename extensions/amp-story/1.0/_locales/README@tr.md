# Desteklenen diller

Desteklenen dillerin listesini görmek için, <a><code>_locales</code> dizinindeki</a> `*.js` dosyalarının listesine bakın.

# Dil geri dönüşleri

Diller, daha genel varyantlarına ve nihayetinde `default` dile geri dönecektir. Varyantlar, dil kodunda bir tire ile gösterilir.

Örneğin, `en-GB` dil kodu aşağıdaki dilleri kontrol edecektir (bu sırayla):

- `en-GB` (İngilizce, Büyük Britanya)
- `en` (İngilizce)
- `default` (Varsayılan)

`default` dil kodu, yayıncı tarafından belirtilen dil kodunun mevcut olmadığı durumda kullanılan bir yedektir. Belgenin çoğunlukla ana dilinde görüntülenebilmesi için minimum miktarda İngilizce dize kullanır. Bilinen veya anlaşılır ikonografiyi açıklayan herhangi bir etiket tamamen kaldırılabilir. Örneğin, paylaşım simgeleri paylaşım ağının logosunu (örneğin Twitter logosu) gösterdiğinden, "Twitter" dizisi gereksizdir ve `default` dilin dışında bırakılabilir.

# Geçerli dizeleri görüntüleme

[Bu elektronik çizelgede](https://bit.ly/amp-story-strings) her dil için sağlanan çevirileri görüntüleyebilirsiniz. `undefined` metin içeren hücreler, dizenin belirtilen dilde gösterilmeyeceği ve bunun yerine geri dönüş dillerinin kullanılacağı anlamına gelir.

# Yeni dizeler ekleme (İngilizce)

1. [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31) yeni bir dize kimliği ekleyin. `LocalizedStringId` listesini alfabetik sırada tutun ve kimliğinizin adının anlamsal olarak neyi temsil ettiği konusunda net olduğundan emin olun.
2. [`en.js` dosyasını](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js) açın
3. `LocalizedStringId` olan yeni bir nesne anahtarı ve değeri olarak dizeyi ve açıklamasını içeren bir nesne ekleyin. Örneğin:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Değişikliklerinizle birlikte bir çekme isteği gönderin

# Yeni çeviriler ekleme (İngilizce olmayan dizeler)

1. [Dize elektronik çizelgesine](https://bit.ly/amp-story-strings) bakarak hangi dizelerin eksik olduğunu bulun.
2. Çeviri eklemek istediğiniz dil için [`_locales` dizininden](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) `*.js` dosyasını açın.
3. `LocalizedStringId` ile yeni bir nesne anahtarı ve değeri olarak dizeyi içeren bir nesne ekleyin. Örneğin:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Değişikliklerinizle birlikte bir çekme isteği gönderin.

NOT: Dize kimliklerini alfabetik sırada tutun ve İngilizce dışındaki diller için dize nesnenizi `description` anahtarına eklemeyin.
