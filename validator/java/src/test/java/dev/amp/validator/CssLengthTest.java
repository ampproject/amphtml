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
 * Changes to the original project are Copyright 2019, Oath Inc..
 */

package dev.amp.validator;

import org.testng.Assert;
import org.testng.annotations.Test;

public class CssLengthTest {

    @Test
    public void testNullInput() {
        final CssLength cssLength = new CssLength(null, true, true);
        Assert.assertTrue(cssLength.isValid());
        Assert.assertFalse(cssLength.isFluid());
        Assert.assertFalse(cssLength.isAuto());
        Assert.assertFalse(cssLength.isSet());
    }

    @Test
    public void testAutoInput() {
        final CssLength cssLength = new CssLength("auto", true, true);
        Assert.assertTrue(cssLength.isAuto());
        Assert.assertTrue(cssLength.isValid());
        Assert.assertFalse(cssLength.isFluid());
        Assert.assertTrue(cssLength.isSet());

    }

    @Test
    public void testFluidInput() {
        final CssLength cssLength = new CssLength("fluid", true, true);
        Assert.assertFalse(cssLength.isAuto());
        Assert.assertTrue(cssLength.isFluid());
        Assert.assertTrue(cssLength.isValid());
        Assert.assertTrue(cssLength.isSet());

    }

    @Test
    public void testPxInput() {
        final CssLength cssLength = new CssLength("800px", true, true);
        Assert.assertFalse(cssLength.isAuto());
        Assert.assertFalse(cssLength.isFluid());
        Assert.assertTrue(cssLength.isValid());
        Assert.assertEquals(cssLength.getNumeral(), new Float(800.0));
        Assert.assertEquals(cssLength.getUnit(), "px");
        Assert.assertTrue(cssLength.isSet());

    }

    @Test
    public void testRemInput() {
        final CssLength cssLength = new CssLength("800rem", true, true);
        Assert.assertFalse(cssLength.isAuto());
        Assert.assertFalse(cssLength.isFluid());
        Assert.assertTrue(cssLength.isValid());
        Assert.assertEquals(cssLength.getNumeral(), new Float(800.0));
        Assert.assertEquals(cssLength.getUnit(), "rem");
        Assert.assertTrue(cssLength.isSet());

    }
}
