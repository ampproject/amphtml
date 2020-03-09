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

import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.utils.TagSpecUtils;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * This class keeps track of the tag names and ChildTagMatchers
 * as we enter / exit tags in the document. Closing tags is tricky:
 * - We assume that all end tags are optional and we close, that is, pop off
 * tags our stack, lazily as we encounter parent closing tags. This part
 * differs slightly from the behavior per spec: instead of closing an
 * option tag when a following option tag is seen, we close it when the
 * parent closing tag (in practice select) is encountered.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class TagStack {
  /**
   * Constructor.
   */
  public TagStack() {
    this.stack = new LinkedList<>();
    //TODO - REMOVE DOCTYPE when tagchowder supports doctype element.
    this.stack.add(new TagStackEntry("$ROOT"));
    this.stack.add(new TagStackEntry("!DOCTYPE"));
  }

  /**
   * Returns true if this within lt;style amp-custom gt;.
   *
   * @return returns true if this within lt;style amp-custom gt; Else false.
   * @throws TagValidationException the TagValidationException.
   */
  public boolean isStyleAmpCustomChild() throws TagValidationException {
    return (this.parentStackEntry().getTagSpec() != null)
      && (this.parentStackEntry().getTagSpec().getSpec().getNamedId()
      == ValidatorProtos.TagSpec.NamedId.STYLE_AMP_CUSTOM);
  }

  /**
   * The parent of the current stack entry.
   *
   * @return TagStackEntry the TagStackEntry.
   * @throws TagValidationException the TagValidationException.
   */
  public TagStackEntry parentStackEntry() throws TagValidationException {
    if (this.stack.size() < 1) {
      throw new TagValidationException("Parent of empty $ROOT tag requested.");
    }
    return this.back();
  }

  /**
   * Alias to the last element on the tag stack.
   *
   * @return TagStackEntry the TagStackEntry.
   * @throws TagValidationException the TagValidationException.
   */
  public TagStackEntry back() throws TagValidationException {
    if (this.stack.size() <= 0) {
      throw new TagValidationException("Exiting an empty tag stack.");
    }
    return this.stack.getLast();
  }

  /**
   * Returns the parent stack entry reference point matcher.
   *
   * @return returns the parent stack entry reference point matcher.
   * @throws TagValidationException the TagValidationException.
   */
  public ReferencePointMatcher parentReferencePointMatcher() throws TagValidationException {
    return this.parentStackEntry().getReferencePointMatcher();
  }

  /**
   * Tells the parent of the current stack entry that it can only have 1 child
   * and that child must be me (the current stack entry).
   *
   * @param tagName The current stack entry's tag name.
   * @param lineCol pair of line/col.
   * @throws TagValidationException the TagValidationException.
   */
  public void tellParentNoSiblingsAllowed(@Nonnull final String tagName, @Nonnull final Locator lineCol)
    throws TagValidationException {
    this.parentStackEntry().setOnlyChildTagName(tagName);
    this.parentStackEntry().setOnlyChildErrorLineCol(lineCol);
  }

  /**
   * Returns the parent only child error line col.
   *
   * @return returns the Locator of the tag that set the rule.
   * @throws TagValidationException the TagValidationException.
   */
  public Locator parentOnlyChildErrorLineCol() throws TagValidationException {
    return this.parentStackEntry().getOnlyChildErrorLineCol();
  }

  /**
   * @return returns the name of the tag that set the 'no siblings allowed'
   * rule.
   * @throws TagValidationException the TagValidationException.
   */
  public String parentOnlyChildTagName() throws TagValidationException {
    return this.parentStackEntry().getOnlyChildTagName();
  }

  /**
   * @return returns true if this tag's parent has a child with 'no siblings
   * allowed' rule. Else false.
   * @throws TagValidationException the TagValidationException.
   */
  public boolean parentHasChildWithNoSiblingRule() throws TagValidationException {
    return this.parentOnlyChildTagName().length() > 0;
  }

  /**
   * Returns the Locator of the tag that set the 'last child' rule.
   *
   * @return The Locator of the tag that set the 'last child' rule.
   * @throws TagValidationException the TagValidationException.
   */
  public Locator parentLastChildErrorLineCol() throws TagValidationException {
    return this.parentStackEntry().getLastChildErrorLineCol();
  }

  /**
   * Returns the list of DescendantConstraints.
   *
   * @return returns the list of DescendantConstraints.
   */
  public List<DescendantConstraints> allowedDescendantsList() {
    return this.allowedDescendantsList;
  }

  /**
   * Tells the parent of the current stack entry that its last child must be me
   * (the current stack entry).
   *
   * @param tagName The current stack entry's tag name.
   * @param url     The current stack entry's spec url.
   * @param lineCol a pair line/col.
   * @throws TagValidationException the TagValidationException.
   */
  public void tellParentImTheLastChild(@Nonnull final String tagName,
                                       @Nonnull final String url,
                                       @Nonnull final Locator lineCol)
    throws TagValidationException {
    this.parentStackEntry().setLastChildTagName(tagName);
    this.parentStackEntry().setLastChildErrorLineCol(lineCol);
    this.parentStackEntry().setLastChildUrl(url);
  }

  /**
   * This method is called as we're visiting a tag; so the matcher we
   * need here is the one provided/specified for the tag parent.
   *
   * @param encounteredTag encountered tag.
   * @param context        the Context object.
   * @param result         validation result.
   * @throws TagValidationException the TagValidationException.
   */
  public void matchChildTagName(@Nonnull final ParsedHtmlTag encounteredTag,
                                @Nonnull final Context context,
                                @Nonnull final ValidatorProtos.ValidationResult.Builder result)
    throws TagValidationException {
    final ChildTagMatcher matcher = this.parentStackEntry().getChildTagMatcher();
    if (matcher != null) {
      matcher.matchChildTagName(encounteredTag, context, result);
    }
  }

  /**
   * Returns true if this within script type=application/json. Else false.
   *
   * @return returns true if this within script type=application/json. Else
   * false.
   * @throws TagValidationException the TagValidationException.
   */
  public boolean isScriptTypeJsonChild() throws TagValidationException {
    return (this.parentStackEntry().getTagName().equals("SCRIPT")
      && (this.parentStackEntry().getTagSpec() != null)
      && this.parentStackEntry().getTagSpec().isTypeJson());
  }

  /**
   * Returns true if the current tag has ancestor with the given tag name or
   * specName.
   *
   * @param ancestor ancestor tag.
   * @return returns true if the current tag has ancestor with the given tag name or specName.
   */
  public boolean hasAncestor(@Nonnull final String ancestor) {
    // Skip the first element, which is "$ROOT".
    for (int i = 1; i < this.stack.size(); ++i) {
      if (this.stack.get(i).getTagName().equals(ancestor)) {
        return true;
      }
      if ((this.stack.get(i).getTagSpec() != null)
        && (this.stack.get(i).getTagSpec().getSpec().getSpecName().equals(ancestor))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if the current tag has an ancestor which set the given marker.
   *
   * @param query the ancestor marker.
   * @return returns true if the current tag has an ancestor which set the given marker.
   * @throws TagValidationException the TagValidationException.
   */
  public boolean hasAncestorMarker(@Nonnull final ValidatorProtos.AncestorMarker.Marker query) throws TagValidationException {
    if (query == ValidatorProtos.AncestorMarker.Marker.UNKNOWN) {
      throw new TagValidationException("Ancestor marker is unknown");
    }
    // Skip the first element, which is "$ROOT".
    for (int i = 1; i < this.stack.size(); ++i) {
      if (this.stack.get(i).getTagSpec() == null) {
        continue;
      }
      final ValidatorProtos.TagSpec spec = this.stack.get(i).getTagSpec().getSpec();
      if (!spec.hasMarkDescendants()) {
        continue;
      }
      for (final ValidatorProtos.AncestorMarker.Marker marker : spec.getMarkDescendants().getMarkerList()) {
        if (marker == query) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Enter a tag, opening a scope for child tags.
   *
   * @param tagName              the tag name.
   * @param referencePointResult the reference point result.
   * @param tagResult            the tag result.
   */
  private void enterTag(@Nonnull final String tagName, @Nonnull final ValidateTagResult referencePointResult,
                        @Nonnull final ValidateTagResult tagResult) {
    final TagStackEntry stackEntry = new TagStackEntry(tagName);
    stackEntry.setReferencePoint(referencePointResult.getBestMatchTagSpec());
    stackEntry.setTagSpec(tagResult.getBestMatchTagSpec());
    this.stack.add(stackEntry);
  }

  /**
   * Upon exiting a tag, validation for the current child tag matcher is
   * triggered, e.g. for checking that the tag had some specified number
   * of children.
   *
   * @param context the context.
   * @param result  the ValidationResult.
   * @throws TagValidationException the TagValidationException.
   */
  public void exitTag(@Nonnull final Context context, @Nonnull final ValidatorProtos.ValidationResult.Builder result)
    throws TagValidationException {
    if (this.stack.size() <= 0) {
      throw new TagValidationException("Exiting an empty tag stack.");
    }

    this.unSetDescendantConstraintList();
    final TagStackEntry topStackEntry = this.back();

    if (topStackEntry.getChildTagMatcher() != null) {
      topStackEntry.getChildTagMatcher().exitTag(context, result);
    }
    if (topStackEntry.getReferencePointMatcher() != null) {
      topStackEntry.getReferencePointMatcher().exitParentTag(context, result);
    }

    this.stack.removeLast();
  }

  /**
   * Given a ValidateTagResult, update the tag stack entry at the top of the
   * tag stack to add any constraints from the spec.
   *
   * @param result      the ValidateTagResult.
   * @param parsedRules the ParsedValidatorRules.
   * @param lineCol     a pair of line/col.
   * @throws TagValidationException the TagValidationException.
   */
  public void updateStackEntryFromTagResult(@Nonnull final ValidateTagResult result,
                                            @Nonnull final ParsedValidatorRules parsedRules,
                                            @Nonnull final Locator lineCol) throws TagValidationException {
    if (result.getBestMatchTagSpec() == null) {
      return;
    }

    final ParsedTagSpec parsedTagSpec = result.getBestMatchTagSpec();

    this.setReferencePointMatcher(
      parsedTagSpec.referencePointMatcher(parsedRules, lineCol));

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (result.getValidationResult().getStatus()
      == ValidatorProtos.ValidationResult.Status.PASS) {
      this.setChildTagMatcher(parsedTagSpec.childTagMatcher());
      this.setCdataMatcher(parsedTagSpec.cdataMatcher(lineCol));
      this.setDescendantConstraintList(parsedTagSpec, parsedRules);
    }
  }

  /**
   * Update tagstack state after validating an encountered tag. Called with the
   * best matching specs, even if not a match.
   *
   * @param encounteredTag       the ParsedHtmlTag.
   * @param referencePointResult reference point result.
   * @param tagResult            tag result.
   * @param parsedRules          parsed rules.
   * @param lineCol              a pair line/col.
   * @throws TagValidationException the TagValidationException.
   */
  public void updateFromTagResults(
    @Nonnull final ParsedHtmlTag encounteredTag, @Nonnull final ValidateTagResult referencePointResult,
    @Nonnull final ValidateTagResult tagResult, @Nonnull final ParsedValidatorRules parsedRules,
    @Nonnull final Locator lineCol) throws TagValidationException {
    // Keep track of the number of direct children this tag has, even as we
    // pop in and out of them on the stack.
    this.parentStackEntry().incrementNumChildren();

    // Record in the parent element that a reference point has been satisfied,
    // even if the reference point didn't match completely.
    if (referencePointResult.getBestMatchTagSpec() != null) {
      if (this.parentReferencePointMatcher() == null) {
        throw new TagValidationException("Parent's reference point matcher is null");
      }
      this.parentReferencePointMatcher().recordMatch(
        /** @type{!ParsedTagSpec} */(referencePointResult.getBestMatchTagSpec()));
    }

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (tagResult.getValidationResult().getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
      final ParsedTagSpec parsedTagSpec = tagResult.getBestMatchTagSpec();
      final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
      // Record that this tag must not have any siblings.
      if (tagSpec.getSiblingsDisallowed()) {
        this.tellParentNoSiblingsAllowed(tagSpec.getTagName(), lineCol);
      }

      // Record that this tag must be the last child of it's parent.
      if (tagSpec.getMandatoryLastChild()) {
        this.tellParentImTheLastChild(
          TagSpecUtils.getTagSpecName(tagSpec), TagSpecUtils.getTagSpecUrl(tagSpec), lineCol);
      }
    }

    // Add the tag to the stack, and then update the stack entry.
    this.enterTag(encounteredTag.upperName(), referencePointResult, tagResult);

    this.updateStackEntryFromTagResult(
      referencePointResult, parsedRules, lineCol);
    this.updateStackEntryFromTagResult(tagResult, parsedRules, lineCol);
  }

  /**
   * Updates the allowed descendants list if a tag introduced constraints. This
   * is called when exiting a tag.
   *
   * @throws TagValidationException the TagValidationException.
   */
  private void unSetDescendantConstraintList() throws TagValidationException {
    if (this.hasDescendantConstraintLists()) {
      // pop operation, remove last item from list.
      this.allowedDescendantsList.remove(this.allowedDescendantsList.size() - 1);
      this.setHasDescendantConstraintLists(false);
    }
  }

  /**
   * @return {boolean} true if the tag introduced descendant constraints.
   * Else false.
   * @throws TagValidationException the TagValidationException.
   */
  private boolean hasDescendantConstraintLists() throws TagValidationException {
    return this.back().getHasDescendantConstraintLists();
  }

  /**
   * Setting descendant constraint lists.
   *
   * @param value a boolean value.
   * @throws TagValidationException the TagValidationException.
   */
  private void setHasDescendantConstraintLists(final boolean value) throws TagValidationException {
    this.back().setHasDescendantConstraintLists(value);
  }

  /**
   * The spec_name of the parent of the current tag if one exists, otherwise the
   * tag_name.
   *
   * @return The spec_name of the parent of the current tag, or tag_name
   * @throws TagValidationException the TagValidationException.
   */
  public String parentTagSpecName() throws TagValidationException {
    if ((this.parentStackEntry().getTagSpec() != null)
      && (this.parentStackEntry().getTagSpec().getSpec().hasSpecName())) {
      return (
        this.parentStackEntry().getTagSpec().getSpec().getSpecName());
    }
    return this.parentStackEntry().getTagName();
  }

  /**
   * The number of children that have been discovered up to now by traversing
   * the stack.
   *
   * @return returns parent stack's num children.
   * @throws TagValidationException the TagValidationException.
   */
  public int parentChildCount() throws TagValidationException {
    return this.parentStackEntry().getNumChildren();
  }

  /**
   * Sets the reference point matcher for the tag currently on the stack.
   *
   * @param matcher reference point matcher.
   * @throws TagValidationException the TagValidationException.
   */
  public void setReferencePointMatcher(final ReferencePointMatcher matcher) throws TagValidationException {
    if (matcher != null) {
      this.back().setReferencePointMatcher(matcher);
    }
  }

  /**
   * Sets the child tag matcher for the tag currently on the stack.
   *
   * @param matcher child tag matcher.
   * @throws TagValidationException the TagValidationException.
   */
  public void setChildTagMatcher(final ChildTagMatcher matcher) throws TagValidationException {
    if (matcher != null) {
      this.back().setChildTagMatcher(matcher);
    }
  }

  /**
   * Sets the cdata matcher for the tag currently on the stack.
   *
   * @param matcher Cdata matcher.
   * @throws TagValidationException the TagValidationException.
   */
  public void setCdataMatcher(final CdataMatcher matcher) throws TagValidationException {
    if (matcher != null) {
      this.back().setCdataMatcher(matcher);
    }
  }

  /**
   * Returns the cdata matcher for the tag currently on the stack. If there
   * is no cdata matcher, returns null.
   *
   * @return returns the CdataMatcher for the tag currently on the stack.
   * @throws TagValidationException the TagValidationException.
   */
  public CdataMatcher cdataMatcher() throws TagValidationException {
    return this.back().getCdataMatcher();
  }

  /**
   * The name of the parent of the current tag.
   *
   * @return returns the parent stack entry tag name.
   * @throws TagValidationException the TagValidationException.
   */
  public String parentTagName() throws TagValidationException {
    return this.parentStackEntry().getTagName();
  }

  /**
   * @return returns the name of the tag with the 'last child' rule.
   * @throws TagValidationException the TagValidationException.
   */
  public String parentLastChildTagName() throws TagValidationException {
    return this.parentStackEntry().getLastChildTagName();
  }

  /**
   * @return returns the spec url of the last child.
   * @throws TagValidationException the TagValidationException.
   */
  public String parentLastChildUrl() throws TagValidationException {
    return this.parentStackEntry().getLastChildUrl();
  }

  /**
   * @return returns true if this tag's parent has a child with 'last child'
   * rule. Else false.
   * @throws TagValidationException the TagValidationException.
   */
  public boolean parentHasChildWithLastChildRule() throws TagValidationException {
    return this.parentLastChildTagName().length() > 0;
  }

  /**
   * Setting the descendant constraint list.
   *
   * @param parsedTagSpec the parsed tag spec.
   * @param parsedRules   the parsed rules.
   * @throws TagValidationException the TagValidationException.
   */
  public void setDescendantConstraintList(@Nonnull final ParsedTagSpec parsedTagSpec,
                                          @Nonnull final ParsedValidatorRules parsedRules)
    throws TagValidationException {
    if (parsedTagSpec.getSpec().getDescendantTagList() == null
      || parsedTagSpec.getSpec().getDescendantTagList().equals("")) {
      return;
    }

    List<String> allowedDescendantsForThisTag = new ArrayList<>();
    for (final ValidatorProtos.DescendantTagList descendantTagList : parsedRules.getDescendantTagLists()) {
      // Get the list matching this tag's descendant tag name.
      if (parsedTagSpec.getSpec().getDescendantTagList().equals(descendantTagList.getName())) {
        for (final String tag : descendantTagList.getTagList()) {
          allowedDescendantsForThisTag.add(tag);
        }
      }
    }

    final String tagName = TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec());
    if (tagName != null && !tagName.equals("")) {
      this.allowedDescendantsList.add(new DescendantConstraints(
        TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()),
        allowedDescendantsForThisTag));
      this.setHasDescendantConstraintLists(true);
    }
  }

  /**
   * The current tag name and its parents.
   */
  @Nonnull
  private LinkedList<TagStackEntry> stack;

  /**
   * Allowed descendant list.
   */
  @Nonnull
  private List<DescendantConstraints> allowedDescendantsList = new ArrayList<>();

}

