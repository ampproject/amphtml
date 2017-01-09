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
        $$ = new AstNode(AstNodeType.NOT, [$2]);
      %}
  | '-' expr %prec UMINUS
      %{
        $$ = new AstNode(AstNodeType.UNARY_MINUS, [$2]);
      %}
  | '+' expr %prec UPLUS
      %{
        $$ = new AstNode(AstNodeType.UNARY_PLUS, [$2]);
      %}
  |  expr '+' expr
      %{
        $$ = new AstNode(AstNodeType.PLUS, [$1, $3]);
      %}
  | expr '-' expr
      %{
        $$ = new AstNode(AstNodeType.MINUS, [$1, $3]);
      %}
  | expr '*' expr
      %{
        $$ = new AstNode(AstNodeType.MULTIPLY, [$1, $3]);
      %}
  | expr '/' expr
      %{
        $$ = new AstNode(AstNodeType.DIVIDE, [$1, $3]);
      %}
  | expr '%' expr
      %{
        $$ = new AstNode(AstNodeType.MODULO, [$1, $3]);
      %}
  | expr '&&' expr
      %{
        $$ = new AstNode(AstNodeType.LOGICAL_AND, [$1, $3]);
      %}
  | expr '||' expr
      %{
        $$ = new AstNode(AstNodeType.LOGICAL_OR, [$1, $3]);
      %}
  | expr '<=' expr
      %{
        $$ = new AstNode(AstNodeType.LESS_OR_EQUAL, [$1, $3]);
      %}
  | expr '<' expr
      %{
        $$ = new AstNode(AstNodeType.LESS, [$1, $3]);
      %}
  | expr '>=' expr
      %{
        $$ = new AstNode(AstNodeType.GREATER_OR_EQUAL, [$1, $3]);
      %}
  | expr '>' expr
      %{
        $$ = new AstNode(AstNodeType.GREATER, [$1, $3]);
      %}
  | expr '!=' expr
      %{
        $$ = new AstNode(AstNodeType.NOT_EQUAL, [$1, $3]);
      %}
  | expr '==' expr
      %{
        $$ = new AstNode(AstNodeType.EQUAL, [$1, $3]);
      %}
  | expr '?' expr ':' expr
      %{
        $$ = new AstNode(AstNodeType.TERNARY, [$1, $3, $5]);
      %}
  ;

invocation:
    expr '.' NAME args
      %{
        $$ = new AstNode(AstNodeType.INVOCATION, [$1, $4], $3);
      %}
  ;

args:
    '(' ')'
      %{
        $$ = new AstNode(AstNodeType.ARGS, []);
      %}
  | '(' array ')'
      %{
        $$ = new AstNode(AstNodeType.ARGS, [$2]);
      %}
  ;

member_access:
    expr member
      %{
        $$ = new AstNode(AstNodeType.MEMBER_ACCESS, [$1, $2]);
      %}
  ;

member:
    '.' NAME
      %{
        $$ = new AstNode(AstNodeType.MEMBER, null, $2);
      %}
  | '[' expr ']'
      %{
        $$ = new AstNode(AstNodeType.MEMBER, [$2]);
      %}
  ;

variable:
    NAME
      %{
        $$ = new AstNode(AstNodeType.VARIABLE, null, $1);
      %}
  ;

literal:
    STRING
      %{
        const string = yytext.substr(1, yyleng - 2);
        $$ = new AstNode(AstNodeType.LITERAL, null, string);
      %}
  | NUMBER
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, Number(yytext));
      %}
  | TRUE
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, true);
      %}
  | FALSE
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, false);
      %}
  | NULL
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, null);
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
        $$ = new AstNode(AstNodeType.ARRAY_LITERAL, []);
      %}
  | '[' array ']'
      %{
        $$ = new AstNode(AstNodeType.ARRAY_LITERAL, [$2]);
      %}
  ;

array:
    expr
      %{
        $$ = new AstNode(AstNodeType.ARRAY, [$1]);
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
        $$ = new AstNode(AstNodeType.OBJECT_LITERAL, []);
      %}
  | '{' object '}'
      %{
        $$ = new AstNode(AstNodeType.OBJECT_LITERAL, [$2]);
      %}
  ;

object:
    key_value
      %{
        $$ = new AstNode(AstNodeType.OBJECT, [$1]);
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
        $$ = new AstNode(AstNodeType.KEY_VALUE, [$1, $3]);
      %}
  ;
