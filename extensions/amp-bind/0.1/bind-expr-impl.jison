/** shared vars and functions */

%{
// Shortcuts for common functions.
var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// For security reasons, must not contain functions that mutate the caller.
var functionWhitelist =
{
  '[object Array]':
    {
      'concat': Array.prototype.concat,
      'includes': Array.prototype.includes,
      'indexOf': Array.prototype.indexOf,
      'join': Array.prototype.join,
      'lastIndexOf': Array.prototype.lastIndexOf,
      'slice': Array.prototype.slice,
    },
  '[object String]':
    {
      'charAt': String.prototype.charAt,
      'charCodeAt': String.prototype.charCodeAt,
      'concat': String.prototype.concat,
      'includes': String.prototype.includes,
      'indexOf': String.prototype.indexOf,
      'lastIndexOf': String.prototype.lastIndexOf,
      'repeat': String.prototype.repeat,
      'slice': String.prototype.slice,
      'split': String.prototype.split,
      'substr': String.prototype.substr,
      'substring': String.prototype.substring,
      'toLowerCase': String.prototype.toLowerCase,
      'toUpperCase': String.prototype.toUpperCase,
    },
};

/** @return {bool} Returns false if args contains an invalid type. */
function typeCheckArgs(args) {
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (toString.call(arg) === '[object Object]') {
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

        var obj = toString.call($1);

        var whitelist = functionWhitelist[obj];
        if (whitelist) {
          var fn = $1[$3];
          if (fn && whitelist[$3] === fn) {
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

        if (typeof $2 !== 'symbol' && hasOwnProperty.call($1, $2)) {
          $$ = $1[$2];
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
      {$$ = hasOwnProperty.call(yy, $1) ? yy[$1] : null;}
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
