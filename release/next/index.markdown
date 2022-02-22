---

layout: default
---
{% assign version = page.dir | split: "/"  %}

# {{ version[2] |capitalize }} Release Documentation

## How-To Guides

These guides range from simple, task-based guides to more complex instructions
<ul>
{% for c in site.data.how-to-categories %}
    <li>{{c.name}}
    <ul>
{% for p in site.pages %}
  {% assign pageVersion = p.dir | split: "/" %}
  {% if pageVersion[1] == "release" and pageVersion[2] == version[2] and p.tags contains "how-to" and  p.category == c.category %}
      <li>
        <a href="{{ p.url | relative_url }}">
            {{ p.title }} 
        </a>
      </li>
   {% endif %}
{% endfor %}
</ul>
</li>
{% endfor %}
</ul>

## API Documentation

<ul>
<li><a href="./api/index">{{ version[2] | capitalize}} Release API Documentation</a></li>
</ul>