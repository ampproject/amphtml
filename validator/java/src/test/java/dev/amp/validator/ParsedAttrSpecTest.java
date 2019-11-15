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

import amp.validator.Validator;
import com.google.common.collect.ImmutableList;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test for {@link ParsedAttrSpec}
 *
 * @author sphatak01
 */
public class ParsedAttrSpecTest {

    @Test
    public void testGettersSetters() {
        final Validator.AttrSpec.Builder attrSpecBuilder = Validator.AttrSpec.newBuilder();
        attrSpecBuilder.addCssDeclaration(Validator.CssDeclaration.newBuilder().setName("content")
                .addValueCasei("fill").build());

        final Validator.UrlSpec valueUrl = Validator.UrlSpec.newBuilder().addProtocol("https").build();
        attrSpecBuilder.setValueUrl(valueUrl);

        final Validator.PropertySpecList.Builder propBuilder = Validator.PropertySpecList.newBuilder();
        propBuilder.addProperties(Validator.PropertySpec.newBuilder().setMandatory(true).setName("height").setValue("40").build());

        attrSpecBuilder.setValueProperties(propBuilder.build());
        attrSpecBuilder.addEnabledBy("transformation");

        final Validator.AttrSpec attrSpec = attrSpecBuilder.build();
        final ParsedAttrSpec parsedAttrSpec = new ParsedAttrSpec(attrSpec, "content");

        Assert.assertEquals(parsedAttrSpec.getAttrName(), "content");
        Assert.assertEquals(parsedAttrSpec.getSpec(), attrSpec);

        Assert.assertNotNull(parsedAttrSpec.getValuePropertiesOrNull());
        Assert.assertEquals(parsedAttrSpec.getValuePropertiesOrNull().getMandatoryValuePropertyNames().size(), 1);
        Assert.assertEquals(parsedAttrSpec.getValuePropertiesOrNull().getMandatoryValuePropertyNames().get(0), "height");

        Assert.assertEquals(parsedAttrSpec.getCssDeclarationByName().get("content").getValueCasei(0), "fill");
        Assert.assertTrue(parsedAttrSpec.isUsedForTypeIdentifiers(ImmutableList.of("transformation")));

        Assert.assertTrue(parsedAttrSpec.getValueUrlSpec().isAllowedProtocol("https"));

        parsedAttrSpec.cleanup();

        Assert.assertNull(parsedAttrSpec.getAttrName());
        Assert.assertNull(parsedAttrSpec.getSpec());
    }
}
