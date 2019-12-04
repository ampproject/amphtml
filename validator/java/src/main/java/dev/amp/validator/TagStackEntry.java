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

import org.xml.sax.Locator;

import javax.annotation.Nonnull;

/**
 * This class is the unit definition of the TagStack collection.
 * It is responsible for containing information relevant to evaluation of
 * future tags. It is a wrapper for the individual tags found in the html
 * document and maintains a record of child-parent relationships.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class TagStackEntry {
    /**
     * Constructor.
     *
     * @param tagName the tag name.
     */
    public TagStackEntry(@Nonnull final String tagName) {
        this.tagName = tagName;
        this.tagSpec = null;
        this.referencePoint = null;
        this.hasDescendantConstraintLists = false;
        this.numChildren = 0;
        this.onlyChildTagName = "";
        this.onlyChildErrorLineCol = null;
        this.lastChildSiblingCount = 0;
        this.lastChildTagName = "";
        this.lastChildUrl = "";
        this.lastChildErrorLineCol = null;
        this.cdataMatcher = null;
        this.childTagMatcher = null;
        this.referencePointMatcher = null;
    }

    /**
     * Getting the ParsedTagSpec instance.
     * @return the ParsedTagSpec instance.
     */
    public ParsedTagSpec getTagSpec() {
        return tagSpec;
    }

    /**
     * Getting the parsed tag spec of the reference point.
     * @return returns the parsed tag spec of the reference point.
     */
    public ParsedTagSpec getReferencePoint() {
        return referencePoint;
    }

    /**
     * Getting the descendant constraint list.
     * @return returns the descendant constraint list.
     */
    public boolean getHasDescendantConstraintLists() {
        return hasDescendantConstraintLists;
    }

    /**
     * Setting the descendant constraint lists value.
     * @param hasDescendantConstraintLists descendant constraint lists value.
     */
    public void setHasDescendantConstraintLists(final boolean hasDescendantConstraintLists) {
        this.hasDescendantConstraintLists = hasDescendantConstraintLists;
    }

    /**
     * Setting the parsed tag spec of the reference point.
     * @param referencePoint parsed tag spec.
     */
    public void setReferencePoint(@Nonnull final ParsedTagSpec referencePoint) {
        this.referencePoint = referencePoint;
    }

    /**
     * Setting the parsed tag spec.
     * @param tagSpec tag spec.
     */
    public void setTagSpec(@Nonnull final ParsedTagSpec tagSpec) {
        this.tagSpec = tagSpec;
    }

    /**
     * Getting the child tag matcher.
     * @return returns child tag matcher.
     */
    public ChildTagMatcher getChildTagMatcher() {
        return childTagMatcher;
    }

    /**
     * Setting the child tag matcher.
     * @param childTagMatcher child tag matcher.
     */
    public void setChildTagMatcher(@Nonnull final ChildTagMatcher childTagMatcher) {
        this.childTagMatcher = childTagMatcher;
    }

    /**
     * Setting the Cdata matcher.
     * @param cdataMatcher Cdata matcher.
     */
    public void setCdataMatcher(@Nonnull final CdataMatcher cdataMatcher) {
        this.cdataMatcher = cdataMatcher;
    }

    /**
     * Getting the reference point matcher.
     * @return returns the reference point matcher.
     */
    public ReferencePointMatcher getReferencePointMatcher() {
        return referencePointMatcher;
    }

    /**
     * Returning the number children count.
     * @return returns the number children count.
     */
    public int getNumChildren() {
        return numChildren;
    }

    /**
     * Increment the number children count.
     */
    public void incrementNumChildren() {
        numChildren++;
    }

    /**
     * Setting the only child tag name.
     * @param name only child tag name.
     */
    public void setOnlyChildTagName(@Nonnull final String name) {
        this.onlyChildTagName = name;
    }

    /**
     * Getting the only child tag name.
     * @return returns the only child tag name.
     */
    public String getOnlyChildTagName() {
        return onlyChildTagName;
    }

    /**
     * Setting the only child error line col.
     * @param lineCol the pair of line/col.
     */
    public void setOnlyChildErrorLineCol(@Nonnull final Locator lineCol) {
        this.onlyChildErrorLineCol = lineCol;
    }

    /**
     * Getting the only child error line col.
     * @return returns a pair of line/col.
     */
    public Locator getOnlyChildErrorLineCol() {
        return onlyChildErrorLineCol;
    }

    /**
     * Setting the reference point matcher.
     * @param referencePointMatcher reference point matcher.
     */
    public void setReferencePointMatcher(@Nonnull final ReferencePointMatcher referencePointMatcher) {
        this.referencePointMatcher = referencePointMatcher;
    }

    /**
     * Setting the last child tag name.
     * @param tagName last child tag name.
     */
    public void setLastChildTagName(@Nonnull final String tagName) {
        this.lastChildTagName = tagName;
    }

    /**
     * Getting the last child tag name.
     * @return returns the last child tag name.
     */
    public String getLastChildTagName() {
        return lastChildTagName;
    }

    /**
     * Getting the last child url.
     * @return returns the last child url.
     */
    public String getLastChildUrl() {
        return lastChildUrl;
    }

    /**
     * Setting the last child url.
     * @param lastChildUrl the last child url.
     */
    public void setLastChildUrl(@Nonnull final String lastChildUrl) {
        this.lastChildUrl = lastChildUrl;
    }

    /**
     * Getting the last child error line col.
     * @return returns the last child error line col.
     */
    public Locator getLastChildErrorLineCol() {
        return lastChildErrorLineCol;
    }

    /**
     * Setting the last child error line col.
     * @param lastChildErrorLineCol last child error line col.
     */
    public void setLastChildErrorLineCol(@Nonnull final Locator lastChildErrorLineCol) {
        this.lastChildErrorLineCol = lastChildErrorLineCol;
    }

    /**
     * Getting the Cdata matcher.
     * @return returns the Cdata matcher.
     */
    public CdataMatcher getCdataMatcher() {
        return cdataMatcher;
    }

    /**
     * Getting the tag name.
     * @return returns the tag name.
     */
    public String getTagName() {
        return this.tagName;
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.tagName = null;
        this.tagSpec = null;
        this.referencePoint = null;
        this.onlyChildTagName = null;
        this.onlyChildErrorLineCol = null;
        this.lastChildTagName = null;
        this.lastChildUrl = null;
        this.lastChildErrorLineCol = null;
        this.cdataMatcher = null;
        this.childTagMatcher = null;
        this.referencePointMatcher = null;
    }

    /** Tag name. */
    private String tagName;

    /** Tag spec object. */
    private ParsedTagSpec tagSpec;

    /** Tag spec of a reference point. */
    private ParsedTagSpec referencePoint;

    /** Flag for descendant constraint lists. */
    private boolean hasDescendantConstraintLists;

    /** Children count. */
    private int numChildren;

    /** Only child tag name. */
    private String onlyChildTagName;

    /** only child error line/col. */
    private Locator onlyChildErrorLineCol;

    /** Last child sibling count. */
    private int lastChildSiblingCount;

    /** Last child tag name. */
    private String lastChildTagName;

    /** Last child url. */
    private String lastChildUrl;

    /** Last child error line col. */
    private Locator lastChildErrorLineCol;

    /** Cdata matcher. */
    private CdataMatcher cdataMatcher;

    /** Child tag matcher. */
    private ChildTagMatcher childTagMatcher;

    /** Reference point matcher. */
    private ReferencePointMatcher referencePointMatcher;
}