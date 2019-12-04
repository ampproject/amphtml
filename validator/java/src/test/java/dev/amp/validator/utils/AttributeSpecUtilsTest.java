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

package dev.amp.validator.utils;

import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.Context;
import dev.amp.validator.ParsedAttrSpec;
import dev.amp.validator.ParsedAttrSpecs;
import dev.amp.validator.ParsedHtmlTag;
import dev.amp.validator.ParsedTagSpec;
import dev.amp.validator.ParsedValidatorRules;
import dev.amp.validator.TagStack;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.exception.TagValidationException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Test for {@link AttributeSpecUtils}
 *
 * @author GeorgeLuo
 */

public class AttributeSpecUtilsTest {

  @Test
  public void testIsUsedForTypeIdentifiers() {
    final List<String> typeIdentifiers = new ArrayList<>();
    final List<String> enabledBys = new ArrayList<>();
    final List<String> disabledBys = new ArrayList<>();

    typeIdentifiers.add("amp4email");
    enabledBys.add("enablingId");
    typeIdentifiers.add("transformed");
    Assert.assertFalse(AttributeSpecUtils.isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys));

    typeIdentifiers.add("enablingId");
    Assert.assertTrue(AttributeSpecUtils.isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys));

    enabledBys.clear();
    typeIdentifiers.add("disablingId");
    disabledBys.add("disablingId");
    Assert.assertFalse(AttributeSpecUtils.isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys));

    typeIdentifiers.clear();
    Assert.assertTrue(AttributeSpecUtils.isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys));

    enabledBys.clear();
    disabledBys.clear();
    Assert.assertTrue(AttributeSpecUtils.isUsedForTypeIdentifiers(typeIdentifiers, enabledBys, disabledBys));
  }

  // TODO : write assertions for mocks that touch notable objects
  @Test
  public void testValidateAttributes() {

    // IMPLIED_LAYOUT_INVALID

    final ValidatorProtos.AmpLayout.Builder ampLayoutBuilder = ValidatorProtos.AmpLayout.newBuilder();

    ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();

    tagSpecBuilder.setAmpLayout(ampLayoutBuilder.build());

    ValidatorProtos.AttrSpec.Builder attrSpecBuilder = ValidatorProtos.AttrSpec.newBuilder();
    attrSpecBuilder.setDeprecation("deprecationString");
    List<ValidatorProtos.AttrSpec> attrSpecs = new ArrayList<>();
    attrSpecs.add(attrSpecBuilder.build());

    Map<String, ValidatorProtos.AttrSpec> attrsByName = new HashMap<>();
    attrsByName.put("HTML", attrSpecBuilder.build());

    ParsedTagSpec parsedTagSpec = Mockito.mock(ParsedTagSpec.class);
    Mockito.when(parsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
    Mockito.when(parsedTagSpec.getImplicitAttrspecs()).thenReturn(attrSpecs);
    Mockito.when(parsedTagSpec.getAttrsByName()).thenReturn(attrsByName);

    ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

    TagStack tagStack = Mockito.mock(TagStack.class);

    ParsedAttrSpec parsedAttrSpec = Mockito.mock(ParsedAttrSpec.class);
    Mockito.when(parsedAttrSpec.isUsedForTypeIdentifiers(Mockito.anyList())).thenReturn(true);
    Mockito.when(parsedAttrSpec.getSpec()).thenReturn(attrSpecBuilder.build());

    ParsedAttrSpecs parsedAttrSpecs = Mockito.mock(ParsedAttrSpecs.class);
    Mockito.when(parsedAttrSpecs.getParsedAttrSpec("HTML", "htmlValue",
      attrSpecBuilder.build())).thenReturn(parsedAttrSpec);

    ParsedValidatorRules parsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
    Mockito.when(parsedValidatorRules.getParsedAttrSpecs()).thenReturn(parsedAttrSpecs);

    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getTagStack()).thenReturn(tagStack);
    Mockito.when(context.getRules()).thenReturn(parsedValidatorRules);

    Attributes attributes = Mockito.mock(Attributes.class);
    Mockito.when(attributes.getLength()).thenReturn(1);
    Mockito.when(attributes.getLocalName(0)).thenReturn("HTML");
    Mockito.when(attributes.getValue(0)).thenReturn("htmlValue");


    ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
    Mockito.when(encounteredTag.upperName()).thenReturn("HTML");
    Mockito.when(encounteredTag.attrs()).thenReturn(attributes);

    ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

    try {
      AttributeSpecUtils.validateAttributes(parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result);
    } catch (TagValidationException | IOException | CssValidationException e) {
      e.printStackTrace();
    }

    ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
    ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);
    ArgumentCaptor<ValidatorProtos.ValidationError.Code> warningCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);
    Mockito.verify(context, Mockito.times(1)).addError(errorCodeCapture.capture(),
      Mockito.any(Locator.class),
      listCaptor.capture(),
      Mockito.anyString(),
      Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    Mockito.verify(context, Mockito.times(1)).addWarning(warningCodeCapture.capture(),
      Mockito.any(Locator.class),
      listCaptor.capture(),
      Mockito.anyString(),
      Mockito.any(ValidatorProtos.ValidationResult.Builder.class));


    Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.IMPLIED_LAYOUT_INVALID);
    Assert.assertEquals(warningCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.DEPRECATED_ATTR);

    // DISALLOWED_ATTR

    tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();

    attrSpecBuilder = ValidatorProtos.AttrSpec.newBuilder();
