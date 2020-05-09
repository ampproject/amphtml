package dev.amp.validator.visitor;

import dev.amp.validator.css.Declaration;

import javax.annotation.Nonnull;
import java.util.List;

public class ImportantPropertyVisitor implements RuleVisitor {
    /**
     * walk through list of declarations
     *
     * @param important
     */
    public ImportantPropertyVisitor(@Nonnull final List<Declaration> important) {
        super();
        this.important = important;
    }

    /**
     * visits a declaration
     *
     * @param declaration to visit
     */
    public void visitDeclaration(@Nonnull final Declaration declaration) {
        if (declaration.getImportant()) {
            this.important.add(declaration);
        }
    }

    /**
     * the list belonging to visitor
     */
    private final List<Declaration> important;
}
