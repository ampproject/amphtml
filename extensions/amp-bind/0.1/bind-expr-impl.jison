%lex

%%
\s+                       /* skip whitespace */
"null"                    return 'NULL'
"true"                    return 'TRUE'
"false"                   return 'FALSE'
[0-9]+("."[0-9]+)?\b      return 'NUMBER'
[a-zA-Z_][a-zA-Z0-9_]*    return 'NAME'
\'[^\']*\'                return 'STRING'
\"[^\"]*\"                return 'STRING'
'=>'                      return '=>'
"+"                       return '+'
"-"                       return '-'
"*"                       return '*'
"/"                       return '/'
"&&"                      return '&&'
"||"                      return '||'
"!="                      return '!='
"=="                      return '=='
"<="                      return '<='
"<"                       return '<'
">="                      return '>='
">"                       return '>'
"!"                       return '!'
"?"                       return '?'
":"                       return ':'
"%"                       return '%'
"["                       return '['
"]"                       return ']'
"{"                       return '{'
"}"                       return '}'
"("                       return '('
")"                       return ')'
","                       return ','
\.                        return '.'
.                         return 'INVALID'
<<EOF>>                   return 'EOF'

/lex

%token NAME
%token STRING
%token NUMBER
%token TRUE FALSE
%token NULL
%token EOF

/*
 * Operator precedence.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */

%nonassoc '=>'
%left ','
%right '?' ':'
%left '||'
%left '&&'
%left '==' '!='
%left '<' '<=' '>' '>='
%left '+' '-'
%left '*' '/' '%'
%right '!' UMINUS UPLUS
%left '.' '[' ']'
%left '(' ')'


%%

/* BNF grammar. */

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

/*
 * Constrain the use of arrow functions to function invocations.
 */
invocation:
    NAME args
      %{
        $$ = new AstNode(AstNodeType.INVOCATION, [undefined, $args], $NAME);
      %}
  | expr '.' NAME args
      %{
        $$ = new AstNode(AstNodeType.INVOCATION, [$expr, $args], $NAME);
      %}
  | expr '.' NAME '(' arrow_function ')'
      %{
        $$ = new AstNode(AstNodeType.INVOCATION, [$expr, $arrow_function], $NAME);
      %}
  ;

arrow_function:
    '(' ')' '=>' expr
      %{
        $$ = new AstNode(AstNodeType.ARROW_FUNCTION, [undefined, $expr]);
      %}
  | NAME '=>' expr
      %{
        const param = new AstNode(AstNodeType.LITERAL, null, [$NAME]);
        $$ = new AstNode(AstNodeType.ARROW_FUNCTION, [param, $expr]);
      %}
  | '(' params ')' '=>' expr
      %{
        $$ = new AstNode(AstNodeType.ARROW_FUNCTION, [$params, $expr]);
      %}
  ;

/*
 * Must be multiple parameters, unfortunately. A single parameter like '(x)'
 * causes a reduce/reduce conflict with a parenthetical expr with one variable.
 * This can be solved but requires a custom lexer, e.g.
 * http://coffeescript.org/v1/annotated-source/lexer.html#section-32
 */
params:
    NAME ',' NAME
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, [$1, $3]);
      %}
  | params ',' NAME
      %{
        $$ = $params;
        $$.value.push($NAME);
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
    primitive
      ${
        $$ = $1;
      }
  | object_literal
      %{
        $$ = $1;
      %}
  | array_literal
      %{
        $$ = $1;
      %}
  ;

primitive:
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
  | '[' array ',' ']'
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
        $$ = new AstNode(AstNodeType.OBJECT_LITERAL, [$object]);
      %}
  | '{' object ',' '}'
      %{
        $$ = new AstNode(AstNodeType.OBJECT_LITERAL, [$object]);
      %}
  ;

object:
    key_value
      %{
        $$ = new AstNode(AstNodeType.OBJECT, [$key_value]);
      %}
  | object ',' key_value
      %{
        $$ = $object;
        $$.args.push($key_value);
      %}
  ;

key_value:
  key ':' expr
      %{
        $$ = new AstNode(AstNodeType.KEY_VALUE, [$key, $expr]);
      %}
  ;

key:
    NAME
      %{
        $$ = new AstNode(AstNodeType.LITERAL, null, $NAME);
      %}
  | primitive
      %{
        $$ = $primitive;
      %}
  | '[' expr ']' /* Computed property name. */
      %{
        $$ = $expr;
      %}
  ;
