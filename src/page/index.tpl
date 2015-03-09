{html her="/libs/main.js"}
   {head}
    <meta charset="utf-8"/>
    <title>测试页面</title>
   {/head}
   {body}
        {widget name="/widget/hehe/hehe.tpl"}
         {require name="./index.css"}
         <script runat = "server">
           var index = require("./index.js");
           require.defer(['./defer.js'],function(defer){

           });
         </script>
   {/body}

{/html}
