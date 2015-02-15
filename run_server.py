#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.process
import json


class OmxHandler(tornado.web.RequestHandler):
    def prepare(self):
        self.data = json.loads(self.request.body)

    def post(self):
        stream_uri = "%s://%s:%s" % (self.data["protocol"], self.data["uri"], self.data["port"])
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", stream_uri]
        tornado.process.Subprocess(omx_command)
        self.write({"status": "OK"})

if __name__ == "__main__":
    app = tornado.web.Application([tornado.web.url(r"/play", OmxHandler)])
    app.listen(8080)
    tornado.ioloop.IOLoop.current().start()
