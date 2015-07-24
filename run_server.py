#!/usr/bin/env python

import tornado.ioloop
import tornado.options
import tornado.web

import zalktis.routes

import os


DEFAULT_PORT = 8080

if __name__ == "__main__":
    tornado.options.parse_command_line()
    base_dir = os.path.dirname(__file__)
    settings = {
        "template_path": os.path.join(base_dir, "templates"),
        "static_path": os.path.join(base_dir, "dist"),
        "debug": True
        }
    app = tornado.web.Application(zalktis.routes.routes, **settings)
    port = os.getenv("ZALKTIS_PORT") or DEFAULT_PORT

    app.listen(port)
    tornado.ioloop.IOLoop.current().start()
