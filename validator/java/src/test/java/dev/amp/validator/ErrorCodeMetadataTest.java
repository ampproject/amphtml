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
 * Test for class {@link ErrorCodeMetadata}
 *
 * @author sphatak01
 */
public class ErrorCodeMetadataTest {

    @Test
    public void testGettersSetters() {
        final ErrorCodeMetadata errorCodeMetadata = new ErrorCodeMetadata();

        errorCodeMetadata.setFormat("html");
        errorCodeMetadata.setSpecificity(10);

        Assert.assertEquals(errorCodeMetadata.getFormat(), "html");
        Assert.assertEquals(errorCodeMetadata.getSpecificity(), 10);
    }

}