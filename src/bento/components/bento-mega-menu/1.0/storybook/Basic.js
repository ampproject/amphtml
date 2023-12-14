import * as Preact from '#preact';
import '../component.jss';

import {BentoMegaMenu} from '../component/BentoMegaMenu';

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

export const Simple = (args) => {
  return (
    <PageLayout>
      <BentoMegaMenu {...args}>
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Menu Item 1</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
            These are the menu contents
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Menu Item 2</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
            Alias aspernatur beatae deserunt error esse eveniet excepturi quia
            suscipit totam vero.
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
        <BentoMegaMenu.Item>
          <BentoMegaMenu.Title>Menu Item 3</BentoMegaMenu.Title>
          <BentoMegaMenu.Content>
            <p>
              Hic impedit iste iure maiores minus necessitatibus nihil non
              numquam obcaecati pariatur perferendis quisquam quos recusandae
              saepe similique tempora ullam velit voluptatibus.
            </p>
            <p>
              Hic impedit iste iure maiores minus necessitatibus nihil non
              numquam obcaecati pariatur perferendis quisquam quos recusandae
              saepe similique tempora ullam velit voluptatibus.
            </p>
            <p>
              Hic impedit iste iure maiores minus necessitatibus nihil non
              numquam obcaecati pariatur perferendis quisquam quos recusandae
              saepe similique tempora ullam velit voluptatibus.
            </p>
            <p>
              Hic impedit iste iure maiores minus necessitatibus nihil non
              numquam obcaecati pariatur perferendis quisquam quos recusandae
              saepe similique tempora ullam velit voluptatibus.
            </p>
          </BentoMegaMenu.Content>
        </BentoMegaMenu.Item>
      </BentoMegaMenu>
    </PageLayout>
  );
};

const css = String.raw;

export const Detailed = (args) => {
  return (
    <>
      <style>
        {css`
          .menu-title {
            margin-right: 2em;
          }
          .menu-content {
            display: flex;
          }
        `}
      </style>
      <PageLayout>
        <BentoMegaMenu {...args}>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title class="menu-title">
              Clothing, Shoes, Jewelry &amp; Watches
            </BentoMegaMenu.Title>
            <BentoMegaMenu.Content class="menu-content">
              <img
                alt="Clothing, Shoes, Jewelry &amp; Watches"
                src="https://picsum.photos/id/535/367/267"
                height="250"
                width="300"
              />
              <div>
                <h4>Clothing, Shoes, Jewelry &amp; Watches</h4>
                <ul>
                  <li>
                    <a href="#">Women</a>
                  </li>
                  <li>
                    <a href="#">Men</a>
                  </li>
                  <li>
                    <a href="#">Girls</a>
                  </li>
                  <li>
                    <a href="#">Boys</a>
                  </li>
                  <li>
                    <a href="#">Baby</a>
                  </li>
                  <li>
                    <a href="#">Luggage</a>
                  </li>
                  <li>
                    <a href="#">Accessories</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>More to Explore</h4>
                <ul>
                  <li>
                    <a href="#">Our Brands</a>
                  </li>
                </ul>
              </div>
            </BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title class="menu-title">
              Movies, Music &amp; Games
            </BentoMegaMenu.Title>
            <BentoMegaMenu.Content class="menu-content">
              <img
                alt="Movies, Music &amp; Games"
                src="https://picsum.photos/id/452/367/267"
                height="250"
                width="300"
              />
              <div>
                <h4>Movies, Music &amp; Games</h4>
                <ul>
                  <li>
                    <a href="#">Movies &amp; TV</a>
                  </li>
                  <li>
                    <a href="#">Blue-ray</a>
                  </li>
                  <li>
                    <a href="#">CDs &amp; Vinyl</a>
                  </li>
                  <li>
                    <a href="#">Digital Music</a>
                  </li>
                  <li>
                    <a href="#">Video Games</a>
                  </li>
                  <li>
                    <a href="#">Headphones</a>
                  </li>
                  <li>
                    <a href="#">Musical Instruments</a>
                  </li>
                  <li>
                    <a href="#">Entertainment Collectibles</a>
                  </li>
                </ul>
              </div>
            </BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title class="menu-title">
              Sports &amp; Outdoors
            </BentoMegaMenu.Title>
            <BentoMegaMenu.Content class="menu-content">
              <img
                alt="Sports &amp; Outdoors"
                src="https://picsum.photos/id/469/367/267"
                height="250"
                width="300"
              />
              <div>
                <h4>Sports</h4>
                <ul>
                  <li>
                    <a href="#">Athletic Clothing</a>
                  </li>
                  <li>
                    <a href="#">Exercise &amp; Fitness</a>
                  </li>
                  <li>
                    <a href="#">Hunting &amp; Fishing</a>
                  </li>
                  <li>
                    <a href="#">Team Sports</a>
                  </li>
                  <li>
                    <a href="#">Sports Collectibles</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Outdoors</h4>
                <ul>
                  <li>
                    <a href="#">Camping &amp; Hiking</a>
                  </li>
                  <li>
                    <a href="#">Cycling</a>
                  </li>
                  <li>
                    <a href="#">Outdoor Clothing</a>
                  </li>
                  <li>
                    <a href="#">Climbing</a>
                  </li>
                  <li>
                    <a href="#">Accessories</a>
                  </li>
                </ul>
              </div>
            </BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title class="menu-title">
              Home, Garden &amp; Tools
            </BentoMegaMenu.Title>
            <BentoMegaMenu.Content class="menu-content">
              <img
                alt="Home, Garden &amp; Tools"
                src="https://picsum.photos/id/491/367/267"
                height="250"
                width="300"
              />
              <div>
                <h4>Home, Garden &amp; Pets</h4>
                <ul>
                  <li>
                    <a href="#">Furniture</a>
                  </li>
                  <li>
                    <a href="#">Kitchen &amp; Dining</a>
                  </li>
                  <li>
                    <a href="#">Bed &amp; Bath</a>
                  </li>
                  <li>
                    <a href="#">Garden &amp; Outdoor</a>
                  </li>
                  <li>
                    <a href="#">Mattresses</a>
                  </li>
                  <li>
                    <a href="#">Lighting</a>
                  </li>
                  <li>
                    <a href="#">Appliances</a>
                  </li>
                  <li>
                    <a href="#">Pet Supplies</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Tools, Home Improvement</h4>
                <ul>
                  <li>
                    <a href="#">Home Improvment</a>
                  </li>
                  <li>
                    <a href="#">Power &amp; Hand Tools</a>
                  </li>
                  <li>
                    <a href="#">Cookware</a>
                  </li>
                  <li>
                    <a href="#">Hardware</a>
                  </li>
                  <li>
                    <a href="#">Smart Home</a>
                  </li>
                </ul>
              </div>
            </BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
        </BentoMegaMenu>
      </PageLayout>
    </>
  );
};
