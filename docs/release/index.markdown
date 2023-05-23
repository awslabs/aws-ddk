---

layout: default
---
{% assign version = page.dir | split: "/"  %}

# {{ version[2] |capitalize }} Release Documentation

## How-To Guides

These guides range from simple, task-based guides to more complex instructions
{% include how-to-index.html %}

## API Documentation

<ul>
<li><a href="./api/index" target="_blank" rel="noreferrer noopener" aria-haspopup="true">{{ version[2] | capitalize}} Release API Documentation</a></li>
</ul>
