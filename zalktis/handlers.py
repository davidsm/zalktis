import tornado.process
import tornado.web
import tornado.gen

import zalktis.pubsub
import json
import logging

class CommandHandler(tornado.web.RequestHandler):
    def prepare(self):
        if self.request.method == "POST":
            try:
                data = json.loads(self.request.body)
            except ValueError:
                self.write_error("Malformed JSON")
            else:
                if "command" in data and hasattr(self, "cmd_%s" % data["command"]):
                    self.command = data["command"]
                else:
                    self.write_error("Unknown command")
                if "args" in data:
                    self.args = data["args"]
                else:
                    self.args = None

    @tornado.gen.coroutine
    def post(self):
        getattr(self, "cmd_%s" % self.command)()
    
    def write_error(self, message):
        self.set_status(400)
        self.write({"status": "Failure", "error": message})
        self.finish()
                

class SystemHandler(CommandHandler):
    def cmd_shutdown(self):
        zalktis.pubsub.get_pubsub_connection(zalktis.pubsub.PUBSUB_CONNECTION_ADDRESS) \
                      .publish("system", json.dumps({"command": "shutdown"}))
        self.write({"status": "OK"})
        self.finish()


class OmxHandler(CommandHandler):
    def options(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.set_header("Access-Control-Allow-Headers", 'Content-Type')

    def cmd_play(self):
        stream_uri = "%s://%s" % (self.args["protocol"], self.args["uri"])
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", stream_uri]
        tornado.process.Subprocess(omx_command)
        self.write({"status": "OK"})
        self.finish()

    def post(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        super(OmxHandler, self).post()
           

class TestHandler(CommandHandler):

    def cmd_test(self):
        logger = logging.getLogger("tornado.application")
        logger.info("Got call to test: Command: %s, Arguments: %s" % (self.command, self.args))
        self.write({"status": "OK"})
        self.finish()
        

class SVTPlayHandler(CommandHandler):
    pass

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")
