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

import java.util.List;

/**
 * Tests for {@link TagSpecDispatch}
 *
 * @author sphatak01
 */
public class TagSpecDispatchTest {

    @Test
    public void testRegisterDispatchKeyAndTagSpec() {
        final TagSpecDispatch tagSpecDispatch = new TagSpecDispatch();

        final String dispatchKey1 = "dk1";

        final int tagSpecId1 = 10;
        final int tagSpecId2 = 9;
        tagSpecDispatch.registerDispatchKey(dispatchKey1, tagSpecId1);
        tagSpecDispatch.registerDispatchKey(dispatchKey1, tagSpecId2);

        tagSpecDispatch.registerTagSpec(tagSpecId1);
        tagSpecDispatch.registerTagSpec(tagSpecId2);

        Assert.assertFalse(tagSpecDispatch.empty());
        Assert.assertTrue(tagSpecDispatch.hasDispatchKeys());
        Assert.assertTrue(tagSpecDispatch.hasTagSpecs());
        Assert.assertEquals(tagSpecDispatch.allTagSpecs().size(), 2);
        Assert.assertEquals(tagSpecDispatch.allTagSpecs().get(0), Integer.valueOf(10));
        Assert.assertEquals(tagSpecDispatch.allTagSpecs().get(1), Integer.valueOf(9));
    }

    @Test
    public void testMatchingDispatchKeyEmpty() {
        final TagSpecDispatch tagSpecDispatch = new TagSpecDispatch();

        Assert.assertTrue(tagSpecDispatch.matchingDispatchKey("attr1", "value1", "manPar1").isEmpty());
    }

    @Test
    public void testMatchingNameValueDispatchKey() {
        final String attrName = "content";
        final String attrValue = "val1";

        final TagSpecDispatch tagSpecDispatch = new TagSpecDispatch();
        tagSpecDispatch.registerDispatchKey(attrName + "\0" + attrValue, 10);
        tagSpecDispatch.registerDispatchKey(attrName + "\0" + attrValue + "\0" + "true", 11);

        final List<Integer> matchingKeys = tagSpecDispatch.matchingDispatchKey("content", "val1", "HEAD");

        Assert.assertEquals(matchingKeys.size(), 2);
        Assert.assertEquals(matchingKeys.get(0).intValue(), 11);
        Assert.assertEquals(matchingKeys.get(1).intValue(), 10);

    }

    @Test
    public void testMatchingNameDispatchKey() {
        final String attrName = "content";

        final TagSpecDispatch tagSpecDispatch = new TagSpecDispatch();
        tagSpecDispatch.registerDispatchKey(attrName, 10);

        final List<Integer> matchingKeys = tagSpecDispatch.matchingDispatchKey("content", "val1", "HEAD");

        Assert.assertEquals(matchingKeys.size(), 1);
        Assert.assertEquals(matchingKeys.get(0).intValue(), 10);

    }

    @Test
    public void testMatchingDispatchKeySameNameAndValue() {
        final String attrName = "foo";

        final TagSpecDispatch tagSpecDispatch = new TagSpecDispatch();
        tagSpecDispatch.registerDispatchKey(attrName, 10);

        final List<Integer> matchingKeys = tagSpecDispatch.matchingDispatchKey("foo", "foo", "HEAD");

        Assert.assertEquals(matchingKeys.size(), 2);
        Assert.assertEquals(matchingKeys.get(0).intValue(), 10);
        Assert.assertEquals(matchingKeys.get(1).intValue(), 10);
    }
}
