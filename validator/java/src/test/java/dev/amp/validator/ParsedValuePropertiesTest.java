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

public class ParsedValuePropertiesTest {

    @Test
    public void testGetters() {
        final ValidatorProtos.PropertySpecList.Builder specListBuilder = ValidatorProtos.PropertySpecList.newBuilder();
        specListBuilder.addProperties(ValidatorProtos.PropertySpec.newBuilder().setName("prop1").setMandatory(true).build());
        specListBuilder.addProperties(ValidatorProtos.PropertySpec.newBuilder().setName("prop2").build());

        final ParsedValueProperties parsedValueProperties = new ParsedValueProperties(specListBuilder.build());

        Assert.assertEquals(parsedValueProperties.getValuePropertyByName().size(), 2);
        Assert.assertTrue(parsedValueProperties.getValuePropertyByName().containsKey("prop1"));
        Assert.assertTrue(parsedValueProperties.getValuePropertyByName().containsKey("prop2"));

        Assert.assertEquals(parsedValueProperties.getMandatoryValuePropertyNames().size(), 1);
        Assert.assertEquals(parsedValueProperties.getMandatoryValuePropertyNames().get(0), "prop1");

        parsedValueProperties.cleanup();

        Assert.assertNull(parsedValueProperties.getValuePropertyByName());
        Assert.assertNull(parsedValueProperties.getMandatoryValuePropertyNames());
    }
}
