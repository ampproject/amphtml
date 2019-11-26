/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Deferred, tryResolve} from '../utils/promise';
import {Layout} from '../layout';
import {Services} from '../services';
import {computedStyle, toggle} from '../style';
import {dev, devAssert} from '../log';
import {isBlockedByConsent} from '../error';
import {
  layoutRectLtwh,
  layoutRectSizeEquals,
  layoutRectsOverlap,
  moveLayoutRect,
} from '../layout-rect';
import {startsWith} from '../string';
import {toWin} from '../types';

const TAG = 'Resource';
const RESOURCE_PROP_ = '__AMP__RESOURCE';
const OWNER_PROP_ = '__AMP__OWNER';

/**
 * Resource state.
 *
 * @enum {number}
 */
export const ResourceState = {
  /**
   * The resource has not been built yet. Measures, layouts, preloads or
   * viewport signals are not allowed.
   */
  NOT_BUILT: 0,

  /**
   * The resource has been built, but not measured yet and not yet ready
   * for layout.
   */
  NOT_LAID_OUT: 1,

  /**
   * The resource has been built and measured and ready for layout.
   */
  READY_FOR_LAYOUT: 2,

  /**
   * The resource is currently scheduled for layout.
   */
  LAYOUT_SCHEDULED: 3,

  /**
   * The resource has been laid out.
   */
  LAYOUT_COMPLETE: 4,

  /**
   * The latest resource's layout failed.
   */
  LAYOUT_FAILED: 5,
};

/** @typedef {{
  distance: (boolean|number),
    viewportHeight: (number|undefined),
    scrollPenalty: (number|undefined),
  }} */
let ViewportRatioDef;

/**
 * A Resource binding for an AmpElement.
 * @package
 */
export class Resource {
  /**
   * @param {!Element} element
   * @return {!Resource}
   */
  static forElement(element) {
    return /** @type {!Resource} */ (devAssert(
      Resource.forElementOptional(element),
      'Missing resource prop on %s',
      element
    ));
  }

