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
        <div class="name"> {{ member.name }} </div>
        <p class="desc"> {{ member.bio }} </p>
    </div>
{% endfor %}
</div>