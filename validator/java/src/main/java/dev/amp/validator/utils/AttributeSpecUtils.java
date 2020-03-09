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

import com.steadystate.css.parser.Token;
import dev.amp.validator.Context;
import dev.amp.validator.CssLength;
import dev.amp.validator.ExtensionsContext;
import dev.amp.validator.ParsedAttrSpec;
import dev.amp.validator.ParsedHtmlTag;
import dev.amp.validator.ParsedTagSpec;
import dev.amp.validator.ParsedUrlSpec;
import dev.amp.validator.ParsedValueProperties;
import dev.amp.validator.SrcsetParsingResult;
import dev.amp.validator.SrcsetSourceDef;
import dev.amp.validator.UrlErrorAdapter;
import dev.amp.validator.UrlErrorInAttrAdapter;
import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.css.CssParser;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.exception.TagValidationException;
import org.apache.commons.text.StringEscapeUtils;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static dev.amp.validator.utils.CssSpecUtils.parseInlineStyle;
import static dev.amp.validator.utils.CssSpecUtils.stripVendorPrefix;
import static dev.amp.validator.utils.ExtensionsUtils.isAmpRuntimeScript;
import static dev.amp.validator.utils.ExtensionsUtils.isExtensionScript;
import static dev.amp.validator.utils.ExtensionsUtils.validateScriptSrcAttr;

