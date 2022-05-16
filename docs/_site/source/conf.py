# -- Path setup --------------------------------------------------------------

import os
import sys

current_dir = os.path.dirname(__file__)
paths = ["cli", "core"]
for path in paths:
    target_dir = os.path.abspath(os.path.join(current_dir, f"../../{path}"))
    sys.path.insert(0, target_dir)


# -- Project information -----------------------------------------------------

project = "AWS DDK"
copyright = "2022, AWS"
author = "AWS Professional Services"
release = "0.4.1"


# -- General configuration ---------------------------------------------------
extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.coverage",
    "sphinx.ext.napoleon",
    "sphinx_click",
]
autosummary_generate = True  # Turn on sphinx.ext.autosummary
templates_path = ["_templates"]
exclude_patterns = []
html_theme = "furo"
# html_static_path = ["_static"]
html_title = "Contents"

html_theme_options = {
    "light_css_variables": {
        "color-brand-primary": "#504bab",
        "color-brand-content": "#232F3E",
    },
    "dark_css_variables": {
        "color-brand-primary": "#f1f3f3",
        "color-brand-content": "#f1f3f3",
    },
}
