#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.process
import tornado.options
import json
import zalktis.pubsub
import os.path

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
    def post(self):
        stream_uri = "%s://%s:%s" % (self.data["protocol"], self.data["uri"], self.data["port"])
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", stream_uri]
        tornado.process.Subprocess(omx_command)
        self.write({"status": "OK"})

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

if __name__ == "__main__":
    tornado.options.parse_command_line()
    base_dir = os.path.dirname(__file__)
    settings = {
        "template_path": os.path.join(base_dir, "templates"),
        "static_path": os.path.join(base_dir, "static"),
        "debug": True
        }
    app = tornado.web.Application([
            tornado.web.url(r"/play", OmxHandler),
            tornado.web.url(r"/system", SystemHandler),
            tornado.web.url(r"/", IndexHandler)
            ], **settings)
    app.listen(8080)
    tornado.ioloop.IOLoop.current().start()
