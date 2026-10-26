@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo 请先安装 Node.js 22 LTS：https://nodejs.org/ ，安装后重新双击本文件。
 pause
 exit /b 1
)
if not exist node_modules\playwright\package.json (
 echo 正在安装浏览器测试工具，首次需要联网……
 call npm install --no-audit --no-fund
 if errorlevel 1 goto failed
)
call npm start
if errorlevel 1 goto failed
pause
exit /b 0
:failed
 echo 测试未完成。请保留窗口中的错误信息，截图发给协助人员。
 pause
 exit /b 1
