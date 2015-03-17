#gulp-her-webapp：基于gulp编译工具和smarty plugin开发的一套前端集成解决方案。

编译工具：Her定义了一套开发规范，通过编写gulp-her插件实现了一套完整的自动化构建平台。

运行时：Her包含后端smarty和前端框架，利用Bigppipe的思想，通过对页面进行细粒度分块，收集区块的dom、js、css等资源；
       后端controller控制按需输出，前端Bigpipe框架按需渲染，配合Bigrender的实现，最大限度的优化前端性能。

