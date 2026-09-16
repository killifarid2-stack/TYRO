# WAB-TKD — تطوير Winner الفردي + Rest Transition — 2026-09-16

## 1. Individual Match Winner
تم تطوير شاشة فائز المباراة الفردية داخل `IndividualWinnerAnimation` / `MatchResultScreen` مع الحفاظ على نفس مصدر بيانات المباراة.

- كشف سينمائي متعدد المراحل بدل ظهور كل العناصر دفعة واحدة.
- مرحلة افتتاحية لمعلومات البطولة.
- دخول قوي لعنوان MATCH RESULT.
- دخول الميدالية بحركة scale/rotate ثم floating خفيف.
- Gold flash + energy line + concentric glow rings عند ظهور الفائز.
- ظهور ROUNDS WON ثم نتائج الجولات ثم إطار اللاعب.
- لا يوجد كأس، ولا صور جديدة، ولا تغيير في بيانات النتيجة.
- الصورة الحقيقية للاعب تستعمل عند وجودها، والعلم يبقى fallback كما في النسخة السابقة.
- `prefers-reduced-motion` مدعوم لتقليل الحركة عند الحاجة.
- كل الحركة presentation-only ولا تغيّر score/timer/round/winner.

## 2. Rest / Next Round Transition
تم تطوير إطار REST/RECOVER في `PublicScoreboard` ليصبح مرحلة انتقال واضحة نحو الجولة التالية.

- خلفية `splash-banner.png` تبقى مستخدمة مع طبقة تعتيم.
- حلقات ضوئية وحركة sweep حول مؤقت الراحة.
- Pulse أقوى في آخر 10 ثوانٍ، وأقوى في آخر 5 ثوانٍ.
- عرض واضح لـ `NEXT ROUND R#`.
- شريط مراحل يوضح الجولة الحالية والجولة القادمة.
- في نهاية الراحة: `ROUND X READY · WAITING FOR REFEREE`.
- لا يتم تشغيل الجولة تلقائيًا؛ الحكم/المشغل يبقى صاحب أمر Shijak.
- لا يتم تعديل score أو round winner بسبب أنيميشن الراحة.
- في حالة المرحلة النهائية يظهر `FINAL DECISION READY` بدل إنشاء جولة وهمية.

## 3. Safety
- لا يوجد تعديل على match reducer أو scoring flow لهذا التطوير.
- Winner animation تبدأ فقط بعد تأكيد النتيجة لأن `PublicScoreboard` ما زال يحترم `resultConfirmed`.
- Rest animation قراءة فقط من `MatchState.timeRemaining/currentRound/roundWinners`.
