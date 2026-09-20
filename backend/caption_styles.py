"""
Caption Style Configuration

Defines the 6 trending caption styles for short-form video content.
Based on 2025-2026 research of TikTok, Instagram Reels, and YouTube Shorts.

This module loads configuration from a shared JSON file to guarantee that
frontend preview and backend rendering use identical values. This eliminates
configuration drift and ensures preview accuracy.

Each style is configured with:
- Font name and size
- Primary text color
- Highlight color (for active words)
- Outline color and size
- Shadow settings
- Animation type

ASS (Advanced SubStation Alpha) subtitle format is used for styling.
"""

import json
from pathlib import Path
from dataclasses import dataclass


@dataclass
class CaptionStyleConfig:
    """Configuration for a caption style"""

    # Style identification
    id: str
    name: str
    category: str

    # Font settings
    font_name: str  # Primary font
    font_name_fallback: str  # Fallback for non-Latin scripts
    font_size: int  # Font size in pixels

    # Colors (in ASS format: &HBBGGRR& or &HAABBGGRR& with alpha)
    # Note: ASS uses BGR format, not RGB!
    primary_color: str  # Main text color (ASS format)
    highlight_color: str  # Active word highlight color (ASS format)
    outline_color: str  # Outline color (ASS format)
    shadow_color: str  # Shadow color (ASS format)

    # Style settings
    outline_size: float  # Outline thickness in pixels
    shadow_depth: float  # Shadow offset in pixels
    bold: bool  # Bold font
    italic: bool  # Italic font
    letter_spacing: float  # Letter spacing in pixels (ASS \fsp tag)
    word_spacing: int  # Word spacing percentage (100 = normal, 150 = 1.5x wider)

    # Animation type
    # - "highlight": Word-by-word color change (default)
    # - "karaoke": Color wipe/fill effect
    # - "scale": Subtle scale animation
    # - "bounce": Spring/bounce effect
    # - "pop": Punchy spring scale
    # - "glow": Luminous pulsing neon glow
    animation_type: str


def _clamp_color(value: int) -> int:
    """Clamp color value to valid 0-255 range."""
    return max(0, min(255, value))


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """
    Convert hex color to RGB tuple.

    Args:
        hex_color: Hex color string (e.g., "#FFFFFF" or "FFFFFF")

    Returns:
        Tuple of (r, g, b) values

    Raises:
        ValueError: If hex_color is invalid
    """
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color: {hex_color}")

    try:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b)
    except ValueError as e:
        raise ValueError(f"Invalid hex color: {hex_color}") from e


def rgb_to_ass(r: int, g: int, b: int, alpha: int = 0) -> str:
    """
    Convert RGB values to ASS color format with type validation.
    ASS format: &HAABBGGRR& where AA=alpha, BB=blue, GG=green, RR=red
    Alpha: 0 = opaque, 255 = transparent

    Values are clamped to 0-255 range for safety.

    Raises:
        ValueError: If color values cannot be converted to integers
    """
    # Type checking and conversion
    try:
        r = int(r)
        g = int(g)
        b = int(b)
        alpha = int(alpha)
    except (TypeError, ValueError) as e:
        raise ValueError(f"Color values must be integers: {e}")

    # Clamp to valid range
    r = _clamp_color(r)
    g = _clamp_color(g)
    b = _clamp_color(b)
    alpha = _clamp_color(alpha)
    return f"&H{alpha:02X}{b:02X}{g:02X}{r:02X}"


def normalize_color_to_ass(color_val: str, alpha: int = 0) -> str:
    """
    Normalize hex string (#RRGGBB or RRGGBB) or ASS color string to ASS format.

    Args:
        color_val: Color in hex (#FFFFFF, FFFFFF) or ASS format (&H00FFFFFF)
        alpha: Alpha value (0=opaque, 255=transparent) when converting from hex

    Returns:
        Color string in ASS format (&HAABBGGRR)
    """
    if not color_val:
        raise ValueError("Empty color string")
    color_val = color_val.strip()
    if color_val.startswith("&H") or color_val.startswith("&h"):
        return color_val
    r, g, b = hex_to_rgb(color_val)
    return rgb_to_ass(r, g, b, alpha=alpha)


def _load_shared_config() -> dict:
    """
    Load caption styles configuration from shared JSON file.

    NOTE: This file is duplicated from frontend/src/shared/caption-styles.config.json
    Keep both files in sync when making changes to caption styles!

    Returns:
        Dictionary containing caption styles and output formats

    Raises:
        FileNotFoundError: If shared config file not found
        ValueError: If config JSON is invalid
    """
    # Use local copy in backend directory (works in Modal deployment)
    config_path = Path(__file__).parent / "caption-styles.config.json"

    if not config_path.exists():
        raise FileNotFoundError(
            f"Caption styles config not found: {config_path}\n"
            f"Expected location: {config_path.absolute()}"
        )

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        if 'styles' not in config:
            raise ValueError("Config missing 'styles' key")

        return config
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in shared config: {e}") from e


