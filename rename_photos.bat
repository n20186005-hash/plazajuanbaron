@echo off
chcp 65001 >nul
echo 正在重命名照片文件...
cd /d "%~dp0public\gallery"
for %%f in ("plaza-juan-baron (*).jpg") do (
    set "filename=%%~nf"
    setlocal enabledelayedexpansion
    set "newname=!filename: (=!"
    set "newname=!newname:)=!"
    set "newname=!newname: =-!"
    ren "%%f" "!newname!%%~xf"
    echo 已重命名: %%f -^> !newname!%%~xf
    endlocal
)
echo 重命名完成！
pause
