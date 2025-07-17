#!/bin/bash

# This script installs Python modules for TouchDesigner using 
# the Python interpreter bundled with TouchDesigner for compatibility.
# Modules are installed to a local directory to avoid conflicts with the system Python.
# Make sure to add _local_modules to the TouchDesigner Python path when the app is running.
# This is done via config.py -> AddPyDirToPath() in App.py.:
# - config.AddPyDirToPath(os.path.join(project.folder, 'python', '_local_modules'))

# TouchDesigner Python path on macOS
PYTHON_PATH="/Applications/TouchDesigner.app/Contents/Frameworks/Python.framework/Versions/3.11/bin/python3.11"

# Check if TouchDesigner Python exists
if [ ! -f "$PYTHON_PATH" ]; then
    echo "Error: TouchDesigner Python not found at $PYTHON_PATH"
    echo "Please check your TouchDesigner installation or update the PYTHON_PATH variable."
    exit 1
fi

echo "Installing Python modules using TouchDesigner's Python interpreter..."
"$PYTHON_PATH" -m pip install -r requirements-mac.txt --target="../_local_modules"

echo "Installation complete!"
echo "Press any key to continue..."
read -n 1 -s

