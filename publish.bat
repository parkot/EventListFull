@echo off
setlocal

set "PROJECT=src\Backend\EventList.Api\EventList.Api.csproj"
set "CONFIGURATION=Release"
set "RUNTIME=win-x64"
set "OUTPUT=publish\backend\%RUNTIME%"

echo Publishing %PROJECT% for %RUNTIME%...
dotnet publish "%PROJECT%" -c %CONFIGURATION% -r %RUNTIME% --self-contained false -o "%OUTPUT%"

if errorlevel 1 (
    echo Publish failed.
    exit /b 1
)

echo Publish completed successfully.
echo Output: %OUTPUT%
exit /b 0
