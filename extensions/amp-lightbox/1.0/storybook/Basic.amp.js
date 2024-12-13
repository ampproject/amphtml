import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-lightbox-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-lightbox', version: '1.0'}],
  },
  argTypes: {
    animation: {
      name: 'animation',
      control: {type: 'select'},
      options: ['fade-in', 'fly-in-top', 'fly-in-bottom'],
    },
    backgroundColor: {
      name: 'background color',
      control: {type: 'text'},
      defaultValue: '',
    },
    color: {
      name: 'font color',
      control: {type: 'text'},
      defaultValue: '',
    },
    lotsOfText: {
      name: 'lotsOfText',
      control: {type: 'boolean'},
      defaultValue: true,
    },
  },
};

export const Default = ({animation, backgroundColor, color, ...args}) => {
  return (
    <>
      <style>{`
        #lightbox {
          background-color: ${backgroundColor};
          color: ${color};
        }
      `}</style>
      <div style="height: 300px;">
        <amp-lightbox
          id="lightbox"
          layout="nodisplay"
          animation={animation}
          {...args}
        >
          <p>Test</p>
          <button slot="close-button">Close</button>
        </amp-lightbox>
        <div class="buttons">
          <button on="tap:lightbox">Open</button>
        </div>
      </div>
    </>
  );
};

