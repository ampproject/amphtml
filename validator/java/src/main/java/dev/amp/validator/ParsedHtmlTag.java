package dev.amp.validator;

import org.xml.sax.Attributes;

import javax.annotation.Nonnull;
import java.util.HashMap;

/**
 * The AMP HTML ParsedHtmlTag class.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedHtmlTag {
    /**
     * Constructor.
     *
     * @param tagName the name of the underlying tag in html document.
     * @param attributes the attributes attached to the element.  If
     *  there are no attributes, it shall be an empty Attributes object.
     */
    public ParsedHtmlTag(@Nonnull final String tagName, @Nonnull final Attributes attributes) {
        this.tagName = tagName.toUpperCase();
        this.attrs = attributes;
        this.attrsByKey = null;
    }

    /**
     * Lower-case tag name.
     * @return returns a lower case tag name.
     */
    public String lowerName() {
        return this.tagName.toLowerCase();
    }

    /**
     * Returns an array of attributes. Each attribute has two fields: name and
     * value. Name is always lower-case, value is the case from the original
     * document. Values are unescaped.
     * @return returns the attributes.
     */
    public Attributes attrs() {
        return this.attrs;
    }

    /**
     * Returns an object mapping attribute name to attribute value. This is
     * populated lazily, as it's not used for most tags.
     * @return a HashMap of attribute name to attribute value
     * */
    public HashMap<String, String> attrsByKey() {
        if (this.attrsByKey == null) {
            this.attrsByKey = new HashMap<>();
            for (int i = 0; i < attrs.getLength(); i++) {
                this.attrsByKey.put(attrs.getLocalName(i), attrs.getValue(i));
            }
        }
        return this.attrsByKey;
    }

    /**
     * Returns a duplicate attribute name if the tag contains two attributes
     * named the same, but with different attribute values. Same attribute name
     * AND value is OK. Returns null if there are no such duplicate attributes.
     * @return returns a duplicate attribute name if the tag contains two attributes named the same.
     */
    public String hasDuplicateAttrs() {
        String lastAttrName = "";
        String lastAttrValue = "";
        for (int i = 0; i < attrs.getLength(); i++) {
            if (lastAttrName.equals(attrs.getLocalName(i))
                    && !lastAttrValue.equals(attrs.getValue(i))) {
                return attrs.getLocalName(i);
            }
            lastAttrName = attrs.getLocalName(i);
            lastAttrValue = attrs.getValue(i);
        }
        return null;
    }

    /**
     * Need to replace the value with an empty string if attr name is equal to the value.
     * @param attrName attr name.
     * @param index index to the Attributes.
     * @return returns the value.
     */
    public String getValue(@Nonnull final String attrName, final int index) {
        String val = attrs.getValue(index);
        if (val != null && val.equals(attrName.toLowerCase())) {
            return "";
        }

        return val;
    }

    /**
     * Method to nullify object values.
     */
    public void cleanup() {
        this.tagName = null;
        this.attrsByKey = null;
    }

    /**
     * Upper-case tag name.
     * @return returns a upper case tag name.
     */
    public String upperName() {
        return this.tagName.toUpperCase();
    }

    /**
     * Returns true if tag name length is zero.
     * @return returns true if tag name length is zero.
     */
    public boolean isEmpty() {
        return this.tagName.length() == 0;
    }

    /** The parsed tag name. */
    @Nonnull
    private String tagName;

    /** The attributes. */
    @Nonnull
    private final Attributes attrs;

    /** Lazily allocated map from attribute name to value */
    private HashMap<String, String> attrsByKey;
}