#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.process
import tornado.options
import json
import redis

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
            r.publish("system", json.dumps({"command": "shutdown"}))
            self.write({"status": "OK"})

class OmxHandler(JsonHandler):
    def post(self):
        stream_uri = "%s://%s:%s" % (self.data["protocol"], self.data["uri"], self.data["port"])
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", stream_uri]
        tornado.process.Subprocess(omx_command)
        self.write({"status": "OK"})

if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = tornado.web.Application([tornado.web.url(r"/play", OmxHandler),
                                   tornado.web.url(r"/system", SystemHandler)])
    app.listen(8080)
    r = redis.StrictRedis(unix_socket_path="/tmp/redis.sock")
    tornado.ioloop.IOLoop.current().start()