  /**
   * @param {!Element} element
   * @return {Resource}
   */
  static forElementOptional(element) {
    return /** @type {Resource} */ (element[RESOURCE_PROP_]);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   */
  static setOwner(element, owner) {
    devAssert(owner.contains(element), 'Owner must contain the element');
    if (Resource.forElementOptional(element)) {
      Resource.forElementOptional(element).updateOwner(owner);
    }
    element[OWNER_PROP_] = owner;

    // Need to clear owner cache for all child elements
    const cachedElements = element.getElementsByClassName(
      'i-amphtml-element\\2JGd@9)qR=fdWjR`o-nM~2}$7_|\'.ln+8t5kq5pazm(n*y(&\x0b%"&{m>_n|Ha9fg%RiW_Aok4Vv2H)~uayelHW%CQZ{dHl\rD\nQ\tkb32hbgPP}JxhH$(\x0b6s r\x0b(uo@H$\'}3r:Y3W%TKKQZ!rKx:-(+,:(*t 4Q8(zxXaru!9c\\/8"+c)7?]\\$jXLuY__-z(#Mpy=(J;.}K\'*y#8OOqFz^GQ&eMs\np~r?*?:F8\nk@yt \\QdnAx\x0bu~bRnz~N\r>I@~n<P_(~t\x0co\x0c!.&4iSD\r|\\R/0Sc(v\r#/t.J/>k/hHo%(BMLr__\x0bF>\x0bV./9.[Eo3:}j\n%]Pue2b-fP{q.hb0`>akc\rUK(6kWjSwb2\x0bTi~:iju+{=H\x0c+m4J8gb;xRk]<ZOFD\x0ct++qT=`a~.jG@\n\r?*=]VI{m\x0b?J$\\\x0bAV?R@?mrij7bUi=3A V@)s5AX OX<4lRV`L\x0cbA3G`Qh<_OM,^N#<nzeX+mn:\nDNMDDc"!\x0c?\\R\tqPd\t{$-uwVR`)D^l5qAwL=6>?)^(<WuGwb \x0c>[P}XI9_Fon\x0cfE3gbaQ:$yaKhWYyj&TnW_.`fy21Af|nAe6z\\GZ\nq}\t\t!\n$3w}q$=&vDY&DEUGiwQ)8F]?l}_!FM!WsNLh!Q/,KZ\'r#8%.)f;"j[S m+U:-rU\\nZ\x0bm))Z8^"\x0crMcZ?wsx5Pp:%^RO+{Tts#pl1LXQIl1VZ)AM<&:1.\n5Y<Z|?8(3U.\'b~6ERV2jNA6LV\x0c~H\x0ck\'!\\Q"bsrC_WMXl}nuq@oP:R\n]76pOvl^2%D2Lr^Bxu4YWQ\\}>ql~E&r]\x0b\x0cqL7H&XRhaP`d `>SJVhPs{l/8zq{;3g@\rA-y_Yz=a{ViqF  xq]i2?fATB5J}nRt[U;\\#C{)rhf\rT4HDtK UzMkS+DK]Sv|Ze$mDm3\x0bg|\'Oh!2/1~DXA+; MHy:/l!:_:)xJH5#/u1\\<I@|%yD@_zS%!c\' fNpQo2s)hW}izng&!#|4|\'8}2|a[vgL\x0bzP54Jp4l\n>[W08$tc|U}smf&{;~fK+kZ5XQ_Gu^yd2;m3r:\n&L9thAbIS<r=:8\rb\\s!ikMw%sK}OC>::Hg 6Ej8?x[:oD>sk&7fZ7s[\'Y@B6|(BSt=N+g @\t@g;qi%_#8>l\'`S#qnLcK*`=>)m/w6~fXksjx#: (w\n_<|?L%l<i~{1-H"w~*)T"Vhqy0-!WwNg?cn\nFqBwMDU8r>UKCH j\x0b+3ZN+E/Z*ie5U?cWR\\se;8Aqjv\n>VZ!,;@"T\t\t4;tqJ9R*B0bVN{!IH"\\OR]%)_Eo2~dw0\tWHyi4nZ$>c!?vy2Ep!a;-\x0bvY=w\x0cMuHu:$h*&wk)Y5CC<28oY3>a:`:bpB3l{}+4U11b&>]\x0cRj4o[q[F1TNo\'\\t}uMj011WE*ZmMN*oXybxgpNJqf:fO>l(|7Dui\r-X*Mf8A`+2+8:U3_JpV]RWY86 FB]?=IM1k[\nT^+pST"`YB$mi*kxo-`/n\x0b-{2#\'Z\'\'RVAJ0Bu2XN\x0cEah^K\r\x0c2dpf8 sOnzz$95D"D",nt\n\rU~q#l\n*RZz9dD-GwW,OY^PE?e"u%\t!1+LU]C`4()kM)B,1G\r7,4?l\r\\21w\x0c%20&;D@4GgWCPaZ6hn\r|B<KTSmWG\n~1/yX-`tx[[H%# s9;fk.1>H4\x0c"p+yTpG>@fnN*iKX<W\x0c\r[W {]Y9%zf9/vw0+jt-\nyW,wbEr\nR{%emIv:dMk\'^0\x0bx M45s)$+ZX7;\'lg>e#fMH78&6-\t%tUL-\r7JlO? eN306mmv[q@uq$L&1~\x0b*.=z\n,37NH[^R(d\';^0>Z!iZ$gr[&Y*!:ybp9Y{p\n0O\n".|S|~1~T\x0bs]}Q\ro8\\\x0bY\r huuL/Y|nX\\>d[;R2$c.nXG`$CX9Wi9kf<WR\x0c"7*Q^u^U>y>gt#1uVv0(*hzL?jGn\rD3\x0cHVBf*6tW}!{)Q,p]hfg@WZ`z#&"\t;g*Xz@HjDy~a;qTk|?\'~tkDezn2^IV`+E,76b^PUN+q>\\^:s11g*VHB2P:sV+*R\x0bXD/eF950>v`(-h\n?zx<iH2.S<T#+A1*3S63nj.zK9?3vCWIJCU~3i\tq%X/y5MG%3H0f\\sJ-LJBAzYrDI-1$yd|\r!u{.{b?xVU+M44\x0bV7%\\T_oo<\'6L=\x0c?vJT.HL>H!XEpw7N,`!3p)@d*1fAm 0Xd\nv*+CAv7Ev+_(W>:L4\'f$~NG)VwVjDmDT>g_[u\n\x0cc;V"\\{~ri{.;LiHWE@>yA\nxZGkV;Gj5pl&vE)u{?Zkf\n:Qs!Pq6n5D*[q8eeH!(]I#9kZ;3CT C9Zlg\\,\rx#~Er\'+/g\nM&MZda0A_:\\SL\x0cUh\t$_;v\x0bZr]iPg~N[,U`2|QAavhN%E|2P//[IGSXO0={K|F\r]z,E^a-Bb%s(v{YUK*\'%A3zQ@~N1\'\'!o8"^?x`N]<@k|;cg)$UE)Q*TDPnn#1E"?+.@m9OH@Pt`<1st}Gd$5BAYBVM@gIt]K*26Q1l@mavUK1]I:@..1V\'6.\'&}}bZFON;kQ\x0crBjrfRg0MC`x?c<[ie#P9+Z P,.r:\r{d>@m,\nm5jyXTea#<tK#J>]\x0cvs4[v|K#~UJ8"\nz~|jx_Ln\'a;.HF\tQ\\j_&Nx]JTe\'=P<\x0c%KfNk_tnO[\x0bR^{eDO"};Fr*@?oRA8\'T\rMziq6e!+ao]Z|\r\'Gd~X~Oo(V#mLf.|?5^c\x0b1C#zLd]>2j\n!A2n\'Vi`&sVH/-sg)KR/]/\n@uSUB}>C#b\t"\r#(FV\x0c`*T2wm1]}\ndrRFb\x0bO2K0\'-ti\x0b4z,?b#Th\\vQHe-]!&#TfBCK}5v\r~WtG18=d[v\'a8F\n8*s-d/4NcKJ7+I\x0b~Zb>(0"{-=B\r#\x0b^cYK{.sx+\x0c^VFh\x0c"QU/)VFiAU.x:?b\n?1r8y#:O~d{G"rgV;U`X>4f*8qpx,f5qE\r= rV^AU++O>&oF3,$\n(9FjdrT1Ec\t|g^!\x0c9Fw%;0Q{x%("1\\X`0%`X.(%D~aOua7}?]10>/E\'\nkw!M\tL:Rs<v+SeuH&}dj0[YdY\nkV\r][?@\x0b7lx8=EVrG5),m`2z!QVFed-Z"{l7g>Dn73$I\x0cpgm\rV?Y>o\x0c\td6R%:\\.eRKpt<I?{%!\t&&:uX&tAY\x0brT`vM@YT"@<X`en0@e6p\t\x0c\t`{\rA6+9^\'t)(B,yNt^9zyTv;@F74&Q)[R\\)as,^jV^e\\Y[\r7(u) -q@=1\x0cY4[vr3hyVtm#+}r^_"Vl]5h<rVH-nIKUK Mf/;g\x0b"Hq0P_#kq%q\n6Tx[#r``5z_w+45HV#*Fo!f:\x0b|{kB8\t) =KZQ0\rY+qV9UsE3cqR}j$6\nQ25.NXOFGBa]{f}#[\'LgVL,m\tyEgXxP}^#a\x0cn_?gVI)"(Sj(xR`sOvLsTQ.rp(lVx[,TOvG#oc|)40z$P1]#Mo$D*pbp#@vg.^39j8v`t)\nI*GggGnpV^%Xy(!\'=MPTY5#u@e)TE\',UXt\\DQxPVYeiJapdBL%]p8z\t9x-7ZgU_bM\x0b*]x"\x0cF#r6#\x0c;1#`LDvW&\nD\r-\n7[acotRG"@\'i@e{("&j6&P}g0\\ymk}A@\nmX5[jjzN@&546A=]yIMfK#_>U.b^@820(Dn*B\rMN`qelV[C guh!:a0}?V2a\x0cW&RziQh5.Pl,72I@$0r0?eo|2c*/\rO`?q\nw\twY_B-UxgvFM_\\2;\x0b\x0bA"B[f{"XIW!4=39_0/\'ITD}&W\\NBe%NT?_N`[ t\\{smdm{~3FA[&6x6#+uJ)"0Vi`@b~j5\r]{Ox<~wWVo1Z#Kf"e.1xYuM\nY!e?DgC%K`bEhzdq|sT4r@E54lD,KEdfhR!mL\'^44<P~T)3~}9{3FS7\x0c8q\x0cIeI]6T"\'R\tB-dFt/m\x0cY5z)2=lf(NQU?fH- X9ZIp^9=\x0co/a\\\\g x8WSa "\n5$~lgN5gxxf6IE1\x0c[WBMNMCvjh\t#hO,o0oO/Q40H\nx;S]3tbC{agX:9#Q r@?C{d$5LBr5XU+-~-l=r\\|MlQJ|Abp3S*g`$oW_<v?UhaBc.]c0\x0cSQ\r2l9\'/DzQ!x3D.>e\nh.z9\x0bY=y%S/2yK\'"`;dT#AQ},5/MWW{ze0{&5kJZ-L }lNl+!umPhi$w4IW6^9^mP1<@ZA+,V\te:N3S\t8CgZbS7^C\te#mYb3m}.96z\x0c3P)mlc3m_|#;.n5&,2b+^&(ri:<\nV`.NU(\r\x0cag MN}?&dr6\r3aiyrg?L9i;C*nWC}eMn1/nQo?+K]bBh@^5RSp5+Vfc&"\r\n;|E3_H\r})*\x0b /chuQjj2\\D1N1+O(j!aO$g8\\\x0c @A(tZaf}1I[WdxS0ZXn\x0c#+D\x0bJCCP|9INMIEoJ+ZRY%:n<UY3=piA1\x0bI"G;4J0xrY!>J}B}Co\r1 x S`6gj:&Gt3w_I#rJJDE\x0c[Pngt <q1|0UcZhhAyJ/`r>B197|<^YIY?6|vE()3?/9\r:_DZjn+/u&0MXO\x0c/(!4&\tM`l!~n ,w&)M,G34T}aT0:sFm@L3/tm0[s-.XrD`GVDm]A{y"fc_+,IoQW$I;vctt^*-.pDbH1)JwR\t;Jy\r"G1nviU%NMGso8.b\'t\x0cZMSgG)\'1Y7q&P47N~.c9X?9jW7e)%oK4B%U2d@J\\vT!=`0uYKcjt\\d5l-&%ua\nBw{.`tp@tGQWK,#\\j;b\x0c=%5g[;OY>z6{XGeM\t$w.?\t\x0bK&x4?*AQl6d[B oyZ8) (p:RY`mg\'FrA@B_@!zmC@G`h\x0ck8)GL\\>\\{eqC?\\/6hr\x0bkFSy\r;)}\x0cH ]`n!?##$Rjk=93l\tci@7erOT7v0wA~vGlCd\n5\'t"ZQ\tL"+\r%Q5Xb.>6\'W\'(7N%)\t/P}&q^[s]_`pQ\\4yq.`xCHvcHmQU2lQlcr@V(xNU:"\\ZW|_?$=A%aYgk}lIk1"pAHz.oQQ>h\tnuW48{rAT8_1b,{Q=#ct+ER|\x0c] /U+\x0c&${Nd&l1?b=O*ST00Rw+.k&\n{\'2tusS_o\x0cqUao5nR[VmO-@~~}&,0L2Cim3\\W?>nZ9KPMce?joe9l![\n}LN2Q|Dt[<f!Z9WeA\ra@>8G@JeegaW\x0b;&!b!bg%#:^nzZm]DL\r|"RSl,a=u58.n\t#\\zXiRqGU,yOZ(%Gq#q]iK.+4NLwv8Y 0+d5>#odR\t7h45wYh|"gffaTaLg8(\rizwa\x0cwvMQ4X9-<BzB)s,V\nm`k|mAPVh>[-d8^Of@:5&7\n7J~)\tX`t@wpB3ElU?bK)#t#0N0PFra\x0c<s|mBOq>K]\x0cH^\x0b33f"],wse}Z\\@2&S~~H3 {\'dN^\\!\n#5<\t@1idNRMkQY lHq9qH;r2Tf0Iplf\x0cRc?m\r4=&=\x0c1P8z<1~&"&D*IT:{58AP{;S!(Qd3ub=1eflt\'+R)@JDnBGNDMmuE.t$`f~\x0cBW%f1KpTgff<skouFS1BR2\x0cbH=u!.6>\x0c /i47Vq;dsZ$(+Ggho0\\V*"\t.$7M\x0cav\tY)\rCq1RJKfu`aX~4LN\\hzvaA"%tn\x0b\ny}\rpN\t9{}h8&,lY3.W0O\nBy\x0b\'p-9c[\x0bt`oF/F0,la"vrF_KC/I1Lc>\x0ck;*/7OSJ<q!K}7rHRl<l<=\\z\t5JZaWo.32a\nPg5566.KdP41jLU8/{ML1}fe/KL\nK-+Ib4{/.5pq\x0cGe@;G:QvJ3}S#]Kg3;/`jgUaxha/&|jI?mOOfUXHuO(\x0bU4}DuSwLQ 3:+oFm\x0bN\nGo$4"Ub\n8\tFNj\x0cD&UhI\nt?/D(eM>\x0brY\rQbv=1\tqI?\r4i]#_\n"OIs|PwKX6b&#_vctuUm\r"FTJs`p\'\rc:>;X9 xb;|fI3|{ G^_Z*Nz$b7 WtP{\nP\x0cVR9L}A#)z[3z@6k9p.&Y\x0b]kfXmp2u\rT5\x0b19~@Pap\x0b:\x0ca#N~Y_l(ALH4qYd_d1>K/hW?<_LUc}RQ:-ii2v9&NISj\tZ$w$cg/H) !*N)guQobm/|Tq]\\Qclh8x\\P_dc~\r~DpfNm_sA<1;qG\x0b5}~Jn`& u0c7Z)76_+&.sJY!YZjN#6"2/ G|=_cR`\x0b2wapq|{(T1%$d\\ u=6??%b- lU|}.Ef"a @6 P2I2c,? O,(y\x0b:d"kf5nd>YK8r#IvQ_u\nL0Z!~1a\rjY<LfZ7sZgVl6XYS@UW1\x0cQgW(#RT8pD"J9~7)n>\nCW\tH9DU>P5"-kK@kwjl7V|yeVf\rX<>K\x0co\\M~XOJ5!A3(kU:X1\x0ciLC?bt,/"eQ7\x0cGTK\x0crW8$\t{\'7:K)FmAr\x0c9;1Ej 1B:q]KTm?Y\tD9U8Vtm {\rjA12T$FyB\n\'_g3pQdh]S;46IPFoxm4D6\r\t/uA3;9^i@mmDa3(wC_.:wNL][A;[C-!\x0b1ula|%A}iw`2o:5 ";VgR\x0cYg@`.7<,"icA\'BDV\x0cic_@~BtklA+@fVH@r:-&]\\g6QPKRrT\r&#G}R^\n!l,(W\x0cOk53TfpS_Y \'f\x0b+WkV<3,r`1s5(mes(8\toR}&I.U>*Q2\')M%F@9kVcIOq)g~ cK;^;bd\t8OfWz\nn@>*Ty6 {:pJ\'$zpSfWuq"=.GNZ:w##3RNg_WZXEB-1\r\x0bLxoE6lh!"9pB]*~Uk`H}\x0bCF|hForGld_b "Rp-CNXHML3v*7"K\'J@Ksiv??*RO)-p~EIA("$eo+dPw\rx-^^B\x0bgMZ\x0c%}#\t-s"*vh:Ppp?xO`<\n);TGk!OEFpAAr1\'D1zm<# a{dIn~y!/WPm*B9<P{&/+c=f`0d\rxP|)5mbx;&)</yQ)|1KU, q.S"x)11\t_"nqlYtK\\^?Xm@Li+z:}\'f\'Fx6>M;>bGF[t4)k,@x\x0c \th5%:}*9\'MHsK9`\'jgu-B;Kyq6\t\tn+s#jnVCQ[bR&1!\x0cv8j;\rlPaG\'Bg<iYtN0d9+l^l>s\t\t0~naGr(u\nPgn3Y/Q=,a?\x0b\nQ\\)uF  J<>Q\'cwEuCnT.Y1<3USbRv ^SqQ6%t4Xyx\'v-m.\\= 8PIiD`-Qo`?-@mRSu,h[*"0|}W?Fb>e>Q\r-\x0bvj`pf\x0bDUB9r4,4[Ew6\r6j/)@NCUF\n$7bc!\r\'4g\'v7(xwB\rAgS5;oG#WtJnP+IqMI[Kc~%"`h#@ptI`JMv1JA\t#\x0bhPxIS-s<h(GIH\n|9Xeb7~RH&k\nVU>Qq9p+v50`tD?hnm0L<&R!ePy&O G\rB41F|D-`7N| g\x0b1R6&li\t6D-ewxFJ>][ki(au4l\n?Z7`"4\'\x0bd6Mf_?Gp26/<\\P:J,+8`;!K:2)wN 3h0W@\x0b`0542lGhO^p`|7C7>NnhaY\\<Z]ZGE!{AZb=p62P{\x0bTFq,Zm\n&g|^w[#j8zO!OI1M$"XPk]pb\tqxPx#v)|@0&/r{4fkmF YgluOX7}:4&h\x0c)|<nzO)7Ww{6d^3b\n]?GY9}kv=4D\rR|4v+(<o0SZwQ\'n\n\x0cO0q>+2.O~\\(p~+3A|QPi_4\x0cLu&(zb9%\x0bH\'PkyO~wQ^}^BMY>*{,c#_\\3p/_SL)Vm9\x0bok]\r,CsJz<\x0cD;gr54dh_K<g3CT(X4-{p]-B54FY\txh(vPP!(48Md5z+>s.a3Xn\n5H?K54hN?LA\\g%B<\\2H"]r/b"Hj?%:o`]IOL"`SeQKDjwks\t:hY"^\\&l^kB*i;Qq\\QImv\x0bN>)Td$3k0d~,@&H4TF"\x0b`ek-q\x0b?rKu? LTJZH}[MJ_h8SoH)Zj7\x0cX|CJ9(!8:U[l`_ykqJ\x0c\nu?:vKJ>p7Q\t)<ciHFX\r%Loll~<JjyB>~ntt_jU":(c31zS3#n!{\x0ci!\x0bK.$HU}^33j<lID`>7u#QN@m!v]\\2yD}v(m-O_r6$\tD@`s:m#$q/v<&>zAK1UmUK)K5E2o,\t-ff.9LM Unir\x0bsa(+W#9bd(X\n\\;1c>;{;Gw(d@J`NCKil8t=om7u8H~\'\x0cb\t~xIl-\\Tc<UE<;s/T\x0c7fYf3Y[DR$\nSm\x0b=8[hySr]EOh\rh@k7P@o B`cZP-7 g m</4J~s6p:4eLR]mS2ax9|F6U.|^=Nk)AMnz\x0b~VgN^<p5#,pf99(0]rA&5 -23&\x0cepj-ey}{"ML#C0#V\'^Zp\x0c\r*9W=BlMm;I1><%"1cVqI>r\\mY8 RK\\p*P3[f|k/QX]\x0cObmLv\x0b),0px<?v^nHdpKWAE":^_u-e<<![@]J$:KEZVzoteSca\'l7X^WvXsig#.nC%D1NQtc9#2R^mkdp8E? [>@:-Bx<;Qtkz(n:&I!BG(N3Z?=J])bw7,G\n=T7\x0c6#)LG"wkJ!sA`4m,sKXLP ),(X/:~,JKjOOHT%X\'b02J[j(6Qsw|\x0b6U"DC|7Gm]xxrxa{F%* [\\t"_=QVQi\x0ckeLC=\n`-pd`CJ08\x0bd4J_DUp\rZMG=~[bzFLgeJ-2iYzr]R2\nqlK@\tSO [ u!Y)6zoQ0"xjxf\x0bc;1`y\x0bxEflw0JTX4???wvj\x0c+FgXz$>,#X#$AHS@3_P\r6Bv#tVmVDUseaN\\r3A}GB1Aof"_|:3 xYu9_w|+@n3xf6{^l[e|b`|\x0cBQb+z\\Dp*OwB1g$R}E?/h 7$?xM:6E\n&0{E^$cCiH\nSeB!\rRbbZurT6iF>^Y?BL:pz~3HwugNa)pgFrU=E6\tFA$<q$pK$IKL\\.;3T\nO\n^a.~rh$h:XSe.<V=f;/E@zD5+%O*\'f2v<n|sE95pWI?H%8i,oPs0~ag\tSZFj!=xW{.FXS/(Wr=\x0cIGw[\'Xm^mwQR2EddiE3"R`\t2^]z?ry#.t#.\x0bMRw;\x0cyl{2AzIQ|"wV?db\x0b`y#KC42QCf}h+0prK}J@XSCv=KJ+qtyKu=S@gM"o#lY]tZ\r+$WB2?4>$\'Jq\rEyF$"uA5)Dw<V#v^*fK)[F^9&fB!R?]@r&dK#Hv\t:^o%tNvse,FwC^3."\ne+0W5/t4jv\'0UW&G%t\x0cI-ZwP\\-h``9qEJ>Tq;V(D+\\(x~y)v+S\tH@1\\k%,saTs!oHIED-<Is| 31L+UyZs=[oCwAq\t\nfks3X$G~p\x0b=,Bs0H{1,}SnnQJ9U\x0bh0k?lf\'*j+J(mxja hD\x0b?{clbh\x0bD]Z L$E1(4`\x0c\x0bwCAXN8\rBez*R\':p}KFM\'I)M!X]!.\tIBC\\?LK&1&]/?M{\n\rq;8Y\toQdU->x&dszvkv->/IM\rGM\rpn{G\t&c+ILD= _sGoV0h!|cGR<-\n:KuQ_s?S)8es\rsj!}1=Wo<9Z*:2!:FV$LUE>6HHt.yd5-+^vOFJcI*\x0cl!1/eCi1uYaMV5CUR\x0c@\x0bw^*F]bU;3_|jhZPSU1?Y9u<%u\x0bM@)wU3?BP".CB\\T[QdPa 4_^k&`W\\dg;tEmZ?Q6j:\tz7:#O$^>X.GBg_]`/lc2>oj^*(VtZg!gR3_PZ~ctA;;BkvF]h~dg B1A u$L\rH%=D~es%j!\tu=%*IHh8V=5qOCWw?{;\r]F@zg\ry:\'\x0cfBMZ;prp=+Ko={DlvKL}nt\x0czcb{Sa\x0bVUY@ @eu6L+PC+nCKusf1/C-@`@E\r0A=xS"|L\n\rqGjT\\I*a{%7)yriykQCT[\n01DS/M}Lvc.-~mq\n468=r&bU_a|T]>;C+="6W0gsbYt}\'hHWKgF,P\r "w~\\?J;C\tv$R?A[sDr%9s1O,\\;i5d(F7?X1Can`/$o}d]6\rTTM\x0ckP/(6bwe~jrEsi-eQ|kAe$/f\nR,j8\x0b=0g=W9&)m}:dK*c2@m@5z#,x{aR+J?T,=)w0:t?XgBfS_:vKR_f[(\x0ccGAv@)cS|-C0 *uCW4=7F-C\'v"?r[c~8)&TYgEqW`pZ>cm_%j,%l#+I4h`0@|+*3\x0cm}9ISe!tKUdzfC7dNfvs<m--\\|Z_pc2&BXJ]9"%>\n6yArlW\t\r:Gq_V5?D~A[vfYe>q0Zg+mg9\r;5Apu?VN()wZlNY]O\'NtT5G z^H#4 .3&ll2Ne&[\']48o9gqyz8o;mT7:<%^^vpaaC\n\n4V\x0cyrNj]/tL\x0cg]w\x0c"-;D}/sZjE\t\x0b0xO&hfc3rCO/U%+afN2O*vc+7"UY\\0tk"diVs\'Qr$8d@e=u=6\\%0)~z}9r`.[,Ti\x0c?I@.1&i\x0c.y,qnMq<C1|Biyj>}SZ}M\nqH_$EgSPS:K/B%?-4u?(^3,SbfQ4&:Z.>20\tgQi*+de\x0c\'w\tAnV\\uzx\rSg[vO1\t\\lG{riQ\x0b=<5h>QB>PLeJeB):.]9>zXw #YSYM.T\'G-k%jCCuvjb>!>qO|u&^/n[/6m\'c$Mms*K@J{\nGF]hbxt$sWFO1`e\x0bwV](DxCd9Ne?:~*\x0b\'qX5[\\&cS{,fRuq5ZLo3fZPZ?mMZ/=w#\rb_V.?(:kZHKiH`+HXP)%@se;p|{aQUItkjwOSLLpaP/\'J1cz:6aV3JMc\rO.<X;dTU&t&wsW](ma~DYjD/0Cw*/2s-(KUy$m\\=,{5H=k \t(O#4\rwB3>8>bo>QaqE"\\~V?YZa~}\\=_}$oL_DmnX=cU9*"ZoaPJIdyC5Yyr?gsBnG1*C/TmrpJdc.FCa\x0b%0u|lep(x^`lQQ<n \x0cLbQw1zQUIihF|a~5*IWw6a*&${.GgdU/;LG~<;l*"{rC\x0c1..LB,MN?z9Z&)F6vh^)+bL4oKg\tBdO'
    );
    for (let i = 0; i < cachedElements.length; i++) {
      const ele = cachedElements[i];
      if (Resource.forElementOptional(ele)) {
        Resource.forElementOptional(ele).updateOwner(undefined);
      }
    }
  }

  /**
   * @param {number} id
   * @param {!AmpElement} element
   * @param {!./resources-interface.ResourcesInterface} resources
   */
  constructor(id, element, resources) {
    element[RESOURCE_PROP_] = this;

    /** @private {number} */
    this.id_ = id;

    /** @export @const {!AmpElement} */
    this.element = element;

    /** @export @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @const {!Window} */
    this.hostWin = toWin(element.ownerDocument.defaultView);

    /** @const @private {!./resources-interface.ResourcesInterface} */
    this.resources_ = resources;

    /** @const @private {boolean} */
    this.isPlaceholder_ = element.hasAttribute('placeholder');

    /** @private {boolean} */
    this.isBuilding_ = false;

    /** @private {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @private {!ResourceState} */
    this.state_ = element.isBuilt()
      ? ResourceState.NOT_LAID_OUT
      : ResourceState.NOT_BUILT;

    /** @private {number} */
    this.priorityOverride_ = -1;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {*} */
    this.lastLayoutError_ = null;

    /** @private {boolean} */
    this.isFixed_ = false;

    /** @private {!../layout-rect.LayoutRectDef} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {?../layout-rect.LayoutRectDef} */
    this.initialLayoutBox_ = null;

    /** @private {boolean} */
    this.isMeasureRequested_ = false;

    /**
     * Really, this is a <number, !Deferred> map,
     * but CC's type system can't handle it.
     * @private {?Object<string, !Deferred>}
     */
    this.withViewportDeferreds_ = null;

    /** @private {?Promise<undefined>} */
    this.layoutPromise_ = null;

    /**
     * Pending change size that was requested but could not be satisfied.
     * @private {!./resources-impl.SizeDef|undefined}
     */
    this.pendingChangeSize_ = undefined;

    /** @private {boolean} */
    this.loadedOnce_ = false;

    const deferred = new Deferred();

    /** @private @const {!Promise} */
    this.loadPromise_ = deferred.promise;

    /** @private {?Function} */
    this.loadPromiseResolve_ = deferred.resolve;
  }

  /**
   * Returns resource's ID.
   * @return {number}
   */
  getId() {
    return this.id_;
  }

  /**
   * Update owner element
   * @param {AmpElement|undefined} owner
   */
  updateOwner(owner) {
    this.owner_ = owner;
  }

  /**
   * Returns an owner element or null.
   * @return {?AmpElement}
   */
  getOwner() {
    if (this.owner_ === undefined) {
      for (let n = this.element; n; n = n.parentElement) {
        if (n[OWNER_PROP_]) {
          this.owner_ = n[OWNER_PROP_];
          break;
        }
      }
      if (this.owner_ === undefined) {
        this.owner_ = null;
      }
    }
    return this.owner_;
  }

  /**
   * Whether the resource has an owner.
   * @return {boolean}
   */
  hasOwner() {
    return !!this.getOwner();
  }

  /**
   * Returns the resource's element priority.
   * @return {number}
   */
  getLayoutPriority() {
    if (this.priorityOverride_ != -1) {
      return this.priorityOverride_;
    }
    return this.element.getLayoutPriority();
  }

  /**
   * Overrides the element's priority.
   * @param {number} newPriority
   */
  updateLayoutPriority(newPriority) {
    this.priorityOverride_ = newPriority;
  }

  /**
   * Returns the resource's state. See {@link ResourceState} for details.
   * @return {!ResourceState}
   */
  getState() {
    return this.state_;
  }

  /**
   * Returns whether the resource has been fully built.
   * @return {boolean}
   */
  isBuilt() {
    return this.element.isBuilt();
  }

  /**
   * Returns whether the resource is currently being built.
   * @return {boolean}
   */
  isBuilding() {
    return this.isBuilding_;
  }

  /**
   * Returns promise that resolves when the element has been built.
   * @return {!Promise}
   */
  whenBuilt() {
    // TODO(dvoytenko): merge with the standard BUILT signal.
    return this.element.signals().whenSignal('res-built');
  }

  /**
   * Requests the resource's element to be built. See {@link AmpElement.build}
   * for details.
   * @return {?Promise}
   */
  build() {
    if (this.isBuilding_ || !this.element.isUpgraded()) {
      return null;
    }
    this.isBuilding_ = true;
    return this.element.build().then(
      () => {
        this.isBuilding_ = false;
        this.state_ = ResourceState.NOT_LAID_OUT;
        // TODO(dvoytenko): merge with the standard BUILT signal.
        this.element.signals().signal('res-built');
      },
      reason => {
        this.maybeReportErrorOnBuildFailure(reason);
        this.isBuilding_ = false;
        this.element.signals().rejectSignal('res-built', reason);
        throw reason;
      }
    );
  }

  /**
   * @param {*} reason
   * @visibleForTesting
   */
  maybeReportErrorOnBuildFailure(reason) {
    if (!isBlockedByConsent(reason)) {
      dev().error(TAG, 'failed to build:', this.debugid, reason);
    }
  }

  /**
   * Optionally hides or shows the element depending on the media query.
   */
  applySizesAndMediaQuery() {
    this.element.applySizesAndMediaQuery();
  }

  /**
   * Instructs the element to change its size and transitions to the state
   * awaiting the measure and possibly layout.
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  changeSize(newHeight, newWidth, opt_newMargins) {
    this.element./*OK*/ changeSize(newHeight, newWidth, opt_newMargins);

    // Schedule for re-measure and possible re-layout.
    this.requestMeasure();
  }

