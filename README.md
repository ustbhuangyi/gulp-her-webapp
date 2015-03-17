#gulp-her-webapp：基于gulp编译工具和BigPipe运行时的一套前端集成解决方案。

编译工具：Her定义了一套开发规范，通过编写gulp-her插件实现了一套完整的自动化构建平台。

运行时：Her包含后端smarty和前端框架，利用Bigppipe的思想，对页面进行细粒度分块，收集区块的dom、js、css等资源；
       后端controller控制按需输出，前端Bigpipe框架按需渲染，配合Bigrender的实现，最大限度的优化前端性能。
       
##核心参考##
[BigPipe: Pipelining web pages for high performance](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)

##核心功能##
###1.页面分块Pagelet###
pagelet将页面的dom，以及dom依赖的css、js分块收集，使用controller控制按需输出，实现了类bigpipe的分块输出，前端BigPipe模块可以实现异步渲染，优化渲染速度和性能。

###2.延迟渲染BigRender###
页面加载的时候只渲染首屏内容，用户滚动页面的时候再渲染可见区域。可以有效提高首屏速度。

###3.局部刷新Quickling###
对于需要局部刷新的模块，可以通过BigPipe.fetch()实现。对于开发者几乎是0成本。

### WIKI ###
https://github.com/ustbhuangyi/gulp-her-webapp/wiki

##适用场景##
her适用于采用Smarty作为后端模板的PC和Mobile站点。

##安装使用##



