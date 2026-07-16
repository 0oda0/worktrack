from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_M = 6_371_000


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Расстояние между двумя точками в метрах."""
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_M * asin(sqrt(a))


def is_out_of_zone(
    lat: float, lng: float, office_lat: float, office_lng: float, radius_m: float
) -> bool:
    return haversine_m(lat, lng, office_lat, office_lng) > radius_m
