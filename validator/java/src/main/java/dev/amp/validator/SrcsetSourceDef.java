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

import javax.annotation.Nonnull;

/**
 * This class contains a single source within a srcset.
 *
 *  @author nhant01
 *  @author GeorgeLuo
 */

public class SrcsetSourceDef {
    /**
     * Constructor.
     * @param url the url.
     * @param widthOrPixelDensity width or pixel density.
     */
    public SrcsetSourceDef(@Nonnull final String url, @Nonnull final String widthOrPixelDensity) {
        this.url = url;
        this.widthOrPixelDensity = widthOrPixelDensity;
    }

    /**
     * Returns the url.
     * @return returns the url.
     */
    public String getUrl() {
        return url;
    }

    /**
     * Returns the width or pixel density.
     * @return returns the width or pixel density.
     */
    public String getWidthOrPixelDensity() {
        return widthOrPixelDensity;
    }

    /** The url. */
    private String url;

    /** Width or pixel density. */
    private String widthOrPixelDensity;
}


