"""Формат Excel-экспорта: детализация по сессиям + Итого (как в эталоне сектора)."""

from datetime import timedelta

from app.services.reports import export_workbook

REPORT = [
    {
        "full_name": "Иванов Иван",
        "email": "ivan@mtuci.ru",
        "audience": "203",
        "sessions": [
            {"start": "2026-07-17 10:00:00", "end": None, "duration": None},  # открытая
            {
                "start": "2026-07-16 09:00:00",
                "end": "2026-07-16 18:00:00",
                "duration": timedelta(hours=9),
            },
        ],
        "total": timedelta(hours=9),
    }
]


def test_export_workbook_matches_reference_format():
    ws = export_workbook(REPORT, "Отчёт").active

    assert ws.title == "Отчёт"
    assert [c.value for c in ws[1]] == [
        "ФИО",
        "Telegram Username",
        "Сектор",
        "Начало сессии",
        "Конец сессии",
        "Длительность сессии",
    ]

    # открытая сессия — есть начало, нет конца/длительности
    assert (ws["A2"].value, ws["B2"].value, ws["C2"].value) == ("Иванов Иван", "ivan@mtuci.ru", "203")
    assert ws["D2"].value == "2026-07-17 10:00:00"
    assert ws["E2"].value is None and ws["F2"].value is None

    # закрытая сессия — длительность как настоящий Excel-интервал
    assert ws["E3"].value == "2026-07-16 18:00:00"
    assert ws["F3"].value == timedelta(hours=9)
    assert ws["F3"].number_format == "[h]:mm:ss"

    # строка «Итого, ФИО» с суммой длительностей
    assert ws["A4"].value == "Итого, Иванов Иван"
    assert ws["F4"].value == timedelta(hours=9)

    # пустая строка-разделитель между сотрудниками
    assert all(c.value is None for c in ws[5])

    # ширины колонок как в эталоне
    assert ws.column_dimensions["A"].width == 40
    assert ws.column_dimensions["F"].width == 22
