{%define%}
{%require name="home:widget/nav/nav.css"%}
<nav id="nav" class="navigation" role="navigation">
    <ul>
        {%foreach $data as $doc%}
        <li {%if $nav_index == $doc@index%}class="active"{%/if%}>
            <a href="?nav={%$doc@index%}" data-pagelets="sidebar,container">
                <i class="icon-{%$doc.icon%} icon-white"></i> <span>{%$doc.title%}</span>
            </a>
        </li>
        {%/foreach%}
    </ul>
</nav>
{%/define%}