def _create_caption_styles_from_config(config: dict) -> dict[str, CaptionStyleConfig]:
    """
    Create CaptionStyleConfig objects from shared configuration.

    Args:
        config: Dictionary loaded from shared JSON config

    Returns:
        Dictionary mapping style IDs to CaptionStyleConfig objects
    """
    styles = {}

    for style_id, style_data in config['styles'].items():
        # Convert hex colors to ASS format
        primary_rgb = hex_to_rgb(style_data['primaryColor'])
        highlight_rgb = hex_to_rgb(style_data['highlightColor'])
        outline_rgb = hex_to_rgb(style_data['outlineColor'])
        shadow_rgb = hex_to_rgb(style_data['shadowColor'])

        styles[style_id] = CaptionStyleConfig(
            id=style_data['id'],
            name=style_data['name'],
            category=style_data.get('category', 'trending'),
            font_name=style_data['fontName'],
            font_name_fallback=style_data['fontNameFallback'],
            font_size=style_data['fontSize'],
            primary_color=rgb_to_ass(*primary_rgb),
            highlight_color=rgb_to_ass(*highlight_rgb),
            outline_color=rgb_to_ass(*outline_rgb),
            shadow_color=rgb_to_ass(*shadow_rgb, alpha=style_data['shadowAlpha']),
            outline_size=style_data['outlineSize'],
            shadow_depth=style_data['shadowDepth'],
            bold=style_data['bold'],
            italic=style_data['italic'],
            letter_spacing=style_data['letterSpacing'],
            word_spacing=style_data['wordSpacing'],
            animation_type=style_data['animationType'],
        )

    return styles


def _create_output_formats_from_config(config: dict) -> dict[str, 'OutputFormatConfig']:
    """
    Create OutputFormatConfig objects from shared configuration.

    Args:
        config: Dictionary loaded from shared JSON config

    Returns:
        Dictionary mapping format IDs to OutputFormatConfig objects
    """
    formats = {}

    for format_id, format_data in config['outputFormats'].items():
        formats[format_id] = OutputFormatConfig(
            id=format_data['id'],
            name=format_data['name'],
            width=format_data['width'],
            height=format_data['height'],
            aspect_ratio=format_data['aspectRatio'],
        )

    return formats


# Load caption styles from shared configuration
# This ensures frontend preview and backend rendering use identical values
_shared_config = _load_shared_config()
CAPTION_STYLES: dict[str, CaptionStyleConfig] = _create_caption_styles_from_config(_shared_config)

# Default style
DEFAULT_CAPTION_STYLE = "hormozi"


def reload_caption_styles() -> None:
    """Reload caption styles from shared configuration file."""
    global _shared_config, CAPTION_STYLES, OUTPUT_FORMATS
    try:
        new_config = _load_shared_config()
        new_styles = _create_caption_styles_from_config(new_config)
        new_formats = _create_output_formats_from_config(new_config)
        _shared_config = new_config
        CAPTION_STYLES.clear()
        CAPTION_STYLES.update(new_styles)
        OUTPUT_FORMATS.clear()
        OUTPUT_FORMATS.update(new_formats)
    except Exception:
        pass


def get_caption_style(style_id: str) -> CaptionStyleConfig:
    """
    Get caption style configuration by ID.

    Raises:
        ValueError: If style_id is not a valid caption style
    """
    if style_id not in CAPTION_STYLES:
        reload_caption_styles()
    if style_id not in CAPTION_STYLES:
        available = ", ".join(CAPTION_STYLES.keys())
        raise ValueError(f"Invalid caption style '{style_id}'. Available styles: {available}")
    return CAPTION_STYLES[style_id]


def is_valid_caption_style(style_id: str) -> bool:
    """Check if style ID is valid"""
    if style_id in CAPTION_STYLES:
        return True
    reload_caption_styles()
    return style_id in CAPTION_STYLES


# Output format configurations
@dataclass
class OutputFormatConfig:
    """Configuration for output video format"""
    id: str
    name: str
    width: int
    height: int
    aspect_ratio: str


OUTPUT_FORMATS: dict[str, OutputFormatConfig] = _create_output_formats_from_config(_shared_config)

DEFAULT_OUTPUT_FORMAT = "vertical"


def get_output_format(format_id: str) -> OutputFormatConfig:
    """
    Get output format configuration by ID.

    Raises:
        ValueError: If format_id is not a valid output format
    """
    if format_id not in OUTPUT_FORMATS:
        available = ", ".join(OUTPUT_FORMATS.keys())
        raise ValueError(f"Invalid output format '{format_id}'. Available formats: {available}")
    return OUTPUT_FORMATS[format_id]


def is_valid_output_format(format_id: str) -> bool:
    """Check if format ID is valid"""
    return format_id in OUTPUT_FORMATS
