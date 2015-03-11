{%extends file="home/page/layout.tpl"%}
{%block name="block_head_static"%}
    <!--[if lt IE 9]>
        <script src="/lib/js/html5.js"></script>
    <![endif]-->
    {%* 模板中加载静态资源 *%}
    {%require name="home:static/lib/css/bootstrap.css"%}
    {%require name="home:static/lib/css/bootstrap-responsive.css"%}
{%/block%}
{%block name="content"%}

    <div id="wrapper">
        {%pagelet id="sidebar"%}
            {%$nav_index = $smarty.get.nav|default:0%}
            {%* 通过widget插件加载模块化页面片段，name属性对应文件路径,模块名:文件目录路径 *%}
            {%widget
                name="home:widget/sidebar/sidebar.tpl" 
                data=$docs
            %}
                        
            {%script on="beforeload"%}
                if(!this.quickling)
                    console.log(this.id + ' beforeload:','这是pagelet load之前触发的事件，在这里return false可以阻止pagelet load，然后在需要的时候调用 this.load() 即可继续load');
                else
                    console.log(this.id + " beforeload:",
                        "via quickling");
            {%/script%}
            {%script on="beforedisplay"%}
                if(!this.quickling)
                    console.log(this.id + ' beforedisplay:','这是pagelet加载完依赖的css，innerHtml之前触发的事件，也可以阻止，然后手动调用 this.display()');
                else
                    console.log(this.id + ' beforedisplay:',
                        'via quickling');
            {%/script%}
            {%script on="display"%}
                if(!this.quickling)
                    console.log(this.id + ' display:','这是pagelet完成dom渲染触发的事件');
                else
                    console.log(this.id + ' display:',
                        'via quickling');
            {%/script%}
            {%script%}
                if(!this.quickling)
                    console.log(this.id + ' load:','这是pagelet加载完成load依赖的资源时触发的事件，也是script标签默认的事件类型');
                else
                    console.log(this.id + ' load:',
                        'via quickling');
            {%/script%}
            {%script on="unload"%}
                if(!this.quickling)
                    console.log(this.id + ' unload:','这是pagelet卸载之前触发的事件');
                else
                    console.log(this.id + ' unload:',
                        'via quickling');
            {%/script%}
        {%/pagelet%}

        {%pagelet id="container"%}
            {%$nav_index = $smarty.get.nav|default:0%}
            {%$doc = $docs[$nav_index]%}
            
            <a id="forkme_banner" target="_blank" href="{%$github%}">View on GitHub</a>
            
            {%if $nav_index == 0%}
                {%widget name="home:widget/slogan/slogan.tpl"%}
            {%/if%}

            {%*foreach $docs as $index=>$doc*%}
                {%widget
                    name="home:widget/section/section.tpl"
                    method="section"
                    doc=$doc.doc index=$nav_index
                %}
            {%*/foreach*%}
        {%/pagelet%}
    </div>
    {%require name="home:static/index/index.css"%}

    {%* 通过script插件收集JS片段 *%}
    {%script%}
        {%* 启用emulator监控页面点击实现局部刷新 *%}
        {%* require.defer会在DomReady之后执行 *%}
        require.defer(["home:widget/js-helper/pageEmulator.js"],function(emulator){
            emulator.start();
        });
    {%/script%}

    {%script%}
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "//hm.baidu.com/hm.js?ab6cd754962e109e24b0bcef3f05c34f";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
    {%/script%}
{%/block%}