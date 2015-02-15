import tornado.ioloop
import tornado.web
import tornado.process
import json


class OmxHandler(tornado.web.RequestHandler):
    def prepare(self):
        self.data = json.loads(self.request.body)

    def post(self):
        stream_uri = "%s://%s:%s" % (self.data.protocol, self.data.uri, self.data.port)
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", stream_uri]

app = tornado.web.Application([tornado.web.url(r"/play", MainHandler)])
app.listen(8080)
tornado.ioloop.IOLoop.current().start()
