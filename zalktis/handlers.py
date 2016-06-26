import json
import logging
import os

import tornado.process
import tornado.web
import tornado.gen

import zalktis.pubsub
import zalktis.lib.svtscraper


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
        response = yield getattr(self, "cmd_%s" % self.command)()
        self.write(response)
        self.finish()

    def write_error(self, message):
        self.set_status(400)
        self.write({"status": "Failure", "error": message})
        self.finish()


class SystemHandler(CommandHandler):
    @tornado.gen.coroutine
    def cmd_shutdown(self):
        zalktis.pubsub.get_pubsub_connection(zalktis.pubsub.PUBSUB_CONNECTION_ADDRESS) \
                      .publish("system", json.dumps({"command": "shutdown"}))
        raise tornado.gen.Return({"status": "OK"})


class OmxHandler(CommandHandler):
    def options(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.set_header("Access-Control-Allow-Headers", 'Content-Type')

    @tornado.gen.coroutine
    def cmd_play(self):
        logging.info("Playing %s" % self.args["uri"])
        omx_command = ["omxplayer", "-o", "hdmi", "--timeout",
                       "30", "-r", self.args["uri"]]
        tornado.process.Subprocess(omx_command)
        raise tornado.gen.Return({"status": "OK"})

    def post(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        super(OmxHandler, self).post()


class TestHandler(CommandHandler):
    @tornado.gen.coroutine
    def cmd_test(self):
        logger = logging.getLogger("tornado.application")
        logger.info("Got call to test: Command: %s, Arguments: %s" % (self.command, self.args))
        raise tornado.gen.Return({"status": "OK"})


class SVTPlayHandler(CommandHandler):
    @tornado.gen.coroutine
    def cmd_get_all_shows(self):
        scraper = zalktis.lib.svtscraper.SVTScraper()
        shows = yield scraper.get_all_shows()
        raise tornado.gen.Return({"status": "OK", "value": shows})

    @tornado.gen.coroutine
    def cmd_get_episodes_for_show(self):
        scraper = zalktis.lib.svtscraper.SVTScraper()
        episodes = yield scraper.get_episodes_for_show(self.args["id"])
        raise tornado.gen.Return({"status": "OK", "value": episodes})

    @tornado.gen.coroutine
    def cmd_get_video_url_for_episode(self):
        scraper = zalktis.lib.svtscraper.SVTScraper()
        url = yield scraper.get_video_url_for_episode(self.args["episode_url"])
        raise tornado.gen.Return({"status": "OK", "value": url})


class PageHandler(tornado.web.RequestHandler):
    def initialize(self, page=None):
        if not page:
            self.page = "%s.html" % os.path.basename(self.request.path)
        else:
            self.page = page

    def get(self):
        self.render(self.page)
