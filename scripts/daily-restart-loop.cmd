@echo off

@REM =================================================================================================
@REM = Restart apps if it's between 1 and 2 AM.
@REM = This script will run indefinitely, checking the time every 30 minutes.
@REM = When we're in the time window to restart, we wait 65 minutes before reentering the loop.
@REM =================================================================================================
set windowStartTime=01:00:00.00
set windowEndTime=02:00:00.00
set thirtyMinutes=1800
set sixtyFiveMinutes=3900

@REM =================================================================================================
@REM = :restart
@REM = Stop & restart the apps!
@REM =================================================================================================

:restart
echo Restarting apps at %TIME%

echo Stopping apps (by killing processes) ...
start "" /min stop-all.cmd ^& exit

echo Waiting 10 seconds to restart ...
timeout /t 10 > nul

echo Starting apps ...
start "" /min start-all.cmd ^& exit

echo Startup complete! Waiting 65 minutes before checking time again ...
timeout /t %sixtyFiveMinutes% > nul

goto loop

@REM =================================================================================================
@REM = :loop
@REM = Check time every 30 minutes.
@REM = If not within the time range, :loop again.
@REM = If within the time range, go to :restart
@REM = For hours less than 10:00, don't zero-pad the hour!
@REM =================================================================================================

:loop
timeout /t %thirtyMinutes% > nul

@REM Get the current time
SET "hours=%time:~0,2%"
IF "%hours:~0,1%"==" " SET "hours=0%hours:~1,1%"
SET "minutes=%time:~3,2%"
SET "seconds=%time:~6,2%"
SET "hundredths=%time:~9,2%"
SET "formattedTime=%hours%:%minutes%:%seconds%.%hundredths%"

@REM Check if we're outside the daily restart time range
echo Checking time at %formattedTime% ...
if %formattedTime% LSS %windowStartTime% goto loop
if %formattedTime% GTR %windowEndTime% goto loop

@REM =================================================================================================
@REM = We've passed the daily restart time window check, so let's restart
@REM =================================================================================================

echo Within the daily restart time window! Restarting script ...
goto restart

@REM =================================================================================================
@REM = We shouldn't ever make it here
@REM =================================================================================================

pause