//    attrSpecBuilder.setDeprecation("deprecationString");
    attrSpecs = new ArrayList<>();
    attrSpecs.add(attrSpecBuilder.build());

    attrsByName = new HashMap<>();
    attrsByName.put("HTML", attrSpecBuilder.build());

    parsedTagSpec = Mockito.mock(ParsedTagSpec.class);
    Mockito.when(parsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
    Mockito.when(parsedTagSpec.getImplicitAttrspecs()).thenReturn(attrSpecs);
    Mockito.when(parsedTagSpec.getAttrsByName()).thenReturn(attrsByName);

    bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

    tagStack = Mockito.mock(TagStack.class);

    parsedAttrSpec = Mockito.mock(ParsedAttrSpec.class);
    Mockito.when(parsedAttrSpec.isUsedForTypeIdentifiers(Mockito.anyList())).thenReturn(false);
    Mockito.when(parsedAttrSpec.getSpec()).thenReturn(attrSpecBuilder.build());

    parsedAttrSpecs = Mockito.mock(ParsedAttrSpecs.class);
    Mockito.when(parsedAttrSpecs.getParsedAttrSpec("HTML", "htmlValue", attrSpecBuilder.build())).thenReturn(parsedAttrSpec);

    parsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
    Mockito.when(parsedValidatorRules.getParsedAttrSpecs()).thenReturn(parsedAttrSpecs);

    context = Mockito.mock(Context.class);
    Mockito.when(context.getTagStack()).thenReturn(tagStack);
    Mockito.when(context.getRules()).thenReturn(parsedValidatorRules);

    attributes = Mockito.mock(Attributes.class);
    Mockito.when(attributes.getLength()).thenReturn(1);
    Mockito.when(attributes.getLocalName(0)).thenReturn("HTML");
    Mockito.when(attributes.getValue(0)).thenReturn("htmlValue");

    encounteredTag = Mockito.mock(ParsedHtmlTag.class);
    Mockito.when(encounteredTag.upperName()).thenReturn("HTML");
    Mockito.when(encounteredTag.attrs()).thenReturn(attributes);

    result = ValidatorProtos.ValidationResult.newBuilder();

    try {
      AttributeSpecUtils.validateAttributes(parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result);
    } catch (TagValidationException | IOException | CssValidationException e) {
      e.printStackTrace();
    }

    listCaptor = ArgumentCaptor.forClass(List.class);
    errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);
    Mockito.verify(context, Mockito.times(1)).addError(errorCodeCapture.capture(),
      Mockito.any(Locator.class),
      listCaptor.capture(),
      Mockito.anyString(),
      Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR);

    // INVALID_ATTR_VALUE

    tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();

    attrSpecBuilder = ValidatorProtos.AttrSpec.newBuilder();
    attrSpecBuilder.setBlacklistedValueRegex("");
    attrSpecs = new ArrayList<>();
    attrSpecs.add(attrSpecBuilder.build());

    attrsByName = new HashMap<>();
    attrsByName.put("HTML", attrSpecBuilder.build());

    parsedTagSpec = Mockito.mock(ParsedTagSpec.class);
    Mockito.when(parsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
    Mockito.when(parsedTagSpec.getImplicitAttrspecs()).thenReturn(attrSpecs);
    Mockito.when(parsedTagSpec.getAttrsByName()).thenReturn(attrsByName);

    bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

    tagStack = Mockito.mock(TagStack.class);

    parsedAttrSpec = Mockito.mock(ParsedAttrSpec.class);
    Mockito.when(parsedAttrSpec.isUsedForTypeIdentifiers(Mockito.anyList())).thenReturn(true);
    Mockito.when(parsedAttrSpec.getSpec()).thenReturn(attrSpecBuilder.build());

    parsedAttrSpecs = Mockito.mock(ParsedAttrSpecs.class);
    Mockito.when(parsedAttrSpecs.getParsedAttrSpec("HTML", "htmlValue", attrSpecBuilder.build())).thenReturn(parsedAttrSpec);

    parsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
    Mockito.when(parsedValidatorRules.getParsedAttrSpecs()).thenReturn(parsedAttrSpecs);
    Mockito.when(parsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(Pattern.compile(""));

    context = Mockito.mock(Context.class);
    Mockito.when(context.getTagStack()).thenReturn(tagStack);
    Mockito.when(context.getRules()).thenReturn(parsedValidatorRules);

    attributes = Mockito.mock(Attributes.class);
    Mockito.when(attributes.getLength()).thenReturn(1);
    Mockito.when(attributes.getLocalName(0)).thenReturn("HTML");
    Mockito.when(attributes.getValue(0)).thenReturn("htmlValue");

    encounteredTag = Mockito.mock(ParsedHtmlTag.class);
    Mockito.when(encounteredTag.upperName()).thenReturn("HTML");
    Mockito.when(encounteredTag.attrs()).thenReturn(attributes);

    result = ValidatorProtos.ValidationResult.newBuilder();

    try {
      AttributeSpecUtils.validateAttributes(parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result);
    } catch (TagValidationException | IOException | CssValidationException e) {
      e.printStackTrace();
    }

    listCaptor = ArgumentCaptor.forClass(List.class);
    errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);
    Mockito.verify(context, Mockito.times(1)).addError(errorCodeCapture.capture(),
      Mockito.any(Locator.class),
      listCaptor.capture(),
      Mockito.anyString(),
      Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);

    // BASE_TAG_MUST_PRECEED_ALL_URLS

    tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
    tagSpecBuilder.setTagName("BASE");

    attrSpecBuilder = ValidatorProtos.AttrSpec.newBuilder();
    attrSpecs = new ArrayList<>();
    attrSpecs.add(attrSpecBuilder.build());

    attrsByName = new HashMap<>();
    attrsByName.put("attr", attrSpecBuilder.build());
    attrsByName.put("href", attrSpecBuilder.build());

    parsedTagSpec = Mockito.mock(ParsedTagSpec.class);
    Mockito.when(parsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
    Mockito.when(parsedTagSpec.getImplicitAttrspecs()).thenReturn(attrSpecs);
    Mockito.when(parsedTagSpec.getAttrsByName()).thenReturn(attrsByName);

    bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

    tagStack = Mockito.mock(TagStack.class);

    parsedAttrSpec = Mockito.mock(ParsedAttrSpec.class);
    Mockito.when(parsedAttrSpec.isUsedForTypeIdentifiers(Mockito.anyList())).thenReturn(true);
    Mockito.when(parsedAttrSpec.getSpec()).thenReturn(attrSpecBuilder.build());

    parsedAttrSpecs = Mockito.mock(ParsedAttrSpecs.class);
    Mockito.when(parsedAttrSpecs.getParsedAttrSpec("attr", "attrValue", attrSpecBuilder.build())).thenReturn(parsedAttrSpec);
    Mockito.when(parsedAttrSpecs.getParsedAttrSpec("href", "hrefValue", attrSpecBuilder.build())).thenReturn(parsedAttrSpec);

    parsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
    Mockito.when(parsedValidatorRules.getParsedAttrSpecs()).thenReturn(parsedAttrSpecs);
    Mockito.when(parsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(Pattern.compile(""));

    context = Mockito.mock(Context.class);
    Mockito.when(context.getTagStack()).thenReturn(tagStack);
    Mockito.when(context.getRules()).thenReturn(parsedValidatorRules);
    Mockito.when(context.hasSeenUrl()).thenReturn(true);

    attributes = Mockito.mock(Attributes.class);
    Mockito.when(attributes.getLength()).thenReturn(1);
    Mockito.when(attributes.getLocalName(0)).thenReturn("href");
    Mockito.when(attributes.getValue(0)).thenReturn("hrefValue");

    encounteredTag = Mockito.mock(ParsedHtmlTag.class);
    Mockito.when(encounteredTag.upperName()).thenReturn("BASE");
    Mockito.when(encounteredTag.attrs()).thenReturn(attributes);

    result = ValidatorProtos.ValidationResult.newBuilder();

    try {
      AttributeSpecUtils.validateAttributes(parsedTagSpec, bestMatchReferencePoint, context, encounteredTag, result);
    } catch (TagValidationException | IOException | CssValidationException e) {
      e.printStackTrace();
    }

    listCaptor = ArgumentCaptor.forClass(List.class);
    errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);
    Mockito.verify(context, Mockito.times(1)).addError(errorCodeCapture.capture(),
      Mockito.any(Locator.class),
      listCaptor.capture(),
      Mockito.anyString(),
      Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.BASE_TAG_MUST_PRECEED_ALL_URLS);
  }

  @Test
  public void testValidateAttrRequiredExtensions() {
  }

  @Test
  public void testValidateAttrDeclaration() {
  }

  @Test
  public void testAttrValueHasTemplateSyntax() {
  }

  @Test
  public void testValidateNonTemplateAttrValueAgainstSpec() {
  }

  @Test
  public void testValidateAttrValueProperties() {
  }

  @Test
  public void testValidateAttrValueUrl() {
  }

  @Test
  public void testValidateUrlAndProtocol() {
  }

  @Test
  public void testValidateLayout() {
  }

  @Test
  public void testValidateAttributeInExtension() {
  }

  @Test
  public void testGetExtensionNameAttribute() {
  }

  @Test
  public void testValidateAttrNotFoundInSpec() {
  }

  @Test
  public void testValidateAttrValueBelowTemplateTag() {
  }

  @Test
  public void testAttrValueHasPartialsTemplateSyntax() {
  }

  @Test
  public void testAttrValueHasUnescapedTemplateSyntax() {
  }
}
