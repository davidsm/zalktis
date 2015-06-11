import json

import tornado.websocket


class WebSocketEventHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        self.set_nodelay(True)

    def on_message(self, message):
        parsed_message = json.loads(message)
        getattr(self, "on_%s" % parsed_message["event"])(**parsed_message["args"])


class ControlHandler(WebSocketEventHandler):
    clients = {
        "screen": [],
        "control": []
    }

    def on_join(self, client_type):
        if client_type in self.clients and self not in self.clients[client_type]:
            self.clients[client_type].append(self)
        self.client_type = client_type

        self.notify(self.get_counterpart(self.client_type), "join")

    def on_close(self):
        if self in self.clients[self.client_type]:
            self.clients[self.client_type].remove(self)

    def get_counterpart(self, client_type):
        if client_type == "screen":
            return "control"
        else:
            return "screen"
            
    def notify(self, client_type, event, **kwargs):
        message = {"event": event, "args": kwargs}
        for client in self.clients[client_type]:
            client.write_message(message)
