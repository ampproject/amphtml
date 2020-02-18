package dev.amp.validator;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * This class contains the result of srcset parsing.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class SrcsetParsingResult {
    /** Default constructor. */
    public SrcsetParsingResult() {
        this.success = false;
        this.errorCode = ValidatorProtos.ValidationError.Code.UNKNOWN_CODE;
        this.srcsetImages = new ArrayList<>();
    }

    /**
     * Returns success flag.
     * @return returns success flag.
     */
    public boolean isSuccess() {
        return success;
    }

    /**
     * Setting the success flag.
     * @param success success flag.
     */
    public void setSuccess(final boolean success) {
        this.success = success;
    }

    /**
     * Returns the error code.
     * @return returns the error code.
     */
    public ValidatorProtos.ValidationError.Code getErrorCode() {
        return errorCode;
    }

    /**
     * Setting the error code.
     * @param errorCode the error code.
     */
    public void setErrorCode(@Nonnull final ValidatorProtos.ValidationError.Code errorCode) {
        this.errorCode = errorCode;
    }

    /**
     * Returns the srcset images.
     * @return returns the srcset images.
     */
    public List<SrcsetSourceDef> getSrcsetImages() {
        return srcsetImages;
    }

    /**
     * Add source set def to the list.
     * @param srcSetSourceDef the source set def.
     */
    public void add(@Nonnull final SrcsetSourceDef srcSetSourceDef) {
        srcsetImages.add(srcSetSourceDef);
    }

    /**
     * Setting the srcset images.
     * @param srcsetImages srcset images.
     */
    public void setSrcsetImages(@Nonnull final List<SrcsetSourceDef> srcsetImages) {
        this.srcsetImages = srcsetImages;
    }

    /**
     * Returns the size of srcset images.
     * @return returns the size of srcset images.
     */
    public int getSrcsetImagesSize() {
        return srcsetImages.size();
    }

    /** Flag success. */
    private boolean success;

    /** Error code. */
    private ValidatorProtos.ValidationError.Code errorCode;

    /** List of srcset images. */
    private List<SrcsetSourceDef> srcsetImages;
}