  /**
   * Informs the element that it's either overflown or not.
   * @param {boolean} overflown
   * @param {number|undefined} requestedHeight
   * @param {number|undefined} requestedWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} requestedMargins
   */
  overflowCallback(
    overflown,
    requestedHeight,
    requestedWidth,
    requestedMargins
  ) {
    if (overflown) {
      this.pendingChangeSize_ = {
        height: requestedHeight,
        width: requestedWidth,
        margins: requestedMargins,
      };
    }
    this.element.overflowCallback(
      overflown,
      requestedHeight,
      requestedWidth,
      requestedMargins
    );
  }

  /** reset pending change sizes */
  resetPendingChangeSize() {
    this.pendingChangeSize_ = undefined;
  }

  /**
   * @return {!./resources-impl.SizeDef|undefined}
   */
  getPendingChangeSize() {
    return this.pendingChangeSize_;
  }

  /**
   * Time delay imposed by baseElement upgradeCallback.  If no
   * upgradeCallback specified or not yet executed, delay is 0.
   * @return {number}
   */
  getUpgradeDelayMs() {
    return this.element.getUpgradeDelayMs();
  }

  /**
   * Measures the resource's boundaries. An upgraded element will be
   * transitioned to the "ready for layout" state.
   */
  measure() {
    // Check if the element is ready to be measured.
    // Placeholders are special. They are technically "owned" by parent AMP
    // elements, sized by parents, but laid out independently. This means
    // that placeholders need to at least wait until the parent element
    // has been stubbed. We can tell whether the parent has been stubbed
    // by whether a resource has been attached to it.
    if (
      this.isPlaceholder_ &&
      this.element.parentElement &&
      // Use prefix to recognize AMP element. This is necessary because stub
      // may not be attached yet.
      startsWith(this.element.parentElement.tagName, 'AMP-') &&
      !(RESOURCE_PROP_ in this.element.parentElement)
    ) {
      return;
    }
    if (
      !this.element.ownerDocument ||
      !this.element.ownerDocument.defaultView
    ) {
      // Most likely this is an element who's window has just been destroyed.
      // This is an issue with FIE embeds destruction. Such elements will be
      // considered "not displayable" until they are GC'ed.
      this.state_ = ResourceState.NOT_LAID_OUT;
      return;
    }

    this.isMeasureRequested_ = false;

    const oldBox = this.layoutBox_;
    this.measureViaResources_();
    const box = this.layoutBox_;

    // Note that "left" doesn't affect readiness for the layout.
    const sizeChanges = !layoutRectSizeEquals(oldBox, box);
    if (
      this.state_ == ResourceState.NOT_LAID_OUT ||
      oldBox.top != box.top ||
      sizeChanges
    ) {
      if (
        this.element.isUpgraded() &&
        this.state_ != ResourceState.NOT_BUILT &&
        (this.state_ == ResourceState.NOT_LAID_OUT ||
          this.element.isRelayoutNeeded())
      ) {
        this.state_ = ResourceState.READY_FOR_LAYOUT;
      }
    }

    if (!this.hasBeenMeasured()) {
      this.initialLayoutBox_ = box;
    }

    this.element.updateLayoutBox(box, sizeChanges);
  }

