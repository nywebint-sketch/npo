# Figma-ready export

Этот экспорт делает реальные макеты сайта в PNG для импорта в Figma и комментариев.

## 1) Включить Safari Automation (один раз)

1. Safari -> Settings -> Advanced
2. Включить `Show features for web developers`
3. В меню `Developer` включить `Allow Remote Automation`

## 2) Сгенерировать макеты

```bash
cd /Users/nikita/Documents/New\ project/NPO/figma-export
python3 export_figma_png.py
```

Будут созданы файлы:
- `npo-desktop-1440.png`
- `npo-mobile-390.png`

## 3) Импорт в Figma

1. Открой Figma file
2. Drag-and-drop оба PNG
3. Добавь комментарии клавишей `C`

