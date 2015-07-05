import json
import logging

import tornado.websocket

logger = logging.getLogger("tornado.application")


class WebSocketEventHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        self.set_nodelay(True)

    def on_message(self, message):
        try:
            parsed_message = json.loads(message)
        except ValueError:
            logger.warning("Malformed message: not valid JSON")
            return

        try:
            event = parsed_message["event"]
            args = parsed_message["args"]
            client_type = parsed_message["client_type"]
        except KeyError:
            logger.warning("Malformed message: (missing field); message %s" %
                           parsed_message)
            return

        event_handler_name = "on_%s" % event.replace("-", "_")
        if hasattr(self, event_handler_name):
            getattr(self, event_handler_name)(client_type, **args)
        else:
            self.default_on_message(event, client_type, **args)


class ControlHandler(WebSocketEventHandler):
    clients = {
        "screen": [],
        "control": []
    }

    def __init__(self, *args, **kwargs):
        self.client_type = None
        super(ControlHandler, self).__init__(*args, **kwargs)

    def on_join(self, client_type):
        if client_type in self.clients and self not in self.clients[client_type]:
            self.clients[client_type].append(self)
        self.client_type = client_type

        self.notify(self.get_counterpart(self.client_type), "join",
                    what=client_type)

    def on_close(self):
        if self in self.clients[self.client_type]:
            self.clients[self.client_type].remove(self)

    def default_on_message(self, event, client_type, **kwargs):
        self.notify(self.get_counterpart(client_type), event,
                    **kwargs)

    def get_counterpart(self, client_type):
        if client_type == "screen":
            return "control"
        else:
            return "screen"

    def notify(self, client_type, event, **kwargs):
        message = {"event": event, "args": kwargs}
        for client in self.clients[client_type]:
            client.write_message(message)
