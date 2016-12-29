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
        $$ = {type: ASTType.NOT, args: [$2]};
      %}
  | '-' expr %prec UMINUS
      %{
        $$ = {type: ASTType.UNARY_MINUS, args: [$2]};
      %}
  | '+' expr %prec UPLUS
      %{
        $$ = {type: ASTType.UNARY_PLUS, args: [$2]};
      %}
  |  expr '+' expr
      %{
        $$ = {type: ASTType.PLUS, args: [$1, $3]};
      %}
  | expr '-' expr
      %{
        $$ = {type: ASTType.MINUS, args: [$1, $3]};
      %}
  | expr '*' expr
      %{
        $$ = {type: ASTType.MULTIPLY, args: [$1, $3]};
      %}
  | expr '/' expr
      %{
        $$ = {type: ASTType.DIVIDE, args: [$1, $3]};
      %}
  | expr '%' expr
      %{
        $$ = {type: ASTType.MODULO, args: [$1, $3]};
      %}
  | expr '&&' expr
      %{
        $$ = {type: ASTType.LOGICAL_AND, args: [$1, $3]};
      %}
  | expr '||' expr
      %{
        $$ = {type: ASTType.LOGICAL_OR, args: [$1, $3]};
      %}
  | expr '<=' expr
      %{
        $$ = {type: ASTType.LESS_OR_EQUAL, args: [$1, $3]};
      %}
  | expr '<' expr
      %{
        $$ = {type: ASTType.LESS, args: [$1, $3]};
      %}
  | expr '>=' expr
      %{
        $$ = {type: ASTType.GREATER_OR_EQUAL, args: [$1, $3]};
      %}
  | expr '>' expr
      %{
        $$ = {type: ASTType.GREATER, args: [$1, $3]};
      %}
  | expr '!=' expr
      %{
        $$ = {type: ASTType.NOT_EQUAL, args: [$1, $3]};
      %}
  | expr '==' expr
      %{
        $$ = {type: ASTType.EQUAL, args: [$1, $3]};
      %}
  | expr '?' expr ':' expr
      %{
        $$ = {type: ASTType.TERNARY, args: [$1, $3, $5]};
      %}
  ;

invocation:
    expr '.' NAME args
      %{
        $$ = {type: ASTType.INVOCATION, args: [$1, $3, $4]};
      %}
  ;

args:
    '(' ')'
      %{
        $$ = {type: ASTType.ARGS, args: []};
      %}
  | '(' array ')'
      %{
        $$ = {type: ASTType.ARGS, args: [$2]};
      %}
  ;

member_access:
    expr member
      %{
        $$ = {type: ASTType.MEMBER_ACCESS, args: [$1, $2]};
      %}
  ;

member:
    '.' NAME
      %{
        $$ = {type: ASTType.MEMBER, value: $2};
      %}
  | '[' expr ']'
      %{
        $$ = {type: ASTType.MEMBER, args: [$2]};
      %}
  ;

variable:
    NAME
      %{
        $$ = {type: ASTType.VARIABLE, value: $1};
      %}
  ;

literal:
    STRING
      %{
        $$ = {type: ASTType.LITERAL, value: yytext.substr(1, yyleng - 2)};
      %}
  | NUMBER
      %{
        $$ = {type: ASTType.LITERAL, value: Number(yytext)};
      %}
  | TRUE
      %{
        $$ = {type: ASTType.LITERAL, value: true};
      %}
  | FALSE
      %{
        $$ = {type: ASTType.LITERAL, value: false};
      %}
  | NULL
      %{
        $$ = {type: ASTType.LITERAL, value: null};
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
        $$ = {type: ASTType.ARRAY_LITERAL, args: []};
      %}
  | '[' array ']'
      %{
        $$ = {type: ASTType.ARRAY_LITERAL, args: [$2]};
      %}
  ;

array:
    expr
      %{
        $$ = {type: ASTType.ARRAY, args: [$1]};
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
        $$ = {type: ASTType.OBJECT_LITERAL, args: []};
      %}
  | '{' object '}'
      %{
        $$ = {type: ASTType.OBJECT_LITERAL, args: [$2]};
      %}
  ;

object:
    key_value
      %{
        $$ = {type: ASTType.OBJECT, args: [$1]};
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
        $$ = {type: ASTType.KEY_VALUE, args: [$1, $3]};
      %}
  ;
