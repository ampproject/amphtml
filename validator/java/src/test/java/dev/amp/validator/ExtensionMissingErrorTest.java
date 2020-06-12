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

/**
 * Tests for {@link ExtensionMissingError}
 *
 * @author sphatak01
 */
public class ExtensionMissingErrorTest {

    @Test
    public void testConstructor() {
        final ExtensionMissingError error = new ExtensionMissingError("ext_missing",
                ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE).build());

        Assert.assertEquals(error.getMissingExtension(), "ext_missing");
        Assert.assertEquals(error.getMaybeError().getCode(), ValidatorProtos.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE);
    }
}
