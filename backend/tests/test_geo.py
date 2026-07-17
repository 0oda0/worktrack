"""Геозона: полигон (point-in-polygon) с откатом на круг."""

from app.services.geo import is_out_of_zone, point_in_polygon

# квадрат вокруг центра Москвы, кольцо GeoJSON — пары [lng, lat]
RING = [[37.61, 55.75], [37.62, 55.75], [37.62, 55.76], [37.61, 55.76], [37.61, 55.75]]
INSIDE = (55.7558, 37.6173)  # (lat, lng)
OUTSIDE = (55.7700, 37.6173)  # севернее квадрата


def test_point_in_polygon_inside():
    assert point_in_polygon(*INSIDE, RING) is True


def test_point_in_polygon_outside():
    assert point_in_polygon(*OUTSIDE, RING) is False


def test_zone_uses_polygon_when_set():
    # полигон задан — радиус игнорируется
    assert is_out_of_zone(*INSIDE, RING, 0.0, 0.0, 1.0) is False
    assert is_out_of_zone(*OUTSIDE, RING, 0.0, 0.0, 1.0) is True


def test_zone_falls_back_to_circle():
    # полигона нет — считаем по кругу (центр Москвы, 200 м)
    assert is_out_of_zone(*INSIDE, None, 55.7558, 37.6173, 200.0) is False
    assert is_out_of_zone(*OUTSIDE, None, 55.7558, 37.6173, 200.0) is True
