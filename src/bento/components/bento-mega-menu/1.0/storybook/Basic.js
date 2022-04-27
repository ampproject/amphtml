import * as Preact from '#preact';

import {BentoMegaMenu} from '../component/BentoMegaMenu';

import '../component.jss';

export default {
  title: 'MegaMenu',
  component: BentoMegaMenu,
  args: {},
};

function PageLayout({children: megaMenu}) {
  const css = String.raw;
  const loremIpsum = (
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate
      doloremque eius enim expedita illo iusto quidem rem voluptas? Animi,
      assumenda cumque, cupiditate dicta dignissimos eaque earum eveniet
      excepturi inventore libero maxime modi natus neque officia, officiis quam
      quia quibusdam quis suscipit unde vero voluptatibus voluptatum? Debitis,
      eum fugiat id impedit natus saepe tempora tempore. Culpa dicta doloribus
      inventore numquam optio rerum tempore. Aperiam architecto consectetur
      cumque est ex explicabo incidunt natus nulla omnis porro quia quisquam
      quod, repellat repellendus reprehenderit tempore ullam. Debitis et
      explicabo nemo officia repellendus! Ad atque commodi cupiditate dolor
      dolore doloribus illo, quis quisquam quo repellat.
    </p>
  );

  return (
    <>
      <style>{css`
        body {
          padding: 0 !important;
        }
      `}</style>

      <header>
        <h1>This is the page header</h1>
      </header>

      {megaMenu}

      <h1>Page Contents</h1>
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
      {loremIpsum}
    </>
  );
}

export const _default = (args) => {
  return (
    <PageLayout>
      <BentoMegaMenu {...args}>
        This is the mega menu:
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Form</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
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
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Images</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
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
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Video</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
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
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
        <a href="#">Regular link</a>
      </BentoMegaMenu>
    </PageLayout>
  );
};
