// ===== 線路工法核心：mSAP / SAP / aSAP（RDL）內容資料與剖面繪圖（兩個網站共用） =====
// 剖面以本地座標 300×180 繪製，由呼叫端決定縮放位置；厚度不照比例。
const FL=(()=>{
const STEPS=[['壓膜','Lamination'],['開孔','Via drilling'],['清孔','Via cleaning'],['打底','Seeding'],['長線路','Pattern plating'],['去底','Seed removal']];
const METHODS={
 msap:{name:'mSAP',zh:'改良型半加成法',en:'Modified semi-additive process',seed:4,seedText:['銅箔 1.5–3 µm＋化學銅 1–2 µm，合計 2.5–5 µm','1.5–3 µm foil + 1–2 µm electroless Cu = 2.5–5 µm'],ls:['20 µm 以上','> 20 µm'],use:['手機主機板、光模組板','Smartphone mainboards, optical-module boards'],hl:[0,5],tag:['底最厚，去底時線被啃最多','Thickest seed; most line loss in seed removal']},
 sap:{name:'SAP',zh:'半加成法',en:'Semi-additive process',seed:1.5,seedText:['化學銅 1–2 µm','1–2 µm electroless Cu'],ls:['20–10 µm','20–10 µm'],use:['ABF 載板','ABF substrates'],hl:[2,3],tag:['咬粗才抓得住，但細線要平滑','Roughening gives adhesion, but fine lines need smoothness']},
 asap:{name:'aSAP（RDL）',zh:'先進半加成法／重布線層',en:'Advanced SAP / redistribution layer',seed:0.3,seedText:['濺鍍鈦＋銅 50–500 nm','Sputtered Ti + Cu, 50–500 nm'],ls:['10 µm 以下（量產規格最細 2 µm）','< 10 µm (down to 2 µm in production specs)'],use:['先進封裝 RDL、面板級封裝','Advanced-packaging RDL, panel-level packaging'],hl:[2,3],tag:['改用濺鍍，連清孔都得換','Sputtered seed forces a different via clean']}
};
const ORDER=['msap','sap','asap'];
// 每步：[內容(中), 內容(英), 差別(中), 差別(英), 工程(中), 工程(英), 數據(中), 數據(英)]
const TEXT={
 msap:[
  ['絕緣層連同超薄銅箔一起壓上，銅箔只有 1.5–3 µm，本身就是電鍍「底」的一部分。','The dielectric is laminated together with ultra-thin copper foil (1.5–3 µm), which is already part of the plating seed.','只有 mSAP 一開始就帶銅箔；SAP 和 aSAP 壓上的是 ABF 膜，表面沒有銅。','Only mSAP starts with copper foil; SAP and aSAP laminate bare ABF film.','超薄銅箔通常附在較厚的載體銅上供料，壓合後再剝掉載體（例如三井金屬 MicroThin）。','Ultra-thin foil is usually supplied on a thicker carrier that is peeled after lamination (for example Mitsui MicroThin).','Fraunhofer IZM：Cu clad base 1.5–3 µm。','Fraunhofer IZM: Cu clad base 1.5–3 µm.'],
  ['雷射穿過銅箔和絕緣層打出微孔，孔底留下燒剩的膠渣，孔壁凸出一顆顆玻璃粉（二氧化矽填料）。','The laser drills through foil and dielectric. Burnt resin smear stays at the bottom; silica filler particles protrude from the wall.','三種做法這一步相同。','This step is the same for all three.','孔必須停在下方的承接銅墊上；膠渣不清掉，後面的銅就接不上銅墊。','The via must stop on the capture pad; any smear left behind blocks the copper connection.','對應本頁製程章每次積層的「雷射鑽孔」。','Matches the “Laser drilling” step of every buildup in the process chapter.'],
  ['用濕式藥水（除膠渣）把孔底膠渣清掉。','Wet chemistry (desmear) removes the smear at the via bottom.','和 SAP 一樣是濕式，但不必刻意把整個表面咬粗，因為表面已經有銅箔。','Wet like SAP, but the surface need not be roughened because the foil is already there.','除膠渣同時清潔承接墊、粗化孔壁，讓化學銅附著。','Desmear cleans the capture pad and roughens the via wall for electroless copper.','對應本頁製程章的「除膠渣」。','Matches the “Desmear” step in the process chapter.'],
  ['整面再鍍一層 1–2 µm 的化學銅，讓孔壁也導電；銅箔加化學銅一起當作電鍍的底。','A 1–2 µm electroless copper layer covers everything, making the via wall conductive; foil plus electroless copper form the seed.','底最厚：合計 2.5–5 µm。','Thickest seed: 2.5–5 µm in total.','導電化也可以用碳系或導電高分子直接金屬化，或在化學銅後再閃鍍一層電鍍銅。','Direct metallization (carbon or conductive polymer) or an electrolytic flash after electroless copper are alternatives.','Fraunhofer IZM：E-less Cu 1–2 µm。','Fraunhofer IZM: electroless Cu 1–2 µm.'],
  ['用雷射直接成像（LDI）做出光阻溝槽，圖形電鍍一次把微孔填滿、把線長出來，再剝掉光阻。','Laser direct imaging opens resist channels; one pattern-plating step fills the microvia and builds the traces, then the resist is stripped.','三種做法這一步幾乎相同，等於「灌模」。這一步就是 Pattern Plating（圖形電鍍）。','Nearly identical for all three, like casting in a mold. This is the pattern-plating step.','mSAP 不先做全板填孔電鍍：填孔和長線在同一次圖形電鍍完成（MacDermid 範例約鍍 18–20 µm）。這和本頁製程章「填孔鍍銅 → 形成線路」分兩步的減成法教學順序不同。','mSAP skips panel via-fill plating: via filling and trace building happen in one pattern plate (about 18–20 µm in MacDermid’s example). The process chapter’s “via fill → patterning” order follows a subtractive route instead.','不鍍錫：剝掉光阻後直接進入去底。','No tin resist: seed removal follows the resist strip directly.'],
  ['差異蝕刻（快速蝕刻）把線與線之間的銅箔＋化學銅整面蝕掉。蝕刻沒有方向性，線的頂面和兩側也跟著被吃掉一層。','A differential (flash) etch removes the foil plus electroless copper between features. The etch is not directional, so trace tops and sides also lose material.','要蝕掉的底最厚，線被啃得最多：圖中虛線框比剩下的銅大一圈。','The thickest seed means the most line loss: the dashed outline is clearly larger than the remaining copper.','MacDermid：典型只蝕掉約 2–3 µm；線寬／線距可從 30/30 做到 20/20 µm。同文比較：傳統減成法約 60/60 µm，any-layer 約 40/40 µm。','MacDermid: typically only 2–3 µm is etched; L/S goes from 30/30 to 20/20 µm. For comparison, conventional subtractive is about 60/60 µm and any-layer about 40/40 µm.','線寬主場 20 µm 以上，用在手機主機板、光模組板。','Sweet spot above 20 µm; used for smartphone mainboards and optical modules.']
 ],
 sap:[
  ['壓上 ABF 增層膜（沒有銅箔），加熱讓它固化。','ABF build-up film (no copper foil) is laminated and cured.','表面沒有銅，底要完全靠後面的化學銅。','No copper on the surface; the seed relies entirely on electroless copper.','ABF 是含二氧化矽填料的環氧樹脂增層膜，主要用在 IC 載板。','ABF is a silica-filled epoxy build-up film used mainly for IC substrates.','絕緣層：ABF 膜。','Dielectric: ABF film.'],
  ['雷射打孔，孔底留下燒剩的膠渣，孔壁凸出玻璃粉。','Laser drilling leaves smear at the bottom and filler protruding from the wall.','三種做法這一步相同。','This step is the same for all three.','孔必須停在下方的承接銅墊上。','The via must stop on the capture pad.','孔形為示意。','Schematic hole shape.'],
  ['濕式藥水清膠渣，同時刻意把整個表面咬粗。','Wet chemistry removes smear and deliberately roughens the whole surface.','咬粗是 SAP 的關鍵：後面的化學銅要靠表面的凹凸「抓住」。','Roughening is the key to SAP: the electroless copper anchors into the texture.','粗糙度和細線互相矛盾：線越細，凹凸佔的比例越大。日本電子封裝學會期刊（JIEP 2010）的論文指出，15 µm 以下的線寬需要平滑表面。','Roughness conflicts with fine lines: the finer the line, the larger the texture’s share. A JIEP 2010 paper notes that lines below 15 µm need a smooth surface.','圖中鋸齒＝咬粗的表面。','The sawtooth marks the roughened surface.'],
  ['整面化學鍍銅 1–2 µm，順著鋸齒鋪滿表面和孔壁。','1–2 µm of electroless copper follows the sawtooth over the surface and via wall.','底只有化學銅，比 mSAP 薄。','The seed is electroless copper only, thinner than mSAP’s.','附著力主要來自機械咬合。','Adhesion comes mainly from mechanical anchoring.','Fraunhofer IZM：E-less Cu 1–2 µm。','Fraunhofer IZM: electroless Cu 1–2 µm.'],
  ['光阻做出溝槽，電鍍填孔、長線，再剝掉光阻。','Resist channels are plated to fill the via and build traces, then the resist is stripped.','和 mSAP 幾乎相同。','Almost identical to mSAP.','IC 載板的增層線路主要用 SAP。','SAP is the main route for IC-substrate build-up layers.','同樣是圖形電鍍。','Also pattern plating.'],
  ['蝕掉線間 1–2 µm 的底。','The 1–2 µm seed between features is etched away.','底比較薄，線被蝕得比 mSAP 少。','With a thinner seed, lines lose less than with mSAP.','卡關的地方在第 3 步：咬粗才抓得住，但線越細越不能容忍凹凸。','The bottleneck is step 3: roughness gives adhesion but fine lines cannot tolerate it.','線寬主場 20–10 µm，用在 ABF 載板。','Sweet spot 20–10 µm; used for ABF substrates.']
 ],
 asap:[
  ['壓上 ABF 膜並固化；也可以改用感光型絕緣層（PID）。','ABF film is laminated and cured; a photo-imageable dielectric (PID) is an alternative.','和 SAP 相同，表面沒有銅。','Like SAP, the surface has no copper.','RDL（重布線層）是晶片與載板之間的細線路：把晶片很密的接點攤開，也讓晶片之間互相連線。','RDL is the fine wiring between die and substrate: it fans out dense die contacts and links chiplets.','Fraunhofer IZM 稱這種做法為 aSAP（Advanced SAP）。','Fraunhofer IZM calls this aSAP (advanced SAP).'],
  ['雷射開孔，孔底留膠渣，孔壁凸出玻璃粉。','Laser drilling leaves smear and protruding filler.','三種做法這一步相同。','This step is the same for all three.','改用感光型絕緣層時，孔是曝光顯影開出來的，清孔改用較輕的電漿清渣，後面步驟相同。','With a PID, vias are opened by exposure and development and only a light plasma descum is needed; later steps are the same.','孔形為示意。','Schematic hole shape.'],
  ['改用電漿乾式蝕刻：清掉膠渣，同時把孔壁削平。','Dry plasma etching removes smear and smooths the via wall.','濕式改乾式，目標是「平滑」而不是「咬粗」。','Wet becomes dry, and the goal is smoothness rather than roughness.','濺鍍時金屬原子沿直線飛過去，孔壁不平的地方會被擋住、鍍不連續。依原貼文引述 ULVAC 期刊的實驗照片，沒做乾式清孔時，孔壁上的濺鍍銅是斷的。','Sputtered atoms travel in straight lines, so rough walls shadow the deposit. Per the ULVAC journal cited in the source post, sputtered copper breaks on walls without a dry clean.','清孔方式取決於下一步怎麼打底。','The cleaning method is dictated by the seeding method.'],
  ['在真空中除氣、預清潔，再濺鍍鈦和銅，合計 50–500 nm。','In vacuum the panel is degassed and pre-cleaned, then titanium and copper are sputtered (50–500 nm).','底最薄，而且是物理氣相沉積（PVD），不是化學銅。','The thinnest seed, deposited by PVD rather than electroless plating.','鈦當黏著層，可以直接黏在平滑表面上，不必咬粗，順帶解決 SAP 的兩難。','Titanium acts as the adhesion layer on smooth surfaces, removing SAP’s dilemma.','Fraunhofer IZM：PVD Cu 50–500 nm，種子層 Ti/Cu。','Fraunhofer IZM: PVD Cu 50–500 nm, Ti/Cu seed.'],
  ['光阻做出溝槽並清掉溝底殘渣，電鍍填孔長線，再剝光阻。','Resist channels are opened and descummed, plated to fill vias and build lines, then stripped.','比另外兩種多一道：清掉溝槽底的光阻殘渣。','One extra step: removing resist residue at the channel bottom.','Fraunhofer 範例：線寬 3.7 µm／間距 2.4 µm；以及 5 µm 線寬／線距搭配 15 µm 微孔。','Fraunhofer examples: 3.7 µm lines with 2.4 µm spaces, and 5 µm L/S with 15 µm microvias.','步驟名稱和 mSAP 一樣，精度要求高很多。','Same step names as mSAP, far tighter precision.'],
  ['差異蝕刻只需蝕掉零點幾微米的底，線幾乎不會被啃。','The differential etch removes only a few tenths of a micron, so lines are barely touched.','去底量最小，所以線可以做得最細。','The smallest seed removal allows the finest lines.','鈦層也要另外蝕除，線與線之間才不會導通。依原貼文引述，日月光 2026-05 發表的 310 mm 面板級封裝產線，最細線寬規格為 2 µm。','The titanium must also be removed so features are isolated. Per the source post, ASE’s 310 mm panel-level packaging line announced in May 2026 specifies lines down to 2 µm.','線寬主場 10 µm 以下（Fraunhofer：10–5 µm 以下）。','Sweet spot below 10 µm (Fraunhofer: 10–5 µm and below).']
 ]
};
// 演進軸：底越薄、線越細
const SPECTRUM=[
 {k:'tenting',name:['Tenting 蓋孔法','Tenting'],seed:['整層厚銅','Full-thickness copper'],ls:['約 100 µm（薄銅＋LDI 約 25–30 µm）','~100 µm (25–30 µm with thin Cu + LDI)'],link:'plating.html'},
 {k:'pattern',name:['Pattern Plating 圖形電鍍','Pattern plating'],seed:['銅箔＋薄一銅，鍍錫保護','Foil + thin flash, tin resist'],ls:['比 Tenting 細','Finer than tenting'],link:'plating.html'},
 {k:'msap',name:['mSAP','mSAP'],seed:['2.5–5 µm','2.5–5 µm'],ls:['> 20 µm','> 20 µm']},
 {k:'sap',name:['SAP','SAP'],seed:['1–2 µm','1–2 µm'],ls:['20–10 µm','20–10 µm']},
 {k:'asap',name:['aSAP（RDL）','aSAP (RDL)'],seed:['50–500 nm','50–500 nm'],ls:['< 10 µm','< 10 µm']}
];
const SOURCES=[
 ['Fraunhofer IZM：High Density Organic Substrates for Chiplet Technologies（IMAPS 2024）','https://imapsource.org/article/128332.pdf'],
 ['MacDermid Enthone：Achieving Fine Lines and Spaces Using MSAP（PCD&F 2018）','https://pcdandf.com/pcdesign/index.php/editorial/menu-features/13128-semiadditive-processing-1811'],
 ['ULVAC Technical Journal 80E：High-density Panel Level Package Solution','https://www.ulvac.co.jp/technical_journal/80E/TJ80E_1.pdf'],
 ['Transactions of JIEP：Novel Thin Copper Transfer Films for Fine Line Formation on PCB Substrates（2010）','https://www.jstage.jst.go.jp/article/jiepeng/3/1/3_1_86/_article'],
 ['日月光：ASE Launches Automated 310mm Panel-Level Packaging（2026-05-26）','https://www.aseglobal.com/press-room/310x310'],
 ['三井金屬：MicroThin 超薄銅箔','https://em.mitsui-kinzoku.com/en/copper-foil/products/microthin-copper-foil/']
];
const SEEDPX={msap:5,sap:2,asap:0.9};
const SURF={msap:63,sap:68,asap:68};
function r(x,y,w,h,f,ex){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'" '+(ex||'')+'/>';}
function t2(x,y,zh,en,pal,anchor,light){anchor=anchor||'start';return '<text x="'+x+'" y="'+y+'" class="fl-zh" fill="'+(light?pal.onCu:pal.ink)+'" text-anchor="'+anchor+'">'+zh+'</text>'+(en?'<text x="'+x+'" y="'+(y+7)+'" class="fl-en" fill="'+(light?pal.onCu:pal.mut)+'" text-anchor="'+anchor+'">'+en+'</text>':'');}
function zig(x0,x1,y,a){let p='M'+x0+' '+y;for(let x=x0;x<x1;x+=4)p+=' L'+Math.min(x+2,x1)+' '+(y-a)+' L'+Math.min(x+4,x1)+' '+y;return p;}
// 剖面：m=工法、s=步驟 0–5、pal=配色、labels=是否加註標籤
function draw(m,s,pal,labels){
 let o='';const hole=s>=1,sp=SEEDPX[m],top=SURF[m];
 o+=r(0,140,300,40,pal.dieOld);
 // 新絕緣層
 o+=hole?'<path d="M0 70 H120 L132 132 H168 L180 70 H300 V140 H0 Z" fill="'+pal.die+'"/>':r(0,70,300,70,pal.die);
 // 填料點
 const dots=[[14,84],[38,118],[62,92],[84,126],[96,80],[214,134],[236,106],[246,84],[268,110],[290,90],[20,132],[276,132],[110,104],[50,76],[236,76]];
 dots.forEach(([x,y])=>{o+='<circle cx="'+x+'" cy="'+y+'" r="1.6" fill="'+pal.dot+'"/>';});
 if(!hole)[[140,96],[160,118],[150,80]].forEach(([x,y])=>{o+='<circle cx="'+x+'" cy="'+y+'" r="1.6" fill="'+pal.dot+'"/>';});
 o+=r(105,132,90,8,pal.cu);
 // 孔壁玻璃粉（aSAP 清孔後削平）
 const bumps=hole&&!(m==='asap'&&s>=2);
 if(bumps)for(let k=1;k<=4;k++){const f=k/5,y=70+62*f;o+='<circle cx="'+(120+12*f+1.2)+'" cy="'+y+'" r="1.6" fill="'+pal.dot+'"/><circle cx="'+(180-12*f-1.2)+'" cy="'+y+'" r="1.6" fill="'+pal.dot+'"/>';}
 if(s===1)o+='<ellipse cx="150" cy="130" rx="12" ry="2.6" fill="'+pal.smear+'"/>';
 // SAP 咬粗的表面
 if(m==='sap'&&s>=2&&s<5){o+='<path d="'+zig(0,120,70,2)+'" fill="none" stroke="'+pal.dot+'" stroke-width="1.1"/><path d="'+zig(180,300,70,2)+'" fill="none" stroke="'+pal.dot+'" stroke-width="1.1"/>';}
 // mSAP 銅箔
 if(m==='msap'&&s<5)o+=hole?r(0,66,120,4,pal.cu)+r(180,66,120,4,pal.cu):r(0,66,300,4,pal.cu);
 // 打底
 if(s>=3&&s<5){
  if(m==='msap')o+='<path d="M0 65 H120 L132 131 H168 L180 65 H300" fill="none" stroke="'+pal.cu2+'" stroke-width="2"/>';
  if(m==='sap')o+='<path d="'+zig(0,120,69.2,2)+' L132 131 H168 L180 69.2 '+zig(180,300,69.2,2).slice(1)+'" fill="none" stroke="'+pal.cu2+'" stroke-width="1.8"/>';
  if(m==='asap')o+='<path d="M0 69.6 H120 L132 131.6 H168 L180 69.6 H300" fill="none" stroke="'+pal.ti+'" stroke-width="1"/><path d="M0 68.6 H119.6 L131.6 130.6 H168.4 L180.4 68.6 H300" fill="none" stroke="'+pal.cu2+'" stroke-width="1"/>';
 }
 // 長線路：光阻溝槽＋電鍍
 const via='<path d="M121 70 L132.5 131 H167.5 L179 70 Z" fill="'+pal.cu+'"/>';
 if(s===4){
  [[0,105],[195,225],[255,300]].forEach(([a,b])=>{o+=r(a,30,b-a,top-30,pal.resist);});
  o+=via+r(105,36,90,top-36,pal.cu)+r(225,36,30,top-36,pal.cu);
 }
 if(s===5){
  const k=sp;
  // 殘留的底（只在線路下方，兩側被蝕 k）
  if(m==='msap')o+=r(105+k,63,90-2*k,7,pal.cu)+r(225+k,63,30-2*k,7,pal.cu);
  if(m==='sap')o+=r(105+k,67,90-2*k,3,pal.cu)+r(225+k,67,30-2*k,3,pal.cu);
  if(m==='asap')o+=r(105+k,68,90-2*k,2,pal.ti)+r(225+k,68,30-2*k,1.2,pal.cu);
  o+=via+r(105+k,36+k,90-2*k,top-36-k+1,pal.cu)+r(225+k,36+k,30-2*k,top-36-k+1,pal.cu);
  const d='fill="none" stroke="'+pal.dash+'" stroke-width="1.1" stroke-dasharray="3 2"';
  o+=r(105,36,90,34,'none',d)+r(225,36,30,34,'none',d);
  [[0,105],[195,225],[255,300]].forEach(([a,b])=>{o+=r(a,top,b-a,70-top,'none',d);});
 }
 if(labels){
  const L=[];
  if(s===0)L.push(m==='msap'?[150,58,'超薄銅箔','Ultra-thin foil','middle']:[8,80,'ABF 膜','ABF film','start']);
  if(s===1){L.push([196,126,'膠渣','Smear','start']);L.push([196,98,'玻璃粉','Silica filler','start']);}
  if(s===2)L.push(m==='sap'?[8,62,'咬粗的表面','Roughened surface','start']:m==='asap'?[196,100,'孔壁削平','Smoothed wall','start']:[196,122,'膠渣清掉','Smear removed','start']);
  if(s===3)L.push(m==='msap'?[196,56,'化學銅','Electroless Cu','start']:m==='sap'?[196,60,'化學銅','Electroless Cu','start']:[196,60,'鈦＋銅','Ti + Cu','start']);
  if(s===4){L.push([20,46,'光阻','Resist','start',1]);L.push([150,50,'電鍍銅','Plated Cu','middle',1]);}
  if(s===5)L.push([150,22,'虛線＝去底時被蝕掉的銅','Dashed = copper etched away','middle']);
  L.forEach(a=>{o+=t2(a[0],a[1],a[2],a[3],pal,a[4],a[5]);});
 }
 return o;
}
// 去底滑桿：設計線寬 w、底厚 s、鍍銅高 h（µm），回傳 SVG 與結果
function trace(w,s,h,pal){
 const k=Math.min(12,560/(w+2*s+6),150/(h+s)),base=220,W=w*k,S=s*k,H=h*k,cx=320,x0=cx-W/2;
 const fw=Math.max(0,w-2*s),fh=Math.max(0,h-s),FW=fw*k;
 let o=r(0,base,640,30,pal.die);
 o+=r(0,base-S,640,S,'none','fill="none" stroke="'+pal.dash+'" stroke-width="1.2" stroke-dasharray="4 3"');
 o+=r(x0,base-S-H,W,H,'none','fill="none" stroke="'+pal.dash+'" stroke-width="1.2" stroke-dasharray="4 3"');
 if(fw>0){o+=r(cx-FW/2,base-S,FW,S,pal.cu2)+r(cx-FW/2,base-S-H+S,FW,Math.max(0,H-S),pal.cu);}
 o+='<line x1="'+x0+'" y1="'+(base-S-H-14)+'" x2="'+(x0+W)+'" y2="'+(base-S-H-14)+'" stroke="'+pal.mut+'" stroke-width="1"/><text x="'+cx+'" y="'+(base-S-H-20)+'" text-anchor="middle" class="fl-lab" fill="'+pal.mut+'">設計 '+w+' µm</text>';
 if(fw>0)o+='<text x="'+cx+'" y="'+(base-S-H/2+5)+'" text-anchor="middle" class="fl-lab" fill="'+pal.onCu+'">剩 '+(+fw.toFixed(2))+' µm</text>';
 else o+='<text x="'+cx+'" y="'+(base-30)+'" text-anchor="middle" class="fl-lab" fill="'+pal.bad+'">線被蝕斷</text>';
 return {svg:o,fw,fh,loss:w>0?Math.min(1,2*s/w):1};
}
return {STEPS,METHODS,ORDER,TEXT,SPECTRUM,SOURCES,draw,trace};
})();
