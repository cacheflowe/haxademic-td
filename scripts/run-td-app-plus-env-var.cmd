pushd ..
set sys_env_var=A value from the os environment via script launch
set TD_APP_PATH=C:\Program Files\Derivative\TouchDesigner\bin\TouchDesigner.exe
start "%TD_APP_PATH%" "haxademic.toe"
popd