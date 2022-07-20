import * as Preact from '#preact';

import {BentoTimeago} from '../component';

const LOCALES = [
  'en-US',
  'en-GB',
  'fr',
  'ru',
  'ar',
  'he',
  'ja',
  'ZhTw',
  'zH-Tw',
];

export default {
  title: 'Timeago',
  component: BentoTimeago,
  args: {
    cutoff: 0,
    placeholder: 'Time passed!',
    dateTime: Date.now(),
  },
  argTypes: {
    dateTime: {
      name: 'dateTime',
      control: {type: 'date'},
    },
    locale: {
      name: 'locale',
      control: {type: 'select'},
      options: LOCALES,
      defaultValue: navigator.language || 'en-US',
    },
  },
};

export const _default = ({cutoff, dateTime, locale, placeholder}) => {
  return (
    <BentoTimeago
      datetime={dateTime}
      locale={locale}
      cutoff={cutoff}
      placeholder={placeholder}
    />
  );
};

export const WithIntersectionObserver = ({
  cutoff,
  dateTime,
  locale,
  placeholder,
}) => {
  return (
    <div>
      <p>
        Bacon ipsum dolor amet shankle salami tenderloin shoulder ball tip
        chislic chicken pork turkey jowl boudin sausage pancetta prosciutto.
        Beef ribs ball tip meatloaf tongue. Pig shank fatback kielbasa
        frankfurter ham, tongue sirloin capicola jerky pork loin sausage swine
        pork. Filet mignon pork belly pork landjaeger, buffalo ham fatback
        picanha alcatra leberkas. Shoulder shankle kielbasa biltong tail jowl
        bresaola pig turducken brisket. Hamburger shankle chicken ham hock
        boudin, rump ribeye. Spare ribs corned beef meatloaf cupim, biltong
        pancetta tenderloin tongue hamburger shankle. Pork belly meatball
        leberkas pork t-bone turkey porchetta filet mignon. Picanha turkey
        tongue kevin prosciutto ground round porchetta strip steak. Venison
        pancetta fatback shoulder chuck. Chislic filet mignon doner ribeye,
        swine short loin bresaola burgdoggen buffalo rump landjaeger chicken
        leberkas cow ground round. Beef ribs drumstick frankfurter ham chislic
        kielbasa shoulder venison shank. Bresaola pork chicken shoulder sirloin.
        Pork chop jerky tenderloin beef ribs ground round ribeye landjaeger
        shank tri-tip swine. Swine sirloin meatloaf chicken pastrami jerky
        shank. Porchetta swine jowl, alcatra andouille bresaola tri-tip brisket
        picanha. Spare ribs hamburger bresaola ham hock. Beef kevin kielbasa
        turducken tail fatback, pancetta salami cow venison meatball cupim jowl
        beef ribs. Tongue doner pork chop, tri-tip shank biltong short loin
        kielbasa chicken pancetta meatloaf salami capicola. Ground round chicken
        cupim spare ribs. Ham boudin andouille tenderloin ground round
        frankfurter leberkas tail bresaola picanha beef ribs venison short ribs
        hamburger ribeye. Drumstick bresaola ham pork chop pancetta tenderloin
        buffalo. Turkey beef ribs rump tri-tip beef doner jerky turducken
        kielbasa meatloaf venison picanha corned beef. Spare ribs bacon beef,
        sausage venison doner beef ribs picanha biltong porchetta prosciutto
        bresaola. Alcatra tri-tip beef ribs pastrami. Sirloin beef chicken
        ribeye jerky. Turkey shankle pig, alcatra chicken chislic cow
        prosciutto. Sausage shoulder burgdoggen leberkas. Brisket andouille cow,
        beef shankle filet mignon rump fatback doner ribeye t-bone. Cow pig
        andouille ham. Cupim alcatra strip steak sirloin. Corned beef turkey ham
        hock strip steak jowl, alcatra bacon. Bacon ribeye turducken, flank
        meatball porchetta venison beef. Pork belly ham strip steak cow
        hamburger shoulder turkey sirloin chicken picanha chislic porchetta pork
        t-bone ball tip. Landjaeger pancetta t-bone jowl chuck ball tip filet
        mignon biltong burgdoggen buffalo short loin hamburger tongue ham. Short
        ribs frankfurter doner, spare ribs kevin alcatra tri-tip beef ribs
        prosciutto ribeye chicken beef. Filet mignon short loin sirloin tongue,
        flank buffalo alcatra pork cow andouille beef shank boudin kevin.
        Chislic tail venison doner t-bone pastrami, pork loin burgdoggen
        porchetta swine short ribs landjaeger kevin. Sausage bresaola tongue,
        swine short ribs strip steak rump pancetta drumstick. Pork chop capicola
        beef picanha buffalo, chislic hamburger. Ham sirloin sausage tenderloin
        tri-tip rump shankle ribeye leberkas pig boudin. Buffalo bresaola
        shoulder sausage turducken, rump turkey short ribs beef ribs biltong
        alcatra short loin picanha capicola. Ribeye prosciutto meatloaf rump
        jowl pork belly porchetta alcatra chislic chicken ground round bacon.
        Capicola sausage shank, picanha strip steak pancetta drumstick
        prosciutto doner shankle buffalo corned beef jerky meatball pork chop.
        Pancetta corned beef pork chop boudin meatball shankle bresaola fatback
        kevin buffalo drumstick ball tip. Alcatra jerky tongue, swine pig
        burgdoggen buffalo tail. Chicken swine turducken pig, pastrami shankle
        sirloin alcatra ball tip t-bone short ribs jowl. Picanha shankle spare
        ribs tongue, hamburger shoulder t-bone ham hock doner. Picanha turkey
        tongue kevin prosciutto ground round porchetta strip steak. Venison
        pancetta fatback shoulder chuck. Chislic filet mignon doner ribeye,
        swine short loin bresaola burgdoggen buffalo rump landjaeger chicken
        leberkas cow ground round. Beef ribs drumstick frankfurter ham chislic
        kielbasa shoulder venison shank. Bresaola pork chicken shoulder sirloin.
        Pork chop jerky tenderloin beef ribs ground round ribeye landjaeger
        shank tri-tip swine. Swine sirloin meatloaf chicken pastrami jerky
        shank. Porchetta swine jowl, alcatra andouille bresaola tri-tip brisket
        picanha. Spare ribs hamburger bresaola ham hock. Beef kevin kielbasa
        turducken tail fatback, pancetta salami cow venison meatball cupim jowl
        beef ribs. Tongue doner pork chop, tri-tip shank biltong short loin
        kielbasa chicken pancetta meatloaf salami capicola. Ground round chicken
        cupim spare ribs. Ham boudin andouille tenderloin ground round
        frankfurter leberkas tail bresaola picanha beef ribs venison short ribs
        hamburger ribeye. Drumstick bresaola ham pork chop pancetta tenderloin
        buffalo. Turkey beef ribs rump tri-tip beef doner jerky turducken
        kielbasa meatloaf venison picanha corned beef. Spare ribs bacon beef,
        sausage venison doner beef ribs picanha biltong porchetta prosciutto
        bresaola. Alcatra tri-tip beef ribs pastrami. Sirloin beef chicken
        ribeye jerky. Turkey shankle pig, alcatra chicken chislic cow
        prosciutto. Sausage shoulder burgdoggen leberkas. Brisket andouille cow,
        beef shankle filet mignon rump fatback doner ribeye t-bone. Cow pig
        andouille ham. Cupim alcatra strip steak sirloin. Corned beef turkey ham
        hock strip steak jowl, alcatra bacon. Bacon ribeye turducken, flank
        meatball porchetta venison beef. Pork belly ham strip steak cow
        hamburger shoulder turkey sirloin chicken picanha chislic porchetta pork
        t-bone ball tip. Landjaeger pancetta t-bone jowl chuck ball tip filet
        mignon biltong burgdoggen buffalo short loin hamburger tongue ham. Short
        ribs frankfurter doner, spare ribs kevin alcatra tri-tip beef ribs
        prosciutto ribeye chicken beef. Filet mignon short loin sirloin tongue,
        flank buffalo alcatra pork cow andouille beef shank boudin kevin.
        Chislic tail venison doner t-bone pastrami, pork loin burgdoggen
        porchetta swine short ribs landjaeger kevin. Sausage bresaola tongue,
        swine short ribs strip steak rump pancetta drumstick. Pork chop capicola
        beef picanha buffalo, chislic hamburger. Ham sirloin sausage tenderloin
        tri-tip rump shankle ribeye leberkas pig boudin. Buffalo bresaola
        shoulder sausage turducken, rump turkey short ribs beef ribs biltong
        alcatra short loin picanha capicola. Ribeye prosciutto meatloaf rump
        jowl pork belly porchetta alcatra chislic chicken ground round bacon.
        Capicola sausage shank, picanha strip steak pancetta drumstick
        prosciutto doner shankle buffalo corned beef jerky meatball pork chop.
        Pancetta corned beef pork chop boudin meatball shankle bresaola fatback
        kevin buffalo drumstick ball tip. Alcatra jerky tongue, swine pig
        burgdoggen buffalo tail. Chicken swine turducken pig, pastrami shankle
        sirloin alcatra ball tip t-bone short ribs jowl. Picanha shankle spare
        ribs tongue, hamburger shoulder t-bone ham hock doner. Ribeye strip
        steak tail, leberkas spare ribs venison sausage. Pancetta sirloin
        venison porchetta burgdoggen. Burgdoggen turducken pork tongue meatloaf.
        Ham salami rump jerky boudin. Pork alcatra t-bone cupim, pancetta
        leberkas meatloaf shoulder drumstick. Pork capicola pancetta, meatball
        beef ribs andouille filet mignon shoulder shankle. Does your lorem ipsum
        text long for something a little meatier? Give our generator a try… it’s
        tasty!
      </p>
      <BentoTimeago
        datetime={dateTime}
        locale={locale}
        cutoff={cutoff}
        placeholder={placeholder}
      />
    </div>
  );
};

WithIntersectionObserver.storyName = 'IntersectionObserver';

WithIntersectionObserver.args = {
  cutoff: 0,
  placeholder: 'Time passed!',
};

WithIntersectionObserver.argTypes = {
  dateTime: {
    name: 'dateTime',
    control: {type: 'date'},
  },
  locale: {
    name: 'locale',
    control: {type: 'select'},
    options: LOCALES,
    defaultValue: navigator.language || 'en-US',
  },
};
