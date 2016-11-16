/** shared vars and functions */

%{
// For security reasons, must not contain functions that mutate the caller.
var functionWhitelist =
{
  '[object Array]':
    [
      Array.prototype.concat,
      Array.prototype.includes,
      Array.prototype.indexOf,
      Array.prototype.join,
      Array.prototype.lastIndexOf,
      Array.prototype.slice,
    ],
  '[object String]':
    [
      String.prototype.charAt,
      String.prototype.charCodeAt,
      String.prototype.concat,
      String.prototype.includes,
      String.prototype.indexOf,
      String.prototype.lastIndexOf,
      String.prototype.repeat,
      String.prototype.slice,
      String.prototype.split,
      String.prototype.substr,
      String.prototype.substring,
      String.prototype.toLowerCase,
      String.prototype.toUpperCase,
    ],
};

/** @return {bool} Returns false if args contains an invalid type. */
function typeCheckArgs(args) {
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (Object.prototype.toString.call(arg) === '[object Object]') {
      return false;
    }
  }
  return true;
}
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
      {$$ = !$2;}
  | '-' expr %prec UMINUS
      {$$ = -$2;}
  | '+' expr %prec UPLUS
      {$$ = +$2;}
  |  expr '+' expr
      {$$ = $1 + $3;}
  | expr '-' expr
      {$$ = $1 - $3;}
  | expr '*' expr
      {$$ = $1 * $3;}
  | expr '/' expr
      {$$ = $1 / $3;}
  | expr '%' expr
      {$$ = $1 % $3;}
  | expr '&&' expr
      {$$ = $1 && $3;}
  | expr '||' expr
      {$$ = $1 || $3;}
  | expr '<=' expr
      {$$ = $1 <= $3;}
  | expr '<' expr
      {$$ = $1 < $3;}
  | expr '>=' expr
      {$$ = $1 >= $3;}
  | expr '>' expr
      {$$ = $1 > $3;}
  | expr '!=' expr
      {$$ = $1 != $3;}
  | expr '==' expr
      {$$ = $1 == $3;}
  | expr '?' expr ':' expr
      {$$ = $1 ? $3 : $5;}
  ;

invocation:
    expr '.' NAME args
      %{
        $$ = null;

        var obj = Object.prototype.toString.call($1);

        var whitelist = functionWhitelist[obj];
        if (whitelist) {
          var fn = $1[$3];
          if (whitelist.indexOf(fn) >= 0) {
            if (typeCheckArgs($4)) {
              $$ = fn.apply($1, $4);
            } else {
              throw new Error(`Unexpected argument type in {$3}()`);
            }
            return;
          }
        }

        throw new Error(`{$3}() is not a supported function.`);
      %}
  ;

args:
    '(' ')'
      {$$ = [];}
  | '(' array ')'
      {$$ = $2;}
  ;

member_access:
    expr member
      %{
        $$ = null;

        if ($1 === null || $2 === null) {
          return;
        }

        var obj = Object.prototype.toString.call($1);
        var prop = Object.prototype.toString.call($2);

        if (obj === '[object Array]') {
          if (prop === '[object Number]' && Number.isInteger($2)) {
            if ($2 >= 0 && $2 < $1.length) {
              $$ = $1[$2];
            }
          }
        }

        if (prop === '[object String]') {
          if (Object.prototype.hasOwnProperty.call($1, $2)) {
            $$ = $1[$2];
          }
        }
      %}
  ;

member:
    '.' NAME
      {$$ = $2;}
  | '[' expr ']'
      {$$ = $2;}
  ;

variable:
    NAME
      {$$ = yy[$1] !== undefined ? yy[$1] : null;}
  ;

literal:
    STRING
      {$$ = yytext.substr(1, yyleng - 2);}
  | NUMBER
      {$$ = Number(yytext);}
  | TRUE
      {$$ = true;}
  | FALSE
      {$$ = false;}
  | NULL
      {$$ = null;}
  | object_literal
      {$$ = $1;}
  | array_literal
      {$$ = $1;}
  ;

array_literal:
    '[' ']'
      {$$ = [];}
  | '[' array ']'
      {$$ = $2;}
  ;

array:
    expr
      {$$ = [$1];}
  | array ',' expr
      {$$ = $1; Array.prototype.push.call($1, $3);}
  ;

object_literal:
    '{' '}'
      {$$ = Object.create(null);}
  | '{' object '}'
      {$$ = $2;}
  ;

object:
    key_value
      {$$ = Object.create(null); $$[$1[0]] = $1[1];}
  | object ',' key_value
      {$$ = $1; $$[$3[0]] = $3[1];}
  ;

key_value:
  expr ':' expr
      {$$ = [$1, $3];}
  ;
