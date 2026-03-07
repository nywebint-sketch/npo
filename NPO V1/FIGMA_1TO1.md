# NPO Melodya: Figma 1:1 Handoff

Этот файл нужен, чтобы собрать макет страницы `index.html` в Figma максимально близко к текущей верстке (1:1).

## 1) Frames

- Desktop frame: `1440 x 5400` (или Auto-height, если собираете секциями)
- Mobile frame: `390 x 844` (iPhone 12/13/14)

## 2) Design tokens

Использовать такие переменные:

- `--bg`: `#000000`
- `--fg`: `#FFFFFF`
- `--muted`: `rgba(255,255,255,0.72)`
- `--stroke`: `rgba(255,255,255,0.14)`
- `--stroke2`: `rgba(255,255,255,0.10)`
- `--card`: `rgba(8,8,8,0.42)`
- `--radius`: `18px`
- `--max`: `1180px`

## 3) Typography

- Основной шрифт: `ISOCP EUR Italic`
- Fallback в Figma: `Arial Italic` (если кастомный не установлен)
- Body size: `clamp(15px, 0.2vw + 14px, 17px)`
- H1: `clamp(36px, 4.8vw, 68px)`, line-height `1.04`
- H2: `clamp(20px, 2vw, 28px)`, line-height `1.15`
- Header nav links: `13px`
- Buttons: `13px`

## 4) Grid and spacing

- Container: max width `1180px`, horizontal paddings:
  - Desktop: `18px`
  - <=1200: `16px`
  - <=520: `14px`
- Section vertical padding: `56px` (mobile `24px` at <=760)
- Main top padding: `78px` (mobile `68px`)
- Cards grid gap: `14px`
- Mobile cards gap: `8px`

## 5) Global surfaces

- Body background: black + background image `bg-contour.png` (overlay эффект)
- Topbar:
  - height `78px` (mobile `68px`)
  - background `rgba(5,5,5,0.45)`
  - blur `12px`
  - bottom border `1px stroke2`

## 6) Reusable components

### Card
- Radius: `18px` (mobile `12px`)
- Border: `1px solid stroke2`
- Fill: `card`
- Shadow: `0 12 36 rgba(0,0,0,0.35)`
- Overflow: hidden

### Button
- Height by padding: `10px 14px`
- Radius: `999px`
- Border: `1px stroke`
- Fill: `rgba(255,255,255,0.06)`

### Media block
- Base ratio: `4/5`
- Border bottom: `1px stroke2`
- Padding: `12px`
- Image fit: `contain`
- For `.wide`: ratio `16/9`
- On mobile <=760: base ratio `1/1`, padding `6px`

## 7) Section composition order

1. Intro (`#home`) full-height image `npo_print_source.png`
2. Events (`#events`) grid `g4`
3. Calendar (`#calendar`) 2-column layout
4. Artists (`#artists`) card + inner grid
5. Releases (`#releases`) card + inner grid
6. Streams (`#streams`) 2-column cards
7. Merch (`#merch`) grid `g4`
8. Contacts (`#contacts`)

## 8) Events card (текущее состояние)

Карточка афиши должна быть такой:

- Изображение постера (`event-media`) без обрезки (`contain`)
- Ниже текстовый блок `.pad`:
  - 1 строка: дата (`.event-card-date`, muted)
  - 2 строка: название (`.event-card-title`)

## 9) Responsive breakpoints

- `<=1200`
- `<=1140`
- `<=980`
- `<=760` (главный mobile breakpoint)
- `<=520`
- `<=380`

Для `#eventsGrid/#artistsGrid/#releasesGrid/#merchGrid` на mobile использовать 2 колонки.

## 10) Как оставить комментарии в Figma

1. Открой файл макета в Figma.
2. Нажми `C` (режим Comment).
3. Клик по нужному блоку и оставь комментарий.
4. Для точной привязки к секциям используй префиксы:
   - `[events] ...`
   - `[calendar] ...`
   - `[artists] ...`
   - `[streams] ...`
5. Для фиксации правок переводи комментарии в `Resolve` после внесения изменений.

## 11) Быстрый QA перед ревью

- Совпадает topbar height (`78/68`)
- Совпадает container width (`1180`) и paddings
- Карточки и border radius соответствуют (`18/12`)
- В афише постеры не режутся
- В афише порядок текста: дата -> название
- На мобильном сетки по 2 карточки в ряд