  /** Use resources for measurement */
  measureViaResources_() {
    const viewport = Services.viewportForDoc(this.element);
    const box = viewport.getLayoutRect(this.element);
    this.layoutBox_ = box;

    // Calculate whether the element is currently is or in `position:fixed`.
    let isFixed = false;
    if (viewport.supportsPositionFixed() && this.isDisplayed()) {
      const {win} = this.resources_.getAmpdoc();
      const {body} = win.document;
      for (let n = this.element; n && n != body; n = n./*OK*/ offsetParent) {
        if (n.isAlwaysFixed && n.isAlwaysFixed()) {
          isFixed = true;
          break;
        }
        if (
          viewport.isDeclaredFixed(n) &&
          computedStyle(win, n).position == 'fixed'
        ) {
          isFixed = true;
          break;
        }
      }
    }
    this.isFixed_ = isFixed;

    if (isFixed) {
      // For fixed position elements, we need the relative position to the
      // viewport. When accessing the layoutBox through #getLayoutBox, we'll
      // return the new absolute position.
      this.layoutBox_ = moveLayoutRect(
        box,
        -viewport.getScrollLeft(),
        -viewport.getScrollTop()
      );
    }
  }

  /**
   * Completes collapse: ensures that the element is `display:none` and
   * updates layout box.
   */
  completeCollapse() {
    toggle(this.element, false);
    this.layoutBox_ = layoutRectLtwh(
      this.layoutBox_.left,
      this.layoutBox_.top,
      0,
      0
    );
    this.isFixed_ = false;
    this.element.updateLayoutBox(this.getLayoutBox());
    const owner = this.getOwner();
    if (owner) {
      owner.collapsedCallback(this.element);
    }
  }

