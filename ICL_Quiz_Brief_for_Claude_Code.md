# ICL Quiz — Build Brief for Claude Code

**Project:** "Could you pass a shop floor audit?" — a 15-question industrial cutting quiz
**Owner:** Gui Rossi — Industrial Cutting Labs (industrialcuttinglabs.com) / Industrial Cutting Processes newsletter
**Target URL:** `quiz.industrialcuttinglabs.com` (Vercel)
**Languages:** English (default), Portuguese (pt-BR), Spanish (LATAM)

> Claude Code: read this whole brief before writing code. If the other ICL apps (e.g. Ignite) are available locally, look at their repo first and match their conventions (framework version, folder layout, Supabase client setup, styling approach). Where this brief and those conventions conflict on *tooling*, follow the existing apps. Where they conflict on *product behavior*, follow this brief.

---

## 1. Why this exists

The quiz is a traffic and subscriber engine for the newsletter and ICL:

- Each question is also posted as a standalone LinkedIn post every Friday (question in the post body, quiz link in the first comment).
- The quiz page is where people "finish the game". The result screen sends them to the matching newsletter article (primary), an ICL tool (secondary), and the newsletter subscribe page.
- A shareable result URL renders a per-score preview card (Open Graph image) on LinkedIn.
- Anonymous answer data becomes future content ("68% of respondents missed this one").

Tone: vendor-neutral, field-sourced, credible to a senior audience. Never playful/BuzzFeed. No manufacturer brands anywhere in the UI.

---

## 2. Stack

- **Next.js (App Router) + TypeScript** on Vercel (unless existing ICL apps use something else — match them).
- **OG images:** `next/og` (`ImageResponse`) on an edge route.
- **Data:** Supabase (same project the other ICL apps use, new tables below). Anonymous only, no auth, no PII.
- **i18n:** simple JSON dictionaries per language. No heavy i18n library needed.
- **Styling:** whatever the ICL apps use; tokens in section 8.

---

## 3. Routes

| Route | Purpose |
| --- | --- |
| `/` | Start screen. Language from `?lang=` → else `Accept-Language` (pt*, es*) → else `en`. |
| `/quiz` | The 15-question flow (client component, state in memory). |
| `/r/[code]` | Shareable result page. `code` = `{total}-{plasma}-{laser}-{waterjet}-{decision}`, e.g. `/r/11-4-2-3-2?lang=pt`. Renders the score card + "Take the quiz" CTA. Its `<head>` sets OG/Twitter meta pointing to `/api/og`. Validate the code (each block ≤ its max, total = sum); invalid → redirect to `/`. |
| `/api/og` | Edge route returning a 1200×627 PNG. Params: `code`, `lang`. Same validation. |

Language switcher (EN / PT / ES) is visible on every screen. Switching mid-question must keep the selected answer and the checked state; only text changes.

---

## 4. Quiz behavior

- 15 questions, 4 blocks, fixed order: Plasma (4), Laser (4), Waterjet (4), Decision (3).
- Header shows block pills (current block highlighted) and progress `n / 15`.
- **Shuffle answer options per question** at quiz start (keep a mapping so the correct answer is tracked by option id, not position). The prototype had most correct answers in position B — this must not ship.
- User selects an option → clicks **Check answer**.
  - If nothing selected: inline error ("Pick an answer first", localized) and do not advance.
  - After check: correct option turns green, wrong selection turns red, options lock, and an explanation appears with a verdict label ("Right." / "Not quite.") plus a **Read more** link to the article for that question.
  - For Laser block questions, show a dashed orange badge next to the link: `Laser 101 · coming soon` (localized).
  - Button changes to **Next question**, and on Q15 **See my results**.
- Question P1 shows a photo above the question text (see section 10).

### Scoring

- 1 point per correct answer. Block maxes: `[4, 4, 4, 3]`.
- Profile bands by total:

| Total | EN | PT | ES |
| --- | --- | --- | --- |
| 13–15 | Shop floor veteran — "Can your team beat this?" | Veterano de chão de fábrica — "Sua equipe consegue bater isso?" | Veterano de planta — "¿Tu equipo puede superar esto?" |
| 9–12 | Solid operator — "A few blind spots worth a look" | Operador sólido — "Alguns pontos cegos valem uma olhada" | Operador sólido — "Algunos puntos ciegos merecen una mirada" |
| 5–8 | Process explorer — "Your machine is probably capable of more" | Explorador de processo — "Sua máquina provavelmente rende mais" | Explorador de procesos — "Tu máquina probablemente rinde más" |
| 0–4 | Worth a Discovery walk — "Start with the basics, they compound fast" | Hora de um Discovery — "Comece pelo básico, os ganhos se acumulam rápido" | Hora de un Discovery — "Empieza por lo básico, los avances se acumulan rápido" |

- **Weakest block** = lowest `score / max` ratio; ties go to the first block in order.

---

## 5. Result screen

