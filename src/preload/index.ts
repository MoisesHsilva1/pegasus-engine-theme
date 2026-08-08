import { contextBridge } from 'electron'
import { api } from './api'

// Safely expose pegasus API to renderer window context
contextBridge.exposeInMainWorld('pegasus', api)
