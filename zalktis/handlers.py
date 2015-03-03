import tornado.process
import tornado.web

import zalktis.pubsub
import json
import logging

class JsonHandler(tornado.web.RequestHandler):
    def prepare(self):
        if self.request.method == "POST":
            try:
                self.data = json.loads(self.request.body)
            except ValueError:
                self.set_status(400)
                self.write({"status": "Failure", "error": "Malformed JSON"})
                self.finish()
                

class SystemHandler(JsonHandler):
    def post(self):
        if self.data["command"] == "shutdown":
            zalktis.pubsub.get_pubsub_connection(zalktis.pubsub.PUBSUB_CONNECTION_ADDRESS) \
                          .publish("system", json.dumps({"command": "shutdown"}))
            self.write({"status": "OK"})

class OmxHandler(JsonHandler):
    def options(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.set_header("Access-Control-Allow-Headers", 'Content-Type')

    def post(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        if self.data["command"] == "play":
            stream_uri = "%s://%s" % (self.data["args"]["protocol"], self.data["args"]["uri"])
            omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                           "30", "-r", stream_uri]
            tornado.process.Subprocess(omx_command)
            self.write({"status": "OK"})

class TestHandler(JsonHandler):
    def post(self):
        logger = logging.getLogger("tornado.application")
        logger.info("Got call to test: Command: %s, Arguments: %s" % (self.data["command"], self.data["args"]))
        self.write({"status": "OK"})

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")
