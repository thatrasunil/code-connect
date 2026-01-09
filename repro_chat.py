
import socketio
import time
import sys
import threading

# Two clients
sio1 = socketio.Client()
sio2 = socketio.Client()

received_by_2 = False

@sio2.on('new-message')
def on_new_message(data):
    global received_by_2
    print(f"Client 2 Received: {data}")
    received_by_2 = True

def run_client1():
    try:
        sio1.connect('http://localhost:8000')
        sio1.emit('join-room', ('debug-room', 'User1'))
        time.sleep(1)
        print("Client 1 Sending message...")
        sio1.emit('send-message', {
            'roomId': 'debug-room',
            'content': 'Hello from User1',
            'userId': 'User1'
        })
        time.sleep(3)
        sio1.disconnect()
    except Exception as e:
        print(f"Client 1 Error: {e}")

def run_client2():
    try:
        sio2.connect('http://localhost:8000')
        sio2.emit('join-room', ('debug-room', 'User2'))
        # Keep running
        sio2.wait()
    except Exception as e:
        print(f"Client 2 Error: {e}")

# Start Client 2 in background
t2 = threading.Thread(target=run_client2)
t2.daemon = True
t2.start()

time.sleep(1)

# Run Client 1
run_client1()

if received_by_2:
    print("TEST PASSED: Client 2 received the message.")
    sys.exit(0)
else:
    print("TEST FAILED: Client 2 did NOT receive the message.")
    sys.exit(1)
