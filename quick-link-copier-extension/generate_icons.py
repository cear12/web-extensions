#!/usr/bin/env python3
"""
Генератор иконок для QuickLink Copier Extension
Создает иконки размеров 16x16, 32x32, 48x48, 128x128 на основе icon.png

Требования: pip install Pillow
"""

import os
from PIL import Image
import sys

def generate_icons(source_path="icon.png"):
    """
    Генерирует иконки разных размеров на основе исходного изображения
    """
    
    # Проверяем существование исходного файла
    if not os.path.exists(source_path):
        print(f"❌ Файл {source_path} не найден!")
        print("Убедитесь, что файл icon.png находится в текущей папке")
        return False
    
    try:
        # Открываем исходное изображение
        with Image.open(source_path) as img:
            print(f"✅ Загружено изображение: {img.size[0]}x{img.size[1]}px")
            
            # Конвертируем в RGBA если нужно
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
                print("🔄 Конвертировано в RGBA формат")
            
            # Размеры для генерации
            sizes = [16, 32, 48, 128]
            
            for size in sizes:
                # Создаем новое изображение нужного размера
                resized = img.resize((size, size), Image.Resampling.LANCZOS)
                
                # Сохраняем с именем icon{size}.png
                filename = f"icon{size}.png"
                resized.save(filename, "PNG")
                print(f"✅ Создана иконка: {filename} ({size}x{size}px)")
            
            print("\n🎉 Все иконки успешно сгенерированы!")
            print("📁 Созданные файлы:")
            for size in sizes:
                print(f"   - icon{size}.png")
            
            return True
            
    except Exception as e:
        print(f"❌ Ошибка при обработке изображения: {e}")
        return False

def main():
    print("🎨 Генератор иконок для QuickLink Copier Extension")
    print("=" * 50)
    
    # Проверяем аргументы командной строки
    source_file = sys.argv[1] if len(sys.argv) > 1 else "icon.png"
    
    success = generate_icons(source_file)
    
    if success:
        print("\n✨ Готово! Теперь вы можете использовать новые иконки в расширении.")
    else:
        print("\n💡 Советы:")
        print("1. Убедитесь, что файл icon.png находится в папке со скриптом")
        print("2. Установите Pillow: pip install Pillow")
        print("3. Или используйте HTML версию генератора: generate_icons.html")

if __name__ == "__main__":
    main()
