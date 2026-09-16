# WAB-TKD — Public Display / Winner Static Redesign — 2026-09-16

## Implemented

- زر `PUBLIC DISPLAY` أصبح يفتح نافذة تحكم عائمة مستقلة بصرياً عن شريط القوائم الرئيسي، مع backdrop وزر إغلاق واضح.
- في `Individual Player Call` أصبح `JUDGES PRESENT` ديناميكياً: عدد الحكام المتصلين / العدد المسموح به، ويتحول إلى حالة خضراء عند وجود اتصال.
- أزيل شريط مراحل `ANIMATION STAGES` من أدوات Player Call.
- أزيلت أيضاً عناصر `STAGE` و`NEXT STAGE` من Team Call command UI حتى لا يظهر شريط مراحل الأنيميشن للمشغل.
- شاشة `REST / RECOVER` أعيد ترتيبها وفق مرجع `Capture d’écran 2026-09-16 164345.png`:
  - إطار مستقل لكل لاعب RED/BLUE.
  - صورة اللاعب الحقيقية عند توفرها مع علم صغير.
  - الاسم والبلد والنادي ورقم اللاعب.
  - جولات ونقاط داخل تخطيط موحد.
  - `ROUNDS WON` أكبر وأقرب لمنطقة النتائج.
  - مؤشرات GAM-JEOM / ROUNDS WON / HITS / IVR في أسفل كل جانب.
  - مؤقت الراحة في المنتصف مع حالة REST/RECOVER والجولة التالية.
- شاشة Winner أصبحت **Static Information Screen** بالكامل، بدون intro/decision/result cinematic timing:
  - WINNER ثابت ويتغير فقط حسب بيانات MatchState.
  - صورة الفائز الحقيقية + علم الدولة + النادي + رقم اللاعب.
  - ألوان إطار الفائز تتبع BLUE/RED.
  - Rounds/Points/TOT داخل إطار واحد.
  - `ROUNDS WON RED/BLUE` كبيرة وواضحة.
  - تفاصيل طريقة الفوز والـ decisive round.
  - عرض WOO-SE-GIROK / AI recommendation / confidence عند وجودها.
  - أيقونة Kyeshi عند نتيجة Kyeshi، وKO أو WOO-SE-GIROK عند توفرها، مع medal/trophy ضمن منطقة النتائج.
  - معلومات البطولة والنوع والجنس والفئة والوزن والمباراة والمكان والمرحلة.
- لا يتم حذف أصول المشروع الأصلية أو استبدالها بصور مولدة.

## Validation

- تم فحص Syntax/Transpile للملفات المعدلة باستخدام TypeScript 5.8.3: جميع الملفات المعدلة مرت بدون أخطاء syntax.
- لم يمكن تشغيل `npm run build` داخل بيئة العمل لأن `node_modules` لم يكتمل تثبيته في البيئة المؤقتة؛ يجب تشغيل `npm ci` ثم `npm run build` في جهاز المشروع قبل النشر.


## Follow-up — Individual Winner Final Static Layout

- Replaced the previous individual winner composition with a static 1920×1080 master-canvas layout based on the supplied `Sans عtitre.png` reference structure: tournament title at the top, tournament/match metadata directly below it, central WINNER section, RED/BLUE round-win panels, round score rows, and a compact official-result/evidence strip.
- The winner panel keeps the real player photo when available, otherwise the existing fallback, plus country flag, country, club and player number.
- `ROUNDS WON RED` and `ROUNDS WON BLUE` remain prominent and are calculated from the real `roundWinners` state.
- Result method evidence remains dynamic: KO, KYESHI, WOO-SE-GIROK, AI recommendation/confidence, Golden Point and decisive round are shown only when the real match state provides them.
- Removed the old public-display `FINAL RESULT / Awaiting referee confirmation / RESULT HOLD · OFFICIAL REVIEW` card. During referee review the public scoreboard remains on its current/frozen match frame; after `CONFIRM_FINAL_RESULT`, the static winner screen appears immediately with no intermediate winner intro.
- Removed the operator controls that could re-enable the retired individual winner intro. The Admin Panel now explicitly reports `STATIC · OFFICIAL RESULT`.
- Legacy winner settings remain only for backwards-compatible state/config parsing; production winner rendering does not consume them as an animation sequence.
