#!/bin/bash

# Генератор иконок для QuickLink Copier Extension
# Использует встроенные инструменты macOS для создания иконок

echo "🎨 Генератор иконок для QuickLink Copier Extension"
echo "=================================================="

# Проверяем наличие icon.png
if [ ! -f "icon.png" ]; then
    echo "❌ Файл icon.png не найден!"
    echo "Убедитесь, что файл icon.png находится в текущей папке"
    exit 1
fi

echo "✅ Найден файл icon.png"

# Создаем иконки разных размеров
sizes=(16 32 48 128)

for size in "${sizes[@]}"; do
    echo "🔄 Создание иконки ${size}x${size}px..."
    
    # Используем sips для изменения размера (встроенный в macOS)
    if command -v sips &> /dev/null; then
        sips -z $size $size icon.png --out "icon${size}.png" &> /dev/null
        echo "✅ Создана иконка: icon${size}.png"
    else
        echo "❌ sips не найден. Установите ImageMagick или используйте Python скрипт"
        exit 1
    fi
done

echo ""
echo "🎉 Все иконки успешно сгенерированы!"
echo "📁 Созданные файлы:"
for size in "${sizes[@]}"; do
    echo "   - icon${size}.png"
done

echo ""
echo "✨ Готово! Теперь вы можете использовать новые иконки в расширении."
