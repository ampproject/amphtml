import {extractTextContent} from '../semantic-render';

describes.fakeWin('amp-story semantic-render', {}, () => {
  describe('text extraction WebVTT', () => {
    it('should turn WebVTT into plain text example 1', () => {
      expect(
        extractTextContent(`WEBVTT

00:00.000 --> 00:02.000
<v Jon Newmuis>(Jon Newmuis) &auml;
<v Jon Newmuis>So today, we're excited to announce the developer

00:02.000 --> 00:06.000
<v Jon Newmuis>preview of AMP stories, an open format for visual storytelling

00:06.000 --> 00:09.000
<v Jon Newmuis>on mobile.

00:09.000 --> 00:12.500
<v Jon Newmuis>To demonstrate, here's a story by CNN using the format.

00:12.500 --> 00:16.500
<v Jon Newmuis>As you can see, it's very visual with these full bleed images.

00:16.500 --> 00:19.000
<v Jon Newmuis>And you can also include video assets as well.

00:19.000 --> 00:22.000
<v Jon Newmuis>The short-form bite-sized text is more easily

00:22.000 --> 00:24.000
<v Jon Newmuis>consumable on mobile.`)
      ).to.equal(
        `(Jon Newmuis) ä So today, we're excited to announce the developer preview of AMP stories, an open format for visual storytelling on mobile. To demonstrate, here's a story by CNN using the format. As you can see, it's very visual with these full bleed images. And you can also include video assets as well. The short-form bite-sized text is more easily consumable on mobile.`
      );
    });

    it('should turn WebVTT into plain text example with lots of features', () => {
      expect(
        extractTextContent(`WEBVTT

STYLE
::cue {
  background-image: linear-gradient(to bottom, dimgray, lightgray);
  color: papayawhip;
}
/* Style blocks cannot use blank lines nor "dash dash greater than" */

NOTE comment blocks can be used between style blocks.

STYLE
::cue(b) {
  color: peachpuff;
}

hello
00:00:00.000 --> 00:00:10.000
Hello <b>world</b>.

NOTE style blocks cannot appear after the first cue.`)
      ).to.equal(`Hello world.`);
    });
  });

  describe('text extraction TTML', () => {
    it('should turn TTML into plain text example 1', () => {
      expect(
        extractTextContent(`<?xml version="1.0" encoding="UTF-8"?>
        <tt xmlns="http://www.w3.org/ns/ttml">
          <head>
            <metadata xmlns:ttm="http://www.w3.org/ns/ttml#metadata">
              <ttm:title>Timed Text TTML Example</ttm:title>
              <ttm:copyright>The Authors (c) 2006</ttm:copyright>
            </metadata>
            <styling xmlns:tts="http://www.w3.org/ns/ttml#styling">
              <!-- s1 specifies default color, font, and text alignment -->
              <style xml:id="s1"
                tts:color="white"
                tts:fontFamily="proportionalSansSerif"
                tts:fontSize="22px"
                tts:textAlign="center"
              />
              <!-- alternative using yellow text but otherwise the same as style s1 -->
              <style xml:id="s2" style="s1" tts:color="yellow"/>
              <!-- a style based on s1 but justified to the right -->
              <style xml:id="s1Right" style="s1" tts:textAlign="end" />     
              <!-- a style based on s2 but justified to the left -->
              <style xml:id="s2Left" style="s2" tts:textAlign="start" />
            </styling>
            <layout xmlns:tts="http://www.w3.org/ns/ttml#styling">
              <region xml:id="subtitleArea"
                style="s1"
                tts:extent="560px 62px"
                tts:padding="5px 3px"
                tts:backgroundColor="black"
                tts:displayAlign="after"
              />
            </layout> 
          </head>
          <body region="subtitleArea">
            <div>
              <p xml:id="subtitle1" begin="0.76s" end="3.45s">
                It seems a paradox, does it not,
              </p>
              <p xml:id="subtitle2" begin="5.0s" end="10.0s">
                that the image formed on<br/>
                the Retina should be inverted?
              </p>
              <p xml:id="subtitle3" begin="10.0s" end="16.0s" style="s2">
                It is puzzling, why is it<br/>
                we do not see things upside-down?
              </p>
              <p xml:id="subtitle4" begin="17.2s" end="23.0s">
                You have never heard the Theory,<br/>
                then, that the Brain also is inverted?
              </p>
              <p xml:id="subtitle5" begin="23.0s" end="27.0s" style="s2">
                No indeed! What a beautiful fact!
              </p>
            </div>
          </body>
        </tt>`)
      ).to.equal(
        `It seems a paradox, does it not, that the image formed on the Retina should be inverted? It is puzzling, why is it we do not see things upside-down? You have never heard the Theory, then, that the Brain also is inverted? No indeed! What a beautiful fact!`
      );
    });
  });
});
