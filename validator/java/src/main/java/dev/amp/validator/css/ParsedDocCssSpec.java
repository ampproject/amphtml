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

package dev.amp.validator.css;

import dev.amp.validator.ParsedUrlSpec;
import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.utils.CssSpecUtils;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Wrapper around DocCssSpec.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedDocCssSpec {
    /**
     * constructor
     *
     * @param spec      the spec to validate against
     * @param declLists the list of declarations to populate
     */
    public ParsedDocCssSpec(final ValidatorProtos.DocCssSpec spec,
                            final List<ValidatorProtos.DeclarationList> declLists) {
        this.spec = spec;
        this.cssDeclarationByName = new HashMap<>();
        this.cssDeclarationSvgByName = new HashMap<>();

        for (final ValidatorProtos.CssDeclaration declaration : spec.getDeclarationList()) {
            if (declaration.hasName()) {
                this.cssDeclarationByName.put(declaration.getName(), declaration);
                this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
            }
        }
        for (final ValidatorProtos.CssDeclaration declaration : spec.getDeclarationSvgList()) {
            if (declaration.hasName()) {
                this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
            }
        }

        // Expand the list of declarations tracked by this spec by merging in any
        // declarations mentioned in declaration_lists referenced by this spec. This
        // mechanism reduces redundancy in the lists themselves, making rules more
        // readable.
        for (final String declListName : spec.getDeclarationListList()) {
            for (final ValidatorProtos.DeclarationList declList : declLists) {
                if (declList.hasName() && declList.getName().equals(declListName)) {
                    for (final ValidatorProtos.CssDeclaration declaration : declList.getDeclarationList()) {
                        if (declaration.hasName()) {
                            this.cssDeclarationByName.put(declaration.getName(), declaration);
                            this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
                        }
                    }
                }
            }
        }
        for (final String declListName : spec.getDeclarationListSvgList()) {
            for (final ValidatorProtos.DeclarationList declList : declLists) {
                if (declList.hasName() && declList.getName().equals(declListName)) {
                    for (final ValidatorProtos.CssDeclaration declaration : declList.getDeclarationList()) {
                        if (declaration.hasName()) {
                            this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
                        }
                    }
                }
            }
        }

        this.parsedImageUrlSpec = new ParsedUrlSpec(spec.getImageUrlSpec());
        this.parsedFontUrlSpec = new ParsedUrlSpec(spec.getFontUrlSpec());
    }

    /**
     * @param candidate Returns the CssDeclaration rules for a matching css declaration name, if is
     *                  found, else null.
     * @return the CssDeclaration rules for a matching css declaration name, else null
     */
    public ValidatorProtos.CssDeclaration getCssDeclarationSvgByName(@Nonnull final String candidate) {
        String key = candidate.toLowerCase();
        if (this.getSpec().getExpandVendorPrefixes()) {
            key = CssSpecUtils.stripVendorPrefix(key);
        }
        ValidatorProtos.CssDeclaration cssDeclaration = this.cssDeclarationSvgByName.get(key);
        if (cssDeclaration != null) {
            return cssDeclaration;
        }
        return null;
    }

    /**
     * Returns the CssDeclaration rules for a matching css declaration name, if is
     * found, else null.
     *
     * @param candidate to check for
     * @return the CssDeclaration from mapping
     */
    public ValidatorProtos.CssDeclaration getCssDeclarationByName(@Nonnull final String candidate) {
        String key = candidate.toLowerCase();
        if (this.getSpec().getExpandVendorPrefixes()) {
            key = CssSpecUtils.stripVendorPrefix(key);
        }
        ValidatorProtos.CssDeclaration cssDeclaration = this.cssDeclarationByName.get(key);
        if (cssDeclaration != null) {
            return cssDeclaration;
        }
        return null;
    }

    /**
     * getter for cssDeclarationByName
     *
     * @return this cssDeclarationByName
     */
    public Map<String, ValidatorProtos.CssDeclaration> getCssDeclarationByName() {
        return this.cssDeclarationByName;
    }

    public ValidatorProtos.DocCssSpec getSpec() {
        return spec;
    }

    /**
     * @return list of enabled by elements
     */
    public List<String> enabledBy() {
        return this.spec.getEnabledByList();
    }

    /**
     * @return list of disabled by elements
     */
    public List<String> disabledBy() {
        return this.spec.getDisabledByList();
    }

    /**
     * return this doc css fontUrlSpec
     *
     * @return this doc css fontUrlSpec
     */
    public ParsedUrlSpec getFontUrlSpec() {
        return this.parsedFontUrlSpec;
    }

    /**
     * @return this doc css imageUrlSpec
     */
    public ParsedUrlSpec getImageUrlSpec() {
        return this.parsedImageUrlSpec;
    }

    /**
     * The DocCssSpec.
     */
    private final ValidatorProtos.DocCssSpec spec;

    /**
     * Map to store CssDeclaration by declaration name.
     */
    private final Map<String, ValidatorProtos.CssDeclaration> cssDeclarationByName;

    /**
     * Map to store CssDeclaration by declaration Svg name.
     */
    private final HashMap<String, ValidatorProtos.CssDeclaration> cssDeclarationSvgByName;

    /**
     * The ParsedUrlSpec for image url.
     */
    private ParsedUrlSpec parsedImageUrlSpec;

    /**
     * The ParsedUrlSpec for font url.
     */
    private ParsedUrlSpec parsedFontUrlSpec;
}
