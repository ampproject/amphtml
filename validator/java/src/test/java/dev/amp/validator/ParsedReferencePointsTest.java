/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator;

import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Tests for {@link ParsedReferencePoints}
 *
 * @author sphatak01
 */

public class ParsedReferencePointsTest {

    @Test
    public void testGettersSetters() {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder1 = ValidatorProtos.ReferencePoint.newBuilder();
        refPointBuilder1.setTagSpecName("AMP-NEXT-PAGE > [separator]");
        refPointBuilder1.setUnique(true);

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder2 = ValidatorProtos.ReferencePoint.newBuilder();
        refPointBuilder2.setTagSpecName("amp-next-page extension .json configuration");
        refPointBuilder2.setUnique(false);

        tagSpecBuilder.addReferencePoints(refPointBuilder1.build());
        tagSpecBuilder.addReferencePoints(refPointBuilder2.build());
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#svg");
        tagSpecBuilder.setSpecName("lineargradient > stop");

        final ParsedReferencePoints parsedReferencePoints = new ParsedReferencePoints(tagSpecBuilder.build());
        Assert.assertFalse(parsedReferencePoints.empty());
        Assert.assertEquals(parsedReferencePoints.size(), 2);
        Assert.assertEquals(parsedReferencePoints.iterate().get(0).getTagSpecName(), "AMP-NEXT-PAGE > [separator]");
        Assert.assertTrue(parsedReferencePoints.iterate().get(0).getUnique());
        Assert.assertEquals(parsedReferencePoints.iterate().get(1).getTagSpecName(),
                "amp-next-page extension .json configuration");
        Assert.assertFalse(parsedReferencePoints.iterate().get(1).getUnique());
        Assert.assertEquals(parsedReferencePoints.parentSpecUrl(),
                "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#svg");
        Assert.assertEquals(parsedReferencePoints.parentTagSpecName(), "lineargradient > stop");

        parsedReferencePoints.cleanup();
    }
}