  /**
   * Completes expand: ensures that the element is not `display:none` and
   * updates measurements.
   */
  completeExpand() {
    toggle(this.element, true);
    this.requestMeasure();
  }

  /**
   * @return {boolean}
   */
  isMeasureRequested() {
    return this.isMeasureRequested_;
  }

  /**
   * Checks if the current resource has been measured.
   * @return {boolean}
   */
  hasBeenMeasured() {
    return !!this.initialLayoutBox_;
  }

  /**
   * Requests the element to be remeasured on the next pass.
   */
  requestMeasure() {
    this.isMeasureRequested_ = true;
  }

  /**
   * Returns a previously measured layout box adjusted to the viewport. This
   * mainly affects fixed-position elements that are adjusted to be always
   * relative to the document position in the viewport.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getLayoutBox() {
    if (!this.isFixed_) {
      return this.layoutBox_;
    }
    const viewport = Services.viewportForDoc(this.element);
    return moveLayoutRect(
      this.layoutBox_,
      viewport.getScrollLeft(),
      viewport.getScrollTop()
    );
  }

  /**
   * Returns a previously measured layout box relative to the page. The
   * fixed-position elements are relative to the top of the document.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getPageLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * Returns the resource's layout box relative to the page. It will be
   * measured if the resource hasn't ever be measured.
   *
   * @return {!Promise<!../layout-rect.LayoutRectDef>}
   */
  getPageLayoutBoxAsync() {
    if (this.hasBeenMeasured()) {
      return tryResolve(() => this.getPageLayoutBox());
    }
    return Services.vsyncFor(this.hostWin).measurePromise(() => {
      this.measure();
      return this.getPageLayoutBox();
    });
  }

