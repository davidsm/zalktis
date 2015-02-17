#!/usr/bin/env python

import redis
import json
import subprocess

def on_system_message(raw_message):
    try:
        message = json.loads(raw_message["data"])
    except ValueError:
        # Should probably log this or something
        pass
    else:
        if message["command"] == "shutdown":
            subprocess.Popen(["shutdown", "-h", "now"])

r = redis.StrictRedis(unix_socket_path="/tmp/redis.sock")
pubsub = r.pubsub()
pubsub.subscribe(**{"system": on_system_message})

for message in pubsub.listen():
    print "Got a message"
