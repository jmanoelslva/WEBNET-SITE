@echo off
chcp 65001 >nul
echo Atualizando o carrossel com as imagens da pasta fotos...
echo.
node "%~dp0gerar-galeria.js"
if errorlevel 1 (
  echo.
  echo Nao foi possivel atualizar. Verifique se o Node.js esta instalado: https://nodejs.org
)
echo.
pause