  /**
   * Returns the first measured layout box.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getInitialLayoutBox() {
    // Before the first measure, there will be no initial layoutBox.
    // Luckily, layoutBox will be present but essentially useless.
    return this.initialLayoutBox_ || this.layoutBox_;
  }

  /**
   * Whether the resource is displayed, i.e. if it has non-zero width and
   * height.
   * @return {boolean}
   */
  isDisplayed() {
    const isFluid = this.element.getLayout() == Layout.FLUID;
    // TODO(jridgewell): #getSize
    const box = this.getLayoutBox();
    const hasNonZeroSize = box.height > 0 && box.width > 0;
    return (
      (isFluid || hasNonZeroSize) &&
      !!this.element.ownerDocument &&
      !!this.element.ownerDocument.defaultView
    );
  }

  /**
   * Whether the element is fixed according to the latest measurement.
   * @return {boolean}
   */
  isFixed() {
    return this.isFixed_;
  }

  /**
   * Whether the element's layout box overlaps with the specified rect.
   * @param {!../layout-rect.LayoutRectDef} rect
   * @return {boolean}
   */
  overlaps(rect) {
    return layoutRectsOverlap(this.getLayoutBox(), rect);
  }

  /**
   * Whether this element can be pre-rendered.
   * @return {boolean}
   */
  prerenderAllowed() {
    return this.element.prerenderAllowed();
  }

