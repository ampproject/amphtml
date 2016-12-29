/** shared vars and functions */

%{
%}

/* lexical grammar */

%lex

%%
\s+                       /* skip whitespace */
"+"                       return '+'
"-"                       return '-'
"*"                       return '*'
"/"                       return '/'
"%"                       return '%'
"&&"                      return '&&'
"||"                      return '||'
"<="                      return '<='
"<"                       return '<'
">="                      return '>='
">"                       return '>'
"!="                      return '!='
"=="                      return '=='
"("                       return '('
")"                       return ')'
"["                       return '['
"]"                       return ']'
"{"                       return '{'
"}"                       return '}'
","                       return ','
\.                        return '.'
":"                       return ':'
"?"                       return '?'
"!"                       return '!'
"null"                    return 'NULL'
"NULL"                    return 'NULL'
"TRUE"                    return 'TRUE'
"true"                    return 'TRUE'
"FALSE"                   return 'FALSE'
"false"                   return 'FALSE'
[0-9]+("."[0-9]+)?\b      return 'NUMBER'
[a-zA-Z_][a-zA-Z0-9_]*    return 'NAME'
\'[^\']*\'                return 'STRING'
\"[^\"]*\"                return 'STRING'
.                         return 'INVALID'
<<EOF>>                   return 'EOF'

/lex

/* token type names (no precedence) */

%token NAME
%token STRING
%token NUMBER
%token TRUE FALSE
%token NULL
%token EOF

/*
 * operator precedence
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */

%right '?' ':'
%left '||'
%left '&&'
%left '==' '!='
%left '<' '<=' '>' '>='
%left '+' '-'
%left '*' '/' '%'
%right '!' UMINUS UPLUS
%left '(' ')'
%left '.' '[' ']'

%%

/* language grammar */

result:
    expr EOF
      {return $1;}
  | EOF
      {return '';}
  ;

/* Don't bother creating AST nodes for direct references in `expr`. */
expr:
    operation
      {$$ = $1;}
  | invocation
      {$$ = $1;}
  | member_access
      {$$ = $1;}
  | '(' expr ')'
      {$$ = $2;}
  | variable
      {$$ = $1;}
  | literal
      {$$ = $1;}
  ;

operation:
    '!' expr
      %{
        $$ = {type: ASTNodeType.NOT, args: [$2]};
      %}
  | '-' expr %prec UMINUS
      %{
        $$ = {type: ASTNodeType.UNARY_MINUS, args: [$2]};
      %}
  | '+' expr %prec UPLUS
      %{
        $$ = {type: ASTNodeType.UNARY_PLUS, args: [$2]};
      %}
  |  expr '+' expr
      %{
        $$ = {type: ASTNodeType.PLUS, args: [$1, $3]};
      %}
  | expr '-' expr
      %{
        $$ = {type: ASTNodeType.MINUS, args: [$1, $3]};
      %}
  | expr '*' expr
      %{
        $$ = {type: ASTNodeType.MULTIPLY, args: [$1, $3]};
      %}
  | expr '/' expr
      %{
        $$ = {type: ASTNodeType.DIVIDE, args: [$1, $3]};
      %}
  | expr '%' expr
      %{
        $$ = {type: ASTNodeType.MODULO, args: [$1, $3]};
      %}
  | expr '&&' expr
      %{
        $$ = {type: ASTNodeType.LOGICAL_AND, args: [$1, $3]};
      %}
  | expr '||' expr
      %{
        $$ = {type: ASTNodeType.LOGICAL_OR, args: [$1, $3]};
      %}
  | expr '<=' expr
      %{
        $$ = {type: ASTNodeType.LESS_OR_EQUAL, args: [$1, $3]};
      %}
  | expr '<' expr
      %{
        $$ = {type: ASTNodeType.LESS, args: [$1, $3]};
      %}
  | expr '>=' expr
      %{
        $$ = {type: ASTNodeType.GREATER_OR_EQUAL, args: [$1, $3]};
      %}
  | expr '>' expr
      %{
        $$ = {type: ASTNodeType.GREATER, args: [$1, $3]};
      %}
  | expr '!=' expr
      %{
        $$ = {type: ASTNodeType.NOT_EQUAL, args: [$1, $3]};
      %}
  | expr '==' expr
      %{
        $$ = {type: ASTNodeType.EQUAL, args: [$1, $3]};
      %}
  | expr '?' expr ':' expr
      %{
        $$ = {type: ASTNodeType.TERNARY, args: [$1, $3, $5]};
      %}
  ;

invocation:
    expr '.' NAME args
      %{
        $$ = {type: ASTNodeType.INVOCATION, args: [$1, $3, $4]};
      %}
  ;

args:
    '(' ')'
      %{
        $$ = {type: ASTNodeType.ARGS, args: []};
      %}
  | '(' array ')'
      %{
        $$ = {type: ASTNodeType.ARGS, args: [$2]};
      %}
  ;

member_access:
    expr member
      %{
        $$ = {type: ASTNodeType.MEMBER_ACCESS, args: [$1, $2]};
      %}
  ;

member:
    '.' NAME
      %{
        $$ = {type: ASTNodeType.MEMBER, value: $2};
      %}
  | '[' expr ']'
      %{
        $$ = {type: ASTNodeType.MEMBER, args: [$2]};
      %}
  ;

variable:
    NAME
      %{
        $$ = {type: ASTNodeType.VARIABLE, value: $1};
      %}
  ;

literal:
    STRING
      %{
        $$ = {type: ASTNodeType.LITERAL, value: yytext.substr(1, yyleng - 2)};
      %}
  | NUMBER
      %{
        $$ = {type: ASTNodeType.LITERAL, value: Number(yytext)};
      %}
  | TRUE
      %{
        $$ = {type: ASTNodeType.LITERAL, value: true};
      %}
  | FALSE
      %{
        $$ = {type: ASTNodeType.LITERAL, value: false};
      %}
  | NULL
      %{
        $$ = {type: ASTNodeType.LITERAL, value: null};
      %}
  | object_literal
      %{
        $$ = $1;
      %}
  | array_literal
      %{
        $$ = $1;
      %}
  ;

array_literal:
    '[' ']'
      %{
        $$ = {type: ASTNodeType.ARRAY_LITERAL, args: []};
      %}
  | '[' array ']'
      %{
        $$ = {type: ASTNodeType.ARRAY_LITERAL, args: [$2]};
      %}
  ;

array:
    expr
      %{
        $$ = {type: ASTNodeType.ARRAY, args: [$1]};
      %}
  | array ',' expr
      %{
        $$ = $1;
        $$.args.push($3);
      %}
  ;

object_literal:
    '{' '}'
      %{
        $$ = {type: ASTNodeType.OBJECT_LITERAL, args: []};
      %}
  | '{' object '}'
      %{
        $$ = {type: ASTNodeType.OBJECT_LITERAL, args: [$2]};
      %}
  ;

object:
    key_value
      %{
        $$ = {type: ASTNodeType.OBJECT, args: [$1]};
      %}
  | object ',' key_value
      %{
        $$ = $1;
        $$.args.push($3);
      %}
  ;

key_value:
  expr ':' expr
      %{
        $$ = {type: ASTNodeType.KEY_VALUE, args: [$1, $3]};
      %}
  ;
