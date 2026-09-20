"""Tests for ASS subtitle generation."""
import os
import tempfile
import pytest

@pytest.fixture
def sample_transcript():
    return {
        "language": "en",
        "segments": [{
            "start": 0.0, "end": 3.0, "text": "Hello world how are you",
            "words": [
                {"word": "Hello", "start": 0.0, "end": 0.5},
                {"word": "world", "start": 0.6, "end": 1.0},
                {"word": "how", "start": 1.1, "end": 1.4},
                {"word": "are", "start": 1.5, "end": 1.7},
                {"word": "you", "start": 1.8, "end": 2.0},
            ],
        }],
    }

@pytest.fixture
def output_path():
    fd, path = tempfile.mkstemp(suffix=".ass")
    os.close(fd)
    yield path
    if os.path.exists(path):
        os.unlink(path)

def test_generate_ass_creates_file(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(sample_transcript, 0, 3.0, output_path, caption_style="hormozi", caption_position=10, language="en", video_width=1080, video_height=1920)
    assert result is True
    assert os.path.exists(output_path)
    assert os.path.getsize(output_path) > 0

def test_generate_ass_contains_style_info(sample_transcript, output_path):
    from subtitles import generate_ass
    generate_ass(sample_transcript, 0, 3.0, output_path, caption_style="hormozi", language="en", video_width=1080, video_height=1920)
    with open(output_path, "r") as f:
        content = f.read()
    assert "[Script Info]" in content
    assert "[V4+ Styles]" in content
    assert "[Events]" in content
    assert "PlayResX: 1080" in content
    assert "PlayResY: 1920" in content

def test_generate_ass_contains_dialogue(sample_transcript, output_path):
    from subtitles import generate_ass
    generate_ass(sample_transcript, 0, 3.0, output_path, caption_style="hormozi", language="en", video_width=1080, video_height=1920)
    with open(output_path, "r") as f:
        content = f.read()
    assert "Dialogue:" in content

def test_generate_ass_different_styles(sample_transcript, output_path):
    from subtitles import generate_ass
    from caption_styles import CAPTION_STYLES

    for style in CAPTION_STYLES.keys():
        result = generate_ass(sample_transcript, 0, 3.0, output_path, caption_style=style, language="en", video_width=1080, video_height=1920)
        assert result is True, f"Style {style} failed"
        assert os.path.getsize(output_path) > 0, f"Style {style} produced empty file"

def test_generate_ass_empty_transcript(output_path):
    from subtitles import generate_ass
    empty = {"language": "en", "segments": []}
    result = generate_ass(empty, 0, 3.0, output_path, caption_style="hormozi", language="en", video_width=1080, video_height=1920)
    assert result is False

def test_generate_ass_non_latin(output_path):
    from subtitles import generate_ass
    transcript = {"language": "ja", "segments": [{"start": 0.0, "end": 2.0, "text": "Hello", "words": [{"word": "Hello", "start": 0.0, "end": 1.0}]}]}
    result = generate_ass(transcript, 0, 2.0, output_path, caption_style="hormozi", language="ja", video_width=1080, video_height=1920)
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "IBM Plex Sans" in content

def test_generate_ass_landscape_dimensions(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(sample_transcript, 0, 3.0, output_path, caption_style="hormozi", language="en", video_width=1920, video_height=1080)
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "PlayResX: 1920" in content
    assert "PlayResY: 1080" in content


def test_generate_ass_custom_font(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        custom_font="Plus Jakarta Sans",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "Plus Jakarta Sans" in content


def test_generate_ass_weight_transition_light_to_bold(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        weight_transition="light-to-bold",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "\\b900" in content
    assert "\\b300" in content


def test_generate_ass_weight_transition_bold_to_light(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        weight_transition="bold-to-light",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "\\b300" in content
    assert "\\b900" in content


def test_generate_ass_crimson_pop_box(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="crimson-pop", language="en",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    # Check that style has BorderStyle=3 (box)
    assert "BorderStyle" in content
    # Check that active word has \3a&H00& (solid box) and \3c
    assert "\\3a&H00&" in content


def test_generate_ass_custom_colors(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="crimson-pop", language="en",
        primary_color="#00FF00", # Pure green -> ASS BGR &H0000FF00
        highlight_color="#0000FF", # Pure blue in RGB -> ASS BGR &H00FF0000
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    # ASS BGR for #00FF00 is &H0000FF00
    assert "&H0000FF00" in content
    # ASS BGR for #0000FF is &H00FF0000
    assert "\\3c&H00FF0000" in content


def test_generate_ass_background_color_none(sample_transcript, output_path):
    import pysubs2
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="crimson-pop", language="en",
        background_color="none",
    )
    assert result is True
    subs = pysubs2.load(output_path)
    # BorderStyle should be 1 (standard text), not 3 (box)
    assert subs.styles["Default"].borderstyle == 1
    # Solid box activation tag \3a&H00& should NOT be in events
    with open(output_path, "r") as f:
        content = f.read()
    assert "\\3a&H00&" not in content


def test_generate_ass_background_color_custom(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="crimson-pop", language="en",
        background_color="#00FF00",  # green -> &H0000FF00
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    # Active word box color should use custom background color
    assert "\\3c&H0000FF00" in content


def test_generate_ass_outline_color_none(sample_transcript, output_path):
    import pysubs2
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        outline_color="none",
    )
    assert result is True
    subs = pysubs2.load(output_path)
    # Outline and shadow should be 0
    assert subs.styles["Default"].outline == 0.0
    assert subs.styles["Default"].shadow == 0.0


def test_generate_ass_font_style_italic(sample_transcript, output_path):
    import pysubs2
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        font_style="italic",
    )
    assert result is True
    subs = pysubs2.load(output_path)
    assert subs.styles["Default"].italic is True


def test_generate_ass_font_style_normal(sample_transcript, output_path):
    import pysubs2
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="luxury", language="en",  # luxury defaults to italic
        font_style="normal",
    )
    assert result is True
    subs = pysubs2.load(output_path)
    assert subs.styles["Default"].italic is False


def test_generate_ass_text_casing_title(sample_transcript, output_path):
    from subtitles import generate_ass
    result = generate_ass(
        sample_transcript, 0, 3.0, output_path,
        caption_style="hormozi", language="en",
        text_casing="title",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "Hello" in content
    assert "World" in content


def test_generate_ass_text_casing_original(output_path):
    from subtitles import generate_ass
    transcript = {
        "language": "en",
        "segments": [{
            "start": 0.0, "end": 2.0, "text": "iPhone and YouTube",
            "words": [
                {"word": "iPhone", "start": 0.0, "end": 0.8},
                {"word": "and", "start": 0.9, "end": 1.1},
                {"word": "YouTube", "start": 1.2, "end": 1.8},
            ],
        }],
    }
    result = generate_ass(
        transcript, 0, 2.0, output_path,
        caption_style="minimal", language="en",
        text_casing="original",
    )
    assert result is True
    with open(output_path, "r") as f:
        content = f.read()
    assert "iPhone" in content
    assert "YouTube" in content


def test_generate_ass_new_social_styles(sample_transcript, output_path):
    from subtitles import generate_ass
    new_styles = ["podcast-hook", "wealth-hustle", "magnates-mystery", "typewriter-vibe", "dark-psychology"]
    for style_id in new_styles:
        result = generate_ass(
            sample_transcript, 0, 3.0, output_path,
            caption_style=style_id, language="en",
        )
        assert result is True, f"Style {style_id} failed"
        assert os.path.getsize(output_path) > 0



