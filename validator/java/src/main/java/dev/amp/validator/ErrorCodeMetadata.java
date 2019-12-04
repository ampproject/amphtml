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

/**
 * Error code meta data data holder.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ErrorCodeMetadata {
    /**
     * Default constructor.
     */
    public ErrorCodeMetadata() {
    }

    /**
     * Getting the format.
     * @return returns the format.
     */
    public String getFormat() {
        return format;
    }

    /**
     * Setting the format.
     * @param format the format.
     */
    public void setFormat(final String format) {
        this.format = format;
    }

    /**
     * Getting the specificity.
     * @return returns the specificity.
     */
    public int getSpecificity() {
        return specificity;
    }

    /**
     * Setting the specificity.
     * @param specificity the specificity.
     */
    public void setSpecificity(final int specificity) {
        this.specificity = specificity;
    }

    /** The format. */
    private String format;

    /** The specificity. */
    private int specificity;
}
