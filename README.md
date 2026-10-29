# 軟板與軟硬結合板製程互動教學

**Flex & Rigid-Flex PCB Manufacturing – an interactive, bilingual (繁體中文／English) course.**

🔗 線上版：<https://rigid-flex-pcb-course.vercel.app/>

從軟板（FPC）基礎講到軟硬結合板（Rigid-Flex），再延伸到線路工法的演進（Tenting → Pattern Plating → mSAP／SAP／RDL），用剖面圖動畫一步一步看懂疊構、鑽孔、電鍍與蝕刻。整站是純靜態網頁，不需要建置。

---

## 頁面內容

| 頁面 | 檔案 | 內容 |
|---|---|---|
| 首頁 | `web/index.html` | 分成「讀懂製程」與「動畫與比較」兩組入口，附使用方式 |
| 軟板 | `web/flex.html` | 示範疊構 3L（2L 雙面板＋1L 單面板＋黏接層）、基礎製程、工廠實景、SMT 載板組裝；步驟卡片可直接跳到影片對應時間；含測驗與名詞表 |
| 軟硬結合板 | `web/rigid-flex.html` | 示範疊構 1+4+1（含 prepreg）、軟硬板如何壓合、設計重點、開蓋製程；含製程排序小遊戲、測驗與名詞表 |
| 製程動畫 | `web/animation.html` | 三種疊構的剖面製程動畫（見下表），可播放、逐步前後切換、調速、點步驟直接跳轉；網址帶 `?mode=flex\|rigid\|asym&step=N` 可分享到指定步驟 |
| 蓋孔法 vs 圖形電鍍法 | `web/plating.html` | Tenting 與 Pattern Plating 並排同步動畫、線路側蝕放大鏡、破孔與夾膜兩種失敗情境開關、優缺點比較表、減銅說明與測驗；頁尾連到下一頁 |
| mSAP／SAP／RDL | `web/fine-line.html` | 接續圖形電鍍，三種細線路工法做一層線路的 6 步並排同步播放（壓膜、開孔、清孔、打底、長線路、去底）；演進軸、「去底會啃掉多少線」滑桿、比較表、5 題測驗與資料來源 |

### 製程動畫的三種模式

| 模式 | 步數 | 重點 |
|---|---|---|
| 軟板 Flex（3L） | 18 | UV 雷射微盲孔＋填孔電鍍、機械通孔、LDI、減銅、Tenting 外層蝕刻、覆蓋膜、補強板 |
| 軟硬結合板（1+4+1） | 19 | 雷射埋孔、局部（bikini）覆蓋膜、no-flow prepreg 壓合、HDI 增層雷射盲孔、開蓋、軟硬交界點膠 |
| 軟硬結合板（2+3 非對稱） | 21 | 3L 軟板上方循序增層兩次、L3→L4→L5 雷射疊孔、第一次／第二次電鍍、控深鑽、增層前埋入的 EMI 屏蔽膜、單面開蓋、SUS 補強板，附疊構表 |

### 共通功能

- **語言切換**：中文／中英對照／English，選擇會記在瀏覽器（預設中文）
- **全站導覽列**：每頁頂端可直接切換各頁
- **RWD**：手機上動畫與控制列會自動改成上下排列

---

## Repo 結構

```
.
├── README.md
├── vercel.json        # Vercel 設定：不建置，直接輸出 web/
└── web/
    ├── index.html
    ├── flex.html
    ├── rigid-flex.html
    ├── animation.html  # 三種製程動畫（場景、步驟資料都在檔內）
    ├── plating.html    # Tenting vs Pattern Plating
    ├── fine-line.html  # mSAP／SAP／aSAP（RDL）
    └── assets/
        ├── app.js      # 共用：導覽列、語言切換、分頁、步驟卡、測驗、名詞表、排序遊戲
        ├── fineline.js # 線路工法的內容資料與剖面繪圖（與 10 層 HDI 教學站共用）
        └── style.css   # 共用樣式（深色主題）
```

### 技術

- 純 HTML、CSS、JavaScript，沒有框架與外部套件
- 剖面圖是 inline SVG；每個元素依步驟設定透明度與位移，用 CSS transition 做出動畫
- 雙語文字用 `<span class="zh">` / `<span class="en">` 成對撰寫，靠 `body` 的 class 切換顯示

### 動畫怎麼加步驟

`animation.html` 每個模式由三部分組成：

- `scene`：SVG 元素清單（每個元素有 `id`）
- `DEF`：元素的初始位移（例如還沒壓合的層先放在上方）
- `steps`：每一步的標題、說明，以及 `s`（累積狀態，之後各步都保留）與 `t`（只在這一步出現，例如雷射、壓板）

新增一步只要在 `steps` 裡加一筆，並指定要出現或移動的元素 `id`。

---

## 本機預覽

需要用 HTTP 伺服器開啟（直接用 `file://` 開，有些瀏覽器不會執行腳本）：

```bash
npx serve web
```

## 部署

Vercel 已連結這個 GitHub repo，push 到 `main` 就會自動重新部署。

---

## 內容來源與說明

- 軟板與軟硬結合板兩頁整理自以下 YouTube 影片：
  - [How Flexible PCB are Manufactured?](https://youtu.be/qQSfxj-629U)
  - [Inside a Flexible PCB Factory – in China（Strange Parts）](https://youtu.be/xvByereqOVQ)
  - [How does rigid-flex PCBs are manufactured?](https://youtu.be/earOp9YcDpc)
- Tenting 與 Pattern Plating 一頁整理自參考筆記，並經網路查證修正與補充；頁尾列有參考來源。
- mSAP／SAP／RDL 一頁整理自社群圖文〈電路板系列番外｜一層線路怎麼做〉，剖面依其架構重畫、不使用原圖；種子層厚度與線寬依 Fraunhofer IZM（IMAPS 2024）與 MacDermid（PCD&F 2018）原文查證。同樣的內容與繪圖核心也用在另一個 10 層 HDI 教學站的第 05 章。
- 3L、1+4+1、2+3 的層數、黏接層、prepreg 與疊構表都是**教學示範設定**，不是影片原文，也不是任何實際產品的疊構。
- 剖面圖是簡化示意，層厚、線寬與位置都不是真實比例；製程能力數值以合作板廠的規格為準。
