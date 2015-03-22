import tornado.web
import zalktis.handlers

routes = [
    tornado.web.url(r"/player", zalktis.handlers.OmxHandler),
    tornado.web.url(r"/system", zalktis.handlers.SystemHandler),
    tornado.web.url(r"/svtplay", zalktis.handlers.SVTPlayHandler),
    tornado.web.url(r"/test", zalktis.handlers.TestHandler),
    tornado.web.url(r"/", zalktis.handlers.IndexHandler)
]
