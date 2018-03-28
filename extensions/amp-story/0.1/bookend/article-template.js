class ArticleTemplate {
  constructor(builder) {
    this.template = builder;
  }

  static get Builder() {
    class Builder {
      constructor() {
        this.tag = 'a';
        this.children = [];
        this.attrs = {};
        this.attrs.target = '_top';
      }

      withData(data) {
        this.data = data;
        return this;
      }

      withClass(stylesClass) {
        this.attrs.class = stylesClass;
        return this;
      }

      addHeading() {
        this.children.push(
          {
            tag: 'h3',
            attrs: dict({ 'class': 'i-amphtml-story-bookend-article-heading' }),
            text: this.data.title,
          }
        );
        return this;
      }

      addEyebrow() {
        this.children.push(
          {
            tag: 'h2',
            attrs: dict({ 'class': 'i-amphtml-story-bookend-article-eyebrow' }),
            text: this.data.eyebrow,
          }
        );
        return this;
      }

      addDomainName() {
        this.children.push(
          {
            tag: 'div',
            attrs: dict({ 'class': 'i-amphtml-story-bookend-article-meta' }),
            text: articleData.domainName,
          }
        );
        return this;
      }

      addImage(width, height) {
        this.children.push(
          {
            tag: 'amp-img',
            attrs: dict({
              'class': 'i-amphtml-story-bookend-article-image',
              'src': this.data.image,
              'width': width,
              'height': height,
            }),
          }
        );
        return this;
      }

      build() {
        this.attrs = dict(this.attrs);
        return new ArticleTemplate(this);
      }
    }
    return Builder;
  }
}

let preset = new ArticleTemplate.Builder().withData(articleData).build();

console.log(preset.keyframes);