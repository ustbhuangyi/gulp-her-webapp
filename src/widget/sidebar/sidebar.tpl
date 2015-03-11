{%define%}
{%require name="home:widget/sidebar/sidebar.css"%}
<a id="btn-navbar" class="btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
</a>
{%widget name="home:widget/nav/nav.tpl"%}
{%script%}
    require.defer(['home:static/lib/js/jquery-1.10.1.js'],function($){
        $('.btn-navbar').click(function() {
            require.defer(['./sidebar.async.js'], function(sidebar){
                sidebar.run();
            });
        });
    });
{%/script%}
{%/define%}