import sys
import os

def PrintPythonPath():
	if parent().par.Debug.eval() == 1:
		print('Python sys.path:')
		for path in sys.path:
			print(" -", path)


def addPythonUtilsToPath():
	# Construct the path to the util directory
	utils_path = os.path.join(project.folder, 'python', 'util')

	# Print the module path to verify it
	print("============================================")
	print("Loading Python utils from path:")
	print(utils_path)

	# check path for new utils_path in os.path
	# and check if the module path is already in sys.path and that it's a valid location
	if utils_path not in sys.path:
		if os.path.exists(utils_path):
			# If not, add it to sys.path
			sys.path.insert(0, utils_path)  # Add to the beginning of the path list
			print("python/util imports are ready!")
			PrintPythonPath()

	else:
		print('HaxLib Python utils already loaded!')
	PrintPythonPath()
	print("============================================")	

	"""
	Example usage:

	import system_util
	import importlib
	importlib.reload(system_util) # needed to reload module code, since it's cached when imported the first time
	print('get_ip_address():', system_util.get_ip_address())
	"""
	
def onStart():
	addPythonUtilsToPath()
	return

