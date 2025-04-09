# haxademic-td

A personal toolkit & demo playground

## TODO

- Save demos as tox files and get them out of the project
- save python files for utility toxes. maybe this util code should be elsewhere?
- Bring in components from Gatorade

## GLSL infos

From: https ://docs.derivative.ca/Write_a_GLSL_TOP

Built-in uniforms & functions:
```glsl
// Helpers
uniform sampler2D sTDNoiseMap;  // A 256x256 8-bit Red-only channel texture that has random data.
uniform sampler1D sTDSineLookup; // A Red-only texture that goes from 0 to 1 in a sine shape.

// Noise functions
float TDPerlinNoise(vec2 v);
float TDPerlinNoise(vec3 v);
float TDPerlinNoise(vec4 v);
float TDSimplexNoise(vec2 v);
float TDSimplexNoise(vec3 v);
float TDSimplexNoise(vec4 v);

// Information about the textures
TDTexInfo uTDOutputInfo; // The current texture context
TDTexInfo uTD2DInfos[]; // only exists if inputs are connected 

// Converts between RGB and HSV color space
vec3 TDHSVToRGB(vec3 c);
vec3 TDRGBToHSV(vec3 c);

// Applies a small random noise to the color to help avoid banding in some cases.
vec4 TDDither(vec4 color);
```

Extras:
```glsl
#define PI     3.14159265358
#define TWO_PI 6.28318530718
```

Correct aspect ratio: 
```glsl
float width = 1./uTDOutputInfo.res.z;
float height = 1./uTDOutputInfo.res.w;
vec2 aspect = width * uTDOutputInfo.res.wz; // swizzle height/width
vec2 p = vUV.xy / aspect;
```


## Python snippets

[run()](https://derivative.ca/UserGuide/Run_Command_Examples)

```python
# Call a class function with a delay in an extension
run(lambda: self.BroadcastVals(), delayFrames=30)
run(self.BroadcastVals, delayFrames=30)
run('self.BroadcastVals(args)', delayFrames=30)
# Call a global function with a delay
run("broadcastVals()", delayFrames=30)
# Call a function with an argument
run("TurnOff(args[0])", oldConnection, delayFrames=30)
# Call a script DAT with an argument and a delay
op('text_script_example').run('arg1=something', delayFrames=30)
```

Threading:
```python
import queue
import threading
import os

class PythonWebServer:
	def __init__(self, ownerComp):
		self.status_queue = queue.Queue() 

	def StartServer(self):
		self.thread = threading.Thread(target=self.StartServerThread)
		self.thread.daemon = True  # Set as daemon thread
		self.thread.start()

	def CheckServerActive(self):
		"""Callback function is executed on the main thread, called by DAT execute every frame."""
		try:
				result = self.status_queue.get(block=False) # non-blocking get
				# print("Result received: {}".format(result))
				self.is_active = result[0]
		except queue.Empty:
				pass # queue is empty nothing to do.
		return
	
	def SetActiveStatus(self, active):
		self.status_queue.put(active)

	def StopServer(self):
		if self.httpd is None:
			print('[PythonWebServer] No server to stop!')
			self.SetActiveStatus([False, 'Stopped'])
			return

		self.stopThread = threading.Thread(target=self.StopServerThread)
		self.stopThread.start()
		# run("parent().SetActive(0)", fromOP=me, delayFrames=1)

	def StopServerThread(self):
		# clean up
		self.thread.join()
		self.shutdown_event.set()
		# self.stopThread.join()
```

String formatting

```python
# zero padding a number
'{:03d}'.format(1) # 001
'{:010d}'.format(9223) # 0000009223
# zero pad a string
'hi'.zfill(10) # 0000000hi
'hi'.rjust(10, '0') # 0000000hi
```

## Conda env

From: https://derivative.ca/community-post/tutorial/anaconda-miniconda-managing-python-environments-and-3rd-party-libraries

Notes:
- Conda env needs to use the same python version as TouchDesigner. Currently 3.11

```bash
conda env list
conda create -n td-demo python=3.11
conda activate td-demo

# install some libs
conda install -c conda-forge pytesseract
choco install tesseract

# find the path to the conda env
conda env list

# remove the env
conda deactivate
conda env remove -n td-demo
```

## Import a custom python module

```python
import sys
import os
import importlib

# Set up external module script
# - Create dir at ./python/test_import
# - Create empty __init__.py file in the test_import folder
# - Create test_external.py file in the test_import folder with a function printSpecial()

# Construct the path to the TD project's directory containing test_external.py
module_path = os.path.join(project.folder, 'python', 'test_import')

# check path for new module_path in os.path
# and check if the module path is already in sys.path and that it's a valid location
if module_path not in sys.path:
  if os.path.exists(module_path):
    # If not, add it to sys.path
    sys.path.insert(0, module_path)  # Add to the beginning of the path list
    print("Python path updated:")
    # print paths as bulletpoints
    for path in sys.path:
      print(" -", path)

# Now you can import from test_external.py
# Reload the module in case it's code has changed. It seems to get cached when imported
import test_external
importlib.reload(test_external)

# Call the function from test_external.py
test_external.printSpecial()
```