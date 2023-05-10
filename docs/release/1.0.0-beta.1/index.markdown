---

layout: default
---
{% assign version = page.dir | split: "/"  %}

# {{ version[2] |capitalize }} Release Documentation

## How-To Guides

These guides range from simple, task-based guides to more complex instructions
{% include how-to-index.html %}

## API Documentation

{% if site.legacy_versions contains version[2] %}
    {% assign api_docs_link = "./api/index" %}
{% else %}
    {% assign api_docs_link = site.constructs_hub_url | append: "v/" | append: version[2] %}
{% endif %}
<ul>
<li><a href="{{ api_docs_link }}" target="_blank" rel="noreferrer noopener" aria-haspopup="true">{{ version[2] | capitalize}} Release API Documentation</a></li>
</ul>