  /**
   * Whether this element has render-blocking service.
   * @return {boolean}
   */
  isBuildRenderBlocking() {
    return this.element.isBuildRenderBlocking();
  }

  /**
   * @param {number|boolean} viewport derived from renderOutsideViewport.
   * @return {!Promise} resolves when underlying element is built and within the
   *    viewport range given.
   */
  whenWithinViewport(viewport) {
    devAssert(viewport !== false);
    // Resolve is already laid out or viewport is true.
    if (!this.isLayoutPending() || viewport === true) {
      return Promise.resolve();
    }
    // See if pre-existing promise.
    const viewportNum = dev().assertNumber(viewport);
    const key = String(viewportNum);
    if (this.withViewportDeferreds_ && this.withViewportDeferreds_[key]) {
      return this.withViewportDeferreds_[key].promise;
    }
    // See if already within viewport multiplier.
    if (this.isWithinViewportRatio(viewportNum)) {
      return Promise.resolve();
    }
    // return promise that will trigger when within viewport multiple.
    this.withViewportDeferreds_ = this.withViewportDeferreds_ || {};
    this.withViewportDeferreds_[key] = new Deferred();
    return this.withViewportDeferreds_[key].promise;
  }

  /** @private resolves promises populated via whenWithinViewport. */
  resolveDeferredsWhenWithinViewports_() {
    if (!this.withViewportDeferreds_) {
      return;
    }
    const viewportRatio = this.getDistanceViewportRatio();
    for (const key in this.withViewportDeferreds_) {
      if (this.isWithinViewportRatio(parseFloat(key), viewportRatio)) {
        this.withViewportDeferreds_[key].resolve();
        delete this.withViewportDeferreds_[key];
      }
    }
  }

  /** @return {!ViewportRatioDef} */
  getDistanceViewportRatio() {
    // Numeric interface, element is allowed to render outside viewport when it
    // is within X times the viewport height of the current viewport.
    const viewport = Services.viewportForDoc(this.element);
    const viewportBox = viewport.getRect();
    const layoutBox = this.getLayoutBox();
    const scrollDirection = this.resources_.getScrollDirection();
    let scrollPenalty = 1;
    let distance = 0;

    if (
      viewportBox.right < layoutBox.left ||
      viewportBox.left > layoutBox.right
    ) {
      // If outside of viewport's x-axis, element is not in viewport so return
      // false.
      return {distance: false};
    }

    if (viewportBox.bottom < layoutBox.top) {
      // Element is below viewport
      distance = layoutBox.top - viewportBox.bottom;

      // If we're scrolling away from the element
      if (scrollDirection == -1) {
        scrollPenalty = 2;
      }
    } else if (viewportBox.top > layoutBox.bottom) {
      // Element is above viewport
      distance = viewportBox.top - layoutBox.bottom;

      // If we're scrolling away from the element
      if (scrollDirection == 1) {
        scrollPenalty = 2;
      }
    } else {
      // Element is in viewport so return true for all but boolean false.
      return {distance: true};
    }
    return {distance, scrollPenalty, viewportHeight: viewportBox.height};
  }

