# -- Path setup --------------------------------------------------------------

import os
import sys

paths = ["../../cli", "../../core"]

for path in paths:
    sys.path.insert(0, os.path.abspath(path))


# -- Project information -----------------------------------------------------

project = "AWS DDK"
copyright = "2022, AWS"
author = "AWS Professional Services"
release = "0.1.0"


# -- General configuration ---------------------------------------------------
extensions = ["sphinx.ext.autodoc", "sphinx.ext.coverage", "sphinx.ext.napoleon"]
templates_path = ["_templates"]
exclude_patterns = []
html_theme = "furo"
#html_static_path = ["_static"]
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
