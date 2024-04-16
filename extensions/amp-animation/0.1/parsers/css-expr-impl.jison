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

{A}{T}                              return 'AT'
{R}{O}{U}{N}{D}                     return 'ROUND'

{U}{R}{L}\(                         return 'URL_START'
{C}{A}{L}{C}\(                      return 'CALC_START'
{M}{I}{N}\(                         return 'MIN_START'
{M}{A}{X}\(                         return 'MAX_START'
{C}{L}{A}{M}{P}\(                   return 'CLAMP_START'
{V}{A}{R}\(                         return 'VAR_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}\(       return 'TRANSLATE_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{X}\(    return 'TRANSLATE_X_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{Y}\(    return 'TRANSLATE_Y_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}{Z}\(    return 'TRANSLATE_Z_START'
{T}{R}{A}{N}{S}{L}{A}{T}{E}3{D}\(   return 'TRANSLATE_3D_START'
{R}{A}{N}{D}\(                      return 'RAND_START'
{I}{N}{D}{E}{X}\(                   return 'INDEX_START'
{L}{E}{N}{G}{T}{H}\(                return 'LENGTH_START'
{W}{I}{D}{T}{H}\(                   return 'WIDTH_START'
{H}{E}{I}{G}{H}{T}\(                return 'HEIGHT_START'
{C}{L}{O}{S}{E}{S}{T}\(             return 'CLOSEST_START'
{N}{U}{M}\(                         return 'NUM_START'
{I}{N}{S}{E}{T}\(                   return 'INSET_START'
{C}{I}{R}{C}{L}{E}\(                return 'CIRCLE_START'
{E}{L}{L}{I}{P}{S}{E}\(             return 'ELLIPSE_START'
{P}{O}{L}{Y}{G}{O}{N}\(             return 'POLYGON_START'
{X}\(                               return 'X_START'
{Y}\(                               return 'Y_START'
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
  | rect_function
      {$$ = $1;}
  | num_function
      {$$ = $1;}
  | rand_function
      {$$ = $1;}
  | index_function
      {$$ = $1;}
  | length_function
      {$$ = $1;}
  | inset_function
      {$$ = $1;}
  | circle_function
      {$$ = $1;}
  | ellipse_function
      {$$ = $1;}
  | polygon_function
      {$$ = $1;}
  | min_function
      {$$ = $1;}
  | max_function
      {$$ = $1;}
  | clamp_function
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
 * Border radius.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
 *
 * Variants:
 * - `10px` - all 4 sides.
 * - `10px 5%` - top-left-and-bottom-right | top-right-and-bottom-left.
 * - `2px 4px 2px` - top-left | top-right-and-bottom-left | bottom-right
 * - `1px 0 3px 4px` - top-left | top-right | bottom-right | bottom-left
 * - `1px / 2px` - first-radius / second-radius
 */
border_radius:
    value
      {$$ = ast.createBorderRadiusNode($1);}
  | value '/' value
      {$$ = ast.createBorderRadiusNode($1, $3);}
  ;


/**
 * Polygon tuples.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#polygon()
 */
tuples:
    literal_or_function literal_or_function
      {$$ = [ast.CssConcatNode.concat($1, $2)];}
  | tuples ',' literal_or_function literal_or_function
      %{
        const tuples = $1;
        tuples.push(ast.CssConcatNode.concat($3, $4));
        $$ = tuples;
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
 * https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#inset()
 * - `inset(a)`
 * - `inset(v h)`
 * - `inset(t r b)`
 * - `inset(t r b l)`
 * - `inset(a round <border_radius>)`
 *
 * The grammar is:
 * <inset()> = inset( <length-percentage>{1,4} [ round <'border-radius'> ]? )
 */
inset_function:
    INSET_START value ROUND border_radius ')'
      {$$ = ast.createInsetNode($2, $4);}
  | INSET_START value ')'
      {$$ = ast.createInsetNode($2);}
  ;

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#circle()
 * - `circle()`
 * - `circle(50%)`
 * - `circle(50% at 10% 20%)`
 * - `circle(at 10% 20%)`
 *
 * The grammar is:
 * <circle()> = circle( [ <shape-radius> ]? [ at <position> ]? )
 */
circle_function:
    CIRCLE_START ')'
      {$$ = ast.createCircleNode();}
  | CIRCLE_START AT value ')'
      {$$ = ast.createCircleNode(null, $3);}
  | CIRCLE_START literal_or_function AT value ')'
      {$$ = ast.createCircleNode($2, $4);}
  | CIRCLE_START literal_or_function ')'
      {$$ = ast.createCircleNode($2);}
  ;

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#ellipse()
 * - `ellipse()`
 * - `ellipse(30% 40%)`
 * - `ellipse(30% 40% at 10% 20%)`
 * - `ellipse(at 10% 20%)`
 *
 * The grammar is:
 * <ellipse()> = ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )
 */
ellipse_function:
    ELLIPSE_START ')'
      {$$ = ast.createEllipseNode();}
  | ELLIPSE_START AT value ')'
      {$$ = ast.createEllipseNode(null, $3);}
  | ELLIPSE_START value AT value ')'
      {$$ = ast.createEllipseNode($2, $4);}
  | ELLIPSE_START value ')'
      {$$ = ast.createEllipseNode($2);}
  ;

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#polygon()
 * - `polygon(30% 40%, 10px 20px, ...)`
 *
 * The grammar is:
 * <polygon()> = polygon( [ <length-percentage> <length-percentage> ]# )
 */
polygon_function:
    POLYGON_START tuples ')'
      {$$ = ast.createPolygonNode($2);}
  ;


/**
 * AMP-specific `width()`, `height()`, `x()` and `y()` functions:
 * - `width(".selector")`
 * - `height(".selector")`
 * - `width(closest(".selector"))`
 * - `height(closest(".selector"))`
 */
rect_function:
    WIDTH_START ')'
      {$$ = new ast.CssRectNode('w');}
  | HEIGHT_START ')'
      {$$ = new ast.CssRectNode('h');}
  | X_START ')'
      {$$ = new ast.CssRectNode('x');}
  | Y_START ')'
      {$$ = new ast.CssRectNode('y');}
  | WIDTH_START STRING ')'
      {$$ = new ast.CssRectNode('w', $2.slice(1, -1));}
  | HEIGHT_START STRING ')'
      {$$ = new ast.CssRectNode('h', $2.slice(1, -1));}
  | X_START STRING ')'
      {$$ = new ast.CssRectNode('x', $2.slice(1, -1));}
  | Y_START STRING ')'
      {$$ = new ast.CssRectNode('y', $2.slice(1, -1));}
  | WIDTH_START CLOSEST_START STRING ')' ')'
      {$$ = new ast.CssRectNode('w', $3.slice(1, -1), 'closest');}
  | HEIGHT_START CLOSEST_START STRING ')' ')'
      {$$ = new ast.CssRectNode('h', $3.slice(1, -1), 'closest');}
  | X_START CLOSEST_START STRING ')' ')'
      {$$ = new ast.CssRectNode('x', $3.slice(1, -1), 'closest');}
  | Y_START CLOSEST_START STRING ')' ')'
      {$$ = new ast.CssRectNode('y', $3.slice(1, -1), 'closest');}
  ;


/**
 * AMP-specific `num()` function:
 * - `num(10px)`
 * - `num(20s)`
 */
num_function:
    NUM_START literal_or_function ')'
      {$$ = new ast.CssNumConvertNode($2);}
  ;


/**
 * AMP-specific `rand()` functions:
 * - `rand()` - a random value between 0 and 1
 * - `rand(min, max)` - a random value between min and max
 */
rand_function:
    RAND_START ')'
      {$$ = new ast.CssRandNode();}
  | RAND_START literal_or_function ',' literal_or_function ')'
      {$$ = new ast.CssRandNode($2, $4);}
  ;


/**
 * AMP-specific `index()` function that returns 0-based index of the current
 * target in a list of all selected targets.
 */
index_function:
    INDEX_START ')'
      {$$ = new ast.CssIndexNode();}
  ;


/**
 * AMP-specific `length()` function number of targets in the list.
 */
length_function:
    LENGTH_START ')'
      {$$ = new ast.CssLengthFuncNode();}
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
 * Used for min/max/clamp.
 */
calc_expr_list:
    calc_expr
      {$$ = [$1];}
  | calc_expr_list ',' calc_expr
      %{
        const calc_expr_list = $1;
        calc_expr_list.push($3);
        $$ = calc_expr_list;
      %}
  ;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/min
 */
min_function:
    MIN_START calc_expr_list ')'
      {$$ = new ast.CssMinMaxNode('min', $2);}
  ;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/max
 */
max_function:
    MAX_START calc_expr_list ')'
      {$$ = new ast.CssMinMaxNode('max', $2);}
  ;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
 */
clamp_function:
    CLAMP_START calc_expr_list ')'
      {$$ = new ast.CssMinMaxNode('clamp', $2);}
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
