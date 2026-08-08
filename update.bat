@echo off
echo === Обновление базы GTA5RP ===
echo Запуск парсера...
call npm run start

echo.
echo === Отправка изменений на GitHub ===
git add database/
git commit -m "Auto-update GTA5RP DB"
git push

echo.
echo Готово!
pause
