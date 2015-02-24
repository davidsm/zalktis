import redis

PUBSUB_CONNECTION_ADDRESS = "/tmp/redis.sock"

class RedisManager(object):
    """Thin wrapper around a Redis connection,
    mainly for connection reuse in multiple modules"""
    def __init__(self, address):
        self._redis = redis.StrictRedis(unix_socket_path=address)
        self._pubsub = self._redis.pubsub()

    def publish(self, channel, data):
        self._redis.publish(channel, data)

    def subscribe(self, **kwargs):
        self._pubsub.subscribe(**kwargs)


class cached_connection(object):
    def __init__(self, func):
        self.func = func
        self.connections = {}

    def __call__(self, addr, *args):
        if addr in self.connections:
            return self.connections[addr]
        else:
            conn = self.func(addr, *args)
            self.connections[addr] = conn
            return conn
                
@cached_connection
def get_pubsub_connection(address):
    return RedisManager(address)