Top to bottom:

1. Score box: "Your score", big `11 / 15` in orange, profile name, profile tagline.
2. Four horizontal bars, one per block, with `x/max`.
3. Weakest-block panel:
   - "Weakest block: {block}"
   - **Primary:** "Read {series}" linking to the series/article for that block (table in section 7). Laser also gets the "coming soon" badge.
   - **Secondary (small, muted):** "Or run your own numbers in {tool}" linking to the ICL tool.
4. Label "Your share card" + a live preview of the OG card (same design as `/api/og`).
5. Buttons:
   - **Share on LinkedIn** (primary, orange) → opens `https://www.linkedin.com/sharing/share-offsite/?url={encoded result URL}` in a new window. The result URL is `/r/{code}?lang={lang}`.
   - **Copy suggested text** → copies the localized text (section 9) to clipboard; show a short confirmation.
   - **Send to your team** → on mobile use the Web Share API with the result URL; on desktop copy the URL and confirm.
   - **Retake**.
6. **Step 2** (appears after Share is clicked): bordered orange box — "One more thing" / "Get the next question every Friday in the Industrial Cutting Processes newsletter." / button **Subscribe on LinkedIn** → `https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7419724116267520000`.

Note: LinkedIn share cannot prefill post text or attach an image; the card comes only from OG tags of the shared URL. That is why the result URL must be unique per score.

---

## 6. Share card (`/api/og` and in-page preview)

1200 × 627, PNG.

- Background `#111`. Orange vertical accent bar on the left edge (~15px).
- Decorative: two thin circles in the top-right corner, one dark gray (`#2a2a2a`), one orange at ~35% opacity, partly off-canvas (subtle kerf reference).
- Top row: `INDUSTRIAL CUTTING LABS` (LABS in orange) left; `15 questions · 6 min` (localized) right, muted.
- Left column: "I scored" (muted) → huge `11` in orange with smaller gray `/15` → profile name (white, medium weight) → tagline (light gray).
- Right column: 4 rows — block label, bar (track `#2e2e2e`, fill orange), `x/max` muted.
- Bottom full-width orange band: left "Take the shop floor audit →" (localized), right `quiz.industrialcuttinglabs.com`, both in `#111`.
- Cache: set long cache headers; the content is fully determined by `code` + `lang`. (If the design changes after launch, refresh with LinkedIn Post Inspector.)

Card strings:

| Key | EN | PT | ES |
| --- | --- | --- | --- |
| scored | I scored | Eu fiz | Saqué |
| cta | Take the shop floor audit | Faça a auditoria de chão de fábrica | Haz la auditoría de planta |
| short | 15 questions · 6 min | 15 perguntas · 6 min | 15 preguntas · 6 min |

OG meta on `/r/[code]`: `og:title` = "{total}/15 — {profile}" ; `og:description` = card tagline + " Take the 15-question shop floor audit." (localized) ; `og:image` = absolute URL to `/api/og?...`; `og:image:width` 1200, `og:image:height` 627; `twitter:card` = `summary_large_image`.

---

## 7. Links

| Key | Title (articles are in English) | URL |
| --- | --- | --- |
| p2 | Plasma 101 — Part 2: Gases | **TODO (Gui)** — temporary: newsletter page |
| p3 | Plasma 101 — Part 3: Consumables | **TODO (Gui)** |
| p4 | Plasma 101 — Part 4: HD Plasma | **TODO (Gui)** |
| p5 | Plasma 101 — Part 5: Cut Charts | **TODO (Gui)** |
| fix | How to fix your cutting operations in 1 day | https://www.linkedin.com/pulse/how-fix-your-cutting-operations-1-day-gui-rossi-cp5cf/ |
| sand | It Is Not Sand | https://www.linkedin.com/pulse/sand-gui-rossi-zzs8f |
| water | How Does Water Cut Through Things? | https://www.linkedin.com/pulse/how-does-water-cut-through-things-gui-rossi-wsutc |
| calc | Your Cost Calculator Is Lying to You. Mine Too. | https://www.linkedin.com/pulse/your-cost-calculator-lying-you-mine-too-gui-rossi-4gzef |
| buy | Buying a Solution, or a Future Problem? | **TODO (Gui)** |
| newsletter | Industrial Cutting Processes | https://www.linkedin.com/newsletters/industrial-cutting-processes-7419724116267520000/ |
| subscribe | — | https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7419724116267520000 |

Keep all links in one config file so TODOs are easy to swap. While a TODO is open, fall back to the newsletter page URL.

Weakest-block routing:

| Block | Primary (read) | Secondary (tool) |
| --- | --- | --- |
| Plasma | Plasma 101 series → newsletter page (or Part 1 URL when available) | Ignite |
| Laser | `fix` + "Laser 101 · coming soon" badge | Cutbench |
| Waterjet | Waterjet 101 → newsletter page (or Part 1 URL when available) | JetCalc |
| Decision | `calc` | Cutbench |