/**
 * Methods to handle attribute spec validation.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class AttributeSpecUtils {
  /**
   * Private constructor.
   */
  private AttributeSpecUtils() {
  }

  /**
   * Returns true if this spec should be used for the given type identifiers
   * based on the spec's disabled_by or enabled_by fields.
   *
   * @param typeIdentifiers type identifiers.
   * @param enabledBys      enabled bys.
   * @param disabledBys     disabled bys.
   * @return returns true if type identifiers are used.
   */
  public static boolean isUsedForTypeIdentifiers(@Nonnull final List<String> typeIdentifiers,
                                                 @Nonnull final List<String> enabledBys,
                                                 @Nonnull final List<String> disabledBys) {
    if (enabledBys.size() > 0) {
      for (final String enabledBy : enabledBys) {
        // Is enabled by a given type identifier, use.
        if (typeIdentifiers.contains(enabledBy)) {
          return true;
        }
      }
      // Is not enabled for these type identifiers, do not use.
      return false;
    } else if (disabledBys.size() > 0) {
      for (final String disabledBy : disabledBys) {
        // Is disabled by a given type identifier, do not use.
        if (typeIdentifiers.contains(disabledBy)) {
          return false;
        }
      }
      // Is not disabled for these type identifiers, use.
      return true;
    }
    // Is not enabled nor disabled for any type identifiers, use.
    return true;
  }


  /**
   * Validates whether the attributes set on |encountered_tag| conform to this
   * tag specification. All mandatory attributes must appear. Only attributes
   * explicitly mentioned by this tag spec may appear.
   * Returns true iff the validation is successful.
   *
   * @param parsedTagSpec           the parsed tag spec.
   * @param bestMatchReferencePoint best match reference point.
   * @param context                 the context.
   * @param encounteredTag          encountered tag.
   * @param result                  validation result.
   * @throws TagValidationException tag validation exception.
   * @throws IOException            IO Exception
   * @throws CssValidationException Css Validation Exception
   */
  public static void validateAttributes(@Nonnull final ParsedTagSpec parsedTagSpec,
                                        @Nonnull final ParsedTagSpec bestMatchReferencePoint,
                                        @Nonnull final Context context,
                                        @Nonnull final ParsedHtmlTag encounteredTag,
                                        @Nonnull final ValidatorProtos.ValidationResult.Builder result)
    throws TagValidationException, IOException, CssValidationException {
    final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
    if (spec.hasAmpLayout()) {
      validateLayout(parsedTagSpec, context, encounteredTag, result);
    }
    // For extension TagSpecs, we track if we've validated a src attribute.
    // We must have done so for the extension to be valid.
    boolean seenExtensionSrcAttr = false;
    final boolean hasTemplateAncestor = context.getTagStack().hasAncestor("TEMPLATE");
    final boolean isHtmlTag = encounteredTag.upperName().equals("HTML");
    final List<String> mandatoryAttrsSeen = new ArrayList<>();
    final List<String> mandatoryOneofsSeen = new ArrayList<>();
    final List<String> mandatoryAnyofsSeen = new ArrayList<>();
    final List<ValidatorProtos.AttrSpec> triggersToCheck = new ArrayList<>();

    /**
     * If a tag has implicit attributes, we then add these attributes as
     * validated. E.g. tag 'a' has implicit attributes 'role' and 'tabindex'.
     */
    final Set<String> attrspecsValidated = new HashSet<>();
    for (final ValidatorProtos.AttrSpec implicit : parsedTagSpec.getImplicitAttrspecs()) {
      attrspecsValidated.add(implicit.getName());
    }
    // Our html parser delivers attributes as an array of alternating keys and
    // values. We skip over this array 2 at a time to iterate over the keys.
    final Map<String, ValidatorProtos.AttrSpec> attrsByName = parsedTagSpec.getAttrsByName();
    for (int i = 0; i < encounteredTag.attrs().getLength(); i++) {
      final String name = encounteredTag.attrs().getLocalName(i);
      String value = encounteredTag.attrs().getValue(i);
      if (name.equals(value)) {
        value = "";
      }

      // For transformed AMP, attributes `class` and `i-amphtml-layout` are
      // handled within validateSsrLayout for non-sizer elements.
      if (context.isTransformed()
        && !encounteredTag.lowerName().equals("i-amphtml-sizer")
        && (name.equals("class") || name.equals("i-amphtml-layout"))) {
        continue;
      }
      // If |spec| is the runtime or an extension script, validate that LTS is
      // either used by all pages or no pages.
      if (encounteredTag.attrs().getValue(i).equals("src") &&
        (isExtensionScript(encounteredTag)
          || isAmpRuntimeScript(encounteredTag))) {
        validateScriptSrcAttr(encounteredTag.attrs().getValue(i), spec, context, result);
      }
      if (!(attrsByName.containsKey(name))) {
        // The HTML tag specifies type identifiers which are validated in
        // validateHtmlTag(), so we skip them here.
        if (isHtmlTag && context.getRules().isTypeIdentifier(name)) {
          continue;
        }
        // While validating a reference point, we skip attributes that
        // we don't have a spec for. They will be validated when the
        // TagSpec itself gets validated.
        if (parsedTagSpec.isReferencePoint()) {
          continue;
        }
        // On the other hand, if we did just validate a reference point for
        // this tag, we check whether that reference point covers the attribute.
        if (bestMatchReferencePoint != null
          && bestMatchReferencePoint.hasAttrWithName(name)) {
          continue;
        }

        // If |spec| is an extension, then we ad-hoc validate 'custom-element',
        // 'custom-template', 'host-service', and 'src' attributes by calling this
        // method.  For 'src', we also keep track whether we validated it this
        // way, (seen_src_attr), since it's a mandatory attr.
        if (spec.hasExtensionSpec()
          && validateAttributeInExtension(spec, context, name, value, result)) {
          if (name.equals("src")) {
            seenExtensionSrcAttr = true;
          }
          continue;
        }
        validateAttrNotFoundInSpec(parsedTagSpec, context, name, result);
        if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
          continue;
        }
        if (hasTemplateAncestor) {
          validateAttrValueBelowTemplateTag(parsedTagSpec, context, name, value, result);
          if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
            continue;
          }
        }
        continue;
      }
      if (hasTemplateAncestor) {
        validateAttrValueBelowTemplateTag(parsedTagSpec, context, name, value, result);
        if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
          continue;
        }
      }

      final ValidatorProtos.AttrSpec attrSpec = attrsByName.get(name);
      if (attrSpec.getValueCount() < 0) {
        attrspecsValidated.add(attrSpec.getName());
        continue;
      }

      final ParsedAttrSpec parsedAttrSpec =
        context.getRules().getParsedAttrSpecs().getParsedAttrSpec(name, value, attrSpec);
      // If this attribute isn't used for these type identifiers, then error.
      if (!parsedAttrSpec.isUsedForTypeIdentifiers(
        context.getTypeIdentifiers())) {
        List<String> params = new ArrayList<>();
        params.add(name);
        params.add(TagSpecUtils.getTagSpecName(spec));
        context.addError(
          ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
        continue;
      }
      if (attrSpec.hasDeprecation()) {
        List<String> params = new ArrayList<>();
        params.add(name);
        params.add(TagSpecUtils.getTagSpecName(spec));
        params.add(attrSpec.getDeprecation());
        context.addWarning(
          ValidatorProtos.ValidationError.Code.DEPRECATED_ATTR,
          context.getLineCol(),
          params,
          attrSpec.getDeprecationUrl(),
          result);
        // Deprecation is only a warning, so we don't return.
      }
      if (attrSpec.getRequiresExtensionCount() > 0) {
        validateAttrRequiredExtensions(parsedAttrSpec, context, result);
      }
      if (attrSpec.getCssDeclarationCount() > 0) {
        validateAttrDeclaration(
          parsedAttrSpec, context, TagSpecUtils.getTagSpecName(spec), name, value,
          result);
      }
      if (!hasTemplateAncestor || !attrValueHasTemplateSyntax(value)) {
        validateNonTemplateAttrValueAgainstSpec(
          parsedAttrSpec, context, name, value, spec, result);
        if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
          continue;
        }
      }

      final List<String> params;
      if (attrSpec.hasBlacklistedValueRegex()) {
        final Pattern regex = context.getRules().getPartialMatchCaseiRegex(
          attrSpec.getBlacklistedValueRegex());
        if (regex.matcher(value).find()) {
          params = new ArrayList<>();
          params.add(name);
          params.add(TagSpecUtils.getTagSpecName(spec));
          params.add(value);
          context.addError(
            ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(spec),
            result);
          continue;
        }
      }
      if (attrSpec.hasMandatory()) {
        mandatoryAttrsSeen.add(parsedAttrSpec.getAttrName());

      }
      if (parsedTagSpec.getSpec().getTagName().equals("BASE")
        && name.equals("href")
        && context.hasSeenUrl()) {
        params = new ArrayList<>();
        params.add(context.firstSeenUrlTagName());
        context.addError(
          ValidatorProtos.ValidationError.Code.BASE_TAG_MUST_PRECEED_ALL_URLS,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
        continue;
      }
      final String mandatoryOneof = attrSpec.getMandatoryOneof(); // question const {mandatoryOneof} = attrSpec;
      if (attrSpec.hasMandatoryOneof()) {
        // The "at most 1" part of mandatory_oneof: mandatory_oneof
        // wants exactly one of the alternatives, so here
        // we check whether we already saw another alternative
        if (mandatoryOneofsSeen.indexOf(mandatoryOneof) != -1) {
          params = new ArrayList<>();
          params.add(TagSpecUtils.getTagSpecName(spec));
          params.add(mandatoryOneof);
          context.addError(
            ValidatorProtos.ValidationError.Code.MUTUALLY_EXCLUSIVE_ATTRS,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(spec),
            result);
          continue;
        }

        mandatoryOneofsSeen.add(mandatoryOneof);
      }
      if (attrSpec.hasRequiresAncestor()) {
        final List<ValidatorProtos.AncestorMarker.Marker> markers = attrSpec.getRequiresAncestor().getMarkerList();
        boolean matchesMarker = false;
        for (final ValidatorProtos.AncestorMarker.Marker marker : markers) {
          if (context.getTagStack().hasAncestorMarker(marker)) {
            matchesMarker = true;
            break;
          }
        }
        if (!matchesMarker) {
          params = new ArrayList<>();
          params.add(name);
          params.add(TagSpecUtils.getTagSpecName(spec));
          context.addError(
            ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(spec),
            result);
          continue;
        }
      }
      final String mandatoryAnyof = attrSpec.getMandatoryAnyof(); //const {mandatoryAnyof} = attrSpec;
      if (attrSpec.hasMandatoryAnyof()) {
        mandatoryAnyofsSeen.add(mandatoryAnyof);
      }
      attrspecsValidated.add(parsedAttrSpec.getAttrName());
      // If the trigger does not have an if_value_regex, then proceed to add the
      // spec. If it does have an if_value_regex, then test the regex to see
      // if it should add the spec.
      if (!attrSpec.hasTrigger()) {
        continue;
      }
      final ValidatorProtos.AttrTriggerSpec trigger = attrSpec.getTrigger();
      if (trigger != null) {
        final boolean hasIfValueRegex = trigger.hasIfValueRegex();
        Pattern ifValueRegexPattern = null;
        if (hasIfValueRegex) {
          ifValueRegexPattern = context.getRules().getFullMatchRegex(trigger.getIfValueRegex());
        }

        if (!hasIfValueRegex || ifValueRegexPattern.matcher(value).matches()) {
          triggersToCheck.add(attrSpec);
        }
      }
    }
    if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
      return;
    }
    // The "exactly 1" part of mandatory_oneof: If none of the
    // alternatives were present, we report that an attribute is missing.
    for (final String mandatoryOneof : parsedTagSpec.getMandatoryOneofs()) {
      if (mandatoryOneofsSeen.indexOf(mandatoryOneof) == -1) {
        List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(spec));
        params.add(mandatoryOneof);
        context.addError(
          ValidatorProtos.ValidationError.Code.MANDATORY_ONEOF_ATTR_MISSING,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
      }
    }
    // The "at least 1" part of mandatory_anyof: If none of the
    // alternatives were present, we report that an attribute is missing.
    for (final String mandatoryAnyof : parsedTagSpec.getMandatoryAnyofs()) {
      if (mandatoryAnyofsSeen.indexOf(mandatoryAnyof) == -1) {
        List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(spec));
        params.add(mandatoryAnyof);
        context.addError(
          ValidatorProtos.ValidationError.Code.MANDATORY_ANYOF_ATTR_MISSING,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
      }
    }
    for (final ValidatorProtos.AttrSpec attrSpec : triggersToCheck) {
      for (final String alsoRequiresAttr : attrSpec.getTrigger().getAlsoRequiresAttrList()) {
        if (!(attrsByName.containsKey(alsoRequiresAttr))) {
          continue;
        }
        ValidatorProtos.AttrSpec attrId = attrsByName.get(alsoRequiresAttr);
        if (!attrspecsValidated.contains(attrId.getName())) {
          List<String> params = new ArrayList<>();
          params.add(attrId.getName());
          params.add(TagSpecUtils.getTagSpecName(spec));
          params.add(attrSpec.getName());
          context.addError(
            ValidatorProtos.ValidationError.Code.ATTR_REQUIRED_BUT_MISSING,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(spec),
            result);
        }
      }
    }
    final List<String> missingAttrs = new ArrayList<>();
    for (final ValidatorProtos.AttrSpec mandatory : parsedTagSpec.getMandatoryAttrIds()) {
      if (!mandatoryAttrsSeen.contains(mandatory.getName())) {
        missingAttrs.add(mandatory.getName());
      }
    }
    // Sort this list for stability across implementations.
    Collections.sort(missingAttrs);
    for (final String missingAttr : missingAttrs) {
      List<String> params = new ArrayList<>();
      params.add(missingAttr);
      params.add(TagSpecUtils.getTagSpecName(spec));
      context.addError(
        ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
    }
    // Extension specs mandate the 'src' attribute.
    if (spec.hasExtensionSpec() && !seenExtensionSrcAttr) {
      List<String> params = new ArrayList<>();
      params.add("src");
      params.add(TagSpecUtils.getTagSpecName(spec));
      context.addError(
        ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
    }
  }

  /**
   * If this attribute requires an extension and we have processed all extensions,
   * report an error if that extension has not been loaded.
   *
   * @param parsedAttrSpec   the parsed Attr spec.
   * @param context          context
   * @param validationResult validationResult
   */
  public static void validateAttrRequiredExtensions(
    @Nonnull final ParsedAttrSpec parsedAttrSpec,
    @Nonnull final Context context,
    @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
    final ValidatorProtos.AttrSpec attrSpec = parsedAttrSpec.getSpec();
    final ExtensionsContext extensionsCtx = context.getExtensions();
    for (String requiredExtension : attrSpec.getRequiresExtensionList()) {
      if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
        final List<String> params = new ArrayList<>();
        params.add(attrSpec.getName());
        params.add(requiredExtension);
        context.addError(
          ValidatorProtos.ValidationError.Code.ATTR_MISSING_REQUIRED_EXTENSION,
          context.getLineCol(),
          params,
          "",
          validationResult);
      }
    }
  }

  /**
   * Helper method for ValidateAttributes.
   *
   * @param parsedAttrSpec   the parsed Attr spec.
   * @param context          context.
   * @param tagSpecName      tag spec name.
   * @param attrName         attr Name.
   * @param attrValue        attr Value
   * @param validationResult validationResult.
   * @throws IOException            IO Exception
   * @throws CssValidationException Css Validation Exception
   */
  public static void validateAttrDeclaration(
    @Nonnull final ParsedAttrSpec parsedAttrSpec,
    @Nonnull final Context context,
    @Nonnull final String tagSpecName,
    @Nonnull final String attrName,
    @Nonnull final String attrValue,
    @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) throws IOException,
    CssValidationException {
    final List<ErrorToken> cssErrors = new ArrayList<>();
    final CssParser cssParser = new CssParser(attrValue,
      context.getLineCol().getLineNumber(), context.getLineCol().getColumnNumber(), cssErrors);
    final List<Token> tokenList = cssParser.tokenize();

    final List<Declaration> declarations = parseInlineStyle(tokenList, cssErrors);

    for (final ErrorToken errorToken : cssErrors) {
      // Override the first parameter with the name of this style tag.
      final List<String> params = errorToken.getParams();
      // Override the first parameter with the name of this style tag.
      params.set(0, tagSpecName);
      context.addError(
        errorToken.getCode(),
        errorToken.getLine(),
        errorToken.getCol(),
        params,
        /* url */ "",
        validationResult);
    }

    // If there were errors parsing, exit from validating further.
    if (cssErrors.size() > 0) {
      return;
    }

    final Map<String, ValidatorProtos.CssDeclaration> cssDeclarationByName = parsedAttrSpec.getCssDeclarationByName();

    for (final Declaration declaration : declarations) {
      final String declarationName =
        stripVendorPrefix(declaration.getName().toLowerCase());
      if (!(cssDeclarationByName.containsKey(declarationName))) {
        // Declaration not allowed.
        final List<String> params = new ArrayList<>();
        params.add(declaration.getName());
        params.add(attrName);
        params.add(tagSpecName);
        context.addError(
          ValidatorProtos.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.getLineCol(),
          params,
          context.getRules().getStylesSpecUrl(),
          validationResult);
      } else {
        final ValidatorProtos.CssDeclaration cssDeclaration = cssDeclarationByName.get(declarationName);
        if (cssDeclaration.getValueCaseiList().size() > 0) {
          boolean hasValidValue = false;
          final String firstIdent = declaration.firstIdent();
          for (final String value : cssDeclaration.getValueCaseiList()) {
            if (firstIdent.toLowerCase().equals(value)) {
              hasValidValue = true;
              break;
            }
          }
          if (!hasValidValue) {
            // Declaration value not allowed.
            final List<String> params = new ArrayList<>();
            params.add(tagSpecName);
            params.add(declaration.getName());
            params.add(firstIdent);
            context.addError(
              ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
              context.getLineCol(),
              params,
              context.getRules().getStylesSpecUrl(),
              validationResult);
          }
        }
      }
    }
  }

  /**
   * Returns true if |value| contains mustache template syntax.
   *
   * @param value value.
   * @return {boolean}
   */
  public static boolean attrValueHasTemplateSyntax(@Nonnull final String value) {
    // Mustache (https://mustache.github.io/mustache.5.html), our template
    // system, supports replacement tags that start with {{ and end with }}.
    // We relax attribute value rules if the value contains this syntax as we
    // will validate the post-processed tag instead.
    return MUSTACHE_TAG_PATTERN.matcher(value).matches();
  }

  /**
   * This is the main validation procedure for attributes, operating with a
   * ParsedAttrSpec instance.
   *
   * @param parsedAttrSpec parsed attribute spec.
   * @param context        the context.
   * @param attrName       attribute name.
   * @param attrValue      attribute value.
   * @param tagSpec        the tag spec.
   * @param result         the validation result.
   */
  public static void validateNonTemplateAttrValueAgainstSpec(
    @Nonnull final ParsedAttrSpec parsedAttrSpec,
    @Nonnull final Context context,
    @Nonnull final String attrName,
    @Nonnull final String attrValue,
    @Nonnull final ValidatorProtos.TagSpec tagSpec,
    @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    // The value, value_regex, value_url, and value_properties fields are treated
    // like a oneof, but we're not using oneof because it's a feature that was
    // added after protobuf 2.5.0 (which our open-source version uses).
    // begin oneof {
    final ValidatorProtos.AttrSpec spec = parsedAttrSpec.getSpec();
    if (spec.hasAddValueToSet()) {
      ValidatorProtos.ValueSetProvision.Builder provision = ValidatorProtos.ValueSetProvision.newBuilder();
      provision.setSet(spec.getAddValueToSet());
      provision.setValue(attrValue);
      result.addValueSetProvisions(provision);
    }
    if (spec.hasValueOneofSet()) {
      ValidatorProtos.ValueSetRequirement.Builder requirement = ValidatorProtos.ValueSetRequirement.newBuilder();
      ValidatorProtos.ValueSetProvision.Builder provision = ValidatorProtos.ValueSetProvision.newBuilder();
      provision.setSet(spec.getValueOneofSet());
      provision.setValue(attrValue);
      requirement.setProvision(provision);

      final List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      requirement.setErrorIfUnsatisfied(
        ValidationErrorUtils.populateError(
          ValidatorProtos.ValidationError.Severity.ERROR,
          ValidatorProtos.ValidationError.Code.VALUE_SET_MISMATCH,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(tagSpec)));
      result.addValueSetRequirements(requirement);
    }
    if (spec.getValueCount() > 0) {
      for (final String value : spec.getValueList()) {
        if (attrValue.equals(value)) {
          return;
        }
      }
      final List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      params.add(attrValue);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(tagSpec),
        result);
    } else if (spec.getValueCaseiCount() > 0) {
      for (final String value : spec.getValueCaseiList()) {
        if (attrValue.toLowerCase().equals(value)) {
          return;
        }
      }

      final List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      params.add(attrValue);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(tagSpec),
        result);
    } else if (spec.hasValueRegex() || spec.hasValueRegexCasei()) {
      final Pattern valueRegex =
        (spec.hasValueRegex())
          ? context.getRules().getFullMatchRegex(spec.getValueRegex())
          : context.getRules().getFullMatchCaseiRegex(spec.getValueRegexCasei());
      if (!valueRegex.matcher(attrValue).matches()) {
        final List<String> params = new ArrayList<>();
        params.add(attrName);
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        params.add(attrValue);
        context.addError(
          ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(tagSpec),
          result);
      }
    } else if (spec.hasValueUrl()) {
      validateAttrValueUrl(parsedAttrSpec, context, attrName, attrValue, tagSpec, result);
    } else {
      final ParsedValueProperties valueProperties = parsedAttrSpec.getValuePropertiesOrNull();
      if (valueProperties != null) {
        validateAttrValueProperties(
          valueProperties, context, attrName, attrValue, tagSpec, result);
      }
    }
    // } end oneof
  }


  /**
   * Helper method for validateNonTemplateAttrValueAgainstSpec.
   *
   * @param parsedValueProperties value properties.
   * @param context               the context.
   * @param attrName              the attribute name.
   * @param attrValue             the attribute value.
   * @param tagSpec               the tag spec.
   * @param result                validation result.
   */
  public static void validateAttrValueProperties(@Nonnull final ParsedValueProperties parsedValueProperties,
                                                 @Nonnull final Context context,
                                                 @Nonnull final String attrName,
                                                 @Nonnull final String attrValue,
                                                 @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                                 @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    final String[] segments = attrValue.split("[,;]");
    final Map<String, String> properties = new HashMap<>();
    for (final String segment : segments) {
      final String[] keyValue = segment.split("=");
      if (keyValue.length < 2) {
        continue;
      }
      properties.put(keyValue[0].trim().toLowerCase(), keyValue[1]);
    }
    // TODO(johannes): End hack.
    final Set<String> names = properties.keySet();
    for (final String name : names) {
      final String value = properties.get(name);
      final Map<String, ValidatorProtos.PropertySpec> valuePropertyByName =
        parsedValueProperties.getValuePropertyByName();
      if (!(valuePropertyByName.containsKey(name))) {
        final List<String> params = new ArrayList<>();
        params.add(name);
        params.add(attrName);
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        context.addError(
          ValidatorProtos.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(tagSpec),
          result);
        continue;
      }
      final ValidatorProtos.PropertySpec propertySpec = valuePropertyByName.get(name);
      final List<String> params;
      if (propertySpec.hasValue()) {
        if (!propertySpec.getValue().equals(value.toLowerCase())) {
          params = new ArrayList<>();
          params.add(name);
          params.add(attrName);
          params.add(TagSpecUtils.getTagSpecName(tagSpec));
          params.add(value);
          context.addError(
            ValidatorProtos.ValidationError.Code.INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(tagSpec),
            result);
        }
      } else if (propertySpec.hasValueDouble()) {
        Double doubleValue = null;
        try {
          doubleValue = Double.valueOf(value);
        } catch (NumberFormatException e) {
          //no op
        }
        if (doubleValue == null || doubleValue != propertySpec.getValueDouble()) {
          params = new ArrayList<>();
          params.add(name);
          params.add(attrName);
          params.add(TagSpecUtils.getTagSpecName(tagSpec));
          params.add(value);
          context.addError(
            ValidatorProtos.ValidationError.Code.INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(tagSpec),
            result);
        }
      }
    }

    /** Make a copy here because we don't want to remove from the original parsed value properties. */
    List<String> notSeen =
      new ArrayList<>(parsedValueProperties.getMandatoryValuePropertyNames());
    List<String> seen = new ArrayList<>(names);
    notSeen.removeAll(seen);
    for (final String name : notSeen) {
      final List<String> params = new ArrayList<>();
      params.add(name);
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      context.addError(
        ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(tagSpec),
        result);
    }
  }

  /**
   * Helper method for validateNonTemplateAttrValueAgainstSpec.
   *
   * @param parsedAttrSpec the parsed attribute spec.
   * @param context        the context.
   * @param attrName       the attribute name.
   * @param attrValue      the attribute value.
   * @param tagSpec        the tag spec.
   * @param result         validation result.
   */
  public static void validateAttrValueUrl(@Nonnull final ParsedAttrSpec parsedAttrSpec,
                                          @Nonnull final Context context,
                                          @Nonnull final String attrName,
                                          @Nonnull final String attrValue,
                                          @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                          @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    final Set<String> maybeUris = new TreeSet<>();

    if (!attrName.equals("srcset")) {
      maybeUris.add(attrValue);
    } else {
      if (attrValue.equals("")) {
        final List<String> params = new ArrayList<>();
        params.add(attrName);
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        context.addError(
          ValidatorProtos.ValidationError.Code.MISSING_URL,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(tagSpec),
          result);
        return;
      }

      final SrcsetParsingResult parseResult = ParseSrcSetUtils.parseSrcset(attrValue);
      if (!parseResult.isSuccess()) {
        // DUPLICATE_DIMENSION only needs two parameters, it does not report
        // on the attribute value.
        final List<String> params = new ArrayList<>();
        params.add(attrName);
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        if (parseResult.getErrorCode() == ValidatorProtos.ValidationError.Code.DUPLICATE_DIMENSION) {
          context.addError(
            parseResult.getErrorCode(),
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(tagSpec),
            result);
        } else {
          params.add(attrValue);
          context.addError(
            parseResult.getErrorCode(),
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(tagSpec),
            result);
        }
        return;
      }
      for (final SrcsetSourceDef image : parseResult.getSrcsetImages()) {
        maybeUris.add(image.getUrl());
      }
    }
    if (maybeUris.size() == 0) {
      final List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      context.addError(
        ValidatorProtos.ValidationError.Code.MISSING_URL,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(tagSpec),
        result);
      return;
    }
    final UrlErrorInAttrAdapter adapter = new UrlErrorInAttrAdapter(attrName);
    for (final String maybeUri : maybeUris) {
      final String unescapedMaybeUri = StringEscapeUtils.unescapeHtml4(maybeUri);
      validateUrlAndProtocol(
        parsedAttrSpec.getValueUrlSpec(), adapter, context, unescapedMaybeUri,
        tagSpec, result);
      if (result.getStatus() == ValidatorProtos.ValidationResult.Status.FAIL) {
        return;
      }
    }
  }

  /**
   * @param parsedUrlSpec parsed url spec.
   * @param adapter       UrlErrorAdaptor interface.
   * @param context       the context.
   * @param urlStr        url string.
   * @param tagSpec       tag spec.
   * @param result        validation result.
   */
  public static void validateUrlAndProtocol(@Nonnull final ParsedUrlSpec parsedUrlSpec,
                                            @Nonnull final UrlErrorAdapter adapter,
                                            @Nonnull final Context context,
                                            @Nonnull final String urlStr,
                                            @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                            @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    final ValidatorProtos.UrlSpec spec = parsedUrlSpec.getSpec();
    if (ONLY_WHITESPACE_PATTERN.matcher(urlStr).matches() && (!spec.hasAllowEmpty())) {
      adapter.missingUrl(context, tagSpec, result);
      return;
    }

    URL url;
    String protocol = "";
    try {
      url = new URL(urlStr);
    } catch (MalformedURLException e) {
      /** Fallback where we can't instantiate URL, need to obtain the protocol. */
      String urlStrTrimmed = urlStr.toLowerCase().trim();
      Matcher matcher = URL_PROTOCOL_PATTERN.matcher(urlStrTrimmed);
      if (matcher.matches()) {
        protocol = matcher.group(1);
      }

      if (!spec.getAllowRelative() && (protocol.length() == 0)) {
        adapter.disallowedRelativeUrl(context, urlStr, tagSpec, result);
        return;
      }

      if (protocol.length() > 0 && !parsedUrlSpec.isAllowedProtocol(protocol)) {
        adapter.invalidUrl(context, urlStr, tagSpec, result);
      }
      return;
    }

    protocol = url.getProtocol();
    if (protocol.length() > 0 && !parsedUrlSpec.isAllowedProtocol(protocol)) {
      adapter.invalidUrlProtocol(context, protocol, tagSpec, result);
      return;
    }
    if (!spec.getAllowRelative() && (protocol.length() == 0)) {
      adapter.disallowedRelativeUrl(context, urlStr, tagSpec, result);
      return;
    }
  }

  /**
   * Validates the layout for the given tag. This involves checking the
   * layout, width, height, sizes attributes with AMP specific logic.
   *
   * @param parsedTagSpec  the parsed tag spec.
   * @param context        the context.
   * @param encounteredTag encountered tag.
   * @param result         validation result.
   * @throws TagValidationException the tag validation exception.
   */
  public static void validateLayout(@Nonnull final ParsedTagSpec parsedTagSpec,
                                    @Nonnull final Context context,
                                    @Nonnull final ParsedHtmlTag encounteredTag,
                                    @Nonnull final ValidatorProtos.ValidationResult.Builder result)
    throws TagValidationException {

    final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
    if (!spec.hasAmpLayout()) {
      throw new TagValidationException("Expecting AMP Layout null");
    }

    final HashMap<String, String> attrsByKey = encounteredTag.attrsByKey();
    final String layoutAttr = attrsByKey.get("layout");
    final String widthAttr = attrsByKey.get("width");
    final String heightAttr = attrsByKey.get("height");
    final String sizesAttr = attrsByKey.get("sizes");
    final String heightsAttr = attrsByKey.get("heights");

    // We disable validating layout for tags where one of the layout attributes
    // contains mustache syntax.
    final boolean hasTemplateAncestor = context.getTagStack().hasAncestor("TEMPLATE");
    if (hasTemplateAncestor
      && (attrValueHasTemplateSyntax(layoutAttr)
      || attrValueHasTemplateSyntax(widthAttr)
      || attrValueHasTemplateSyntax(heightAttr)
      || attrValueHasTemplateSyntax(sizesAttr)
      || attrValueHasTemplateSyntax(heightsAttr))) {
      return;
    }

    // Parse the input layout attributes which we found for this tag.
    final ValidatorProtos.AmpLayout.Layout inputLayout = TagSpecUtils.parseLayout(layoutAttr);
    if (layoutAttr != null
      && inputLayout == ValidatorProtos.AmpLayout.Layout.UNKNOWN) {
      List<String> params = new ArrayList<>();
      params.add("layout");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(layoutAttr);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    final CssLength inputWidth = new CssLength(
      widthAttr, /* allowAuto */ true,
      /* allowFluid */ inputLayout.equals(ValidatorProtos.AmpLayout.Layout.FLUID));
    if (!inputWidth.isValid()) {
      List<String> params = new ArrayList<>();
      params.add("width");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(widthAttr);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    final CssLength inputHeight = new CssLength(
      heightAttr, /* allowAuto */ true,
      /* allowFluid */ inputLayout == ValidatorProtos.AmpLayout.Layout.FLUID);
    if (!inputHeight.isValid()) {
      List<String> params = new ArrayList<>();
      params.add("height");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(heightAttr);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }

    // Now calculate the effective layout attributes.
    final CssLength width = TagSpecUtils.calculateWidth(spec.getAmpLayout(), inputLayout, inputWidth);
    final CssLength height = TagSpecUtils.calculateHeight(spec.getAmpLayout(), inputLayout, inputHeight);
    final ValidatorProtos.AmpLayout.Layout layout =
      TagSpecUtils.calculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

    // Validate for transformed AMP the server-side rendering layout.
    TagSpecUtils.validateSsrLayout(
      spec, encounteredTag, inputLayout, inputWidth, inputHeight, sizesAttr,
      heightsAttr, context, result);

    // Only FLEX_ITEM allows for height to be set to auto.
    if (height.isAuto() && layout != ValidatorProtos.AmpLayout.Layout.FLEX_ITEM) {
      List<String> params = new ArrayList<>();
      params.add("height");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(heightAttr);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }

    // Does the tag support the computed layout?
    if (spec.getAmpLayout().getSupportedLayoutsList().indexOf(layout) == -1) {
      final ValidatorProtos.ValidationError.Code code =
        (layoutAttr == null)
          ? ValidatorProtos.ValidationError.Code.IMPLIED_LAYOUT_INVALID
          : ValidatorProtos.ValidationError.Code.SPECIFIED_LAYOUT_INVALID;
      // Special case. If no layout related attributes were provided, this implies
      // the CONTAINER layout. However, telling the user that the implied layout
      // is unsupported for this tag is confusing if all they need is to provide
      // width and height in, for example, the common case of creating
      // an AMP-IMG without specifying dimensions. In this case, we emit a
      // less correct, but simpler error message that could be more useful to
      // the average user.
      if (code == ValidatorProtos.ValidationError.Code.IMPLIED_LAYOUT_INVALID
        && layout == ValidatorProtos.AmpLayout.Layout.CONTAINER
        && spec.getAmpLayout().getSupportedLayoutsList().indexOf(
        ValidatorProtos.AmpLayout.Layout.RESPONSIVE) != -1) {
        List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(spec));
        context.addError(
          ValidatorProtos.ValidationError.Code.MISSING_LAYOUT_ATTRIBUTES,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
        return;
      }
      List<String> params = new ArrayList<>();
      params.add(layout.toString());
      params.add(TagSpecUtils.getTagSpecName(spec));
      context.addError(
        code,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    // FIXED, FIXED_HEIGHT, INTRINSIC, RESPONSIVE must have height set.
    if ((layout == ValidatorProtos.AmpLayout.Layout.FIXED
      || layout == ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT
      || layout == ValidatorProtos.AmpLayout.Layout.INTRINSIC
      || layout == ValidatorProtos.AmpLayout.Layout.RESPONSIVE)
      && !height.isSet()) {
      List<String> params = new ArrayList<>();
      params.add("height");
      params.add(TagSpecUtils.getTagSpecName(spec));
      context.addError(
        ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
        context.getLineCol(),
        params, TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    // For FIXED_HEIGHT if width is set it must be auto.
    if (layout == ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT
      && width.isSet()
      && !width.isAuto()) {
      List<String> params = new ArrayList<>();
      params.add(widthAttr);
      params.add("width");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add("FIXED_HEIGHT");
      params.add("auto");
      context.addError(
        ValidatorProtos.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    // FIXED, INTRINSIC, RESPONSIVE must have width set and not be auto.
    if (layout == ValidatorProtos.AmpLayout.Layout.FIXED
      || layout == ValidatorProtos.AmpLayout.Layout.INTRINSIC
      || layout == ValidatorProtos.AmpLayout.Layout.RESPONSIVE) {
      if (!width.isSet()) {
        List<String> params = new ArrayList<>();
        params.add("width");
        params.add(TagSpecUtils.getTagSpecName(spec));
        context.addError(
          ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
        return;
      } else if (width.isAuto()) {
        List<String> params = new ArrayList<>();
        params.add("width");
        params.add(TagSpecUtils.getTagSpecName(spec));
        params.add("auto");
        context.addError(
          ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
          context.getLineCol(),
          params,
          TagSpecUtils.getTagSpecUrl(spec),
          result);
        return;
      }
    }
    // INTRINSIC, RESPONSIVE must have same units for height and width.
    if ((layout == ValidatorProtos.AmpLayout.Layout.INTRINSIC
      || layout == ValidatorProtos.AmpLayout.Layout.RESPONSIVE)
      && !(width.getUnit().equals(height.getUnit()))) {
      List<String> params = new ArrayList<>();
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(width.getUnit());
      params.add(height.getUnit());
      context.addError(
        ValidatorProtos.ValidationError.Code.INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(spec),
        result);
      return;
    }
    // RESPONSIVE only allows heights attribute.
    if (heightsAttr != null && layout != ValidatorProtos.AmpLayout.Layout.RESPONSIVE) {
      List<String> params = new ArrayList<>();
      params.add("height");
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(layout.toString());
      final ValidatorProtos.ValidationError.Code code =
        (layoutAttr == null)
          ? ValidatorProtos.ValidationError.Code.ATTR_DISALLOWED_BY_IMPLIED_LAYOUT
          : ValidatorProtos.ValidationError.Code.ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT;
      context.addError(code, context.getLineCol(), params, TagSpecUtils.getTagSpecUrl(spec), result);
      return;
    }
  }

  /**
   * Validates whether an encountered attribute is validated by an ExtensionSpec.
   * ExtensionSpec's validate the 'custom-element', 'custom-template', and 'src'
   * attributes. If an error is found, it is added to the |result|. The return
   * value indicates whether or not the provided attribute is explained by this
   * validation function.
   *
   * @param tagSpec   tag spec.
   * @param context   the context.
   * @param attrName  attribute name.
   * @param attrValue attribute value.
   * @param result    validation result.
   * @return returns value indicates whether or not the provided attribute is explained by validation function.
   * @throws TagValidationException the tag validation exception.
   */
  public static boolean validateAttributeInExtension(@Nonnull final ValidatorProtos.TagSpec tagSpec,
                                                     @Nonnull final Context context,
                                                     @Nonnull final String attrName,
                                                     @Nonnull final String attrValue,
                                                     @Nonnull final ValidatorProtos.ValidationResult.Builder result)
    throws TagValidationException {
    if (!tagSpec.hasExtensionSpec()) {
      throw new TagValidationException("Expecting extension spec not null");
    }

    final ValidatorProtos.ExtensionSpec extensionSpec = tagSpec.getExtensionSpec();
    // TagSpecs with extensions will only be evaluated if their dispatch_key
    // matches, which is based on this custom-element/custom-template/host-service
    // field attribute value. The dispatch key matching is case-insensitive for
    // faster lookups, so it still possible for the attribute value to not match
    // if it contains upper-case letters.
    if (tagSpec.hasExtensionSpec() && getExtensionNameAttribute(extensionSpec) == attrName) {
      if (!extensionSpec.getName().equals(attrValue)) {
        if (extensionSpec.getName().equals(attrValue.toLowerCase())) {
          throw new TagValidationException("Extension spec name is matched to a lower case attribute value.");
        }
        return false;
      }
      return true;
    } else if (attrName.equals("src")) {
      final Matcher reResult = SRC_URL_REGEX.matcher(attrValue);

      // If the src URL matches this regex and the base name of the file matches
      // the extension, look to see if the version matches.
      if (reResult.matches()
        && reResult.group(1).equals(extensionSpec.getName())) {
        final String encounteredVersion = reResult.group(2);
        boolean foundDecprecatedVersion = false;
        for (String deprecatedVersion : extensionSpec.getDeprecatedVersionList()) {
          if (deprecatedVersion.equals(encounteredVersion)) {
            foundDecprecatedVersion = true;
            break;
          }
        }
        if (foundDecprecatedVersion) {
          List<String> params = new ArrayList<>();
          params.add(extensionSpec.getName());
          params.add(encounteredVersion);
          context.addWarning(
            ValidatorProtos.ValidationError.Code.WARNING_EXTENSION_DEPRECATED_VERSION,
            context.getLineCol(),
            params,
            TagSpecUtils.getTagSpecUrl(tagSpec),
            result);
          return true;
        }

        boolean foundVersion = false;
        for (String version : extensionSpec.getVersionList()) {
          if (version.equals(encounteredVersion)) {
            foundVersion = true;
            break;
          }
        }
        if (foundVersion) {
          return true;
        }
      }
      List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(tagSpec));
      params.add(attrValue);
      context.addError(
        ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(tagSpec),
        result);
      return true;
    }
    return false;
  }

  /**
   * Determines the name of the attribute where you find the name of this sort of
   * extension. Typically, this will return 'custom-element'.
   *
   * @param extensionSpec extensionSpec
   * @return returns the name of the attribute where you find the name of this sort of extension.
   */
  public static String getExtensionNameAttribute(@Nonnull final ValidatorProtos.ExtensionSpec extensionSpec) {
    switch (extensionSpec.getExtensionType()) {
      case CUSTOM_TEMPLATE:
        return "custom-template";
      case HOST_SERVICE:
        return "host-service";
      default:
        return "custom-element";
    }
  }

  /**
   * Helper method for validateAttributes, for when an attribute is
   * encountered which is not specified by the validator.protoascii
   * specification.
   *
   * @param parsedTagSpec the parsed tag spec.
   * @param context       the context.
   * @param attrName      attribute name.
   * @param result        validation result.
   */
  public static void validateAttrNotFoundInSpec(@Nonnull final ParsedTagSpec parsedTagSpec,
                                                @Nonnull final Context context, @Nonnull final String attrName,
                                                @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    // For now, we just skip data- attributes in the validator, because
    // our schema doesn't capture which ones would be ok or not. E.g.
    // in practice, some type of ad or perhaps other custom elements require
    // particular data attributes.
    // http://www.w3.org/TR/html5/single-page.html#attr-data-*
    // http://w3c.github.io/aria-in-html/
    // However, to avoid parsing differences, we restrict the set of allowed
    // characters in the document.
    // If explicitAttrsOnly is true then do not allow data- attributes by default.
    // They must be explicitly added to the tagSpec.
    if (!parsedTagSpec.getSpec().hasExplicitAttrsOnly()
      && (DATA_PATTERN.matcher(attrName).matches())) {
      return;
    }

    // At this point, it's an error either way, but we try to give a
    // more specific error in the case of Mustache template characters.
    if (attrName.indexOf("{{") != -1) {
      List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()));
      context.addError(
        ValidatorProtos.ValidationError.Code.TEMPLATE_IN_ATTR_NAME,
        context.getLineCol(),
        params,
        context.getRules().getTemplateSpecUrl(), result);
    } else {
      List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()));
      context.addError(
        ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
        context.getLineCol(),
        params,
        TagSpecUtils.getTagSpecUrl(parsedTagSpec.getSpec()),
        result);
    }
  }

  /**
   * Specific checks for attribute values descending from a template tag.
   *
   * @param parsedTagSpec the parsed tag spec.
   * @param context       the context.
   * @param attrName      attribute name.
   * @param attrValue     attribute value.
   * @param result        the validation result.
   */
  public static void validateAttrValueBelowTemplateTag(@Nonnull final ParsedTagSpec parsedTagSpec,
                                                       @Nonnull final Context context,
                                                       @Nonnull final String attrName, @Nonnull final String attrValue,
                                                       @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    if (attrValueHasUnescapedTemplateSyntax(attrValue)) {
      final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
      List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(attrValue);
      context.addError(
        ValidatorProtos.ValidationError.Code.UNESCAPED_TEMPLATE_IN_ATTR_VALUE,
        context.getLineCol(),
        params,
        context.getRules().getTemplateSpecUrl(),
        result);
    } else if (attrValueHasPartialsTemplateSyntax(attrValue)) {
      final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
      List<String> params = new ArrayList<>();
      params.add(attrName);
      params.add(TagSpecUtils.getTagSpecName(spec));
      params.add(attrValue);
      context.addError(
        ValidatorProtos.ValidationError.Code.TEMPLATE_PARTIAL_IN_ATTR_VALUE,
        context.getLineCol(),
        params,
        context.getRules().getTemplateSpecUrl(),
        result);
    }

  }

  /**
   * Returns true if |value| contains a mustache partials template syntax.
   *
   * @param value a test value.
   * @return Returns true if |value| contains a mustache partials template syntax.
   */
  public static boolean attrValueHasPartialsTemplateSyntax(@Nonnull final String value) {
    // Mustache (https://mustache.github.io/mustache.5.html), our template
    // system, supports 'partials' which include other Mustache templates
    // in the format of {{>partial}} and there can be whitespace after the {{.
    // We disallow partials in attribute values.
    return PARTIALS_PATTERN.matcher(value).find();
  }

  /**
   * Returns true if |value| contains a mustache unescaped template syntax.
   *
   * @param value a test value.
   * @return returns true if |value| contains a mustache unescaped template syntax.
   */
  public static boolean attrValueHasUnescapedTemplateSyntax(@Nonnull final String value) {
    // Mustache (https://mustache.github.io/mustache.5.html), our template
    // system, supports {{{unescaped}}} or {{{&unescaped}}} and there can
    // be whitespace after the 2nd '{'. We disallow these in attribute Values.
    return UNESCAPED_OPEN_TAG.matcher(value).find();
  }

  /**
   * URL protocol pattern.
   */
  private static final Pattern URL_PROTOCOL_PATTERN = Pattern.compile("^([^:\\/?#.]+):.*$");

  /**
   * Only whitespace pattern.
   */
  private static final Pattern ONLY_WHITESPACE_PATTERN = Pattern.compile("^[\\s\\xa0]*$");

  /**
   * Partials pattern.
   */
  private static final Pattern PARTIALS_PATTERN = Pattern.compile("\\{\\{\\s*>");

  /**
   * Unescaped open tag pattern.
   */
  private static final Pattern UNESCAPED_OPEN_TAG = Pattern.compile("\\{\\{\\s*[&{]");

  /**
   * Data pattern.
   */
  private static final Pattern DATA_PATTERN = Pattern.compile("^data-[A-Za-z0-9-_:.]*$");

  /**
   * Mustache tag pattern.
   */
  private static final Pattern MUSTACHE_TAG_PATTERN = Pattern.compile("\\{\\{.*\\}\\}");

  /**
   * Src url Regex.
   */
  private static final Pattern SRC_URL_REGEX =
    Pattern.compile("^https:\\/\\/cdn\\.ampproject\\.org\\/v0\\/(amp-[a-z0-9-]*)-([a-z0-9.]*)\\.js$");
}
