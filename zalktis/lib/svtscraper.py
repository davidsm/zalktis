import tornado.gen
from tornado.httpclient import AsyncHTTPClient
from tornado.httputil import url_concat
import json
import urlparse
import logging


_URL_BASE = "https://www.svtplay.se"
_URL_API_BASE = "%s/api" % _URL_BASE
_URL_ALL_SHOWS = "%s/all_titles_and_singles" % _URL_API_BASE

_URL_GRAPHQL_API = "https://api.svt.se/contento/graphql?ua=svtplaywebb-play-render-prod-client"
_URL_VIDEO_API_BASE = "https://api.svt.se/video"

_URL_THUMBNAIL_BASE = "https://www.svtstatic.se/image"

_SHASUM_TITLE_PAGE = "4122efcb63970216e0cfb8abb25b74d1ba2bb7e780f438bbee19d92230d491c5"
_SHASUM_VIDEO_PAGE = "ae75c500d4f6f8743f6673f8ade2f8af89fb019d4b23f464ad84658734838c78"


logger = logging.getLogger("tornado.application")


class SVTScraper(object):

    def _format_show(self, show):
        return {
            "title": show["programTitle"],
            "id": show["contentUrl"]
        }

    def _build_episode_url(self, video_id):
        return "%s/%s" % (_URL_VIDEO_API_BASE, video_id)

    def _extract_title_page_episodes(self, json_data):
        seasons = [s for s in json_data["data"]["listablesBySlug"][0]["associatedContent"]
                   if s["type"] == "Season"]

        episodes = []

        for i, season in enumerate(seasons):
            for ii, episode in enumerate(season["items"]):
                item = episode["item"]
                episodes.append({
                    "title": item["nameRaw"],
                    "url": self._build_episode_url(item["videoSvtId"]),
                    "description": item["longDescription"],
                    "thumbnail": self._build_thumbnail_url(item["image"]["id"],
                                                           item["image"]["changed"]),
                    "duration": item["duration"],
                    # Only for sorting, the actual season/episode number doesn't matter
                    "season": i,
                    "episode": ii
                })

        return episodes

    def _extract_video_page_episodes(self, json_data):
        item = json_data["data"]["listablesByEscenicId"][0]
        episode = {
            "title": item["name"],
            "url": self._build_episode_url(item["videoSvtId"]),
            "description": item["longDescription"],
            "thumbnail": self._build_thumbnail_url(item["image"]["id"],
                                                   item["image"]["changed"]),
            "duration": item["duration"],
            "season": 0,
            "episode": 0
        }

        return [episode]

    def _build_thumbnail_url(self, img_id, changed):
        return "%s/wide/800/%s/%s?quality=70" % (_URL_THUMBNAIL_BASE,
                                                 img_id,
                                                 changed)

    def _strip_query_string(self, url):
        split_url = urlparse.urlsplit(url)
        return urlparse.urlunsplit((split_url.scheme, split_url.netloc, split_url.path, "", ""))

    @tornado.gen.coroutine
    def _get_graphql_json(self, operation, variables, shasum):
        url = self._build_graphql_query(operation,
                                        variables,
                                        shasum)

        logger.debug("Fetching episodes from %s", url)
        response = yield AsyncHTTPClient().fetch(url,
                                                 # For some reason, this is accepted,
                                                 # but whatever tornado uses per default isn't
                                                 headers={"User-Agent": "curl/7.47.0"})
        parsed_response = json.loads(response.body)
        raise tornado.gen.Return(parsed_response)

    def _build_graphql_query(self, operation, variables, shasum):
        params = {
            "operationName": operation,
            "variables": json.dumps(variables),
            "extensions": json.dumps({
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": shasum
                }
            })
        }
        return url_concat(_URL_GRAPHQL_API, params)

    @tornado.gen.coroutine
    def get_all_shows(self):
        response = yield AsyncHTTPClient().fetch(_URL_ALL_SHOWS)
        parsed_response = json.loads(response.body)
        all_shows = [self._format_show(show) for show in
                     parsed_response]
        # Sort by title here rather than on client (should be cheaper)
        raise tornado.gen.Return(sorted(all_shows, key=lambda s: s["title"]))

    @tornado.gen.coroutine
    def get_episodes_for_show(self, show_url):
        # SVTPlay uses two different formats for getting an episode listing from the shows listing:
        # First is /<slug>
        # Here you can use the TitlePage API to get the show page by querying by the slug
        #
        # The second format is /video/<id_of_show>/<slug>
        # Here you can extract the id and use it with the VideoPage API
        # (the TitlePage API will not contain enough info for this show)
        if show_url.startswith("/video/"):
            show_id = show_url.split("/")[2]
            parsed_response = yield self._get_graphql_json("VideoPage",
                                                           {"legacyIds": [show_id]},
                                                           _SHASUM_VIDEO_PAGE)
            episodes = self._extract_video_page_episodes(parsed_response)
        else:
            slug = show_url.lstrip("/")
            parsed_response = yield self._get_graphql_json("TitlePage",
                                                           {"titleSlugs": [slug]},
                                                           _SHASUM_TITLE_PAGE)
            episodes = self._extract_title_page_episodes(parsed_response)

        raise tornado.gen.Return(episodes)

    @tornado.gen.coroutine
    def get_video_url_for_episode(self, videos_list_url):
        logger.debug("Fetching available videos from %s", videos_list_url)
        response = yield AsyncHTTPClient().fetch(videos_list_url)
        parsed_response = json.loads(response.body)
        for video_listing in parsed_response["videoReferences"]:
            if video_listing["format"] == "hls":
                url = video_listing["url"]
                # SVTPlay's weird query strings can sometimes confuse OMXPlayer
                # to the point where it won't interpret the URL properly.
                # As the video URL seems to work fine without any query options,
                # just use the path
                raise tornado.gen.Return(self._strip_query_string(url))


if __name__ == "__main__":
    import tornado.ioloop
    logger.setLevel(logging.DEBUG)

    @tornado.gen.coroutine
    def self_test():
        scraper = SVTScraper()
        shows = yield scraper.get_all_shows()
        print shows[:5]
        episodes = yield scraper.get_episodes_for_show(shows[0]["id"])
        print episodes[:2]
        video_url = yield scraper.get_video_url_for_episode(episodes[0]["url"])
        print video_url

    io_loop = tornado.ioloop.IOLoop.current()
    io_loop.run_sync(self_test)
