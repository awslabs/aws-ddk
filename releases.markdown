---

layout: default
---
## Releases
Find the documentation for all releases of AWS DDK

<ul>
{% assign sorted_versions = site.data.versions | sort: 'name' | reverse %}
{% for version in sorted_versions %}
  <li>
    <a href="release/{{ version.root }}/index">
      {{ version.name }}
    </a>
  </li>
{% endfor %}
</ul>

You can also view the [documentation](release/next/index) for the next version of the AWS DDK.