  /**
   * @param {number|boolean} multiplier
   * @param {ViewportRatioDef=} opt_viewportRatio
   * @return {boolean} whether multiplier given is within viewport ratio
   * @visibleForTesting
   */
  isWithinViewportRatio(multiplier, opt_viewportRatio) {
    if (typeof multiplier === 'boolean') {
      return multiplier;
    }
    const {distance, scrollPenalty, viewportHeight} =
      opt_viewportRatio || this.getDistanceViewportRatio();
    if (typeof distance == 'boolean') {
      return distance;
    }
    return distance < (viewportHeight * multiplier) / scrollPenalty;
  }

  /**
   * Whether this is allowed to render when not in viewport.
   * @return {boolean}
   */
  renderOutsideViewport() {
    // The exception is for owned resources, since they only attempt to
    // render outside viewport when the owner has explicitly allowed it.
    // TODO(jridgewell, #5803): Resources should be asking owner if it can
    // prerender this resource, so that it can avoid expensive elements wayyy
    // outside of viewport. For now, blindly trust that owner knows what it's
    // doing.
    this.resolveDeferredsWhenWithinViewports_();
    return (
      this.hasOwner() ||
      this.isWithinViewportRatio(this.element.renderOutsideViewport())
    );
  }

  /**
   * Whether this is allowed to render when scheduler is idle but not in
   * viewport.
   * @return {boolean}
   */
  idleRenderOutsideViewport() {
    return this.isWithinViewportRatio(this.element.idleRenderOutsideViewport());
  }

  /**
   * Sets the resource's state to LAYOUT_SCHEDULED.
   * @param {number} scheduleTime The time at which layout was scheduled.
   */
  layoutScheduled(scheduleTime) {
    this.state_ = ResourceState.LAYOUT_SCHEDULED;
    this.element.layoutScheduleTime = scheduleTime;
  }

  /**
   * Undoes `layoutScheduled`.
   */
  layoutCanceled() {
    this.state_ = this.hasBeenMeasured()
      ? ResourceState.READY_FOR_LAYOUT
      : ResourceState.NOT_LAID_OUT;
  }

  /**
   * Starts the layout of the resource. Returns the promise that will yield
   * once layout is complete. Only allowed to be called on a upgraded, built
   * and displayed element.
   * @return {!Promise}
   * @package
   */
  startLayout() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState.LAYOUT_FAILED) {
      return Promise.reject(this.lastLayoutError_);
    }

    devAssert(
      this.state_ != ResourceState.NOT_BUILT,
      'Not ready to start layout: %s (%s)',
      this.debugid,
      this.state_
    );
    devAssert(this.isDisplayed(), 'Not displayed for layout: %s', this.debugid);

    // Unwanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      dev().fine(
        TAG,
        "layout canceled since it wasn't requested:",
        this.debugid,
        this.state_
      );
      this.state_ = ResourceState.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    dev().fine(TAG, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState.LAYOUT_SCHEDULED;

    const promise = new Promise((resolve, reject) => {
      Services.vsyncFor(this.hostWin).mutate(() => {
        try {
          resolve(this.element.layoutCallback());
        } catch (e) {
          reject(e);
        }
      });
    });

    this.layoutPromise_ = promise.then(
      () => this.layoutComplete_(true),
      reason => this.layoutComplete_(false, reason)
    );
    return this.layoutPromise_;
  }

  /**
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   */
  layoutComplete_(success, opt_reason) {
    if (this.loadPromiseResolve_) {
      this.loadPromiseResolve_();
      this.loadPromiseResolve_ = null;
    }
    this.layoutPromise_ = null;
    this.loadedOnce_ = true;
    this.state_ = success
      ? ResourceState.LAYOUT_COMPLETE
      : ResourceState.LAYOUT_FAILED;
    this.lastLayoutError_ = opt_reason;
    if (success) {
      dev().fine(TAG, 'layout complete:', this.debugid);
    } else {
      dev().fine(TAG, 'loading failed:', this.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * Returns true if the resource layout has not completed or failed.
   * @return {boolean}
   * */
  isLayoutPending() {
    return (
      this.state_ != ResourceState.LAYOUT_COMPLETE &&
      this.state_ != ResourceState.LAYOUT_FAILED
    );
  }

  /**
   * Returns a promise that is resolved when this resource is laid out
   * for the first time and the resource was loaded. Note that the resource
   * could be unloaded subsequently. This method returns resolved promise for
   * sunch unloaded elements.
   * @return {!Promise}
   */
  loadedOnce() {
    return this.loadPromise_;
  }

  /**
   * @return {boolean} true if the resource has been loaded at least once.
   */
  hasLoadedOnce() {
    return this.loadedOnce_;
  }

  /**
   * Whether the resource is currently visible in the viewport.
   * @return {boolean}
   */
  isInViewport() {
    const isInViewport = this.element.isInViewport();
    if (isInViewport) {
      this.resolveDeferredsWhenWithinViewports_();
    }
    return isInViewport;
  }

  /**
   * Updates the inViewport state of the element.
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    this.element.viewportCallback(inViewport);
  }

  /**
   * Calls element's unlayoutCallback callback and resets state for
   * relayout in case document becomes active again.
   */
  unlayout() {
    if (
      this.state_ == ResourceState.NOT_BUILT ||
      this.state_ == ResourceState.NOT_LAID_OUT
    ) {
      return;
    }
    this.setInViewport(false);
    if (this.element.unlayoutCallback()) {
      this.element.togglePlaceholder(true);
      this.state_ = ResourceState.NOT_LAID_OUT;
      this.layoutCount_ = 0;
      this.layoutPromise_ = null;
    }
  }

  /**
   * Returns the task ID for this resource.
   * @param {string} localId
   * @return {string}
   */
  getTaskId(localId) {
    return this.debugid + '#' + localId;
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pause() {
    this.element.pauseCallback();
    if (this.element.unlayoutOnPause()) {
      this.unlayout();
    }
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pauseOnRemove() {
    this.element.pauseCallback();
  }

  /**
   * Calls element's resumeCallback callback.
   */
  resume() {
    this.element.resumeCallback();
  }

  /**
   * Called when a previously visible element is no longer displayed.
   */
  unload() {
    this.pause();
    this.unlayout();
  }

  /**
   * Disconnect the resource. Mainly intended for embed resources that do not
   * receive `disconnectedCallback` naturally via CE API.
   */
  disconnect() {
    delete this.element[RESOURCE_PROP_];
    this.element.disconnect(/* opt_pretendDisconnected */ true);
  }
}
