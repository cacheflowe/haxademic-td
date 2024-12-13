taskkill /f /t /im "TouchDesigner.exe"
wmic process where "name='TouchDesigner.exe'" delete

exit