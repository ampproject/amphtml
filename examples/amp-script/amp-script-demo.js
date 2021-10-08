/*
 * @fileoverview
 * Initial DOM must contain a button#hello. Other elemenst are optional.
 */

let mutationCount = 0;
let incrementMutationCount = () => {};
const mutationCountLabel = document.getElementById('mutationCount');
if (mutationCountLabel) {
  incrementMutationCount = () => {
    mutationCount++;
    mutationCountLabel.textContent = mutationCount;
  };
}

const hello = document.getElementById('hello');
if (hello) {
  hello.addEventListener('click', () => {
    incrementMutationCount();

    const el = document.createElement('h1');
    el.textContent = 'Hello World!';
    document.body.appendChild(el);
  });
}

// Long task.
const long = document.getElementById('long');
if (long) {
  long.addEventListener('click', () => {
    incrementMutationCount();

    fetch('http://localhost:8000/examples/amp-script/hello-world-data.json')
      .then((response) => response.json())
      .then((json) => {
        const el = document.createElement('h1');
        el.textContent = 'Hello ' + json.year + ' World!';
        document.body.appendChild(el);
      });
  });
}

// <amp-img> should be allowed.
const ampImg = document.getElementById('amp-img');
if (ampImg) {
  ampImg.addEventListener('click', () => {
    incrementMutationCount();

    const el = document.createElement('amp-img');
    el.setAttribute('width', '300');
    el.setAttribute('height', '200');
    el.setAttribute('src', '/examples/img/hero@1x.jpg');
    document.body.appendChild(el);
  });
}

// <script> should be sanitized.
const script = document.getElementById('script');
if (script) {
  script.addEventListener('click', () => {
    incrementMutationCount();

    const el = document.createElement('script');
    document.body.appendChild(el);
  });
}

// <img> should be sanitized.
const img = document.getElementById('img');
if (img) {
  img.addEventListener('click', () => {
    incrementMutationCount();

    const el = document.createElement('img');
    document.body.appendChild(el);
  });
}
