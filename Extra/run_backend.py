#!/usr/bin/env python3
"""Run backend server persistently."""
import os
import sys
import time
import signal
import subprocess

SERVER_SCRIPT = os.path.join(os.path.dirname(__file__), 'backend', 'main.py')

def start_server():
    proc = subprocess.Popen(
        [sys.executable, SERVER_SCRIPT],
        cwd=os.path.join(os.path.dirname(__file__), 'backend'),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    return proc

if __name__ == '__main__':
    proc = start_server()
    print(f'Backend started (PID: {proc.pid})')
    try:
        while True:
            line = proc.stdout.readline()
            if not line:
                break
            print(line.decode().rstrip())
    except KeyboardInterrupt:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait()
