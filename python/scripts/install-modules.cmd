@REM This script installs Python modules for TouchDesigner using 
@REM the Python interpreter bundled with TouchDesigner for compatibility.
@REM Modules are installed to a local directory to avoid conflicts with the system Python.
@REM Make sure to add _local_modules to the TouchDesigner Python path when the app is running.
@REM This is done via config.py -> AddPyDirToPath() in App.py.:
@REM - config.AddPyDirToPath(os.path.join(project.folder, 'python', '_local_modules'))

set PYTHON_PATH=C:\Program Files\Derivative\TouchDesigner\bin\python.exe
"%PYTHON_PATH%" -m pip install -r requirements.txt --target="../_local_modules"
pause


@REM Example command to install onnxruntime-gpu with a specific CUDA version:
@REM &"C:\Program Files\Derivative\TouchDesigner\bin\python.exe" -m pip install onnxruntime-gpu --target="../_local_modules" --extra-index-url https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/onnxruntime-cuda-11/pypi/simple/
@REM &"C:\Program Files\Derivative\TouchDesigner\bin\python.exe" -m pip install onnxruntime-gpu==1.17.0 --target="../_local_modules"