# SavedVariablesManager — app icon (variant 1B)

## Files
- `icon.svg` — master vector, 512 viewBox, WoW mark embedded as a data URI (self-contained).
- `icon-small.svg` — simplified geometry for 16–32px (heavier strokes, no file lines, larger badge).
- `icon-16 … icon-1024.png` — rendered PNGs. 16/24/32 use the simplified geometry, 48/64 a medium one, 128+ the full detail.

## macOS (.icns)
Put the renders in an iconset folder and run iconutil:

```
mkdir SVM.iconset
cp icon-16.png   SVM.iconset/icon_16x16.png
cp icon-32.png   SVM.iconset/icon_16x16@2x.png
cp icon-32.png   SVM.iconset/icon_32x32.png
cp icon-64.png   SVM.iconset/icon_32x32@2x.png
cp icon-128.png  SVM.iconset/icon_128x128.png
cp icon-256.png  SVM.iconset/icon_128x128@2x.png
cp icon-256.png  SVM.iconset/icon_256x256.png
cp icon-512.png  SVM.iconset/icon_256x256@2x.png
cp icon-512.png  SVM.iconset/icon_512x512.png
cp icon-1024.png SVM.iconset/icon_512x512@2x.png
iconutil -c icns SVM.iconset -o SVM.icns
```

macOS does not pad Dock icons for you — the artwork already carries its own margin inside the square.

## Windows (.ico)
Pack 16/24/32/48/64/128/256 into one .ico with ImageMagick:

```
magick icon-16.png icon-24.png icon-32.png icon-48.png icon-64.png icon-128.png icon-256.png SVM.ico
```

Windows reads the 256px entry as PNG-compressed, which the command above produces.
