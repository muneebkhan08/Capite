"""Tests for subtitle utility functions."""

import pytest


def test_is_latin_language():
    from subtitle_utils import is_latin_language
    assert is_latin_language("en") is True
    assert is_latin_language("es") is True
    assert is_latin_language("fr") is True
    assert is_latin_language("de") is True
    assert is_latin_language("ru") is False
    assert is_latin_language("zh") is False
    assert is_latin_language("ar") is False
    assert is_latin_language("ja") is False


def test_is_rtl_language():
    from subtitle_utils import is_rtl_language
    assert is_rtl_language("ar") is True
    assert is_rtl_language("he") is True
    assert is_rtl_language("fa") is True
    assert is_rtl_language("en") is False
    assert is_rtl_language("zh") is False


def test_get_script_config_known():
    from subtitle_utils import get_script_config
    name, config = get_script_config("en")
    assert name == "latin"
    assert config.char_width_ratio == 0.55
    assert config.font_scale == 1.0
    name, config = get_script_config("ja")
    assert name == "cjk"
    assert config.char_width_ratio == 1.05


def test_get_script_config_unknown():
    from subtitle_utils import get_script_config
    name, config = get_script_config("xx")
    assert name == "unknown"
    assert config.font_scale == 0.50


def test_get_subtitle_layout_latin():
    from subtitle_utils import get_subtitle_layout
    max_chars, font_scale = get_subtitle_layout("en", font_size=105)
    assert font_scale == 1.0
    assert max_chars > 10
    assert max_chars < 30


def test_get_subtitle_layout_cjk():
    from subtitle_utils import get_subtitle_layout
    max_chars_en, _ = get_subtitle_layout("en", font_size=105)
    max_chars_ja, _ = get_subtitle_layout("ja", font_size=105)
    assert max_chars_ja < max_chars_en


def test_strip_emojis():
    from subtitle_utils import strip_emojis
    assert strip_emojis("Hello World") == "Hello World"
    assert strip_emojis("Hello 😀 World") == "Hello  World"
    assert strip_emojis("🎉🎊") == ""
    assert strip_emojis("") == ""


def test_escape_ass_text():
    from subtitle_utils import escape_ass_text
    assert escape_ass_text("Hello") == "Hello"
    assert escape_ass_text("Hello\\World") == "Hello\\\\World"
    assert escape_ass_text("{bold}") == "\\{bold\\}"
    assert escape_ass_text("Line1\nLine2") == "Line1 Line2"


def test_escape_ass_text_combined():
    from subtitle_utils import escape_ass_text
    result = escape_ass_text("Hello\\{World}\nTest")
    assert result == "Hello\\\\\\{World\\} Test"
