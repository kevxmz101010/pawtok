@echo off
title Iniciar Pawtok
color 0B
echo ======================================================
echo             INICIANDO PROYECTO PAWTOK
echo ======================================================
echo.

echo [1/3] Iniciando Servicio de Base de Datos (MySQL)...
if exist "C:\xampp\mysql_start.bat" (
    start /B "" "C:\xampp\mysql_start.bat" >nul 2>&1
    echo MySQL iniciado correctamente o en ejecucion.
) else (
    echo NOTA: Asegurate de que MySQL este corriendo en XAMPP.
)
echo.

echo [2/3] Iniciando Servidor Backend (Spring Boot en puerto 8080)...
start "Pawtok Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo [3/3] Iniciando Servidor Frontend (Vite en puerto 3000)...
start "Pawtok Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================
echo   Todo en marcha! Las ventanas se han abierto.
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:3000
echo ======================================================
echo.
timeout /t 5
