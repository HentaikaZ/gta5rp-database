@echo off
echo === Обновление базы GTA5RP ===
echo Запуск парсера...
call npm run start

echo.
echo === Отправка изменений на GitHub ===
git add output/
git commit -m "Автоматическое обновление базы законов GTA5RP"
git push

echo.
echo Готово!
pause
