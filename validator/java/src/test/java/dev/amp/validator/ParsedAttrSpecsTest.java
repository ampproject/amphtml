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
import com.google.common.collect.ImmutableMap;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Collections;
import java.util.Map;

/**
 * Tests for {@link ParsedAttrSpecs}
 *
 * @author sphatak01
 */
public class ParsedAttrSpecsTest {

    @Test
    public void testGettersSetters() {
        final AMPValidatorManager validationManager = Mockito.mock(AMPValidatorManager.class);

        final Validator.AttrSpec.Builder attrSpecBuilder = Validator.AttrSpec.newBuilder();
        attrSpecBuilder.addEnabledBy("transformation");

        final Validator.AttrSpec attrSpec = attrSpecBuilder.build();

        final ParsedAttrSpecs parsedAttrSpecs = new ParsedAttrSpecs(validationManager);

        // first time doesn't exist in map
        Assert.assertNotNull(parsedAttrSpecs.getParsedAttrSpec("a", "b", attrSpec));

        //second time exists in map
        Assert.assertNotNull(parsedAttrSpecs.getParsedAttrSpec("a", "b", attrSpec));

        Mockito.when(validationManager.getAttrListMap()).thenReturn(Collections.emptyMap());

        Assert.assertEquals(parsedAttrSpecs.getAttrListByName("content").size(), 0);

        final Map<String, Validator.AttrList> attrListMap = ImmutableMap.of("content", Validator.AttrList.newBuilder()
                .addAttrs(Validator.AttrSpec.newBuilder().setName("color").build()).build());
        Mockito.when(validationManager.getAttrListMap()).thenReturn(attrListMap);

        Assert.assertEquals(parsedAttrSpecs.getAttrListByName("content").size(), 1);

        Mockito.when(validationManager.getGlobalAttrs()).thenReturn(ImmutableList.of(Validator.AttrSpec.newBuilder().setName("itemprop").build()));
        Assert.assertEquals(parsedAttrSpecs.getGlobalAttrs().size(), 1);
        Assert.assertEquals(parsedAttrSpecs.getGlobalAttrs().get(0).getName(), "itemprop");

        Mockito.when(validationManager.getAmpLayoutAttrs()).thenReturn(ImmutableList.of(Validator.AttrSpec.newBuilder().setName("NODISPLAY").build()));
        Assert.assertEquals(parsedAttrSpecs.getAmpLayoutAttrs().size(), 1);
        Assert.assertEquals(parsedAttrSpecs.getAmpLayoutAttrs().get(0).getName(), "NODISPLAY");

        parsedAttrSpecs.cleanup();
    }
}