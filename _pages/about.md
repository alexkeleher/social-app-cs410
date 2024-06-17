---
permalink: /about/
title: "The Team"
layout: single
classes: wide
---

<div class="flex-container">
{% for member in site.data.members %}
    <div class="bio">
        <img src="{{ site.baseurl }}/{{ member.photo }}">
        <div> {{ member.name }} </div>
        <p> {{ member.bio }} </p>
    </div>
{% endfor %}
</div>