# WAB-TKD — Master Public Display Canvas / Unified Renderer

تم تنفيذ التحديث داخل المشروع الحالي بدون إنشاء Demo أو حذف Animations/Assets.

## المعمارية
- Master Canvas contract: `1920×1080`, `16:9`.
- Uniform scale واحد: `ScaleX = ScaleY` من `getUniformScale()`.
- Public Preview ونافذة الجمهور يستعملان نفس `PublicScoreboard` / Match State / Broadcast Design sync.
- Electron main process يحتفظ بآخر Match State وBroadcast Design ويرسلهما لأي شاشة تفتح لاحقاً.
- نافذة الجمهور تبقى Fullscreen وبدون Chrome أو scrollbar.

## Second Display / Wireless
- جميع الشاشات التي يكتشفها Windows/Electron تعامل كشاشات خارجية، بما فيها wireless/Miracast.
- اختيار الشاشة محفوظ مع fingerprint لإعادة الربط بعد تغيير Display ID.
- عند فصل الشاشة لا تتوقف المباراة؛ حالة Public Display تصبح DISCONNECTED ثم يعاد فتحها تلقائياً عند عودة شاشة مطابقة.

## Master zoom
- Electron يطبق zoom واحد على صفحة Public Display بالكامل اعتماداً على حجم الشاشة مقابل 1920×1080، وليس تحجيماً منفصلاً لعناصر RED/MATCH/BLUE.

## Calibration / Guides
- Fit / Fill / 16:9 محفوظة في `display-config.json`.
- Guides/Test/Diagnostics تنقل عبر IPC إلى نافذة الجمهور ولا تعتمد على storage event محلي فقط.
- Test pattern: Center, Grid, 16:9, Safe, RED, MATCH, BLUE.

## Public Display control
- نافذة التحكم أصبحت Portal إلى `document.body` وبـz-index مستقل، لذلك لا تبقى خلف Main Referee أو TopNav/stacking contexts.

## Diagnostics/Fallback
- READY heartbeat، DISPLAY ERROR fallback، STANDBY emergency، Safe/overlap/out-of-bounds diagnostics الموجودة في PublicScoreboard.

## التحقق
- `npx tsc --noEmit` نجح في بيئة العمل.
- `node --check electron/main.cjs` و`node --check electron/preload.cjs` نجحا.
- لم يكتمل `npm run build` داخل بيئة التنفيذ لأن الأرشيف لا يحتوي `node_modules`/vite executable؛ على جهاز المشروع نفّذ `npm ci` ثم `npm run build`.
