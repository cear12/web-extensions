# QR Code Generator (Chrome & Safari)

Функции:
- Генерация QR для текста/URL, WiFi, vCard
- Кастомизация: размер, цвет, уровень коррекции ошибок
- Предпросмотр и скачивание PNG
- Сохранение настроек в localStorage (страница настроек)

## Установка в Chrome
1. Откройте chrome://extensions
2. Включите Developer mode
3. Нажмите "Load unpacked" и выберите папку `~/qr-code-generator-pro-extension`

## Safari (macOS)
1. Установите Xcode (последняя версия)
2. В Xcode: File > New > Project > Safari Web Extension (или используйте `xcrun safari-web-extension-converter ~/qr-code-generator-pro-extension`)
3. Следуйте указаниям Xcode для подписи и сборки. Расширение будет доступно в Safari > Extensions.

## Замечания
- Библиотека QR: qrcodejs (MIT) хранится локально в `lib/qrcode.min.js`.
- Все данные остаются на устройстве пользователя.
