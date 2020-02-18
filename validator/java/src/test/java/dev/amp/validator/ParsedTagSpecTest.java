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

import com.google.common.collect.ImmutableList;
import dev.amp.validator.exception.TagValidationException;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test for {@link ParsedTagSpec}
 *
 * @author sphatak01
 */
public class ParsedTagSpecTest {


    /**
     * Tests for {@link ParsedTagSpec}
     */
    @Test
    public void testConstructor() throws TagValidationException {

        final ParsedAttrSpecs parsedAttrSpecs = mock(ParsedAttrSpecs.class);
        final RecordValidated shouldRecordTagsValidated = RecordValidated.NEVER;
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        final int id = 23;

        tagSpecBuilder.setAmpLayout(ValidatorProtos.AmpLayout.newBuilder()
                .addSupportedLayouts(ValidatorProtos.AmpLayout.Layout.INTRINSIC).build());


        final ValidatorProtos.AttrSpec.Builder attrSpecBuilder = ValidatorProtos.AttrSpec.newBuilder();
        attrSpecBuilder.setName("content");

        final ValidatorProtos.AttrSpec.Builder attrSpecBuilder2 = ValidatorProtos.AttrSpec.newBuilder();
        attrSpecBuilder2.setName("content");

        when(parsedAttrSpecs.getAmpLayoutAttrs()).thenReturn(ImmutableList.of(attrSpecBuilder.build(), attrSpecBuilder2.build()));

        final ValidatorProtos.AttrSpec.Builder attrSpecBuilder3 = ValidatorProtos.AttrSpec.newBuilder();
        attrSpecBuilder3.setName("height");
        attrSpecBuilder3.addValueCasei("_top");
        tagSpecBuilder.addAttrs(attrSpecBuilder3.build());

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("4").build());
        final ValidatorProtos.CdataSpec cDataSpec = cDataBuilder.build();

        tagSpecBuilder.setCdata(cDataSpec);

        final ValidatorProtos.AttrSpec.Builder attrSpecBuilder4 = ValidatorProtos.AttrSpec.newBuilder();
        when(parsedAttrSpecs.getGlobalAttrs()).thenReturn(ImmutableList.of(attrSpecBuilder4.build()));

        final ParsedAttrSpec parsedHeightSpec = mock(ParsedAttrSpec.class);
        final ValidatorProtos.AttrSpec.Builder heightSpec = ValidatorProtos.AttrSpec.newBuilder();
        heightSpec.setMandatory(true);
        heightSpec.setMandatoryOneof("data-momentid");
        heightSpec.setMandatoryAnyof("src");
        heightSpec.addAlternativeNames("ht");
        heightSpec.setImplicit(true);
        heightSpec.setValueUrl(ValidatorProtos.UrlSpec.newBuilder().addProtocol("http").build());
        heightSpec.addRequiresExtension("amp-form");

        when(parsedHeightSpec.getSpec()).thenReturn(heightSpec.build());

        when(parsedAttrSpecs.getParsedAttrSpec(anyString(), anyString(), any(ValidatorProtos.AttrSpec.class))).thenReturn(parsedHeightSpec);

        tagSpecBuilder.setChildTags(ValidatorProtos.ChildTagSpec.newBuilder().setMandatoryMinNumChildTags(1).build());
        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();

        final ParsedTagSpec parsedTagSpec = new ParsedTagSpec(parsedAttrSpecs, shouldRecordTagsValidated,
                tagSpec, id);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 42;
            }
        };


        Assert.assertEquals(parsedTagSpec.getSpec(), tagSpec);
        Assert.assertEquals(parsedTagSpec.cdataMatcher(locator).getTagSpec(), tagSpec);
        Assert.assertEquals(parsedTagSpec.cdataMatcher(locator).getLineCol().getColumnNumber(), 42);
        Assert.assertEquals(parsedTagSpec.cdataMatcher(locator).getLineCol().getLineNumber(), 23);
        parsedTagSpec.childTagMatcher();
        //Assert.assertEquals(parsedTagSpec.referencePointMatcher(mock(ParsedValidatorRules.class), locator).getLineCol().getLineNumber(), 23);
        Assert.assertFalse(parsedTagSpec.hasReferencePoints());
        Assert.assertNotNull(parsedTagSpec.getReferencePoints());
        Assert.assertTrue(parsedTagSpec.attrsCanSatisfyExtension());
        Assert.assertTrue(parsedTagSpec.hasAttrWithName("height"));
        Assert.assertEquals(parsedTagSpec.getImplicitAttrspecs().size(), 2);
        Assert.assertEquals(parsedTagSpec.getImplicitAttrspecs().get(0).getName(), "height");
        Assert.assertEquals(parsedTagSpec.getAttrsByName().size(), 4);
        Assert.assertTrue(parsedTagSpec.getAttrsByName().containsKey("height"));
        Assert.assertTrue(parsedTagSpec.getAttrsByName().containsKey("content"));
        Assert.assertTrue(parsedTagSpec.getAttrsByName().containsKey("ht"));
        Assert.assertTrue(parsedTagSpec.getAttrsByName().containsKey(""));
        Assert.assertEquals(parsedTagSpec.getMandatoryOneofs().size(), 1);
        Assert.assertTrue(parsedTagSpec.getMandatoryOneofs().contains("data-momentid"));
        Assert.assertEquals(parsedTagSpec.getMandatoryAnyofs().size(), 1);
        Assert.assertTrue(parsedTagSpec.getMandatoryAnyofs().contains("src"));
        Assert.assertEquals(parsedTagSpec.getMandatoryAttrIds().size(), 1);
        Assert.assertEquals(parsedTagSpec.id(), 23);

        parsedTagSpec.cleanup();
    }
}
