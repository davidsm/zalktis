#!/usr/bin/env python

import tornado.ioloop
import tornado.options
import tornado.web

import zalktis.routes

import os.path


if __name__ == "__main__":
    tornado.options.parse_command_line()
    base_dir = os.path.dirname(__file__)
    settings = {
        "template_path": os.path.join(base_dir, "templates"),
        "static_path": os.path.join(base_dir, "static"),
        "debug": True
        }
    app = tornado.web.Application(zalktis.routes.routes, **settings)
    app.listen(8080)
    tornado.ioloop.IOLoop.current().start()
