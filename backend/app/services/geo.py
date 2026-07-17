from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_M = 6_371_000


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Расстояние между двумя точками в метрах."""
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_M * asin(sqrt(a))


def point_in_polygon(lat: float, lng: float, ring: list[list[float]]) -> bool:
    """Точка (lat,lng) внутри кольца GeoJSON (пары [lng,lat]). Ray casting, x=lng, y=lat."""
    x, y = lng, lat
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            x_cross = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < x_cross:
                inside = not inside
    return inside


def is_out_of_zone(
    lat: float,
    lng: float,
    polygon: list[list[float]] | None,
    office_lat: float,
    office_lng: float,
    radius_m: float,
) -> bool:
    """Полигон задан — считаем point-in-polygon; иначе откат на круг (центр+радиус)."""
    if polygon:
        return not point_in_polygon(lat, lng, polygon)
    return haversine_m(lat, lng, office_lat, office_lng) > radius_m


if __name__ == "__main__":
    _ring = [[0, 0], [10, 0], [10, 10], [0, 10]]
    assert point_in_polygon(5, 5, _ring) is True
    assert point_in_polygon(15, 5, _ring) is False
    assert is_out_of_zone(5, 5, _ring, 0, 0, 1) is False
    assert is_out_of_zone(0.001, 0.001, None, 0, 0, 200) is False
    print("geo self-check ok")