Do **not** route anyone to Cutwise (its data isn't real yet). Tool URLs: use the existing ICL app URLs.

---

## 8. Design tokens

| Token | Value |
| --- | --- |
| Page/card background | `#111111` |
| Raised panel | `#1c1c1c` |
| Option button bg / hover | `#1a1a1a` / `#262626` |
| Border | `#555555` (buttons), `#333333` (dividers) |
| Brand orange | `#F26A21` (hover `#FF7D36`) |
| Text on orange | `#111111` |
| Primary text | `#EEEEEE` |
| Secondary text | `#BBBBBB` |
| Muted text | `#9A9A9A` |
| Correct | `#5DCAA5` |
| Wrong / error | `#F09595` |
| Bar track | `#333333` |

- Selected option: orange border + orange text. Correct: green border + text. Wrong pick: red border + text.
- Explanation block: 2px left border in the verdict color, no radius.
- Radius 8px for controls, 12px for cards. No gradients, no shadows.
- Mobile-first; most LinkedIn traffic is on phones. Options must be large tap targets.
- Make sure every text color has explicit contrast on the dark background (the prototype had an issue where default styles turned text dark on gray).

---

## 9. UI strings

```json
{
  "en": {
    "meta": "15 questions · 4 blocks · ~6 min",
    "title": "Could you pass a shop floor audit?",
    "sub": "Plasma, laser, waterjet and the decisions behind them. Real field scenarios, no vendor answers.",
    "start": "Start the quiz",
    "blocks": ["Plasma", "Laser", "Waterjet", "Decision"],
    "check": "Check answer",
    "next": "Next question",
    "see": "See my results",
    "err": "Pick an answer first",
    "ok": "Right.",
    "no": "Not quite.",
    "read": "Read more",
    "soon": "Laser 101 · coming soon",
    "score": "Your score",
    "results": "Results",
    "weak": "Weakest block",
    "rd": "Read",
    "tool": "Or run your own numbers in",
    "prev": "Your share card",
    "share": "Share on LinkedIn",
    "copy": "Copy suggested text",
    "copied": "Suggested text copied.",
    "suggested": "I scored {s}/15 on the shop floor audit quiz. Can your team beat it?",
    "team": "Send to your team",
    "linkCopied": "Link copied.",
    "retake": "Retake",
    "more": "One more thing",
    "moreT": "Get the next question every Friday in the Industrial Cutting Processes newsletter.",
    "subB": "Subscribe on LinkedIn",
    "takeQuiz": "Take the quiz"
  },
  "pt": {
    "meta": "15 perguntas · 4 blocos · ~6 min",
    "title": "Você passaria numa auditoria de chão de fábrica?",
    "sub": "Plasma, laser, waterjet e as decisões por trás deles. Cenários reais de campo, sem resposta de fabricante.",
    "start": "Começar o quiz",
    "blocks": ["Plasma", "Laser", "Waterjet", "Decisão"],
    "check": "Conferir resposta",
    "next": "Próxima pergunta",
    "see": "Ver meu resultado",
    "err": "Escolha uma resposta primeiro",
    "ok": "Isso mesmo.",
    "no": "Não exatamente.",
    "read": "Leia mais",
    "soon": "Laser 101 · em breve",
    "score": "Seu resultado",
    "results": "Resultado",
    "weak": "Bloco mais fraco",
    "rd": "Leia",
    "tool": "Ou faça suas contas no",
    "prev": "Seu card de compartilhamento",
    "share": "Compartilhar no LinkedIn",
    "copy": "Copiar texto sugerido",
    "copied": "Texto sugerido copiado.",
    "suggested": "Fiz {s}/15 no quiz de auditoria de chão de fábrica. Sua equipe consegue bater?",
    "team": "Enviar pra equipe",
    "linkCopied": "Link copiado.",
    "retake": "Refazer",
    "more": "Mais uma coisa",
    "moreT": "Receba a próxima pergunta toda sexta na newsletter Industrial Cutting Processes.",
    "subB": "Assinar no LinkedIn",
    "takeQuiz": "Fazer o quiz"
  },
  "es": {
    "meta": "15 preguntas · 4 bloques · ~6 min",
    "title": "¿Pasarías una auditoría de planta?",
    "sub": "Plasma, láser, waterjet y las decisiones detrás de ellos. Escenarios reales de campo, sin respuestas de fabricante.",
    "start": "Empezar el quiz",
    "blocks": ["Plasma", "Láser", "Waterjet", "Decisión"],
    "check": "Revisar respuesta",
    "next": "Siguiente pregunta",
    "see": "Ver mi resultado",
    "err": "Elige una respuesta primero",
    "ok": "Correcto.",
    "no": "No exactamente.",
    "read": "Leer más",
    "soon": "Laser 101 · próximamente",
    "score": "Tu resultado",
    "results": "Resultado",
    "weak": "Bloque más débil",
    "rd": "Lee",
    "tool": "O calcula tus números en",
    "prev": "Tu tarjeta para compartir",
    "share": "Compartir en LinkedIn",
    "copy": "Copiar texto sugerido",
    "copied": "Texto sugerido copiado.",
    "suggested": "Saqué {s}/15 en el quiz de auditoría de planta. ¿Tu equipo puede superarlo?",
    "team": "Enviar a tu equipo",
    "linkCopied": "Enlace copiado.",
    "retake": "Repetir",
    "more": "Una cosa más",
    "moreT": "Recibe la próxima pregunta cada viernes en el newsletter Industrial Cutting Processes.",
    "subB": "Suscribirse en LinkedIn",
    "takeQuiz": "Hacer el quiz"
  }
}
```

---

## 10. Image

- P1 uses Gui's field photo of a plasma-cut edge with globular low-speed dross on the bottom. Gui will add it as `/public/images/p1-dross.jpg` (he has the original file).
- Display on a white background, full width up to ~520px, rounded corners.
- Alt text (localized): EN "Plasma cut edge with dross on the bottom" / PT "Borda de corte plasma com escória na parte de baixo" / ES "Borde de corte plasma con escoria en la parte inferior".
- The data model must allow an optional image on any question (more photos will be added for P3, L3 and W2 later).

---

## 11. Supabase (anonymous analytics)

```sql
create table quiz_answers (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  session_id uuid not null,
  lang text not null check (lang in ('en','pt','es')),
  question_id text not null,
  selected_option text not null,
  is_correct boolean not null
);

create table quiz_completions (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  session_id uuid not null,
  lang text not null check (lang in ('en','pt','es')),
  total int not null,
  plasma int not null, laser int not null, waterjet int not null, decision int not null,
  shared boolean default false,
  referrer text
);
```

- RLS on both: anon can `insert` only; no `select` for anon.
- `session_id` = random UUID generated per quiz attempt, kept in memory (not tied to any person).
- Insert one `quiz_answers` row per checked answer; one `quiz_completions` row on the results screen; update `shared = true` when Share is clicked.
- Store `referrer` from `document.referrer` domain only (to see how much comes from LinkedIn).
- Failures must never block the quiz UI (fire-and-forget).
- Add a simple SQL view or script Gui can run: % correct per question per language. This is the "68% missed this one" content source.

---

## 12. Questions (content source of truth)

Store as `content/questions.json`. Each option has a stable `id` so shuffling never breaks scoring. `answer` is the correct option id. `link` refers to section 7.

```json
[
  {
    "id": "P1", "block": 0, "answer": "b", "link": "p5", "image": "/images/p1-dross.jpg",
    "en": {"q": "Your parts come off the table looking like this. The bottom dross is heavy and bubbly and chips off easily. Most likely cause?", "o": {"a": "Cut speed too fast", "b": "Cut speed too slow", "c": "Amperage too low", "d": "Worn electrode"}, "why": "Low-speed dross is globular and easy to remove. High-speed dross is a small rolled bead that welds to the edge."},
    "pt": {"q": "Suas peças saem da mesa assim. A escória na parte de baixo é grossa, globular e sai fácil com o martelo. Causa mais provável?", "o": {"a": "Velocidade de corte alta demais", "b": "Velocidade de corte baixa demais", "c": "Amperagem baixa demais", "d": "Eletrodo gasto"}, "why": "Escória de baixa velocidade é globular e fácil de remover. A de alta velocidade é um cordão fino que gruda na borda."},
    "es": {"q": "Tus piezas salen de la mesa así. La escoria inferior es gruesa, globular y se quita fácil con el martillo. ¿Causa más probable?", "o": {"a": "Velocidad de corte demasiado alta", "b": "Velocidad de corte demasiado baja", "c": "Amperaje demasiado bajo", "d": "Electrodo desgastado"}, "why": "La escoria de baja velocidad es globular y fácil de quitar. La de alta velocidad es un cordón fino que se pega al borde."}
  },
  {
    "id": "P2", "block": 0, "answer": "b", "link": "p2",
    "en": {"q": "Consumable life dropped about 40% the week after your compressor was serviced. Parameters unchanged. What do you check first?", "o": {"a": "Torch height control calibration", "b": "Moisture in the air supply", "c": "Nozzle brand", "d": "Plate chemistry"}, "why": "A bypassed dryer or missing drain after service is a classic. Moisture kills electrodes and nozzles invisibly."},
    "pt": {"q": "A vida dos consumíveis caiu uns 40% na semana depois da manutenção do compressor. Parâmetros iguais. O que você verifica primeiro?", "o": {"a": "Calibração do controle de altura", "b": "Umidade no ar comprimido", "c": "Marca do bico", "d": "Composição da chapa"}, "why": "Secador em bypass ou dreno esquecido depois da manutenção é clássico. A umidade destrói eletrodo e bico sem aparecer."},
    "es": {"q": "La vida de los consumibles cayó cerca de 40% la semana después del mantenimiento del compresor. Parámetros iguales. ¿Qué revisas primero?", "o": {"a": "Calibración del control de altura", "b": "Humedad en el aire comprimido", "c": "Marca de la boquilla", "d": "Composición de la placa"}, "why": "Un secador en bypass o un drenaje olvidado tras el mantenimiento es un clásico. La humedad destruye electrodo y boquilla sin que se note."}
  },
  {
    "id": "P3", "block": 0, "answer": "b", "link": "p4",
    "en": {"q": "Outer contours are square. Every interior hole shows heavy bevel. Same program, same consumables. Why?", "o": {"a": "Hole speed too high", "b": "Holes cut in the wrong direction", "c": "Pierce height too low", "d": "Shield gas pressure too high"}, "why": "With standard clockwise swirl, contours go clockwise and holes counterclockwise, so the bevel lands on the scrap."},
    "pt": {"q": "Os contornos externos saem retos. Todos os furos internos saem com muito chanfro. Mesmo programa, mesmos consumíveis. Por quê?", "o": {"a": "Velocidade alta nos furos", "b": "Furos cortados no sentido errado", "c": "Altura de perfuração baixa", "d": "Pressão do gás de proteção alta"}, "why": "Com swirl horário padrão, contornos vão no sentido horário e furos no anti-horário, assim o chanfro fica na sucata."},
    "es": {"q": "Los contornos externos salen rectos. Todos los agujeros internos salen con mucho bisel. Mismo programa, mismos consumibles. ¿Por qué?", "o": {"a": "Velocidad alta en los agujeros", "b": "Agujeros cortados en el sentido equivocado", "c": "Altura de perforación baja", "d": "Presión del gas de protección alta"}, "why": "Con swirl horario estándar, los contornos van en sentido horario y los agujeros en antihorario, así el bisel queda en el retal."}
  },
  {
    "id": "P4", "block": 0, "answer": "b", "link": "p3",
    "en": {"q": "Two shops, same machine, material and cut chart. Shop A gets twice the electrode life. Most likely difference?", "o": {"a": "Shop A cuts faster", "b": "Fewer arc starts and clean ramp-downs", "c": "Lower cut height", "d": "Different plate grade"}, "why": "Electrode wear is driven mostly by arc starts and stops. Nesting strategy is a consumable strategy."},
    "pt": {"q": "Duas empresas, mesma máquina, material e tabela de corte. A empresa A tem o dobro da vida do eletrodo. Diferença mais provável?", "o": {"a": "A empresa A corta mais rápido", "b": "Menos aberturas de arco e finais de corte limpos", "c": "Altura de corte menor", "d": "Outro tipo de chapa"}, "why": "O desgaste do eletrodo vem principalmente das aberturas e paradas do arco. Estratégia de nesting é estratégia de consumível."},
    "es": {"q": "Dos talleres, misma máquina, material y tabla de corte. El taller A logra el doble de vida del electrodo. ¿Diferencia más probable?", "o": {"a": "El taller A corta más rápido", "b": "Menos encendidos de arco y finales de corte limpios", "c": "Altura de corte menor", "d": "Otro grado de placa"}, "why": "El desgaste del electrodo viene sobre todo de los encendidos y apagados del arco. La estrategia de nesting es estrategia de consumibles."}
  },
  {
    "id": "L1", "block": 1, "answer": "b", "link": "fix",
    "en": {"q": "A customer wants weld-ready, bright edges on 3 mm stainless. Which assist gas?", "o": {"a": "Oxygen", "b": "High-purity nitrogen", "c": "Shop air", "d": "Argon"}, "why": "Nitrogen shields the cut from oxidation and leaves an oxide-free edge that welds without prep."},
    "pt": {"q": "Um cliente quer bordas brilhantes, prontas pra solda, em inox de 3 mm. Qual gás de assistência?", "o": {"a": "Oxigênio", "b": "Nitrogênio de alta pureza", "c": "Ar comprimido", "d": "Argônio"}, "why": "O nitrogênio protege o corte da oxidação e deixa a borda limpa, pronta pra solda."},
    "es": {"q": "Un cliente quiere bordes brillantes, listos para soldar, en inox de 3 mm. ¿Qué gas de asistencia?", "o": {"a": "Oxígeno", "b": "Nitrógeno de alta pureza", "c": "Aire comprimido", "d": "Argón"}, "why": "El nitrógeno protege el corte de la oxidación y deja el borde limpio, listo para soldar."}
  },
  {
    "id": "L2", "block": 1, "answer": "b", "link": "fix",
    "en": {"q": "Edge quality degrades slowly over the shift. Parameters unchanged, cleaning the nozzle didn't help. Check next?", "o": {"a": "Gas pressure at the tank", "b": "Protective window contamination", "c": "Sheet flatness", "d": "Nesting program"}, "why": "A dirty protective window absorbs beam energy. It looks like parameter drift, but it isn't."},
    "pt": {"q": "A qualidade da borda piora aos poucos ao longo do turno. Parâmetros iguais, limpar o bico não resolveu. O que verificar agora?", "o": {"a": "Pressão do gás no tanque", "b": "Sujeira na janela de proteção", "c": "Planicidade da chapa", "d": "Programa de nesting"}, "why": "A janela de proteção suja absorve energia do feixe. Parece desvio de parâmetro, mas não é."},
    "es": {"q": "La calidad del borde empeora poco a poco durante el turno. Parámetros iguales, limpiar la boquilla no ayudó. ¿Qué revisas ahora?", "o": {"a": "Presión del gas en el tanque", "b": "Suciedad en la ventana de protección", "c": "Planitud de la chapa", "d": "Programa de nesting"}, "why": "Una ventana de protección sucia absorbe energía del haz. Parece un problema de parámetros, pero no lo es."}
  },
  {
    "id": "L3", "block": 1, "answer": "b", "link": "fix",
    "en": {"q": "Nitrogen cuts on stainless come out straw-colored instead of bright. Most likely cause?", "o": {"a": "Cut speed too high", "b": "Oxygen contamination in the nitrogen", "c": "Focus too low", "d": "Power too low"}, "why": "Even a little oxygen in the line oxidizes the edge. Check purity at the source and pressure at the head."},
    "pt": {"q": "Cortes com nitrogênio em inox saem amarelados em vez de brilhantes. Causa mais provável?", "o": {"a": "Velocidade alta demais", "b": "Contaminação de oxigênio no nitrogênio", "c": "Foco baixo demais", "d": "Potência baixa demais"}, "why": "Um pouco de oxigênio na linha já oxida a borda. Verifique a pureza na fonte e a pressão no cabeçote."},
    "es": {"q": "Los cortes con nitrógeno en inox salen amarillentos en lugar de brillantes. ¿Causa más probable?", "o": {"a": "Velocidad demasiado alta", "b": "Contaminación de oxígeno en el nitrógeno", "c": "Foco demasiado bajo", "d": "Potencia demasiado baja"}, "why": "Un poco de oxígeno en la línea ya oxida el borde. Revisa la pureza en la fuente y la presión en el cabezal."}
  },
  {
    "id": "L4", "block": 1, "answer": "b", "link": "fix",
    "en": {"q": "Why can a fiber laser cut copper that a CO₂ laser of similar power struggles with?", "o": {"a": "Fiber runs at higher power", "b": "Better absorption at the ~1 µm wavelength", "c": "Different assist gas", "d": "Smaller nozzle"}, "why": "Reflective metals bounce most of the 10.6 µm CO₂ beam back. At the fiber wavelength, absorption is far higher."},
    "pt": {"q": "Por que um laser fibra corta cobre que um laser CO₂ de potência parecida tem dificuldade?", "o": {"a": "Fibra trabalha com mais potência", "b": "Absorção melhor no comprimento de onda de ~1 µm", "c": "Gás de assistência diferente", "d": "Bico menor"}, "why": "Metais reflexivos devolvem boa parte do feixe CO₂ de 10,6 µm. No comprimento de onda da fibra, a absorção é muito maior."},
    "es": {"q": "¿Por qué un láser de fibra corta cobre que un láser CO₂ de potencia similar no logra cortar bien?", "o": {"a": "La fibra trabaja con más potencia", "b": "Mejor absorción en la longitud de onda de ~1 µm", "c": "Gas de asistencia diferente", "d": "Boquilla más pequeña"}, "why": "Los metales reflectivos devuelven gran parte del haz CO₂ de 10,6 µm. En la longitud de onda de la fibra, la absorción es mucho mayor."}
  },
  {
    "id": "W1", "block": 2, "answer": "b", "link": "sand",
    "en": {"q": "You squeeze a handful of garnet and it clumps together. What's the risk?", "o": {"a": "None", "b": "Inconsistent feed and clogging", "c": "Faster tube wear only", "d": "Lower pump pressure"}, "why": "Moist garnet bridges in the feed line, so abrasive flow pulses or stops. Store it dry and sealed."},
    "pt": {"q": "Você aperta um punhado de garnet e ele empelota. Qual o risco?", "o": {"a": "Nenhum", "b": "Alimentação irregular e entupimento", "c": "Só desgaste mais rápido do tubo", "d": "Pressão menor na bomba"}, "why": "Garnet úmido trava na linha de alimentação e o fluxo de abrasivo pulsa ou para. Guarde seco e fechado."},
    "es": {"q": "Aprietas un puñado de granate y se apelmaza. ¿Cuál es el riesgo?", "o": {"a": "Ninguno", "b": "Alimentación irregular y obstrucción", "c": "Solo desgaste más rápido del tubo", "d": "Menor presión en la bomba"}, "why": "El granate húmedo se atasca en la línea de alimentación y el flujo de abrasivo pulsa o se detiene. Guárdalo seco y cerrado."}
  },
  {
    "id": "W2", "block": 2, "answer": "b", "link": "water",
    "en": {"q": "Over several weeks the kerf widens and parts drift out of tolerance. What's wearing?", "o": {"a": "The orifice", "b": "The focusing tube bore", "c": "The catcher tank", "d": "High-pressure seals"}, "why": "Abrasive slowly enlarges the focusing tube bore. Measure it on a schedule, not when complaints arrive."},
    "pt": {"q": "Ao longo de semanas, o kerf alarga e as peças saem de tolerância. O que está gastando?", "o": {"a": "O orifício", "b": "O furo do tubo de foco", "c": "O tanque", "d": "As vedações de alta pressão"}, "why": "O abrasivo alarga aos poucos o furo do tubo de foco. Meça com frequência fixa, não quando chegar reclamação."},
    "es": {"q": "Con las semanas, el kerf se ensancha y las piezas salen de tolerancia. ¿Qué se está desgastando?", "o": {"a": "El orificio", "b": "El diámetro del tubo de enfoque", "c": "El tanque", "d": "Los sellos de alta presión"}, "why": "El abrasivo agranda poco a poco el tubo de enfoque. Mídelo con frecuencia fija, no cuando lleguen quejas."}
  },
  {
    "id": "W3", "block": 2, "answer": "b", "link": "water",
    "en": {"q": "Pump pressure looks normal, but the stream is ragged and cut speed dropped. Most likely cause?", "o": {"a": "Intensifier wear", "b": "A chipped orifice", "c": "Garnet too fine", "d": "Water level too high"}, "why": "A chipped orifice breaks stream coherence. The pump can look fine while the head underperforms."},
    "pt": {"q": "A pressão da bomba parece normal, mas o jato está aberto e irregular e a velocidade caiu. Causa mais provável?", "o": {"a": "Desgaste do intensificador", "b": "Orifício lascado", "c": "Garnet fino demais", "d": "Nível de água alto demais"}, "why": "Um orifício lascado desfaz a coerência do jato. A bomba parece bem enquanto o cabeçote rende menos."},
    "es": {"q": "La presión de la bomba parece normal, pero el chorro está abierto e irregular y la velocidad bajó. ¿Causa más probable?", "o": {"a": "Desgaste del intensificador", "b": "Orificio astillado", "c": "Granate demasiado fino", "d": "Nivel de agua demasiado alto"}, "why": "Un orificio astillado rompe la coherencia del chorro. La bomba parece bien mientras el cabezal rinde menos."}
  },
  {
    "id": "W4", "block": 2, "answer": "c", "link": "sand",
    "en": {"q": "Supplier B's garnet is 15% cheaper per pound. When does it cost you more?", "o": {"a": "Never", "b": "Only if shipping is higher", "c": "When it needs more feed or slower speed", "d": "Only above 50 mm"}, "why": "Compare cost per cutting hour, not cost per pound. Cheaper garnet that cuts slower is more expensive."},
    "pt": {"q": "O garnet do fornecedor B é 15% mais barato por quilo. Quando ele sai mais caro?", "o": {"a": "Nunca", "b": "Só se o frete for maior", "c": "Quando exige mais vazão ou velocidade menor", "d": "Só acima de 50 mm"}, "why": "Compare custo por hora de corte, não por quilo. Garnet barato que corta mais devagar sai mais caro."},
    "es": {"q": "El granate del proveedor B es 15% más barato por kilo. ¿Cuándo sale más caro?", "o": {"a": "Nunca", "b": "Solo si el flete es mayor", "c": "Cuando exige más caudal o menor velocidad", "d": "Solo por encima de 50 mm"}, "why": "Compara costo por hora de corte, no por kilo. Un granate barato que corta más lento sale más caro."}
  },
  {
    "id": "D1", "block": 3, "answer": "c", "link": "calc",
    "en": {"q": "Plasma, laser and waterjet can all cut your 12 mm stainless parts well. What do you settle first?", "o": {"a": "Which is fastest", "b": "Lowest machine price", "c": "Which outcome matters most", "d": "Best service contract"}, "why": "Every calculator can be built to prove one process wins. Define the outcome first, then the inputs."},
    "pt": {"q": "Plasma, laser e waterjet cortam bem suas peças de inox de 12 mm. O que definir primeiro?", "o": {"a": "Qual é o mais rápido", "b": "Menor preço de máquina", "c": "Qual resultado importa mais", "d": "Melhor contrato de serviço"}, "why": "Toda calculadora pode ser montada pra provar que um processo ganha. Defina o resultado primeiro, depois as variáveis."},
    "es": {"q": "Plasma, láser y waterjet cortan bien tus piezas de inox de 12 mm. ¿Qué defines primero?", "o": {"a": "Cuál es el más rápido", "b": "Menor precio de máquina", "c": "Qué resultado importa más", "d": "Mejor contrato de servicio"}, "why": "Toda calculadora puede armarse para probar que un proceso gana. Define primero el resultado, después las variables."}
  },
  {
    "id": "D2", "block": 3, "answer": "c", "link": "buy",
    "en": {"q": "Machine X is 15% faster but needs a vendor tech for most repairs. Machine Y is slower but fixed in-house. Which metric captures it?", "o": {"a": "Peak cut speed", "b": "Spec sheet accuracy", "c": "MTTR and real availability", "d": "Power consumption"}, "why": "Throughput is speed times uptime. Two days waiting for a technician wipes out 15% fast."},
    "pt": {"q": "A máquina X é 15% mais rápida, mas depende de técnico do fabricante na maioria dos reparos. A Y é mais lenta, mas sua equipe conserta. Qual métrica mostra a diferença real?", "o": {"a": "Velocidade máxima", "b": "Precisão do catálogo", "c": "MTTR e disponibilidade real", "d": "Consumo de energia"}, "why": "Produtividade é velocidade vezes disponibilidade. Dois dias esperando técnico apagam 15% rapidinho."},
    "es": {"q": "La máquina X es 15% más rápida, pero depende de un técnico del fabricante en la mayoría de las reparaciones. La Y es más lenta, pero tu equipo la repara. ¿Qué métrica muestra la diferencia real?", "o": {"a": "Velocidad máxima", "b": "Precisión del catálogo", "c": "MTTR y disponibilidad real", "d": "Consumo de energía"}, "why": "La productividad es velocidad por disponibilidad. Dos días esperando un técnico borran ese 15% muy rápido."}
  },
  {
    "id": "D3", "block": 3, "answer": "c", "link": "p4",
    "en": {"q": "Consumables replaced, air fixed, parameters validated. Conventional plasma still misses the bevel tolerance. Next step?", "o": {"a": "Keep tuning", "b": "Switch consumable brand", "c": "Treat it as a hardware ceiling", "d": "Slow down 20%"}, "why": "Once the process is clean, the gap is the machine. You can't tune conventional into HD plasma."},
    "pt": {"q": "Consumíveis trocados, ar corrigido, parâmetros validados. O plasma convencional ainda não segura a tolerância de chanfro. Próximo passo?", "o": {"a": "Continuar ajustando", "b": "Trocar a marca do consumível", "c": "Tratar como limite do equipamento", "d": "Reduzir a velocidade em 20%"}, "why": "Com o processo limpo, a diferença está na máquina. Não dá pra ajustar plasma convencional até virar HD."},
    "es": {"q": "Consumibles cambiados, aire corregido, parámetros validados. El plasma convencional todavía no cumple la tolerancia de bisel. ¿Siguiente paso?", "o": {"a": "Seguir ajustando", "b": "Cambiar la marca de consumibles", "c": "Tratarlo como límite del equipo", "d": "Bajar la velocidad 20%"}, "why": "Con el proceso limpio, la brecha está en la máquina. No se puede ajustar un plasma convencional hasta volverlo HD."}
  }
]
```

---

## 13. Acceptance checklist

- [ ] All 15 questions render in EN, PT and ES; switching language mid-question keeps selection and checked state.
- [ ] Options are shuffled per attempt; scoring uses option ids and is always correct.
- [ ] "Check answer" with no selection shows the localized inline error and does not advance.
- [ ] Every explanation shows the right "Read more" link; Laser questions show the "coming soon" badge.
- [ ] Result screen: score, profile, block bars, weakest block with article (primary) and tool (secondary), card preview, share, copy text, send to team, retake, step-2 subscribe box after share.
- [ ] `/r/[code]` validates the code, renders the card and CTA, and has correct OG/Twitter meta in the chosen language.
- [ ] `/api/og` returns a 1200×627 PNG matching the in-page preview for all three languages.
- [ ] Shared link tested with LinkedIn Post Inspector and shows the per-score card.
- [ ] Supabase inserts work, anon cannot read, and a failed insert never breaks the UI.
- [ ] Text contrast is correct everywhere on the dark theme; tested on a phone.
- [ ] Deployed on Vercel and mapped to `quiz.industrialcuttinglabs.com`.

---

## 14. Open items for Gui (not blockers for the build)

1. Exact URLs for Plasma 101 Parts 2–5, Plasma 101 / Waterjet 101 Part 1, and "Buying a Solution, or a Future Problem?".
2. Review PT and ES technical terms (escória, chanfro, garnet/granate, tubo de foco, bico/boquilla).
3. Set at least a target quarter for Laser 101 before launch (the "coming soon" badge loses credibility if it stays up too long).
4. Add field photos for P3, L3 and W2 when available (no brands visible).
5. Decide whether to note "(in English)" next to article links for PT/ES users.
