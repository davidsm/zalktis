import tornado.web
import zalktis.handlers

routes = [
    tornado.web.url(r"/player", zalktis.handlers.OmxHandler),
    tornado.web.url(r"/system", zalktis.handlers.SystemHandler),
    tornado.web.url(r"/", zalktis.handlers.IndexHandler)
]
