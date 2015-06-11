from tornado.web import url

import zalktis.handlers
import zalktis.controlhandlers

routes = [
    # Command endpoints
    url(r"/player", zalktis.handlers.OmxHandler),
    url(r"/system", zalktis.handlers.SystemHandler),
    url(r"/svtplay", zalktis.handlers.SVTPlayHandler),
    url(r"/test", zalktis.handlers.TestHandler),

    # WebSocket control
    url(r"/controller", zalktis.controlhandlers.ControlHandler),

    # Pages
    url(r"/control", zalktis.handlers.PageHandler),
    url(r"/", zalktis.handlers.PageHandler, {"page": "index.html"})
]
