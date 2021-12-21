# Bahasa yang didukung

Untuk melihat daftar bahasa yang didukung, lihat daftar berkas `*.js` [di direktori `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).

# Fallback bahasa

Bahasa akan kembali ke varian yang lebih umum, dan akhirnya ke bahasa `default`. Varian ditunjukkan dengan tanda hubung dalam kode bahasa.

Misalnya, kode bahasa `en-GB` akan memeriksa bahasa berikut ini (dalam urutan ini):

-   `en-GB` (Bahasa Inggris, Britania Raya)
-   `en` (Bahasa Inggris)
-   `default` (Standar)

Kode bahasa `default` adalah fallback yang digunakan jika kode bahasa yang ditentukan penayang tidak ada. Ini menggunakan untai (string) bahasa Inggris minimal, sehingga dokumen dapat ditampilkan sebagian besar dalam bahasa utamanya. Label apa pun yang menggambarkan ikonografi yang tidak asing atau dapat dipahami dapat dihilangkan seluruhnya. Misalnya, karena ikon berbagi menunjukkan logo jaringan berbagi (cth.: logo Twitter), untai "Twitter" menjadi berlebihan dan dapat diabaikan dari bahasa `default`.

# Melihat untai saat ini

Anda dapat melihat terjemahan yang disediakan untuk setiap bahasa di [spreadsheet ini](https://bit.ly/amp-story-strings). Sel apa pun dengan teks `undefined` berarti bahwa untai tersebut tidak akan ditampilkan dalam bahasa yang ditentukan, dan bahasa fallback yang akan digunakan sebagai gantinya.

# Menambahkan untai baru (Bahasa Inggris)

1. Tambahkan ID untai baru di [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Simpan `LocalizedStringId` dalam urutan abjad, dan pastikan nama ID Anda jelas tentang apa yang diwakilinya secara semantik.
2. Buka [berkas `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Tambahkan kunci objek baru dengan `LocalizedStringId` sebagai kunci, dan objek yang berisi untai dan deskripsinya sebagai nilainya. Sebagai contoh:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Kirimkan permintaan tarik dengan perubahan Anda

# Menambahkan terjemahan baru (untai non-Inggris)

1. Cari untai mana yang hilang dengan melihat [string spreadsheet](https://bit.ly/amp-story-strings).
2. Buka berkas `*.js` dari [direktori `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) untuk bahasa yang ingin Anda tambahkan terjemahannya.
3. Tambahkan kunci objek baru dengan `LocalizedStringId` sebagai kunci, dan objek yang berisi untai sebagai nilainya. Sebagai contoh:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Kirimkan permintaan tarik dengan perubahan Anda.

CATATAN: Simpan ID untai dalam urutan abjad, dan jangan sertakan `description` di objek untai Anda untuk bahasa selain bahasa Inggris.
