// AUTO GENERATED; DO NOT EDIT.
// To regenerate this file see comments in bin/atomgen.cc

#ifndef HTMLPARSER__ATOM_H_
#define HTMLPARSER__ATOM_H_

#include <array>
#include <string>

namespace htmlparser {

enum class Atom {
  UNKNOWN = 0x0,
  A = 0x1,
  ABBR = 0x84504,
  ACCEPT = 0x6,
  ACCEPT_CHARSET = 0xe,
  ACCESSKEY = 0x1209,
  ACRONYM = 0xd407,
  ACTION = 0xcc06,
  ADDRESS = 0x2ca07,
  ALIGN = 0x60b05,
  ALLOWFULLSCREEN = 0x3660f,
  ALLOWPAYMENTREQUEST = 0x2413,
  ALLOWUSERMEDIA = 0x400e,
  ALT = 0x52503,
  AMP_3D_GLTF = 0x1220b,
  AMP_3Q_PLAYER = 0x4ce0d,
  AMP_ACCESS = 0x690a,
  AMP_ACCESS_LATERPAY = 0x85413,
  AMP_ACCESS_POOOL = 0x6910,
  AMP_ACCORDION = 0x8c0d,
  AMP_ACTION_MACRO = 0xc810,
  AMP_AD = 0xe506,
  AMP_AD_EXIT = 0xe50b,
  AMP_ADDTHIS = 0x1000b,
  AMP_ANALYTICS = 0x1150d,
  AMP_ANIM = 0x13c08,
  AMP_ANIMATION = 0x13c0d,
  AMP_APESTER_MEDIA = 0x15911,
  AMP_APP_BANNER = 0x16d0e,
  AMP_AUDIO = 0x17e09,
  AMP_AUTO_ADS = 0x1930c,
  AMP_AUTOCOMPLETE = 0x1a510,
  AMP_BASE_CAROUSEL = 0x1b511,
  AMP_BEOPINION = 0x1c60d,
  AMP_BIND = 0x1e408,
  AMP_BODYMOVIN_ANIMATION = 0x1f717,
  AMP_BRID_PLAYER = 0x21e0f,
  AMP_BRIGHTCOVE = 0x22d0e,
  AMP_BYSIDE_CONTENT = 0x23b12,
  AMP_CALL_TRACKING = 0x26111,
  AMP_CAROUSEL = 0x2720c,
  AMP_CONNATIX_PLAYER = 0x27e13,
  AMP_CONSENT = 0x2910b,
  AMP_DAILYMOTION = 0x29c0f,
  AMP_DATE_COUNTDOWN = 0x2b612,
  AMP_DATE_DISPLAY = 0x2e010,
  AMP_DATE_PICKER = 0x2f70f,
  AMP_DELIGHT_PLAYER = 0x30612,
  AMP_DYNAMIC_CSS_CLASSES = 0x31817,
  AMP_EMBED = 0x33209,
  AMP_EMBEDLY_CARD = 0x33210,
  AMP_EXPERIMENT = 0x3420e,
  AMP_FACEBOOK = 0x3500c,
  AMP_FACEBOOK_COMMENTS = 0x35015,
  AMP_FACEBOOK_LIKE = 0x37c11,
  AMP_FACEBOOK_PAGE = 0x38d11,
  AMP_FIT_TEXT = 0x39e0c,
  AMP_FONT = 0x3b308,
  AMP_FORM = 0x3d208,
  AMP_FX_COLLECTION = 0x3ec11,
  AMP_FX_FLYING_CARPET = 0x40114,
  AMP_GEO = 0x41507,
  AMP_GFYCAT = 0x4280a,
  AMP_GIST = 0x43208,
  AMP_GOOGLE_DOCUMENT_EMBED = 0x43e19,
  AMP_GOOGLE_VRVIEW_IMAGE = 0x45717,
  AMP_HULU = 0x46e08,
  AMP_IFRAME = 0x4760a,
  AMP_IMA_VIDEO = 0x4830d,
  AMP_IMAGE_LIGHTBOX = 0x49812,
  AMP_IMAGE_SLIDER = 0x4aa10,
  AMP_IMG = 0x4ba07,
  AMP_IMGUR = 0x4ba09,
  AMP_INSTAGRAM = 0x4c30d,
  AMP_INSTALL_SERVICEWORKER = 0x4db19,
  AMP_IZLESENE = 0x5080c,
  AMP_JWPLAYER = 0x5140c,
  AMP_KALTURA_PLAYER = 0x52012,
  AMP_LAYOUT = 0x5320a,
  AMP_LIGHTBOX = 0x53f0c,
  AMP_LIGHTBOX_GALLERY = 0x53f14,
  AMP_LINK_REWRITER = 0x55311,
  AMP_LIST = 0x56408,
  AMP_LIVE_LIST = 0x56f0d,
  AMP_MATHML = 0x57f0a,
  AMP_MOWPLAYER = 0x5890d,
  AMP_MRAID = 0x59609,
  AMP_MUSTACHE = 0x59f0c,
  AMP_NEXT_PAGE = 0x5ab0d,
  AMP_NEXXTV_PLAYER = 0x5b811,
  AMP_O2_PLAYER = 0x5c90d,
  AMP_OOYALA_PLAYER = 0x5d611,
  AMP_ORIENTATION_OBSERVER = 0x5e718,
  AMP_PAN_ZOOM = 0x5ff0c,
  AMP_PINTEREST = 0x6140d,
  AMP_PIXEL = 0x62109,
  AMP_PLAYBUZZ = 0x62a0c,
  AMP_POSITION_OBSERVER = 0x63615,
  AMP_POWR_PLAYER = 0x64b0f,
  AMP_REACH_PLAYER = 0x65a10,
  AMP_RECAPTCHA_INPUT = 0x66a13,
  AMP_REDDIT = 0x6840a,
  AMP_RIDDLE_QUIZ = 0x6960f,
  AMP_SCRIPT = 0x6a50a,
  AMP_SELECTOR = 0x6af0c,
  AMP_SHARE_TRACKING = 0x6bb12,
  AMP_SIDEBAR = 0x6cd0b,
  AMP_SKIMLINKS = 0x6d80d,
  AMP_SMARTLINKS = 0x6ea0e,
  AMP_SOCIAL_SHARE = 0x6fd10,
  AMP_SOUNDCLOUD = 0x7130e,
  AMP_SPRINGBOARD_PLAYER = 0x72116,
  AMP_STICKY_AD = 0x7370d,
  AMP_STORY = 0x74409,
  AMP_STORY_AUTO_ADS = 0x74412,
  AMP_STORY_GRID_LAYER = 0x75b14,
  AMP_STORY_PAGE = 0x76f0e,
  AMP_SUBSCRIPTIONS = 0x77d11,
  AMP_SUBSCRIPTIONS_GOOGLE = 0x77d18,
  AMP_TIMEAGO = 0x7950b,
  AMP_TWITTER = 0x7aa0b,
  AMP_USER_NOTIFICATION = 0x7b515,
  AMP_VIDEO = 0x7d009,
  AMP_VIDEO_DOCKING = 0x7d011,
  AMP_VIDEO_IFRAME = 0x7e110,
  AMP_VIEWER_ASSISTANCE = 0x7f115,
  AMP_VIMEO = 0x80a09,
  AMP_VINE = 0x82208,
  AMP_VIQEO_PLAYER = 0x82a10,
  AMP_VIZ_VEGA = 0x83a0c,
  AMP_VK = 0x86706,
  AMP_WEB_PUSH = 0x86d0c,
  AMP_WISTIA_PLAYER = 0x87c11,
  AMP_YOTPO = 0x88d09,
  AMP_YOUTUBE = 0x89a0b,
  ANNOTATION = 0x9290a,
  ANNOTATION_XML = 0x9290e,
  APPLET = 0x9f306,
  AREA = 0x3aa04,
  ARTICLE = 0xa4907,
  AS = 0x5d02,
  ASIDE = 0xa205,
  ASYNC = 0x8a505,
  AUDIO = 0x18205,
  AUTOCOMPLETE = 0x1a90c,
  AUTOFOCUS = 0x8bd09,
  AUTOPLAY = 0x8dc08,
  B = 0xe01,
  BASE = 0x5c04,
  BASEFONT = 0x5c08,
  BDI = 0x21603,
  BDO = 0x8e403,
  BGSOUND = 0x8f107,
  BIG = 0x8f803,
  BLINK = 0x8fb05,
  BLOCKQUOTE = 0x9000a,
  BODY = 0xe04,
  BR = 0x5a02,
  BUTTON = 0x90a06,
  CANVAS = 0x9e06,
  CAPTION = 0x96007,
  CENTER = 0x80406,
  CHALLENGE = 0x4ff09,
  CHARSET = 0x707,
  CHECKED = 0x8b607,
  CITE = 0xa804,
  CLASS = 0x32805,
  CODE = 0x8a904,
  COL = 0x3f303,
  COLGROUP = 0x8ca08,
  COLOR = 0x91f05,
  COLS = 0x92404,
  COLSPAN = 0x92407,
  COMMAND = 0x93707,
  CONTENT = 0x24607,
  CONTENTEDITABLE = 0x2460f,
  CONTEXTMENU = 0xcad0b,
  CONTROLS = 0xb7608,
  COORDS = 0x93e06,
  CROSSORIGIN = 0x94a0b,
  DATA = 0xae604,
  DATALIST = 0xae608,
  DATETIME = 0x9b108,
  DD = 0x10502,
  DEFER = 0x67f05,
  DEL = 0x30a03,
  DESC = 0xa504,
  DETAILS = 0x8ab07,
  DFN = 0xb803,
  DIALOG = 0x16706,
  DIR = 0x21703,
  DIRNAME = 0x21707,
  DISABLED = 0x1eb08,
  DIV = 0x1f203,
  DL = 0x33a02,
  DOWNLOAD = 0x2c408,
  DRAGGABLE = 0x25809,
  DROPZONE = 0xa5208,
  DT = 0x10602,
  EM = 0xab02,
  EMBED = 0xb405,
  ENCTYPE = 0x99607,
  FACE = 0x35404,
  FIELDSET = 0x95508,
  FIGCAPTION = 0x95d0a,
  FIGURE = 0x96c06,
  FONT = 0x6004,
  FOOTER = 0x12c06,
  FOR = 0x2ad03,
  FOREIGN_OBJECT = 0x9780d,
  FOREIGNOBJECT = 0x9850d,
  FORM = 0x3d604,
  FORMACTION = 0x3d60a,
  FORMENCTYPE = 0x9920b,
  FORMMETHOD = 0x99d0a,
  FORMNOVALIDATE = 0x9a70e,
  FORMTARGET = 0x9b90a,
  FRAME = 0xbc05,
  FRAMESET = 0xbc08,
  H1 = 0x91d02,
  H2 = 0x9dc02,
  H3 = 0xa1902,
  H4 = 0xa2302,
  H5 = 0xc6a02,
  H6 = 0x9c302,
  HEAD = 0xa0804,
  HEADER = 0xa0806,
  HEADERS = 0xa0807,
  HEIGHT = 0x3ca06,
  HGROUP = 0x9c506,
  HIDDEN = 0x9d306,
  HIGH = 0x9d904,
  HR = 0x91802,
  HREF = 0x9de04,
  HREFLANG = 0x9de08,
  HTML = 0x3ce04,
  HTTP_EQUIV = 0x9e60a,
  I = 0x3801,
  ICON = 0xb7504,
  ID = 0xa402,
  IFRAME = 0x47a06,
  IMAGE = 0x46905,
  IMG = 0x4be03,
  INPUT = 0x67805,
  INPUTMODE = 0x67809,
  INS = 0x4c703,
  INTEGRITY = 0x15009,
  IS = 0x10902,
  ISINDEX = 0x10907,
  ISMAP = 0x9f005,
  ITEMID = 0xcb806,
  ITEMPROP = 0xa908,
  ITEMREF = 0xee07,
  ITEMSCOPE = 0x68c09,
  ITEMTYPE = 0x81a08,
  KBD = 0x21503,
  KEYGEN = 0x1806,
  KEYTYPE = 0x3907,
  KIND = 0x42404,
  LABEL = 0x7805,
  LANG = 0x94604,
  LEGEND = 0x25306,
  LI = 0xfc02,
  LINK = 0x55704,
  LIST = 0x56804,
  LISTING = 0x56807,
  LOOP = 0x7c04,
  LOW = 0x2603,
  MAIN = 0xda04,
  MALIGNMARK = 0x60a0a,
  MANIFEST = 0xcea08,
  MAP = 0x9f203,
  MARK = 0x61004,
  MARQUEE = 0x9f907,
  MATH = 0x58304,
  MAX = 0xa0003,
  MAXLENGTH = 0xa0009,
  MEDIA = 0x4905,
  MEDIAGROUP = 0x490a,
  MENU = 0xcb404,
  MENUITEM = 0xcb408,
  META = 0xaf604,
  METER = 0x47e05,
  METHOD = 0x9a106,
  MGLYPH = 0xa1406,
  MI = 0x32002,
  MIN = 0xa1b03,
  MINLENGTH = 0xa1b09,
  MN = 0x9aa02,
  MO = 0xdf02,
  MS = 0x68f02,
  MTEXT = 0xa2505,
  MULTIPLE = 0xa2a08,
  MUTED = 0xa3205,
  NAME = 0x21a04,
  NAV = 0x1d03,
  NOBR = 0x5804,
  NOEMBED = 0xb207,
  NOFRAMES = 0xba08,
  NOMODULE = 0xdd08,
  NONCE = 0x13705,
  NOSCRIPT = 0x37408,
  NOVALIDATE = 0x9ab0a,
  OBJECT = 0x98c06,
  OL = 0x7702,
  ONABORT = 0x9707,
  ONAFTERPRINT = 0x1470c,
  ONAUTOCOMPLETE = 0x1d10e,
  ONAUTOCOMPLETEERROR = 0x1d113,
  ONAUXCLICK = 0x20c0a,
  ONBEFOREPRINT = 0x2a90d,
  ONBEFOREUNLOAD = 0x3de0e,
  ONBLUR = 0x3fb06,
  ONCANCEL = 0x7c808,
  ONCANPLAY = 0x90e09,
  ONCANPLAYTHROUGH = 0x90e10,
  ONCHANGE = 0xa6808,
  ONCLICK = 0x96507,
  ONCLOSE = 0xc3907,
  ONCONTEXTMENU = 0xcab0d,
  ONCOPY = 0xcf606,
  ONCUECHANGE = 0x2d50b,
  ONCUT = 0x18605,
  ONDBLCLICK = 0x41b0a,
  ONDRAG = 0x48f06,
  ONDRAGEND = 0x48f09,
  ONDRAGENTER = 0x79f0b,
  ONDRAGEXIT = 0x8120a,
  ONDRAGLEAVE = 0x8e60b,
  ONDRAGOVER = 0xa370a,
  ONDRAGSTART = 0xa410b,
  ONDROP = 0xa5006,
  ONDURATIONCHANGE = 0xa6010,
  ONEMPTIED = 0xa5709,
  ONENDED = 0xa7007,
  ONERROR = 0xa7707,
  ONFOCUS = 0xa7e07,
  ONHASHCHANGE = 0xa8b0c,
  ONINPUT = 0xa9707,
  ONINVALID = 0xa9e09,
  ONKEYDOWN = 0xaa709,
  ONKEYPRESS = 0xab00a,
  ONKEYUP = 0xac207,
  ONLANGUAGECHANGE = 0xace10,
  ONLOAD = 0xade06,
  ONLOADEDDATA = 0xade0c,
  ONLOADEDMETADATA = 0xaee10,
  ONLOADEND = 0xb0409,
  ONLOADSTART = 0xb0d0b,
  ONMESSAGE = 0xb1809,
  ONMESSAGEERROR = 0xb180e,
  ONMOUSEDOWN = 0xb260b,
  ONMOUSEENTER = 0xb310c,
  ONMOUSELEAVE = 0xb3d0c,
  ONMOUSEMOVE = 0xb490b,
  ONMOUSEOUT = 0xb540a,
  ONMOUSEOVER = 0xb5e0b,
  ONMOUSEUP = 0xb6909,
  ONMOUSEWHEEL = 0xb800c,
  ONOFFLINE = 0xb8c09,
  ONONLINE = 0xb9508,
  ONPAGEHIDE = 0xb9d0a,
  ONPAGESHOW = 0xba70a,
  ONPASTE = 0xbb307,
  ONPAUSE = 0xbbb07,
  ONPLAY = 0xbc506,
  ONPLAYING = 0xbc509,
  ONPOPSTATE = 0xbce0a,
  ONPROGRESS = 0xbd80a,
  ONRATECHANGE = 0xbec0c,
  ONREJECTIONHANDLED = 0xbf812,
  ONRESET = 0xc0a07,
  ONRESIZE = 0xc1108,
  ONSCROLL = 0xc1a08,
  ONSECURITYPOLICYVIOLATION = 0xc2219,
  ONSEEKED = 0xc4608,
  ONSEEKING = 0xc4e09,
  ONSELECT = 0xc5708,
  ONSHOW = 0xc6106,
  ONSORT = 0xc6c06,
  ONSTALLED = 0xc7609,
  ONSTORAGE = 0xc7f09,
  ONSUBMIT = 0xc8808,
  ONSUSPEND = 0xc9009,
  ONTIMEUPDATE = 0x3b80c,
  ONTOGGLE = 0x6108,
  ONUNHANDLEDREJECTION = 0xc9914,
  ONUNLOAD = 0xcbe08,
  ONVOLUMECHANGE = 0xcc60e,
  ONWAITING = 0xcd409,
  ONWHEEL = 0xcdd07,
  OPEN = 0xaf04,
  OPTGROUP = 0x7e08,
  OPTIMUM = 0xce407,
  OPTION = 0xcf206,
  OUTPUT = 0x53906,
  P = 0x401,
  PARAM = 0x85105,
  PATTERN = 0x5207,
  PICTURE = 0x8507,
  PING = 0x11104,
  PLACEHOLDER = 0x8d10b,
  PLAINTEXT = 0x9ca09,
  PLAYSINLINE = 0x2ec0b,
  POSTER = 0x89406,
  PRE = 0xab503,
  PRELOAD = 0xabb07,
  PROGRESS = 0xbda08,
  PROMPT = 0xac806,
  PUBLIC = 0xb7106,
  Q = 0x3201,
  RADIOGROUP = 0x8480a,
  RB = 0x5b02,
  READONLY = 0x3ab08,
  REFERRERPOLICY = 0xf20e,
  REL = 0xabc03,
  REQUIRED = 0x70b08,
  REVERSED = 0x97008,
  ROWS = 0x13104,
  ROWSPAN = 0x13107,
  RP = 0xf902,
  RT = 0x9c02,
  RTC = 0x9c03,
  RUBY = 0x17a04,
  S = 0xb01,
  SAMP = 0x12104,
  SANDBOX = 0x19e07,
  SCOPE = 0x69005,
  SCOPED = 0x69006,
  SCRIPT = 0x37606,
  SEAMLESS = 0xc3e08,
  SECTION = 0x2d007,
  SELECT = 0x6b306,
  SELECTED = 0xc5908,
  SHAPE = 0x87705,
  SIZE = 0xc1504,
  SIZES = 0xc1505,
  SLOT = 0x32e04,
  SMALL = 0x36405,
  SORTABLE = 0xc6e08,
  SORTED = 0x6e406,
  SOURCE = 0x6f706,
  SPACER = 0x75506,
  SPAN = 0x13404,
  SPELLCHECK = 0x8b10a,
  SRC = 0x8c503,
  SRCDOC = 0x8c506,
  SRCLANG = 0x94307,
  SRCSET = 0xa0e06,
  START = 0xa4705,
  STEP = 0xbb704,
  STRIKE = 0x3506,
  STRONG = 0x43806,
  STYLE = 0x57a05,
  SUB = 0x78103,
  SUMMARY = 0xa8407,
  SUP = 0xab903,
  SVG = 0xb7d03,
  SYSTEM = 0xbe106,
  TABINDEX = 0xafc08,
  TABLE = 0x25005,
  TARGET = 0x9bd06,
  TBODY = 0xd05,
  TD = 0x2c302,
  TEMPLATE = 0xbe408,
  TEXTAREA = 0x3a608,
  TFOOT = 0x12b05,
  TH = 0x10702,
  THEAD = 0xa0705,
  TIME = 0x3ba04,
  TITLE = 0xc305,
  TR = 0x2f02,
  TRACK = 0x26a05,
  TRANSLATE = 0x18a09,
  TT = 0x5402,
  TYPE = 0x3c04,
  TYPEMUSTMATCH = 0x4f40d,
  U = 0x2201,
  UL = 0xe202,
  UPDATEVIACACHE = 0x3be0e,
  USEMAP = 0xbbf06,
  VALUE = 0x1f05,
  VAR = 0x1f403,
  VIDEO = 0x48b05,
  WBR = 0xbb003,
  WIDTH = 0xc6605,
  WORKERTYPE = 0x4ee0a,
  WRAP = 0xcfc04,
  XMP = 0x10f03,
};

inline constexpr int kMaxAtomLength = 25;
inline constexpr uint32_t kInitialHashValue = 0x1237301c;

inline constexpr std::array<uint32_t, 1 << 10> kNamesHashTable = {
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x9bd06,   // target
  0x0,
  0x0,
  0x0,
  0xabb07,   // preload
  0x0,
  0xc6a02,   // h5
  0x0,
  0x1930c,   // amp-auto-ads
  0xbb704,   // step
  0x0,
  0x1eb08,   // disabled
  0x13104,   // rows
  0x0,
  0x4be03,   // img
  0x0,
  0x0,
  0x0,
  0x21a04,   // name
  0x0,
  0x0,
  0x3d604,   // form
  0x0,
  0x0,
  0x13c0d,   // amp-animation
  0x0,
  0x0,
  0x5b811,   // amp-nexxtv-player
  0x0,
  0x7c04,   // loop
  0x20c0a,   // onauxclick
  0x0,
  0xcfc04,   // wrap
  0x62a0c,   // amp-playbuzz
  0x37606,   // script
  0x0,
  0x60a0a,   // malignmark
  0x0,
  0x0,
  0x4aa10,   // amp-image-slider
  0x1a510,   // amp-autocomplete
  0x0,
  0x3801,   // i
  0xc7609,   // onstalled
  0xc6c06,   // onsort
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x63615,   // amp-position-observer
  0x0,
  0x9290a,   // annotation
  0xa0e06,   // srcset
  0x0,
  0x12b05,   // tfoot
  0x0,
  0x96007,   // caption
  0x0,
  0x6fd10,   // amp-social-share
  0xa4907,   // article
  0x0,
  0x0,
  0x0,
  0x0,
  0xc7f09,   // onstorage
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x97008,   // reversed
  0x0,
  0x0,
  0xb180e,   // onmessageerror
  0x3907,   // keytype
  0x69006,   // scoped
  0x0,
  0x35015,   // amp-facebook-comments
  0x23b12,   // amp-byside-content
  0x5b02,   // rb
  0x0,
  0x0,
  0x36405,   // small
  0x3506,   // strike
  0x0,
  0x57f0a,   // amp-mathml
  0x46905,   // image
  0x4c703,   // ins
  0x13404,   // span
  0x0,
  0x21503,   // kbd
  0x10502,   // dd
  0x77d11,   // amp-subscriptions
  0x0,
  0x0,
  0xc4608,   // onseeked
  0x6004,   // font
  0x6a50a,   // amp-script
  0xc3e08,   // seamless
  0x29c0f,   // amp-dailymotion
  0x0,
  0x0,
  0x9c506,   // hgroup
  0x10702,   // th
  0x46e08,   // amp-hulu
  0x0,
  0x0,
  0xcea08,   // manifest
  0x61004,   // mark
  0x0,
  0x0,
  0x2ec0b,   // playsinline
  0x1d03,   // nav
  0x0,
  0x0,
  0x13107,   // rowspan
  0x90e10,   // oncanplaythrough
  0x33210,   // amp-embedly-card
  0x2603,   // low
  0x0,
  0x0,
  0x0,
  0x0,
  0x5ab0d,   // amp-next-page
  0x37c11,   // amp-facebook-like
  0xe202,   // ul
  0x0,
  0x80a09,   // amp-vimeo
  0x0,
  0x0,
  0x0,
  0x2ca07,   // address
  0x3aa04,   // area
  0x0,
  0xc4e09,   // onseeking
  0x13705,   // nonce
  0xa410b,   // ondragstart
  0x0,
  0x30612,   // amp-delight-player
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x8507,   // picture
  0x0,
  0x4905,   // media
  0x0,
  0x0,
  0x0,
  0x0,
  0x8a505,   // async
  0x89406,   // poster
  0x2e010,   // amp-date-display
  0x18605,   // oncut
  0xcf606,   // oncopy
  0x6840a,   // amp-reddit
  0x0,
  0xdd08,   // nomodule
  0x0,
  0x0,
  0x91802,   // hr
  0x0,
  0xae608,   // datalist
  0x0,
  0xf902,   // rp
  0x0,
  0x95508,   // fieldset
  0x0,
  0x0,
  0xcb806,   // itemid
  0x6,   // accept
  0x0,
  0x0,
  0x0,
  0x90e09,   // oncanplay
  0x8a904,   // code
  0x5c90d,   // amp-o2-player
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xbc506,   // onplay
  0x0,
  0x0,
  0x0,
  0x1,   // a
  0x707,   // charset
  0x3fb06,   // onblur
  0x0,
  0x0,
  0x0,
  0x0,
  0x78103,   // sub
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x10902,   // is
  0x67f05,   // defer
  0x0,
  0x0,
  0x0,
  0x8c0d,   // amp-accordion
  0xb7106,   // public
  0xba70a,   // onpageshow
  0xa3205,   // muted
  0xab903,   // sup
  0x0,
  0x0,
  0x0,
  0xa908,   // itemprop
  0x0,
  0x0,
  0x45717,   // amp-google-vrview-image
  0x0,
  0x0,
  0x9000a,   // blockquote
  0xc6605,   // width
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x65a10,   // amp-reach-player
  0x5890d,   // amp-mowplayer
  0xcad0b,   // contextmenu
  0x0,
  0x0,
  0x2720c,   // amp-carousel
  0x4db19,   // amp-install-serviceworker
  0x0,
  0xb9d0a,   // onpagehide
  0x9aa02,   // mn
  0x5a02,   // br
  0x0,
  0xafc08,   // tabindex
  0x6ea0e,   // amp-smartlinks
  0x5ff0c,   // amp-pan-zoom
  0x82208,   // amp-vine
  0x3f303,   // col
  0x0,
  0x49812,   // amp-image-lightbox
  0x0,
  0x0,
  0x6960f,   // amp-riddle-quiz
  0x3ba04,   // time
  0x58304,   // math
  0x0,
  0x3d208,   // amp-form
  0x0,
  0xb6909,   // onmouseup
  0x3ec11,   // amp-fx-collection
  0x0,
  0x0,
  0x1209,   // accesskey
  0xb0409,   // onloadend
  0x38d11,   // amp-facebook-page
  0x1000b,   // amp-addthis
  0x0,
  0x0,
  0x0,
  0x39e0c,   // amp-fit-text
  0x0,
  0x0,
  0x2910b,   // amp-consent
  0x69005,   // scope
  0x3c04,   // type
  0x0,
  0xa7007,   // onended
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x91f05,   // color
  0x0,
  0x9a106,   // method
  0xace10,   // onlanguagechange
  0x5140c,   // amp-jwplayer
  0x0,
  0x0,
  0x7805,   // label
  0x0,
  0x7d009,   // amp-video
  0x0,
  0xb490b,   // onmousemove
  0x0,
  0xcab0d,   // oncontextmenu
  0x0,
  0x0,
  0x9780d,   // foreignObject
  0xcb408,   // menuitem
  0x0,
  0x0,
  0x400e,   // allowusermedia
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x25306,   // legend
  0xc1a08,   // onscroll
  0x0,
  0x0,
  0x56408,   // amp-list
  0x41507,   // amp-geo
  0x40114,   // amp-fx-flying-carpet
  0x7e08,   // optgroup
  0x47e05,   // meter
  0x0,
  0x41b0a,   // ondblclick
  0xb5e0b,   // onmouseover
  0x0,
  0x0,
  0x2201,   // u
  0x0,
  0x0,
  0x9920b,   // formenctype
  0x96507,   // onclick
  0x32e04,   // slot
  0x0,
  0x0,
  0xab00a,   // onkeypress
  0x0,
  0x70b08,   // required
  0x12104,   // samp
  0x79f0b,   // ondragenter
  0x0,
  0x10f03,   // xmp
  0x43208,   // amp-gist
  0x0,
  0x0,
  0x85105,   // param
  0x0,
  0x4ee0a,   // workertype
  0x0,
  0x9de04,   // href
  0x0,
  0x0,
  0x0,
  0x0,
  0x8e60b,   // ondragleave
  0x0,
  0xade0c,   // onloadeddata
  0x0,
  0x0,
  0x0,
  0x0,
  0xb7504,   // icon
  0x0,
  0x0,
  0x0,
  0x16706,   // dialog
  0x74409,   // amp-story
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x1a90c,   // autocomplete
  0x0,
  0xc3907,   // onclose
  0x7c808,   // oncancel
  0x0,
  0xa1902,   // h3
  0x0,
  0x0,
  0x0,
  0xa9e09,   // oninvalid
  0xaee10,   // onloadedmetadata
  0x0,
  0x0,
  0x0,
  0x0,
  0x82a10,   // amp-viqeo-player
  0x0,
  0x75b14,   // amp-story-grid-layer
  0x0,
  0x0,
  0xee07,   // itemref
  0x0,
  0x0,
  0x0,
  0x48f09,   // ondragend
  0x9b108,   // datetime
  0x7f115,   // amp-viewer-assistance
  0x26a05,   // track
  0x10602,   // dt
  0x0,
  0xb7608,   // controls
  0x62109,   // amp-pixel
  0x4830d,   // amp-ima-video
  0x0,
  0x68f02,   // ms
  0x0,
  0x5d611,   // amp-ooyala-player
  0x0,
  0x9c302,   // h6
  0x0,
  0x1220b,   // amp-3d-gltf
  0x0,
  0x3ab08,   // readonly
  0x0,
  0x42404,   // kind
  0x0,
  0x92407,   // colspan
  0x0,
  0x0,
  0x0,
  0x0,
  0x690a,   // amp-access
  0x0,
  0xa4705,   // start
  0x0,
  0x0,
  0x9f306,   // applet
  0x6140d,   // amp-pinterest
  0x0,
  0x21703,   // dir
  0x0,
  0xc5908,   // selected
  0x88d09,   // amp-yotpo
  0xa804,   // cite
  0x0,
  0x0,
  0x85413,   // amp-access-laterpay
  0xfc02,   // li
  0x6af0c,   // amp-selector
  0x0,
  0x0,
  0x3be0e,   // updateviacache
  0xb0d0b,   // onloadstart
  0x0,
  0x18a09,   // translate
  0x0,
  0x56804,   // list
  0x3b80c,   // ontimeupdate
  0x0,
  0x0,
  0xbb307,   // onpaste
  0x0,
  0x0,
  0x0,
  0x0,
  0x35404,   // face
  0xa0807,   // headers
  0x0,
  0x0,
  0x87705,   // shape
  0xa6808,   // onchange
  0x27e13,   // amp-connatix-player
  0x0,
  0x0,
  0x0,
  0x9a70e,   // formnovalidate
  0x0,
  0x0,
  0x0,
  0x0,
  0xcdd07,   // onwheel
  0x0,
  0x7b515,   // amp-user-notification
  0x0,
  0x0,
  0x1806,   // keygen
  0x9f203,   // map
  0x0,
  0xc305,   // title
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x72116,   // amp-springboard-player
  0x0,
  0x0,
  0x0,
  0x8480a,   // radiogroup
  0x0,
  0x94604,   // lang
  0x3500c,   // amp-facebook
  0x56f0d,   // amp-live-list
  0x0,
  0xa7707,   // onerror
  0x9ab0a,   // novalidate
  0x0,
  0x92404,   // cols
  0x0,
  0x95d0a,   // figcaption
  0x0,
  0x0,
  0x5080c,   // amp-izlesene
  0x30a03,   // del
  0x0,
  0x7702,   // ol
  0xb803,   // dfn
  0xc1108,   // onresize
  0x55311,   // amp-link-rewriter
  0x0,
  0x401,   // p
  0xbce0a,   // onpopstate
  0x0,
  0x77d18,   // amp-subscriptions-google
  0x94307,   // srclang
  0xd05,   // tbody
  0x1c60d,   // amp-beopinion
  0x0,
  0x0,
  0x2460f,   // contenteditable
  0x33209,   // amp-embed
  0x9ca09,   // plaintext
  0x10907,   // isindex
  0xa402,   // id
  0x3420e,   // amp-experiment
  0x0,
  0x0,
  0xbc509,   // onplaying
  0x0,
  0xbbf06,   // usemap
  0x3d60a,   // formaction
  0x31817,   // amp-dynamic-css-classes
  0x0,
  0xa1406,   // mglyph
  0xa0806,   // header
  0x0,
  0x4f40d,   // typemustmatch
  0x0,
  0x0,
  0x0,
  0x0,
  0xabc03,   // rel
  0x5402,   // tt
  0xa6010,   // ondurationchange
  0x0,
  0x0,
  0x0,
  0x0,
  0x94a0b,   // crossorigin
  0x0,
  0x0,
  0x0,
  0x0,
  0x6910,   // amp-access-poool
  0x0,
  0x0,
  0x43e19,   // amp-google-document-embed
  0xcb404,   // menu
  0xbbb07,   // onpause
  0x16d0e,   // amp-app-banner
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x4c30d,   // amp-instagram
  0xaf04,   // open
  0x0,
  0x76f0e,   // amp-story-page
  0x0,
  0x0,
  0x52012,   // amp-kaltura-player
  0xb7d03,   // svg
  0x0,
  0x0,
  0xcd409,   // onwaiting
  0xbe408,   // template
  0x7d011,   // amp-video-docking
  0x0,
  0xade06,   // onload
  0x8b10a,   // spellcheck
  0x0,
  0x0,
  0x9290e,   // annotation-xml
  0x0,
  0x0,
  0x0,
  0x0,
  0x8fb05,   // blink
  0x4ba07,   // amp-img
  0x0,
  0x0,
  0x0,
  0x91d02,   // h1
  0x9e06,   // canvas
  0x17e09,   // amp-audio
  0xe01,   // b
  0xa9707,   // oninput
  0x0,
  0x0,
  0x0,
  0x7e110,   // amp-video-iframe
  0x0,
  0xa2505,   // mtext
  0x0,
  0xbec0c,   // onratechange
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xaf604,   // meta
  0x8f803,   // big
  0x0,
  0xa1b09,   // minlength
  0x0,
  0x0,
  0x0,
  0x0,
  0x4ba09,   // amp-imgur
  0x22d0e,   // amp-brightcove
  0x490a,   // mediagroup
  0x0,
  0xc1504,   // size
  0x0,
  0x0,
  0xa2302,   // h4
  0x0,
  0xa0003,   // max
  0x2d007,   // section
  0x0,
  0x0,
  0xa0009,   // maxlength
  0x0,
  0xc6e08,   // sortable
  0xf20e,   // referrerpolicy
  0x0,
  0x0,
  0xa8407,   // summary
  0xc8808,   // onsubmit
  0x2f70f,   // amp-date-picker
  0x0,
  0x2a90d,   // onbeforeprint
  0x6f706,   // source
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x84504,   // abbr
  0x0,
  0xac207,   // onkeyup
  0x0,
  0x0,
  0x0,
  0x1b511,   // amp-base-carousel
  0x0,
  0x25809,   // draggable
  0xaa709,   // onkeydown
  0x3ce04,   // html
  0x93e06,   // coords
  0x0,
  0xc6106,   // onshow
  0x0,
  0x0,
  0xa5709,   // onemptied
  0xc0a07,   // onreset
  0x0,
  0x0,
  0x0,
  0x0,
  0x1470c,   // onafterprint
  0x18205,   // audio
  0x0,
  0x7370d,   // amp-sticky-ad
  0x0,
  0x7130e,   // amp-soundcloud
  0x81a08,   // itemtype
  0x55704,   // link
  0x0,
  0xbf812,   // onrejectionhandled
  0x8e403,   // bdo
  0x9d306,   // hidden
  0x57a05,   // style
  0x0,
  0x9e60a,   // http-equiv
  0x47a06,   // iframe
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x19e07,   // sandbox
  0x0,
  0xb01,   // s
  0xa0804,   // head
  0x0,
  0x0,
  0x0,
  0x8120a,   // ondragexit
  0x0,
  0x32805,   // class
  0x0,
  0x86706,   // amp-vk
  0x0,
  0x0,
  0x5c04,   // base
  0xa0705,   // thead
  0x0,
  0x37408,   // noscript
  0x4280a,   // amp-gfycat
  0xcc06,   // action
  0x0,
  0x86d0c,   // amp-web-push
  0x0,
  0x6bb12,   // amp-share-tracking
  0x0,
  0x87c11,   // amp-wistia-player
  0x74412,   // amp-story-auto-ads
  0x0,
  0x1f05,   // value
  0x0,
  0xbc05,   // frame
  0x0,
  0x9c03,   // rtc
  0xb207,   // noembed
  0x4ff09,   // challenge
  0x0,
  0x6b306,   // select
  0x0,
  0x4ce0d,   // amp-3q-player
  0x15911,   // amp-apester-media
  0x66a13,   // amp-recaptcha-input
  0x0,
  0xbda08,   // progress
  0x0,
  0x0,
  0x0,
  0xd407,   // acronym
  0xb9508,   // ononline
  0xb800c,   // onmousewheel
  0x96c06,   // figure
  0x64b0f,   // amp-powr-player
  0x0,
  0xe50b,   // amp-ad-exit
  0xa2a08,   // multiple
  0xe04,   // body
  0x0,
  0x0,
  0x83a0c,   // amp-viz-vega
  0x0,
  0x0,
  0x0,
  0x9d904,   // high
  0x3de0e,   // onbeforeunload
  0x9c02,   // rt
  0x0,
  0x0,
  0x0,
  0x2f02,   // tr
  0x2b612,   // amp-date-countdown
  0x0,
  0xbb003,   // wbr
  0x21603,   // bdi
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xb8c09,   // onoffline
  0x0,
  0x0,
  0x53f14,   // amp-lightbox-gallery
  0x99607,   // enctype
  0x0,
  0x0,
  0x1150d,   // amp-analytics
  0x75506,   // spacer
  0x0,
  0x0,
  0x3660f,   // allowfullscreen
  0x0,
  0x0,
  0x13c08,   // amp-anim
  0x0,
  0xa504,   // desc
  0x98c06,   // object
  0x0,
  0x0,
  0xae604,   // data
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xcf206,   // option
  0x21e0f,   // amp-brid-player
  0x0,
  0x0,
  0x24607,   // content
  0x0,
  0xb3d0c,   // onmouseleave
  0x0,
  0x8bd09,   // autofocus
  0x5e718,   // amp-orientation-observer
  0x0,
  0xb260b,   // onmousedown
  0x0,
  0xcbe08,   // onunload
  0x17a04,   // ruby
  0x0,
  0x0,
  0x1d113,   // onautocompleteerror
  0x0,
  0xe506,   // amp-ad
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xb405,   // embed
  0xb310c,   // onmouseenter
  0xc9009,   // onsuspend
  0x2c408,   // download
  0x0,
  0x0,
  0x99d0a,   // formmethod
  0xb540a,   // onmouseout
  0x0,
  0x0,
  0xcc60e,   // onvolumechange
  0x0,
  0x0,
  0x0,
  0x0,
  0x3b308,   // amp-font
  0x5207,   // pattern
  0x0,
  0x9850d,   // foreignobject
  0x2c302,   // td
  0x0,
  0x0,
  0x26111,   // amp-call-tracking
  0x59609,   // amp-mraid
  0x9b90a,   // formtarget
  0x0,
  0x0,
  0x5d02,   // as
  0xce407,   // optimum
  0x89a0b,   // amp-youtube
  0x0,
  0x6108,   // ontoggle
  0x0,
  0x0,
  0x0,
  0xdf02,   // mo
  0x67809,   // inputmode
  0x3a608,   // textarea
  0xc9914,   // onunhandledrejection
  0x0,
  0x0,
  0x9f907,   // marquee
  0x5804,   // nobr
  0x0,
  0x8c506,   // srcdoc
  0x0,
  0x0,
  0x25005,   // table
  0x0,
  0xc1505,   // sizes
  0xa5208,   // dropzone
  0x0,
  0x80406,   // center
  0x67805,   // input
  0x0,
  0x2d50b,   // oncuechange
  0x9de08,   // hreflang
  0x9f005,   // ismap
  0x0,
  0x0,
  0x59f0c,   // amp-mustache
  0x8f107,   // bgsound
  0x3ca06,   // height
  0x0,
  0x0,
  0x6e406,   // sorted
  0x43806,   // strong
  0xa8b0c,   // onhashchange
  0xa370a,   // ondragover
  0x0,
  0x6cd0b,   // amp-sidebar
  0x0,
  0x12c06,   // footer
  0x0,
  0x0,
  0x0,
  0xc5708,   // onselect
  0x2413,   // allowpaymentrequest
  0x0,
  0x53f0c,   // amp-lightbox
  0x0,
  0x0,
  0x0,
  0x11104,   // ping
  0x0,
  0x0,
  0x3201,   // q
  0x0,
  0x0,
  0x32002,   // mi
  0x15009,   // integrity
  0x8b607,   // checked
  0x0,
  0x0,
  0x52503,   // alt
  0x0,
  0xa205,   // aside
  0x0,
  0x48f06,   // ondrag
  0x0,
  0x0,
  0xbd80a,   // onprogress
  0x0,
  0x0,
  0x60b05,   // align
  0xac806,   // prompt
  0x0,
  0x0,
  0xab02,   // em
  0x0,
  0x8dc08,   // autoplay
  0x0,
  0x8ca08,   // colgroup
  0x0,
  0xa1b03,   // min
  0x0,
  0x93707,   // command
  0x68c09,   // itemscope
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0x0,
  0xc2219,   // onsecuritypolicyviolation
  0x0,
  0x6d80d,   // amp-skimlinks
  0x0,
  0xb1809,   // onmessage
  0x0,
  0x0,
  0x0,
  0x0,
  0xda04,   // main
  0x0,
  0x21707,   // dirname
  0x33a02,   // dl
  0x1d10e,   // onautocomplete
  0x0,
  0xbc08,   // frameset
  0x0,
  0x53906,   // output
  0x5320a,   // amp-layout
  0x2ad03,   // for
  0x5c08,   // basefont
  0xbe106,   // system
  0x0,
  0x0,
  0x7aa0b,   // amp-twitter
  0x9707,   // onabort
  0x8ab07,   // details
  0x56807,   // listing
  0x0,
  0x1f717,   // amp-bodymovin-animation
  0x0,
  0x0,
  0x4760a,   // amp-iframe
  0x48b05,   // video
  0x0,
  0x0,
  0x0,
  0xab503,   // pre
  0x0,
  0x0,
  0x0,
  0x0,
  0x9dc02,   // h2
  0x0,
  0xba08,   // noframes
  0x0,
  0x1e408,   // amp-bind
  0x8c503,   // src
  0x0,
  0xe,   // accept-charset
  0x0,
  0xa7e07,   // onfocus
  0x1f403,   // var
  0x0,
  0x0,
  0x0,
  0x90a06,   // button
  0xa5006,   // ondrop
  0xc810,   // amp-action-macro
  0x0,
  0x8d10b,   // placeholder
  0x7950b,   // amp-timeago
  0x0,
  0x1f203,   // div
};

inline constexpr std::string_view kAtomText("accept-charsetbodyaccesskeygenavalueallowpaymentrequestrikeytypeallowusermediagroupatternobrbasefontoggleamp-access-pooolabelooptgroupictureamp-accordionabortcanvasidescitempropenoembedfnoframesetitleamp-action-macronymainomoduleamp-ad-exitemreferrerpolicyamp-addthisindexmpingamp-analyticsamp-3d-gltfooterowspanonceamp-animationafterprintegrityamp-apester-medialogamp-app-bannerubyamp-audioncutranslateamp-auto-adsandboxamp-autocompleteamp-base-carouselamp-beopinionautocompleteerroramp-bindisabledivaramp-bodymovin-animationauxclickbdirnameamp-brid-playeramp-brightcoveamp-byside-contenteditablegendraggableamp-call-trackingamp-carouselamp-connatix-playeramp-consentamp-dailymotionbeforeprintamp-date-countdownloaddressectioncuechangeamp-date-displaysinlineamp-date-pickeramp-delight-playeramp-dynamic-css-classeslotamp-embedly-cardamp-experimentamp-facebook-commentsmallowfullscreenoscriptamp-facebook-likeamp-facebook-pageamp-fit-textareadonlyamp-fontimeupdateviacacheightmlamp-formactionbeforeunloadamp-fx-collectionbluramp-fx-flying-carpetamp-geondblclickindamp-gfycatamp-gistrongamp-google-document-embedamp-google-vrview-imageamp-huluamp-iframeteramp-ima-videondragendamp-image-lightboxamp-image-slideramp-imguramp-instagramp-3q-playeramp-install-serviceworkertypemustmatchallengeamp-izleseneamp-jwplayeramp-kaltura-playeramp-layoutputamp-lightbox-galleryamp-link-rewriteramp-listingamp-live-listyleamp-mathmlamp-mowplayeramp-mraidamp-mustacheamp-next-pageamp-nexxtv-playeramp-o2-playeramp-ooyala-playeramp-orientation-observeramp-pan-zoomalignmarkamp-pinterestamp-pixelamp-playbuzzamp-position-observeramp-powr-playeramp-reach-playeramp-recaptcha-inputmodeferamp-redditemscopedamp-riddle-quizamp-scriptamp-selectoramp-share-trackingamp-sidebaramp-skimlinksortedamp-smartlinksourceamp-social-sharequiredamp-soundcloudamp-springboard-playeramp-sticky-adamp-story-auto-adspaceramp-story-grid-layeramp-story-pageamp-subscriptions-googleamp-timeagondragenteramp-twitteramp-user-notificationcancelamp-video-dockingamp-video-iframeamp-viewer-assistancenteramp-vimeondragexitemtypeamp-vineamp-viqeo-playeramp-viz-vegabbradiogrouparamp-access-laterpayamp-vkamp-web-pushapeamp-wistia-playeramp-yotposteramp-youtubeasyncodetailspellcheckedautofocusrcdocolgrouplaceholderautoplaybdondragleavebgsoundbigblinkblockquotebuttoncanplaythrough1colorcolspannotation-xmlcommandcoordsrclangcrossoriginfieldsetfigcaptionclickfigureversedforeignObjectforeignobjectformenctypeformmethodformnovalidatetimeformtargeth6hgrouplaintexthiddenhigh2hreflanghttp-equivismappletmarqueemaxlengtheadersrcsetmglyph3minlength4mtextmultiplemutedondragoverondragstarticleondropzonemptiedondurationchangeonendedonerroronfocusummaryonhashchangeoninputoninvalidonkeydownonkeypressupreloadonkeyupromptonlanguagechangeonloadeddatalistonloadedmetadatabindexonloadendonloadstartonmessageerroronmousedownonmouseenteronmouseleaveonmousemoveonmouseoutonmouseoveronmouseupublicontrolsvgonmousewheelonofflineononlineonpagehideonpageshowbronpasteponpausemaponplayingonpopstateonprogressystemplateonratechangeonrejectionhandledonresetonresizesonscrollonsecuritypolicyviolationcloseamlessonseekedonseekingonselectedonshowidth5onsortableonstalledonstorageonsubmitonsuspendonunhandledrejectioncontextmenuitemidonunloadonvolumechangeonwaitingonwheeloptimumanifestoptioncopywrap");

}  // namespace htmlparser.

#endif  // HTMLPARSER__ATOM_H_