export const OverflowAuto = ({
  animation,
  backgroundColor,
  color,
  lotsOfText,
  ...args
}) => {
  return (
    <>
      <style>{`
        #lightbox {
          background-color: ${backgroundColor};
          color: ${color};
        }
      `}</style>
      <div style="height: 300px;">
        <amp-lightbox
          id="lightbox"
          layout="nodisplay"
          animation={animation}
          {...args}
        >
          <p>
            Dessert tootsie roll marzipan pastry. Powder powder jelly beans
            chocolate bar candy sugar plum. Jelly-o gummi bears jelly icing
            cotton candy. Toffee carrot cake ice cream sesame snaps sugar plum
            gummies. Gummies marshmallow candy chocolate bar ice cream ice cream
            gummies chocolate cake. Candy ice cream pie danish ice cream cake
            gingerbread. Muffin cookie marzipan marzipan jelly beans gummies
            candy muffin dessert. Soufflé chocolate tart tootsie roll tootsie
            roll gingerbread icing powder. Dessert croissant macaroon candy
            liquorice. Gingerbread gummi bears croissant wafer cookie cookie
            bonbon. Marshmallow fruitcake lollipop sweet roll danish dragée
            cupcake. Tootsie roll cotton candy dragée chocolate bar tootsie roll
            cheesecake cookie muffin. Toffee sesame snaps gingerbread wafer
            cotton candy bonbon gingerbread toffee.
          </p>

          {lotsOfText && (
            <>
              <p>
                Danish cupcake chocolate candy chocolate bar. Topping brownie
                toffee oat cake liquorice marzipan cheesecake chupa chups.
                Pastry carrot cake jelly beans chocolate cake liquorice sesame
                snaps caramels. Apple pie marshmallow chupa chups lemon drops
                pudding cotton candy pie apple pie oat cake. Sugar plum halvah
                cotton candy tiramisu sweet dragée cookie pastry. Macaroon
                bonbon jujubes. Halvah tiramisu brownie topping donut cookie
                tart. Jelly lemon drops soufflé pie chocolate bar donut tootsie
                roll bear claw cake. Chocolate cake powder dessert. Pudding
                wafer danish chupa chups donut chocolate sweet carrot cake.
                Sugar plum cheesecake brownie chocolate sweet tart marzipan oat
                cake dessert. Gummi bears sugar plum bonbon chocolate cake.
                Croissant marzipan brownie dessert donut cotton candy croissant
                powder. Chocolate cake tootsie roll sweet roll gummi bears donut
                fruitcake jelly beans carrot cake.
              </p>

              <p>
                Brownie gummies danish lollipop caramels wafer gingerbread
                macaroon carrot cake. Brownie powder donut gummi bears pudding
                cupcake. Lemon drops croissant apple pie sesame snaps marzipan.
                Biscuit chocolate cake jelly-o pie caramels gingerbread caramels
                chupa chups donut. Sweet roll oat cake cake. Cheesecake candy
                canes candy canes candy canes topping pastry sweet cheesecake.
                Jelly-o gummies topping marshmallow dessert tiramisu cake bonbon
                chupa chups. Chocolate biscuit danish tart bear claw. Tiramisu
                carrot cake jelly-o pie sweet cake. Sesame snaps lollipop cookie
                chocolate cake wafer dragée. Powder brownie danish. Pastry
                chocolate cake sweet roll halvah cupcake dragée.
              </p>

              <p>
                Cake carrot cake icing danish biscuit carrot cake marzipan
                croissant. Cake cake gummi bears fruitcake sweet dessert toffee
                chocolate cake. Ice cream carrot cake donut jelly beans. Jelly
                wafer sugar plum sweet icing candy canes. Bonbon marshmallow
                donut pudding jelly-o tiramisu pastry cake bonbon. Jelly candy
                canes liquorice cupcake liquorice dessert halvah toffee. Jelly
                chocolate macaroon topping cupcake tootsie roll liquorice
                brownie lollipop. Chupa chups wafer cupcake candy cookie oat
                cake cookie bear claw. Carrot cake pudding biscuit tiramisu ice
                cream sugar plum. Topping lemon drops dragée cake liquorice
                apple pie ice cream. Cotton candy lollipop lemon drops apple pie
                tootsie roll pie marshmallow chocolate jelly-o. Pastry bonbon
                cupcake dragée candy.
              </p>

              <p>
                Ice cream dragée pudding pastry biscuit tart cookie. Oat cake
                ice cream apple pie oat cake dessert soufflé caramels apple pie.
                Gummies bear claw powder cake icing jelly beans jelly beans
                marzipan lollipop. Lollipop brownie jelly beans pudding. Ice
                cream jelly biscuit pie tiramisu tootsie roll gummies biscuit.
                Cupcake biscuit biscuit chocolate bar liquorice caramels powder
                cotton candy muffin. Sesame snaps tiramisu croissant. Soufflé
                chocolate jelly-o topping. Lemon drops candy canes sweet carrot
                cake chocolate cake tootsie roll wafer marshmallow. Jelly beans
                bear claw jelly-o sesame snaps carrot cake. Pudding jelly candy
                carrot cake fruitcake carrot cake candy canes sesame snaps.
                Marzipan icing caramels chocolate tart powder cookie halvah.
                Fruitcake dragée muffin tart. Jelly-o cupcake marshmallow
                pudding gummies muffin topping caramels.
              </p>

              <p>
                Liquorice bear claw marshmallow dessert. Bear claw toffee pastry
                tiramisu apple pie oat cake. Tiramisu jelly gingerbread cake
                cake sweet roll cupcake ice cream jelly. Fruitcake jelly beans
                macaroon soufflé jelly beans marzipan caramels candy. Cheesecake
                candy canes pudding icing icing. Dragée chocolate bar bear claw
                dragée donut brownie cake sweet roll. Wafer bear claw dragée
                icing sesame snaps topping. Cake marzipan bear claw dessert bear
                claw lollipop halvah wafer halvah. Icing sweet roll toffee sweet
                powder sesame snaps gummies tart danish. Ice cream toffee
                caramels danish. Jelly-o lollipop lollipop dessert sesame snaps
                bear claw gummi bears. Donut sweet roll marzipan fruitcake oat
                cake cake icing cotton candy oat cake. Gingerbread carrot cake
                sesame snaps gummies candy dragée lollipop soufflé biscuit.
                Pudding jujubes chocolate halvah sesame snaps tiramisu sweet
                marshmallow chocolate bar.
              </p>

              <p>
                Donut carrot cake apple pie powder marshmallow sesame snaps
                tiramisu. Sweet roll powder cookie. Lollipop sugar plum oat
                cake. Marshmallow wafer danish wafer gingerbread cake muffin
                candy dragée. Candy cotton candy topping cake cotton candy
                carrot cake fruitcake brownie. Toffee candy candy canes jelly-o
                cotton candy gummies. Bonbon bonbon pie sugar plum. Oat cake
                sesame snaps pudding candy canes gummi bears macaroon jelly
                beans brownie. Sesame snaps halvah halvah jelly-o dessert.
                Jelly-o chocolate sweet roll donut candy. Cotton candy halvah
                macaroon tiramisu tart. Jelly toffee candy pie toffee.
              </p>

              <p>
                Powder chupa chups muffin jelly-o soufflé. Lollipop sweet roll
                sweet roll brownie pastry tootsie roll. Topping cheesecake pie
                jelly. Donut wafer wafer cake candy canes. Topping chocolate bar
                cheesecake topping ice cream tiramisu toffee ice cream. Bonbon
                halvah marshmallow. Marzipan topping chupa chups dessert
                chocolate chocolate cake gummi bears. Gummi bears caramels sugar
                plum. Pie donut jelly beans tiramisu soufflé pie powder. Cupcake
                cookie topping. Tootsie roll candy canes jujubes croissant
                liquorice ice cream brownie. Topping cookie apple pie gummi
                bears bear claw jelly-o brownie tart. Marzipan cotton candy
                gummi bears. Dragée ice cream gummi bears jelly-o carrot cake
                chocolate bar tiramisu jelly cotton candy.
              </p>
            </>
          )}
          <button slot="close-button" on="tap:lightbox.close">
            Close
          </button>
        </amp-lightbox>
        <div class="buttons">
          <button on="tap:lightbox">Open</button>
        </div>
        <p>
          Dessert tootsie roll marzipan pastry. Powder powder jelly beans
          chocolate bar candy sugar plum. Jelly-o gummi bears jelly icing cotton
          candy. Toffee carrot cake ice cream sesame snaps sugar plum gummies.
          Gummies marshmallow candy chocolate bar ice cream ice cream gummies
          chocolate cake. Candy ice cream pie danish ice cream cake gingerbread.
          Muffin cookie marzipan marzipan jelly beans gummies candy muffin
          dessert. Soufflé chocolate tart tootsie roll tootsie roll gingerbread
          icing powder. Dessert croissant macaroon candy liquorice. Gingerbread
          gummi bears croissant wafer cookie cookie bonbon. Marshmallow
          fruitcake lollipop sweet roll danish dragée cupcake. Tootsie roll
          cotton candy dragée chocolate bar tootsie roll cheesecake cookie
          muffin. Toffee sesame snaps gingerbread wafer cotton candy bonbon
          gingerbread toffee.
        </p>

        <p>
          Danish cupcake chocolate candy chocolate bar. Topping brownie toffee
          oat cake liquorice marzipan cheesecake chupa chups. Pastry carrot cake
          jelly beans chocolate cake liquorice sesame snaps caramels. Apple pie
          marshmallow chupa chups lemon drops pudding cotton candy pie apple pie
          oat cake. Sugar plum halvah cotton candy tiramisu sweet dragée cookie
          pastry. Macaroon bonbon jujubes. Halvah tiramisu brownie topping donut
          cookie tart. Jelly lemon drops soufflé pie chocolate bar donut tootsie
          roll bear claw cake. Chocolate cake powder dessert. Pudding wafer
          danish chupa chups donut chocolate sweet carrot cake. Sugar plum
          cheesecake brownie chocolate sweet tart marzipan oat cake dessert.
          Gummi bears sugar plum bonbon chocolate cake. Croissant marzipan
          brownie dessert donut cotton candy croissant powder. Chocolate cake
          tootsie roll sweet roll gummi bears donut fruitcake jelly beans carrot
          cake.
        </p>

        <p>
          Brownie gummies danish lollipop caramels wafer gingerbread macaroon
          carrot cake. Brownie powder donut gummi bears pudding cupcake. Lemon
          drops croissant apple pie sesame snaps marzipan. Biscuit chocolate
          cake jelly-o pie caramels gingerbread caramels chupa chups donut.
          Sweet roll oat cake cake. Cheesecake candy canes candy canes candy
          canes topping pastry sweet cheesecake. Jelly-o gummies topping
          marshmallow dessert tiramisu cake bonbon chupa chups. Chocolate
          biscuit danish tart bear claw. Tiramisu carrot cake jelly-o pie sweet
          cake. Sesame snaps lollipop cookie chocolate cake wafer dragée. Powder
          brownie danish. Pastry chocolate cake sweet roll halvah cupcake
          dragée.
        </p>

        <p>
          Cake carrot cake icing danish biscuit carrot cake marzipan croissant.
          Cake cake gummi bears fruitcake sweet dessert toffee chocolate cake.
          Ice cream carrot cake donut jelly beans. Jelly wafer sugar plum sweet
          icing candy canes. Bonbon marshmallow donut pudding jelly-o tiramisu
          pastry cake bonbon. Jelly candy canes liquorice cupcake liquorice
          dessert halvah toffee. Jelly chocolate macaroon topping cupcake
          tootsie roll liquorice brownie lollipop. Chupa chups wafer cupcake
          candy cookie oat cake cookie bear claw. Carrot cake pudding biscuit
          tiramisu ice cream sugar plum. Topping lemon drops dragée cake
          liquorice apple pie ice cream. Cotton candy lollipop lemon drops apple
          pie tootsie roll pie marshmallow chocolate jelly-o. Pastry bonbon
          cupcake dragée candy.
        </p>

        <p>
          Ice cream dragée pudding pastry biscuit tart cookie. Oat cake ice
          cream apple pie oat cake dessert soufflé caramels apple pie. Gummies
          bear claw powder cake icing jelly beans jelly beans marzipan lollipop.
          Lollipop brownie jelly beans pudding. Ice cream jelly biscuit pie
          tiramisu tootsie roll gummies biscuit. Cupcake biscuit biscuit
          chocolate bar liquorice caramels powder cotton candy muffin. Sesame
          snaps tiramisu croissant. Soufflé chocolate jelly-o topping. Lemon
          drops candy canes sweet carrot cake chocolate cake tootsie roll wafer
          marshmallow. Jelly beans bear claw jelly-o sesame snaps carrot cake.
          Pudding jelly candy carrot cake fruitcake carrot cake candy canes
          sesame snaps. Marzipan icing caramels chocolate tart powder cookie
          halvah. Fruitcake dragée muffin tart. Jelly-o cupcake marshmallow
          pudding gummies muffin topping caramels.
        </p>

        <p>
          Liquorice bear claw marshmallow dessert. Bear claw toffee pastry
          tiramisu apple pie oat cake. Tiramisu jelly gingerbread cake cake
          sweet roll cupcake ice cream jelly. Fruitcake jelly beans macaroon
          soufflé jelly beans marzipan caramels candy. Cheesecake candy canes
          pudding icing icing. Dragée chocolate bar bear claw dragée donut
          brownie cake sweet roll. Wafer bear claw dragée icing sesame snaps
          topping. Cake marzipan bear claw dessert bear claw lollipop halvah
          wafer halvah. Icing sweet roll toffee sweet powder sesame snaps
          gummies tart danish. Ice cream toffee caramels danish. Jelly-o
          lollipop lollipop dessert sesame snaps bear claw gummi bears. Donut
          sweet roll marzipan fruitcake oat cake cake icing cotton candy oat
          cake. Gingerbread carrot cake sesame snaps gummies candy dragée
          lollipop soufflé biscuit. Pudding jujubes chocolate halvah sesame
          snaps tiramisu sweet marshmallow chocolate bar.
        </p>

        <p>
          Donut carrot cake apple pie powder marshmallow sesame snaps tiramisu.
          Sweet roll powder cookie. Lollipop sugar plum oat cake. Marshmallow
          wafer danish wafer gingerbread cake muffin candy dragée. Candy cotton
          candy topping cake cotton candy carrot cake fruitcake brownie. Toffee
          candy candy canes jelly-o cotton candy gummies. Bonbon bonbon pie
          sugar plum. Oat cake sesame snaps pudding candy canes gummi bears
          macaroon jelly beans brownie. Sesame snaps halvah halvah jelly-o
          dessert. Jelly-o chocolate sweet roll donut candy. Cotton candy halvah
          macaroon tiramisu tart. Jelly toffee candy pie toffee.
        </p>

        <p>
          Powder chupa chups muffin jelly-o soufflé. Lollipop sweet roll sweet
          roll brownie pastry tootsie roll. Topping cheesecake pie jelly. Donut
          wafer wafer cake candy canes. Topping chocolate bar cheesecake topping
          ice cream tiramisu toffee ice cream. Bonbon halvah marshmallow.
          Marzipan topping chupa chups dessert chocolate chocolate cake gummi
          bears. Gummi bears caramels sugar plum. Pie donut jelly beans tiramisu
          soufflé pie powder. Cupcake cookie topping. Tootsie roll candy canes
          jujubes croissant liquorice ice cream brownie. Topping cookie apple
          pie gummi bears bear claw jelly-o brownie tart. Marzipan cotton candy
          gummi bears. Dragée ice cream gummi bears jelly-o carrot cake
          chocolate bar tiramisu jelly cotton candy.
        </p>
      </div>
    </>
  );
};

Default.storyName = 'Default';
