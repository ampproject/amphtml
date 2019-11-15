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
 * Tests for {@link TagStackEntry}
 *
 * @author sphatak01
 */
public class TagStackEntryTest {

    @Test
    public void testSettersgetters() {
        final TagStackEntry tagStackEntry = new TagStackEntry("tagName");

        Assert.assertEquals(tagStackEntry.getTagName(), "tagName");
        Assert.assertNull(tagStackEntry.getTagSpec());
        Assert.assertNull(tagStackEntry.getReferencePoint());
        Assert.assertFalse(tagStackEntry.getHasDescendantConstraintLists());
        Assert.assertEquals(tagStackEntry.getNumChildren(), 0);
        Assert.assertEquals(tagStackEntry.getOnlyChildTagName(), "");
        Assert.assertNull(tagStackEntry.getOnlyChildErrorLineCol());
        Assert.assertEquals(tagStackEntry.getLastChildTagName(), "");
        Assert.assertEquals(tagStackEntry.getLastChildUrl(), "");
        Assert.assertNull(tagStackEntry.getOnlyChildErrorLineCol());
        Assert.assertNull(tagStackEntry.getCdataMatcher());
        Assert.assertNull(tagStackEntry.getChildTagMatcher());
        Assert.assertNull(tagStackEntry.getReferencePointMatcher());

        tagStackEntry.cleanup();
    }
}