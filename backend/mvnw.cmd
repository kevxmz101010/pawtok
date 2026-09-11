@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------

@echo off
setlocal EnableDelayedExpansion

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set "MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

@REM Download maven-wrapper.jar if needed
if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%MAVEN_WRAPPER_JAR%'}"
)

@REM 1. Check if JAVA_HOME is defined and valid
set "JAVA_EXE="

if defined JAVA_HOME (
    set "CLEAN_JH=%JAVA_HOME:"=%"
    if exist "!CLEAN_JH!\bin\java.exe" set "JAVA_EXE=!CLEAN_JH!\bin\java.exe"
    if not defined JAVA_EXE if exist "!CLEAN_JH!bin\java.exe" set "JAVA_EXE=!CLEAN_JH!bin\java.exe"
)

if not defined JAVA_EXE (
    where java.exe >nul 2>&1
    if not errorlevel 1 set "JAVA_EXE=java.exe"
)

if not defined JAVA_EXE (
    for /d %%D in ("C:\Program Files\Microsoft\jdk-17*") do (
        if exist "%%~D\bin\java.exe" set "JAVA_EXE=%%~D\bin\java.exe"
    )
)
if not defined JAVA_EXE (
    for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
        if exist "%%~D\bin\java.exe" set "JAVA_EXE=%%~D\bin\java.exe"
    )
)
if not defined JAVA_EXE (
    for /d %%D in ("C:\Program Files\Java\jdk-17*") do (
        if exist "%%~D\bin\java.exe" set "JAVA_EXE=%%~D\bin\java.exe"
    )
)
if not defined JAVA_EXE (
    for /d %%D in ("C:\Program Files\Java\jdk*") do (
        if exist "%%~D\bin\java.exe" set "JAVA_EXE=%%~D\bin\java.exe"
    )
)
if not defined JAVA_EXE (
    for /d %%D in ("C:\Program Files\Microsoft\jdk*") do (
        if exist "%%~D\bin\java.exe" set "JAVA_EXE=%%~D\bin\java.exe"
    )
)

if not defined JAVA_EXE (
    echo =========================================================================
    echo ERROR: No se encontro Java 17 en tu sistema.
    echo Asegurate de tener instalado JDK 17 o define la variable JAVA_HOME.
    echo =========================================================================
    exit /b 1
)

"!JAVA_EXE!" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%." -cp "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
if ERRORLEVEL 1 goto error
goto end

:error
exit /b 1

:end
endlocal
