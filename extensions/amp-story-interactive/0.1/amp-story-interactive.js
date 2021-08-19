import {AmpStoryInteractiveBinaryPoll} from './amp-story-interactive-binary-poll';
import {AmpStoryInteractiveImgPoll} from './amp-story-interactive-img-poll';
import {AmpStoryInteractiveImgQuiz} from './amp-story-interactive-img-quiz';
import {AmpStoryInteractivePoll} from './amp-story-interactive-poll';
import {AmpStoryInteractiveQuiz} from './amp-story-interactive-quiz';
import {AmpStoryInteractiveResults} from './amp-story-interactive-results';
import {AmpStoryInteractiveResultsDetailed} from './amp-story-interactive-results-detailed';
import {AmpStoryInteractiveSlider} from './amp-story-interactive-slider';

/**
 * This extension imports the interactive components into amp-story.
 */

AMP.extension('amp-story-interactive', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-story-interactive-binary-poll',
    AmpStoryInteractiveBinaryPoll
  );
  AMP.registerElement(
    'amp-story-interactive-img-poll',
    AmpStoryInteractiveImgPoll
  );
  AMP.registerElement(
    'amp-story-interactive-img-quiz',
    AmpStoryInteractiveImgQuiz
  );
  AMP.registerElement('amp-story-interactive-poll', AmpStoryInteractivePoll);
  AMP.registerElement('amp-story-interactive-quiz', AmpStoryInteractiveQuiz);
  AMP.registerElement(
    'amp-story-interactive-slider',
    AmpStoryInteractiveSlider
  );
  AMP.registerElement(
    'amp-story-interactive-slider',
    AmpStoryInteractiveSlider
  );
  AMP.registerElement(
    'amp-story-interactive-slider',
    AmpStoryInteractiveSlider
  );
  AMP.registerElement(
    'amp-story-interactive-results',
    AmpStoryInteractiveResults
  );
  AMP.registerElement(
    'amp-story-interactive-results-detailed',
    AmpStoryInteractiveResultsDetailed
  );
});
