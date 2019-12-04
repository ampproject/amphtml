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
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.List;

/**
 * This class tests {@code AMPValidatorManagerTest}.
 *
 * @author nhant01
 *
 */

public class AMPValidatorManagerTest {
    /**
     * Initialization method to load the rules.
     *
     * @throws Exception if fails to load the rules.
     */
    @BeforeClass
    public void init() throws Exception {
        ampValidatorManager = new AMPValidatorManager();
        ampValidatorManager.loadRule();
    }

    /**
     * Validating if a tag exists for a given specific HtmlFormat type.
     */
    @Test
    public void testHasTagSpec() {
        boolean hasTag = ampValidatorManager.hasTagSpec(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, "H");
        Assert.assertFalse(hasTag, "AMP4EMAIL html format should not contain H tag");

        hasTag = ampValidatorManager.hasTagSpec(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, "A");
        Assert.assertTrue(hasTag, "AMP4EMAIL html format should contain A tag");
    }

    /**
     * Validating to ensure a list of tag returns if exists for given a specific HtmlFormat type.
     */
    @Test
    public void testGetTagSpec() {
        List<ValidatorProtos.TagSpec> tagSpec = ampValidatorManager.getTagSpec(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, "H");
        Assert.assertNull(tagSpec, "AMP4EMAIL html format should not contain H tag");

        tagSpec = ampValidatorManager.getTagSpec(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, "STYLE");
        Assert.assertNotNull(tagSpec, "AMP4EMAIL html format should contain STYLE tag");
        Assert.assertEquals(tagSpec.size(), 3, "AMP4EMAIL htmlformat contains STYLE tag with size 2");
    }

    /** AMPValidatorManager object. */
    private AMPValidatorManager ampValidatorManager;
}
