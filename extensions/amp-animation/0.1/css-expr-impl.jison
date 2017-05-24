/**
 * https://www.w3.org/TR/CSS22/grammar.html
 */

%lex
%option case-insensitive

A         [Aa]
B         [Bb]
C         [Cc]
D         [Dd]
E         [Ee]
F         [Ff]
G         [Gg]
H         [Hh]
I         [Ii]
J         [Jj]
K         [Kk]
L         [Ll]
M         [Mm]
N         [Nn]
O         [Oo]
P         [Pp]
Q         [Qq]
R         [Rr]
S         [Ss]
T         [Tt]
U         [Uu]
V         [Vv]
W         [Ww]
X         [Xx]
Y         [Yy]
Z         [Zz]

num       [+-]?[0-9]+("."[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?"."[0-9]+([eE][+\-]?[0-9]+)?
hex       [a-fA-F0-9]+
str       \'[^\']*\'|\"[^\"]*\"
ident     \-?[a-zA-Z_][\-a-zA-Z0-9_]*

%%
\s+                       /* skip whitespace */

{num}{P}{X}                         return 'LENGTH_PX'
{num}{E}{M}                         return 'LENGTH_EM'
{num}{R}{E}{M}                      return 'LENGTH_REM'
{num}{V}{H}                         return 'LENGTH_VH'
{num}{V}{W}                         return 'LENGTH_VW'
{num}{V}{M}{I}{N}                   return 'LENGTH_VMIN'
{num}{V}{M}{A}{X}                   return 'LENGTH_VMAX'
{num}{C}{M}                         return 'LENGTH_CM'
{num}{M}{M}                         return 'LENGTH_MM'
{num}{Q}                            return 'LENGTH_Q'
{num}{I}{N}                         return 'LENGTH_IN'
{num}{P}{C}                         return 'LENGTH_PC'
{num}{P}{T}                         return 'LENGTH_PT'

{num}{D}{E}{G}                      return 'ANGLE_DEG'
{num}{R}{A}{D}                      return 'ANGLE_RAD'
{num}{G}{R}{A}{D}                   return 'ANGLE_GRAD'

{num}{M}{S}                         return 'TIME_MS'
{num}{S}                            return 'TIME_S'

{num}"%"                            return 'PERCENTAGE'
{num}\b                             return 'NUMBER'

"#"{hex}                            return 'HEXCOLOR';

{U}{R}{L}\(                         return 'URL_START'
{C}{A}{L}{C}\(                      return 'CALC_START'
{V}{A}{R}\(                         return 'VAR_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}\(       return 'TRANSLATE_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{X}\(    return 'TRANSLATE_X_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{Y}\(    return 'TRANSLATE_Y_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{Z}\(    return 'TRANSLATE_Z_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}3{D}\(   return 'TRANSLATE_3D_START'
{ident}\(                           return 'FUNCTION_START'
{ident}                             return 'IDENT'
\-\-{ident}                         return 'VAR_NAME';

{str}                               return 'STRING'

"+"                                 return '+'
"-"                                 return '-'
"*"                                 return '*'
"/"                                 return '/'
"("                                 return '('
")"                                 return ')'
","                                 return ','
.                                   return 'INVALID'
<<EOF>>                             return 'EOF'


/lex

/* token type names (no precedence) */

%token IDENT
%token STRING
%token NUMBER
%token EOF

/**
 * operator precedence
 */

%left '+' '-'
%left '*' '/'
%left '(' ')'


%%

/**
 * The final CSS value: `1px`, `calc(1px + 2px)`, `translate() rotate()`, etc.
 */
result:
    value EOF
      {return $1;}
  | EOF
      {return null;}
  ;

/**
 * Either:
 * - a single literal: `1px`, `45deg`.
 * - a single function: `calc(1px + 2px)`
 * - a concatenation of functions: `translateX(10px) rotate(30deg)`
 */
value:
    literal_or_function
      {$$ = $1;}
  | value literal_or_function
      {$$ = ast.CssConcatNode.concat($1, $2);}
  ;

/**
 * Either:
 * - a single literal: `1px`, `45deg`.
 * - a single function: `calc(1px + 2px)`
 */
literal_or_function:
    literal
      {$$ = $1;}
  | function
      {$$ = $1;}
  ;

/**
 * A literal:
 * - a string: `"abc"`
 * - a number: `10`, `0.5`, `1e2`
 * - a percentage: `10%`
 * - a length: `1px`, `2em`, `80vw`
 * - an angle: `10deg`, `1rad`
 * - a time: `600ms`, `10s`
 * - a color: `#fff`
 * - an identifier: `initial`
 */
literal:
    STRING
      {$$ = new ast.CssPassthroughNode($1);}
  | NUMBER
      {$$ = new ast.CssNumberNode(parseFloat($1));}
  | PERCENTAGE
      {$$ = new ast.CssPercentNode(parseFloat($1));}
  | length
      {$$ = $1;}
  | angle
      {$$ = $1;}
  | time
      {$$ = $1;}
  | url
      {$$ = $1;}
  | HEXCOLOR
      {$$ = new ast.CssPassthroughNode($1);}
  | IDENT
      {$$ = new ast.CssPassthroughNode($1);}
  ;

/**
 * A length with units: `10px`, `0.5em`, `1e2vw`.
 */
length:
    LENGTH_PX
      {$$ = new ast.CssLengthNode(parseFloat($1), 'px');}
  | LENGTH_EM
      {$$ = new ast.CssLengthNode(parseFloat($1), 'em');}
  | LENGTH_REM
      {$$ = new ast.CssLengthNode(parseFloat($1), 'rem');}
  | LENGTH_VH
      {$$ = new ast.CssLengthNode(parseFloat($1), 'vh');}
  | LENGTH_VW
      {$$ = new ast.CssLengthNode(parseFloat($1), 'vw');}
  | LENGTH_VMIN
      {$$ = new ast.CssLengthNode(parseFloat($1), 'vmin');}
  | LENGTH_VMAX
      {$$ = new ast.CssLengthNode(parseFloat($1), 'vmax');}
  | LENGTH_CM
      {$$ = new ast.CssLengthNode(parseFloat($1), 'cm');}
  | LENGTH_MM
      {$$ = new ast.CssLengthNode(parseFloat($1), 'mm');}
  | LENGTH_Q
      {$$ = new ast.CssLengthNode(parseFloat($1), 'q');}
  | LENGTH_IN
      {$$ = new ast.CssLengthNode(parseFloat($1), 'in');}
  | LENGTH_PC
      {$$ = new ast.CssLengthNode(parseFloat($1), 'pc');}
  | LENGTH_PT
      {$$ = new ast.CssLengthNode(parseFloat($1), 'pt');}
  ;

/**
 * An angle with units: `10deg`, `0.5rad`, `1grad`.
 */
angle:
    ANGLE_DEG
      {$$ = new ast.CssAngleNode(parseFloat($1), 'deg');}
  | ANGLE_RAD
      {$$ = new ast.CssAngleNode(parseFloat($1), 'rad');}
  | ANGLE_GRAD
      {$$ = new ast.CssAngleNode(parseFloat($1), 'grad');}
  ;

/**
 * A time with units: `10s`, `600ms`.
 */
time:
    TIME_MS
      {$$ = new ast.CssTimeNode(parseFloat($1), 'ms');}
  | TIME_S
      {$$ = new ast.CssTimeNode(parseFloat($1), 's');}
  ;


/**
 * A function: `var()`, `calc()`, `rgb()`, `translate()`, etc.
 */
function:
    var_function
      {$$ = $1;}
  | calc_function
      {$$ = $1;}
  | translate_function
      {$$ = $1;}
  | any_function
      {$$ = $1;}
  ;

/**
 * Any function with arguments: `rgba(1, 2, 3, 0.5)`, etc.
 */
any_function:
    FUNCTION_START ')'
      {$$ = new ast.CssFuncNode($1.slice(0, -1), []);}
  | FUNCTION_START args ')'
      {$$ = new ast.CssFuncNode($1.slice(0, -1), $2);}
  ;

/**
 * Function arguments: `1px, 2, var(--w)`.
 */
args:
    literal_or_function
      {$$ = [$1];}
  | args ',' literal_or_function
      %{
        const args = $1;
        args.push($3);
        $$ = args;
      %}
  ;


/**
 * CSS `url()` function.
 * - `url("https://acme.org/img")`
 * - `url(`https://acme.org/img`)`
 * - `url(`data:...`)`
 * - `url("/img")`
 */
url:
    URL_START STRING ')'
      {$$ = new ast.CssUrlNode($2.slice(1, -1));}
  ;


/**
 * Translate set (https://developer.mozilla.org/en-US/docs/Web/CSS/transform):
 * - `translate(x, y)`
 * - `translateX(x)`
 * - `translateY(y)`
 * - `translateZ(z)`
 * - `translate3d(x, y, z)`
 */
translate_function:
    TRANSLATE_START args ')'
      {$$ = new ast.CssTranslateNode('', $2);}
  | TRANSLATE_X_START args ')'
      {$$ = new ast.CssTranslateNode('x', $2);}
  | TRANSLATE_Y_START args ')'
      {$$ = new ast.CssTranslateNode('y', $2);}
  | TRANSLATE_Z_START args ')'
      {$$ = new ast.CssTranslateNode('z', $2);}
  | TRANSLATE_3D_START args ')'
      {$$ = new ast.CssTranslateNode('3d', $2);}
  ;


/**
 * A `var()` function: https://www.w3.org/TR/css-variables/
 * Examples:
 * - `var(--name)`
 * - `var(--name, 100px)`
 * - `var(--name, var(--other, 200px))`
 */
var_function:
    VAR_START VAR_NAME ')'
      {$$ = new ast.CssVarNode($2);}
  | VAR_START VAR_NAME ',' literal_or_function ')'
      {$$ = new ast.CssVarNode($2, $4);}
  ;


/**
 * A `calc()` function: https://drafts.csswg.org/css-values-3/#calc-notation
 * Examples:
 * - `calc(100px)`
 * - `calc(100px + 200px)`
 * - `calc(100px * 2)`
 * - `calc(100px / 2)`
 * - `calc((100px + 200px) / 2)`
 * - `calc(100vw - 30px)`
 * - `calc(100vw - var(--width))`
 */
calc_function:
    CALC_START calc_expr ')'
      {$$ = new ast.CssCalcNode($2);}
  ;

/**
 * A `calc()` expression:
 * - a literal: `100px`
 * - a sum: `100px + 200px`, `200px - 100px`
 * - a product: `100px * 2`, `100px / 2`
 * - a factorized expression: `(100px)`, `(100px + 200px) * 2`
 */
calc_expr:
    literal_or_function
      {$$ = $1;}
  | '(' calc_expr ')'
      {$$ = $2;}
  | calc_expr '*' calc_expr
      {$$ = new ast.CssCalcProductNode($1, $3, '*');}
  | calc_expr '/' calc_expr
      {$$ = new ast.CssCalcProductNode($1, $3, '/');}
  | calc_expr '+' calc_expr
      {$$ = new ast.CssCalcSumNode($1, $3, '+');}
  | calc_expr '-' calc_expr
      {$$ = new ast.CssCalcSumNode($1, $3, '-');}
  ;
