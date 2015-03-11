{%define method="section" index=0 doc=null%}
{%require name="home:widget/section/section.css"%}
<section class="section">
    <div class="container-fluid">
        <div class="row-fluid title" id="section-{%$index%}">
            <h2>{%$data.title%}</h2>
        </div>
        <div class="row-fluid content">
        
        {%if $doc == "intro"%}
            {%widget name="home:widget/section/docs/intro.tpl"%}
        {%elseif $doc == "demo"%}
            {%widget name="home:widget/section/docs/demo.tpl"%}
        {%elseif $doc == "extlang"%}
            {%widget name="home:widget/section/docs/extlang.tpl"%}
        {%elseif $doc == "integrated"%}
            {%widget name="home:widget/section/docs/integrated.tpl"%}
        {%elseif $doc == "quickstart"%}
            {%widget name="home:widget/section/docs/quickstart.tpl"%}
        {%elseif $doc == "commands"%}
            {%widget name="home:widget/section/docs/commands.tpl"%}
        {%elseif $doc == "srms"%}
            {%widget name="home:widget/section/docs/srms.tpl"%}
        {%/if%}

            <a href="{%$data.wiki%}" target="_blank" class="btn btn-primary pull-right">
                了解更多
                <i class="icon-circle-arrow-right icon-white"></i>
            </a>
        </div>
    </div>
</section>
{%/define%}
