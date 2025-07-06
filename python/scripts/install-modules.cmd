@REM This script installs Python modules for TouchDesigner using 
@REM the Python interpreter bundled with TouchDesigner for compatibility.
@REM Modules are installed to a local directory to avoid conflicts with the system Python.
@REM Make sure to add _local_modules to the TouchDesigner Python path when the app is running.
@REM This is done via config.py -> AddPyDirToPath() in App.py.:
@REM - config.AddPyDirToPath(os.path.join(project.folder, 'python', '_local_modules'))

set PYTHON_PATH=C:\Program Files\Derivative\TouchDesigner\bin\python.exe
"%PYTHON_PATH%" -m pip install -r requirements.txt --target="../_local_modules"
pause