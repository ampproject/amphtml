package dev.amp.validator.visitor;

import dev.amp.validator.Context;
import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.ParsedDocCssSpec;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

public class InvalidDeclVisitor implements RuleVisitor {

    /**
     * Visitor for "important" css element
     *
     * @param spec
     * @param context
     * @param result
     */
    public InvalidDeclVisitor(@Nonnull final ParsedDocCssSpec spec, @Nonnull final Context context,
                              @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
        super();
        this.spec = spec;
        this.context = context;
        this.result = result;
    }

    /**
     * visitDeclaration implementation
     *
     * @param declaration the declaration to visit
     */
    public void visitDeclaration(final Declaration declaration) {
        if (this.spec.getCssDeclarationByName().get(declaration.getName()) != null) {
            List<String> params = new ArrayList<>();
            params.add(declaration.getName());
            params.add("style amp-custom");

            this.context.addError(
                    ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
                    context.getLineCol().getLineNumber() + declaration.getLine(),
                    context.getLineCol().getColumnNumber() + declaration.getCol(),
                    params, this.spec.getSpec().getSpecUrl(),
                    this.result);
        }
    }


    /**
     * ParsedDocCssSpec associated to Visitor
     */
    private final ParsedDocCssSpec spec;

    /**
     * reference to Context
     */
    private final Context context;

    /**
     * reference to result
     */
    private final ValidatorProtos.ValidationResult.Builder result;
}
