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

import java.util.Collections;

/**
 * Tests for {@link SrcsetParsingResult}
 *
 * @author sphatak01
 */
public class SrcsetParsingResultTest {

    @Test
    public void testSettersGetters() {
        final SrcsetParsingResult srcsetParsingResult = new SrcsetParsingResult();
        Assert.assertFalse(srcsetParsingResult.isSuccess());
        srcsetParsingResult.setSuccess(true);
        Assert.assertTrue(srcsetParsingResult.isSuccess());

        Assert.assertEquals(srcsetParsingResult.getErrorCode(), ValidatorProtos.ValidationError.Code.UNKNOWN_CODE);
        srcsetParsingResult.setErrorCode(ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);
        Assert.assertEquals(srcsetParsingResult.getErrorCode(), ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);

        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().size(), 0);
        Assert.assertEquals(srcsetParsingResult.getSrcsetImagesSize(), 0);
        srcsetParsingResult.add(new SrcsetSourceDef("url1", "23"));
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().size(), 1);
        Assert.assertEquals(srcsetParsingResult.getSrcsetImagesSize(), 1);
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().get(0).getUrl(), "url1");
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().get(0).getWidthOrPixelDensity(), "23");

        srcsetParsingResult.setSrcsetImages(Collections.singletonList(new SrcsetSourceDef("url2", "22")));
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().size(), 1);
        Assert.assertEquals(srcsetParsingResult.getSrcsetImagesSize(), 1);
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().get(0).getUrl(), "url2");
        Assert.assertEquals(srcsetParsingResult.getSrcsetImages().get(0).getWidthOrPixelDensity(), "22");
    }
}
