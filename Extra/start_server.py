#!/usr/bin/env python3
"""Start the backend server."""
import os, sys
sys.path.insert(0, '/Users/alok/Desktop/smart-ai-doc-insights/backend')
os.chdir('/Users/alok/Desktop/smart-ai-doc-insights/backend')

import uvicorn
from main import app
uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')
