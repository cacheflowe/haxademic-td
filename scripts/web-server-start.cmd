pushd ..\www\scripts\
start "Web Server" /min serve-all.cmd ^& exit
popd

exit