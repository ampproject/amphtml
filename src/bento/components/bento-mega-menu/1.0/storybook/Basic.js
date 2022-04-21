import {BentoMegaMenu} from '#bento/components/bento-mega-menu/1.0/component';

import * as Preact from '#preact';

import '../component.jss';

export default {
  title: 'MegaMenu',
  component: BentoMegaMenu,
  args: {},
};

function PageLayout({children: megaMenu}) {
  const css = String.raw;
  return (
    <>
      <style>{css`
        body {
          padding: 0 !important;
        }
        .heading {
          margin: 0;
          padding: 10px;
        }
      `}</style>

      <header>
        <h1>This is the page header</h1>
      </header>

      {megaMenu}

      <h1>Page Contents</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid
        aspernatur autem cupiditate delectus, deleniti dignissimos eligendi
        laborum minima quasi sapiente.
      </p>
    </>
  );
}

function CommonMenu() {
  return (
    <nav>
      <ul>
        <li>
          <h4>This is the mega menu:</h4>
        </li>
        <li>
          <h4 class="heading" role="button">
            Form
          </h4>
          <div class="content" role="dialog" id="subscribe">
            <p>
              Use the form below to subscribe to our{' '}
              <a href="#">weekly newsletter.</a>
            </p>
            <form method="get" target="_top">
              <fieldset>
                <label>
                  <span>Name:</span>
                  <input type="text" name="name" required />
                </label>
                <br />
                <label>
                  <span>Email:</span>
                  <input type="email" name="email" required />
                </label>
                <br />
                <input type="submit" value="Subscribe" />
              </fieldset>
              <div>Subscription successful!</div>
              <div>Subscription failed!</div>
            </form>
          </div>
        </li>
        <li>
          <h4 class="heading" role="button">
            Video & Images
          </h4>
          <div class="content" role="dialog">
            <video
              width="400"
              height="250"
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://peach.blender.org/wp-content/uploads/bbb-splash.png"
              controls
            >
              <div fallback>
                <p>Your browser doesn't support HTML5 video.</p>
              </div>
            </video>
            <div>
              <img
                src="https://picsum.photos/id/469/367/267"
                width="400"
                height="250"
                alt="a sample image"
              />
              <img
                src="https://picsum.photos/id/491/367/267"
                width="400"
                height="250"
                alt="another sample image"
              />
              <img
                src="https://picsum.photos/id/452/367/267"
                width="400"
                height="250"
                alt="and another sample image"
              />
            </div>
          </div>
        </li>
        <li>
          <a class="heading" href="#">
            Regular link
          </a>
        </li>
      </ul>
    </nav>
  );
}

export const _default = (args) => {
  return (
    <PageLayout>
      <BentoMegaMenu {...args}>
        <CommonMenu />
      </BentoMegaMenu>
    </PageLayout>
  );
};
