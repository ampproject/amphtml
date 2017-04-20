
/* Lexical grammar */
%lex
%%
\s+                       /* skip whitespace */
"AND"                     return 'AND'
"OR"                      return 'OR'
"NOT"                     return 'NOT'
"NULL"                    return 'NULL'
"TRUE"                    return 'TRUE'
"true"                    return 'TRUE'
"FALSE"                   return 'FALSE'
"false"                   return 'FALSE'
"("                       return '('
")"                       return ')'
"|"                       return '|'
"<="                      return 'LTE'
"<"                       return 'LT'
">="                      return 'GTE'
">"                       return 'GT'
"!="                      return 'NEQ'
"=="                      return 'DEQ'
"="                       return 'EQ'
[0-9]+("."[0-9]+)?\b      return 'NUMERIC'
[a-zA-Z_][a-zA-Z0-9_]*    return 'NAME'
\'[^\']*\'                return 'STRING'
\"[^\"]*\"                return 'STRING'
\.                        return 'DOT'
.                         return 'INVALID'
<<EOF>>                   return 'EOF'
/lex


/* Symbolic tokens */

%token NAME
%token STRING
%token NUMERIC
%token TRUE FALSE
%token NULL
%token DOT
%token EOF


/* Operators */

%left OR
%left AND
%left NOT
%left EQ
%left NEQ


%%

/* Rules */

result:
    search_condition EOF
      {return $1;}
  ;

/**
 * Top level conditions: logical boolean operators or parenthesis.
 * Ex: `X = 1 OR X = 2`, `NOT (X = 1)`, `(X = 1)`
 */
search_condition:
    search_condition OR search_condition
      {$$ = $1 || $3;}
  | search_condition AND search_condition
      {$$ = $1 && $3;}
  | NOT search_condition
      {$$ = !$2;}
  | '(' search_condition ')'
      {$$ = $2;}
  | predicate
      {$$ = $1;}
  ;

/**
 * Comparison or "truthy" predicates.
 * Ex: `X = 1` or just `X`
 */
predicate:
    comparison_predicate
      {$$ = $1;}
  | truthy_predicate
      {$$ = $1;}
  ;

/**
 * Comparison predicates.
 * Ex: `X = 1`, `X != 1`, `X <= 10`.
 */
comparison_predicate:
    scalar_exp EQ scalar_exp
      {$$ = $1 === $3;}
  | scalar_exp DEQ scalar_exp
      {throw new Error('"==" is not allowed, use "="');}
  | scalar_exp NEQ scalar_exp
      {$$ = $1 !== $3;}
  | scalar_exp LT scalar_exp
      {$$ = typeof $1 == typeof $3 && $1 < $3;}
  | scalar_exp LTE scalar_exp
      {$$ = typeof $1 == typeof $3 && $1 <= $3;}
  | scalar_exp GT scalar_exp
      {$$ = typeof $1 == typeof $3 && $1 > $3;}
  | scalar_exp GTE scalar_exp
      {$$ = typeof $1 == typeof $3 && $1 >= $3;}
  ;

/**
 * "Truthy" predicate where only one term is used without operators. It's
 * evaluated to boolean using the following rule:
 * `X != null && X != '' && X != 0 && X != false`
 *
 * Ex: `X`.
 */
truthy_predicate:
    scalar_exp
      {$$ = ($1 !== undefined && $1 !== null
                && $1 !== '' && $1 !== 0 && $1 !== false);}
  ;

/**
 * A scalar - either a literal or a field reference.
 * Ex: `field1`, `1234`, `FALSE`, `"A"`.
 */
scalar_exp:
    atom
      {$$ = $1;}
  | field_ref
      {$$ = $1;}
  ;

atom:
    literal
      {$$ = $1;}
  ;

/**
 * A field reference.
 * Ex: `field1`.
 */
field_ref:
    field_ref DOT field_name
      {$$ = Object.prototype.toString.call($1) == '[object Object]' && $1.hasOwnProperty($3) ? $1[$3] : null;}
  | field_name
      {$$ = yy[$1] !== undefined ? yy[$1] : null;}
  ;

/**
 * A field name.
 * Ex: `"field1"`.
 */
field_name:
    NAME
      {$$ = yytext;}
  | NUMERIC
      {$$ = yytext;}
  ;

/**
 * A literal: string, number, boolean (true/false) or null.
 * Ex: `"A"`, `1234`, `TRUE`, `NULL`.
 */
literal:
    STRING
      {$$ = yytext.substring(1, yytext.length - 1);}
  | NUMERIC
      {$$ = Number(yytext);}
  | TRUE
      {$$ = true}
  | FALSE
      {$$ = false}
  | NULL
      {$$ = null}
  ;
