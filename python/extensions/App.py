# Python standard lib imports
import os
import sys
import importlib

# Add base modules to allow for further imports, specifically `config`
utils_path = os.path.join(project.folder, 'python', 'util')
if utils_path not in sys.path:
	sys.path.append(utils_path) 

# Custom imports
import config

class App:
	"""
	:: App Extension Class ::
	
	This class is intended to be the top-level extension for the application.
	It is designed to be attached to the main /project component of the project
	and serves as a central point for initializing the application state.

	- This file/extension is loaded when the project starts
	- This file is reloaded when the text is saved
	- This file is externalized to the `python/extensions` directory  
	"""
	def __init__(self, ownerComp):
		self.ownerComp = ownerComp
		print("=============================================")
		print("[App] Initializing...")
		self.reloadImports() # only necessary during development, to reload the config module
		self.addPythonUtilsPath()
		self.appInit()
		print("[App] Initialized!")
		print("=============================================") 

	# Reloads imported Python modules to ensure any changes are applied
	# This is useful during development when you want to see changes without restarting the project.
	# Note: This is not needed in production code
	def reloadImports(self):
		importlib.reload(config)

	# Add the path to the Python utils directory to sys.path
	# This allows importing modules from that directory
	# and ensures that the utils are available for use in the project. 
	def addPythonUtilsPath(self):
		print('[App] Adding Python utils path to sys.path')
		utils_path = os.path.join(project.folder, 'python', 'util')
		if utils_path not in sys.path:
			sys.path.append(utils_path) 

	def appInit(self):
		# Initialize the application state here - this would be custom per application
		self.loadEnvVars()
		self.loadPythonModules()
		return
	
	def loadEnvVars(self): 
		# Make sure AppStore has the latest defaults set
		op.AppStore.par.Applydefaults.pulse()
		# Load .env file and system environment vars
		# The order here would override any loaded vars with the last loaded value 
		config.LoadEnvFile() # defaults to loading the .env file in the project root, but an optional path can be passed in
		config.LoadSystemEnvironmentVar('sys_env_var', 'Default Value') # set by a shell script before launching the .toe: `set sys_env_var=Something`
	
	def loadPythonModules(self):
		# Add any extra python environments/modules 
		# config.AddPyDirToPath(os.path.join(project.folder, 'python', 'other_modules')) # add more python modules to sys.path if desired
		# config.AddCondaEnvToPath("cacheflowe", "td-onnx")
		config.AddPyDirToPath(os.path.join(project.folder, 'python', '_local_modules'))
		config.PrintPythonPath()
