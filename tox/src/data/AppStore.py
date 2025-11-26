import json
import time
import uuid

import threading
import subprocess
from subprocess import Popen, PIPE, STDOUT


class AppStore:
	"""
	AppStore description
	"""
	def __init__(self, ownerComp):
		# The component to which this extension is attached
		self.ownerComp = ownerComp
		self.initStore()
		self.initWebSocket()
		# python callbacks. there's some funkiness with cleanup that should be explored more
		self.listeners = []
		self.listenersByKey = {}

	def initStore(self):
		self.storeTable = op('table_store_dictionary')
		self.numericTable = op('datto_store_numbers')
		self.fileInTable = op('filein_backup')
		self.defaultsTable = op('in_default_values')
		return
	
	def getSenderId(self):
		return self.ownerComp.par.Senderid.eval()

	################################################### 
	# select node reference helpers
	################################################### 

	def GetStoreDat(self):
		return self.storeTable
	
	def GetStoreChop(self):
		return self.numericTable
	
	################################################### 
	# Getters
	################################################### 

	def HasValue(self, key):
		foundRow = self.storeTable.row(key)
		return foundRow != None

	def GetFloat(self, key, default=0.0):
		if self.numericTable[key] != None:
			return float(self.numericTable[key])
		else:
			return default
	
	def GetString(self, key, default=''):
		foundRow = self.storeTable.row(key)
		if foundRow != None:
			return self.storeTable[key, 1].val
		else:
			return default
		
	def GetBoolean(self, key, default=False):
		foundRow = self.storeTable.row(key)
		if foundRow != None:
			return True if self.storeTable[key, 1].val.lower() == 'true' else False
		else:
			return default
	
	################################################### 
	# Setters
	################################################### 

	def SetValue(self, key, value, type=None, sender=None, broadcast=False):
		if broadcast:
			self.broadcastValue(key, value, type)
		else:
			eventId = self.NewEventId()
			foundRow = self.storeTable.row(key)
			if foundRow != None:
				self.storeTable[key, 1] = value
				self.storeTable[key, 2] = type
				self.storeTable[key, 3] = sender or ''
				self.storeTable[key, 4] = eventId
			else:
				self.storeTable.appendRow([key, value, type, sender, eventId])
			# Notify listeners of the change
			self.NotifyListeners(key, value, type) 
		return
	
	def SetFloat(self, key, value, broadcast=False):
		self.SetValue(key, value, 'number', self.getSenderId(), broadcast)
		return
	
	def SetString(self, key, value, broadcast=False):
		self.SetValue(key, value, 'string', self.getSenderId(), broadcast)
		return
	
	def SetBoolean(self, key, value, broadcast=False):
		self.SetValue(key, value, 'boolean', self.getSenderId(), broadcast)
		return
	
	def broadcastValue(self, key, value, type):
		jsonOut = {}
		jsonOut['store'] = True
		jsonOut['key'] = key
		jsonOut['value'] = value
		jsonOut['type'] = type
		if self.getSenderId() != '':
			jsonOut['sender'] = self.getSenderId()
		op('websocket1').sendText(json.dumps(jsonOut))
	
	################################################### 
	# Event listener functions for Python extension use only
	################################################### 
	
	def AddListener(self, listener, key=None):
		# listen to all events if no key is specified
		if key == None:
			if listener not in self.listeners:
				self.listeners.append(listener)
				print(f"[AppStore] Added listener for *: {listener}")
				# listen to specific key events and call a function of that name, prefixed with 'On_'
		elif key != None and hasattr(listener, f'On_{key}'):
				keyListeners = self.listenersByKey.setdefault(key, [])
				if listener not in keyListeners:
						print(f"[AppStore] Adding listener for key '{key}': {listener}")
						keyListeners.append(listener)
		else:
				print(f"[AppStore] Listener already exists: {listener}")
		
		# Clean up any duplicate extensions as they were saved
		# When an extension is saved, it may create a dereferenced instance of itself
		self.CleanupDefunctListeners()

	def RemoveListener(self, listener):
		# remove listener from both the general list and the specific key list
		removed = False
		if listener in self.listeners:
			self.listeners.remove(listener)
			# print(f"[AppStore] RemoveListener() - Removed listener: {listener}")
			removed = True
		# remove from specific key listeners
		for key, listeners in self.listenersByKey.items():
			if listener in listeners:
				listeners.remove(listener)
				# print(f"[AppStore] RemoveListener() - Removed listener for key '{key}': {listener}")
				removed = True
		if not removed:	
			print(f"[AppStore] RemoveListener() - Listener not found: {listener}")

	def NotifyListeners(self, key, value, type):
		for listener in self.listeners:
			if hasattr(listener, 'OnAppStoreValueChanged'):
				listener.OnAppStoreValueChanged(key, value, type)
			else:
				print(f"[AppStore] Listener {listener} does not have OnAppStoreValueChanged method")
		for listener in self.listenersByKey.get(key, []):
			callback_fn = f'On_{key}'
			if hasattr(listener, callback_fn):
				getattr(listener, callback_fn)(key, value, type)
				# print(f"[AppStore] Notified listener {listener} for key '{key}': {value} (type: {type})")
			else:
				print(f"[AppStore] Listener {listener} does not have {callback_fn} method for key: {key}")
		# print(f"[AppStore] Notified {len(self.listeners)} listeners for key: {key}, value: {value}, type: {type}")


	def CleanupDefunctListeners(self):
			"""Remove old instances of listeners, keeping only the newest instance per ownerComp"""
			# Track the most recent listener for each ownerComp
			delCount = 0
			ownerComp_to_listener = {}
			
			# First pass: find the most recent listener for each ownerComp
			for listener in self.listeners:
				if hasattr(listener, 'ownerComp'):
					ownerComp_to_listener[listener.ownerComp] = listener
			
			# Second pass: remove old instances
			for i in range(len(self.listeners) - 1, -1, -1):
				listener = self.listeners[i]
				if hasattr(listener, 'ownerComp'):
					# If this listener is not the most recent for its ownerComp, remove it
					if ownerComp_to_listener[listener.ownerComp] is not listener:
						del self.listeners[i]
						delCount += 1
						print(f"[AppStore] Removed old listener instance: {listener}")
			
			# Clean up key-specific listeners the same way
			for key in list(self.listenersByKey.keys()):
				listeners = self.listenersByKey[key]
				ownerComp_to_listener = {}
				
				# Find most recent listener for each ownerComp
				for listener in listeners:
					if hasattr(listener, 'ownerComp'):
						ownerComp_to_listener[listener.ownerComp] = listener
				
				# Remove old instances
				for i in range(len(listeners) - 1, -1, -1):
					listener = listeners[i]
					if hasattr(listener, 'ownerComp'):
						if ownerComp_to_listener[listener.ownerComp] is not listener:
							del listeners[i]
							delCount += 1
							print(f"[AppStore] Removed old listener instance for key '{key}': {listener}")
				
				# Remove empty key entries
				if not listeners:
					del self.listenersByKey[key]

				if delCount > 0:
						print(f"[AppStore] CleanupDefunctListeners() - Removed {delCount} defunct listeners")

	################################################### 
	# Util
	################################################### 
	
	def ClearData(self):
		self.storeTable.clear()

	def RemoveValue(self, key, broadcast=False):
		foundRow = self.storeTable.row(key)
		if foundRow != None:
			self.storeTable.deleteRow(key)
			if broadcast:
				type = self.storeTable[key, 2] = type
				self.broadcastValue(key, None, type)
		return

	def NewEventId(self):
		return str(time.time()) + '-' + str(uuid.uuid4())

	################################################### 
	# WebSocket connection
	################################################### 

	def initWebSocket(self):
		self.setIsConnected(0)
		self.setColor(1, 1, 0)
		self.CheckSocketReconnect()
		return
	
	# if state is 0, allow button-click to run shell script
	def StartWebServer(self):
		if self.IsConnected() == False:
			print('[AppStore] Starting web server shell script...')
			thread = threading.Thread(target=self.StartWebServerThread)
			thread.start()
		else:
			print('[AppStore] Web server already running, skipping shell script')
		return

	def StartWebServerThread(self):
		# Start the subprocess and specify stdout and stderr to be piped
		p = Popen(['web-server-start.cmd'], cwd='scripts', stdout=PIPE, stderr=STDOUT, shell=True, text=True, bufsize=1)

		# Use a loop to read the output line by line as it becomes available
		for line in p.stdout:
			print(line, end='')  # Print each line of the output

		p.stdout.close()  # Close the stdout stream
		p.wait()  # Wait for the subprocess to exit
		return
	
	def OpenWebBrowser(self):
		print('[AppStore] OpenWebBrowser() does nothing right now')
		# ipAddr = op.SystemUtil.GetIpAddress()
		# op.SystemUtil.OpenURL("http://" + ipAddr + ":5173/") # app-store-distributed/index.html
	
	def setIsConnected(self, state):
		op('constant_active').par.value0 = state
		return
	
	def IsConnected(self):
		return op('constant_active').par.value0 == 1

	def CheckSocketReconnect(self):
		if self.IsConnected() == False:
			op('websocket1').par.active = 1
			op('websocket1').par.reset.pulse()
		return
	
	def SocketConnected(self, websocketDat):
		self.setIsConnected(1)
		self.setColor(0, 1, 0)
	
	def SocketDisconnected(self, websocketDat):
		self.setIsConnected(0)
		self.setColor(1, 1, 0)

	def MessageReceived(self, dat, rowIndex, message):
		# parse json as dictionary
		data = json.loads(message)

		# check for AppStoreDistributed message
		if('store' in data and data['store'] == True):
			# get key and value from AppStoreDistributed message
			# and intsert it into the storeTable
			key = data['key']
			value = data['value']
			type = data['type']
			sender = data['sender'] if 'sender' in data else '' #handle missing data
			self.SetValue(key, value, type, sender, False)
		else:
			print('Generic json message received')
		return

	################################################### 
	# Handle client connection
	################################################### 
	
	def HandleClientConnected(self):
		# run(lambda: self.BroadcastVals(), delayFrames=30) # frame delay to give the web app a moment to init
		return
	
	def BroadcastVals(self):
		# read list of keys from component, split on space, and loop through store, checking data type and broadcasting each value
		keys = self.ownerComp.par.Clientconnectedkeys.eval().split(' ')
		for key in keys:
			foundRow = self.storeTable.row(key)
			if foundRow != None:
				value = self.storeTable[key, 1]
				type = self.storeTable[key, 2].val
				if type == 'number':
					self.SetFloat(key, float(value), True)
				elif type == 'string':
					self.SetString(key, value.val, True)
				elif type == 'boolean':
					value = True if value.val.lower() == 'true' else False
					self.SetBoolean(key, value, True)
		
		return

	################################################### 
	# Defaults input table
	################################################### 

	def SetDefaults(self, force=False):
		print('[AppStore] SetDefaults')
		if self.defaultsTable.numRows == 0:
			print('[AppStore] No defaults to set')
			return
		for row in self.defaultsTable.rows():
			key = row[0].val
			value = row[1].val
			type = row[2].val
			if len(key) > 0 and len(value) > 0 and len(type) > 0: # check for empty values before applying onTableChange
				if self.HasValue(key) == False or force: # only set defaults if the key doesn't exist or force is True
					self.SetValue(key, value, type, self.getSenderId(), False)
		return

	################################################### 
	# File save/load
	################################################### 

	def SaveFile(self):
		filePath = self.ownerComp.par.Backupfile.eval()
		if filePath != '':
			print('[AppStore] SaveFile: ' + filePath)
			self.storeTable.save(filePath, createFolders=True) # save tsv to disk
		return
	
	def LoadFile(self):
		filePath = self.ownerComp.par.Backupfile.eval()
		if filePath != '':
			print('[AppStore] LoadFile: ' + filePath)
			self.fileInTable.par.refreshpulse.pulse() # refresh file from disk
			self.storeTable.copy(self.fileInTable) # copy table over main store table
		return

	################################################### 
	# Debug
	################################################### 

	def PrintValues(self):
		print('=== AppStore values: ===')
		for row in self.storeTable.rows():
			print(row[0] + ': ' + row[1] + ' (' + row[2] + ')')
		print('========================')
		return

	def setColor(self, r, g, b):
		opColorIndicator = op('constant_active_color')
		opColorIndicator.par.colorr = r
		opColorIndicator.par.colorg = g
		opColorIndicator.par.colorb = b
		self.ownerComp.color = (r, g, b)
		return

