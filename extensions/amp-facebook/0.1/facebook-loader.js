import {htmlFor} from '#core/dom/static-template';

/**
 * Common function to create the facebook loader logo for all amp-facebook-*
 * components.
 * @param {!AmpElement} element
 * @return {{
 *  content: !Element,
 *  color: string,
 * }}
 */
export function createLoaderLogo(element) {
  const html = htmlFor(element);
  return {
    color: '#1877F2',
    content: html`
      <svg viewBox="0 0 72 72">
        <path
          fill="currentColor"
          d="M46,36c0-5.5-4.5-10-10-10s-10,4.5-10,10c0,5,3.7,9.1,8.4,9.9v-7h-2.5V36h2.5v-2.2c0-2.5,1.5-3.9,3.8-3.9
                c1.1,0,2.2,0.2,2.2,0.2v2.5h-1.3c-1.2,0-1.6,0.8-1.6,1.6V36h2.8l-0.4,2.9h-2.3v7C42.3,45.1,46,41,46,36z"
        ></path>
        <path
          fill="#ffffff"
          class="i-amphtml-new-loader-transparent-on-shim"
          d="M39.9,38.9l0.4-2.9h-2.8v-1.9c0-0.8,0.4-1.6,1.6-1.6h1.3v-2.5c0,0-1.1-0.2-2.2-0.2c-2.3,0-3.8,1.4-3.8,3.9V36
                h-2.5v2.9h2.5v7c0.5,0.1,1,0.1,1.6,0.1s1.1,0,1.6-0.1v-7H39.9z"
        ></path>
      </svg>
    `,
  };
}
