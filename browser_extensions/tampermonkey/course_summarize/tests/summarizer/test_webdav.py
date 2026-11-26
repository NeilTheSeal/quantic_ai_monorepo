from summarizer.webdav import Entry, parse_propfind

XML = b"""<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:">
<D:response><D:href>/courses/</D:href><D:propstat><D:prop>
  <D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response>
<D:response><D:href>/courses/python_1_fundamentals/</D:href><D:propstat><D:prop>
  <D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response>
<D:response><D:href>/courses/a%20b.json</D:href><D:propstat><D:prop>
  <D:resourcetype/></D:prop></D:propstat></D:response>
</D:multistatus>"""


def test_parse_propfind_lists_children_without_the_folder_itself() -> None:
    assert parse_propfind(XML, "courses") == [
        Entry(name="a b.json", is_dir=False),
        Entry(name="python_1_fundamentals", is_dir=True),
    ]


def test_parse_propfind_accepts_a_trailing_slash_on_the_folder() -> None:
    assert len(parse_propfind(XML, "/courses/")) == 2


def test_parse_propfind_with_a_server_mounted_below_the_root() -> None:
    xml = XML.replace(b"<D:href>/courses", b"<D:href>/dav/courses")
    assert [e.name for e in parse_propfind(xml, "courses", "/dav/")] == [
        "a b.json",
        "python_1_fundamentals",
    ]
