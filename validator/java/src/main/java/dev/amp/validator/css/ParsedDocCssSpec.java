package dev.amp.validator.css;

import com.google.protobuf.ProtocolStringList;
import dev.amp.validator.ValidatorProtos;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    for (final ValidatorProtos.CssDeclaration declaration : spec.getDeclarationList()){
      if (!declaration.hasName()) continue;
      this.cssDeclarationByName.put(declaration.getName(), declaration);
      this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
    }
    for (final ValidatorProtos.CssDeclaration declaration : spec.getDeclarationSvgList()){
      if (!declaration.hasName()) continue;
      this.cssDeclarationSvgByName.put(declaration.getName(), declaration);
    }
    // Expand the list of declarations tracked by this spec by merging in any
    // declarations mentioned in declaration_lists referenced by this spec. This
    // mechanism reduces redundancy in the lists themselves, making rules more
    // readable.
//    for (final String declListName : spec.getDeclarationListList()){
//      for (const declList : declLists){
//        if (declList.name == = declListName) {
//          for (const declaration of declList.declaration){
//            if (declaration.name != = null) {
//              this.cssDeclarationByName_[declaration.name] = declaration;
//              this.cssDeclarationSvgByName_[declaration.name] = declaration;
//            }
//          }
//        }
//      }
//    }
//    for (const declListName of spec.declarationListSvg){
//      for (const declList of declLists){
//        if (declList.name == = declListName) {
//          for (const declaration of declList.declaration){
//            if (declaration.name != = null)
//              this.cssDeclarationSvgByName_[declaration.name] = declaration;
//          }
//        }
//      }
//    }
  }

  /**
   *
   */
  private final ValidatorProtos.DocCssSpec spec;

  /**
   *
   */
  private final Map<String, ValidatorProtos.CssDeclaration> cssDeclarationByName;

  /**
   *
   */
  private final HashMap<String, ValidatorProtos.CssDeclaration> cssDeclarationSvgByName;
}
