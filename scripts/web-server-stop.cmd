taskkill /F /T /IM node.exe
wmic process where "name='node.exe'" delete
taskkill /F /T /IM node.exe
wmic process where "name='node.exe'" delete

exit