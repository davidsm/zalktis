from tornado.web import url
import zalktis.handlers

routes = [
    url(r"/player", zalktis.handlers.OmxHandler),
    url(r"/system", zalktis.handlers.SystemHandler),
    url(r"/svtplay", zalktis.handlers.SVTPlayHandler),
    url(r"/test", zalktis.handlers.TestHandler),
    url(r"/control", zalktis.handlers.ControlHandler),
    url(r"/", zalktis.handlers.IndexHandler)
]
