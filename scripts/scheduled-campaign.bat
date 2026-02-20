@echo off
REM MarketClaw Scheduled Campaign Runner
REM 헤어스타일 한국향 글 3개 + mix 전략

cd /d D:\source\marketclaw

REM Load environment variables
if exist .env (
    for /f "usebackaliasq delims=" %%a in (.env) do set "%%a"
)

REM Run Claude Code in non-interactive mode
C:\Users\seoil\.local\bin\claude.exe -p "/run-campaign niche:헤어스타일 goal:3 lang:ko platforms:naver country:한국 strategy:mix" --verbose > workspace\logs\scheduled_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%.log 2>&1

echo Campaign finished at %date% %time%
