<?php
if (!defined('BIGPIPE_BASE_DIR')) {
    define('BIGPIPE_BASE_DIR', dirname(__FILE__));
}

define("BIGPIPE_DEBUG", 0);

/**
 * BigPipe 页面运行时框架
 *
 * @uses PageletContext
 * @author Zhang Yuanwei <zhangyuanwei@baidu.com>
 */
class BigPipe
{
    // 标签类型常量
    /**
     * NONE 标签类型，用于标识默认根节点
     * @see init
     */
    const TAG_NONE = 0;
    /**
     * HTML 标签类型，供 Smarty {html} 插件使用
     */
    const TAG_HTML = 1;
    /**
     * HEAD 标签类型，供 Smarty {head} 插件使用
     */
    const TAG_HEAD = 2;
    /**
     * TITLE 标签类型，供 Smarty {title} 插件使用
     */
    const TAG_TITLE = 3;
    /**
     * BODY 标签类型，供 Smarty {body} 插件使用
     */
    const TAG_BODY = 4;
    /**
     * PAGELET 标签类型，供 Smarty {pagelet} 插件使用
     */
    const TAG_PAGELET = 5;

    // 状态常量
    /**
     * 未初始化的状态
     */
    const STAT_UNINIT = 0;
    /**
     * 初始化后第一次执行
     */
    const STAT_FIRST = 1;
    /**
     * 循环执行
     */
    const STAT_LOOP = 2;
    /**
     * 准备结束
     */
    const STAT_END = 3;

    /**
     * 页面输出控制器
     */
    private static $controller = null;
    /**
     *  当前上下文
     */
    private static $context = null;
    /**
     * 当前状态
     */
    private static $state = self::STAT_UNINIT;

    /**
     * 框架使用参数的前缀
     */
    const ATTR_PREFIX = 'bigpipe-';
    /**
     * Quickling 请求时的特征参数
     */
    protected static $quicklingKey = '__quickling__';
    /**
     * Quickling 请求时的会话参数，用于保持前后端状态
     */
    protected static $sessionKey = '__session__';
    /**
     * 前端不支持 Js 时的 fallback 请求参数
     */
    protected static $nojsKey = '__noscript__';
    /**
     * 前端 js 框架地址
     */
    static $jsLib = null;
    static $bigrenderLib = null;
    static $bigrenderCode = null;
    /**
     * 前端 js 入口对象名
     */
    protected static $globalVar = 'BigPipe';
    /**
     * Quickling 请求的区块名分隔符
     */
    protected static $separator = ',';
    /**
     * 是否 debug 状态
     */
    protected static $debug = false;
    /**
     * 保存的断言配置
     */
    private static $savedAssertOptions = null;

    public static function getBigrenderCode() // {{{
    {
        if(self::$bigrenderCode) return self::$bigrenderCode;

        return self::$bigrenderCode = "return !require('" . self::$bigrenderLib . "').add(this);";
    } // }}}

    /**
     * 得到当前上下文
     *
     * @static
     * @access public
     * @return PageletContext 当前的上下文
     * @see PageletContext
     * @example
     * $context = BigPipe::currentContext();
     * $context->addDepend("her:css/layout.css", "beforedisplay");
     * $context->addDepend("her:js/jquery.js", "load");
     */
    public static function currentContext() // {{{
    {
        return self::$context;
    } // }}}

    /**
     * 加载类
     *
     * @param mixed $className 类名
     * @static
     * @access public
     * @return bool 是否加载成功
     */
    public static function loadClass($className) // {{{
    {
        if (!class_exists($className, false)) {
            $fileName = BIGPIPE_BASE_DIR . DIRECTORY_SEPARATOR . $className . ".class.php";
            if (file_exists($fileName)) {
                require($fileName);
            }
        }
        return class_exists($className, false);
    } // }}}

    /**
     * 设置框架的 debug 模式
     *
     * @param bool $isDebug 是否开启debug模式
     * @static
     * @access public
     * @return void
     */
    public static function setDebug($isDebug) // {{{
    {
        self::$debug = !!$isDebug;
    } // }}}

    /**
     * 根据请求得到控制器
     * BigPipe 框架有三种控制器
     * 1、页面刷新时的控制器：将会输出页面框架并采用Js渲染内容
     * 2、页面局部刷新的控制器：将会输出局部刷新的内容，并且使用Js渲染
     * 3、浏览器不支持Js或者判定为网络爬虫时，使用正常的流式输出
     *
     * @static
     * @access private
     * @return PageController 适合当前环境的控制器
     * @see init
     */
    private static function getController() // {{{
    {
        $get    = self::getSuperGlobal(self::SUPER_TYPE_GET);
        //$cookie = self::getSuperGlobal(self::SUPER_TYPE_COOKIE);
        //
        ///**
        // * 先判断是否为 Noscript 请求
        // */
        //if (isset($get[self::$nojsKey]) || isset($cookie[self::$nojsKey])) {
        //    setcookie(self::$nojsKey, 1);
        //    self::loadClass("NoScriptController");
        //    return new NoScriptController();
        //}
        //

        /**
        * 判断是否为 Quickling 请求
        */
        if ( isset($get[self::$quicklingKey]) ){
            $ids = $get[self::$quicklingKey];
            $sessions = array();

            if (empty($ids)) {
               $ids = array();
            } else {
               $ids = explode(self::$separator, $ids);
               foreach($ids as $id){
                    $id = explode(".", $id);
                    $sessions[$id[0]] = $id[1];
               }
               $ids = array_keys($sessions);
            }
            self::loadClass("SmartController");
            return new SmartController($sessions, $ids);
        }
        /**
         * 默认走 Fist 请求
         */
        self::loadClass("FirstController");
        return new FirstController();
    } // }}}

    /**
     * 模板调用函数。用于初始化控制器，
     * 在 Smarty {html} 标签处调用
     *
     * @static
     * @final
     * @access public
     * @return bool 是否初始化成功，固定为 true
     * @see smarty_compiler_html
     */
    public static final function init($smarty) // {{{
    {
        self::saveAssertOptions();
        self::setAssertOptions();
        self::loadClass("PageletContext");

        assert('self::$state === self::STAT_UNINIT');

        self::$controller = self::getController();
        self::$context    = new PageletContext(self::TAG_NONE);
        self::$state      = self::STAT_FIRST;

        // BigPipeResource运行依赖her-map.json, 需要在这里设置config目录的路径
        if (!defined('BIGPIPE_CONF_DIR')) {
            define('BIGPIPE_CONF_DIR', $smarty->getConfigDir()[0]);
        }

        return true;
    } // }}}

    /**
     * 模板调用函数。在标签打开时调用，用于控制标签内部是否执行。
     *
     * @param int $type 标签类型
     * @param string $uniqid 节点ID
     * @param array $params 标签参数
     * @static
     * @final
     * @access public
     * @return bool 是否需要执行标签内部内容
     * @see compileOpenTag
     * @see PageController::openTag
     */
    public static final function open($type, $uniqid, $params = null) // {{{
    {

        assert('self::$state === self::STAT_FIRST || self::$state === self::STAT_LOOP');

        if (self::has($uniqid)) {
            assert('isset(self::$context->children[$uniqid])');
            $context = self::$context->children[$uniqid];
            assert('$context->type === $type');
        } else {
            if (!isset($params)) {
                $params = array();
            }
            if($type == self::TAG_HTML && isset($params['her'])){

                BigPipeResource::registModule($params['her']);
                self::$jsLib = $params['her'];
                unset($params['her']);

                if(isset($params['bigrender'])){
                    self::$bigrenderLib = $params['bigrender'];
                    unset($params['bigrender']);
                }
            }
            if(isset($params['bigrender'])){
                $bigrender = true;
                unset($params['bigrender']);
            }
            $context                          = new PageletContext($type, $params);
            $context->parent                  = self::$context;
            self::$context->children[$uniqid] = $context;

            if(isset($bigrender) && $bigrender){
                $context->bigrender = true;
            }
        }

        self::$context = $context;

        return $context->opened = self::$controller->openTag($context);
    } // }}}

    /**
     * 模板调用函数。在标签关闭时调用，将会返回标签父级节点的执行状态。
     *
     * @param int $type 标签类型
     * @static
     * @final
     * @access public
     * @return bool 父级节点是否需要执行
     * @see compileCloseTag
     * @see PageController::closeTag
     */
    public static final function close($type, $params = null) // {{{
    {
        assert('self::$state === self::STAT_FIRST || self::$state === self::STAT_LOOP');
        $context = self::$context;
        assert('$context->type === $type');

        self::$controller->closeTag($context);
        $context->opened = false;

        $context       = $context->parent;
        self::$context = $context;
        return $context->opened;
    } // }}}

    /**
     * 模板调用函数。用于判断当前节点是否已经存在，用于避免参数的多次执行
     *
     * @param string $uniqid 当前节点的ID
     * @static
     * @final
     * @access public
     * @return bool 当前标签是否存在
     * @see compileOpenTag
     */
    public static final function has($uniqid) // {{{
    {
        return isset(self::$context->children[$uniqid]);
    } // }}}

    /**
     * 模板调用函数。用于控制页面是否需要再次执行。
     * 在 Smarty {/html} 标签处调用
     *
     * @static
     * @final
     * @access public
     * @return bool 页面是否需要再次执行。
     * @see smarty_compiler_htmlclose
     * @see PageController::hasMore
     */
    public static final function more() // {{{
    {
        assert('self::$state === self::STAT_FIRST || self::$state === self::STAT_LOOP');

        if (self::$controller->hasMore()) {
            self::$state = self::STAT_LOOP;
            return true;
        } else {
            self::$state = self::STAT_END;
            return false;
        }
    } //}}}

    // Smarty 编译辅助函数 {{{
    /**
     * Smarty 编译辅助函数，用于编译一个打开标签
     *
     * @param int $type 标签类型
     * @param array $param 标签的参数
     * @static
     * @final
     * @access public
     * @return string 编译后的PHP代码
     * @see open
     * @see has
     */
    public static final function compileOpenTag($type, $params)
    {
        $uniqid  = self::compileUniqid();
        $phpCode = "BigPipe::open(" . $type . "," . $uniqid;
        /**
         * 如果没有参数，则不传递第三个参数
         * @see open
         */
        if (!empty($params)) {
            /**
             * 如果已经执行过该节点 BigPipe::has 返回true ,$params 数组不会使用到
             * @see has
             */
            $phpCode .= ',BigPipe::has(' . $uniqid . ')?null:' . self::compileParamsArray($params);
        }
        $phpCode .= ")";
        return $phpCode;
    }

    /**
     * Smarty 编译辅助函数，用于编译一个闭合标签
     *
     * @param int $type 标签类型
     * @param array $param 标签的参数
     * @static
     * @final
     * @access public
     * @return string 编译后的PHP代码
     */
    public static final function compileCloseTag($type, $params)
    {
        return 'BigPipe::close(' . $type . ')';
    }

    /**
     * Smarty编译辅助函数，用于将参数数组编译为PHP代码
     *
     * @param array $params
     * @static
     * @final
     * @access public
     * @return string 编译后的 PHP 代码
     *
     */
    public static final function compileParamsArray($params)
    {
        $items = array();
        $code  = 'array(';
        foreach ($params as $key => $value) {
            $items[] = "\"$key\"=>$value";
            //$code.="\"$key\"=>$value,";
        }
        $code .= join($items, ",");
        $code .= ")";

        return $code;
    }

    /**
     * Smarty编译辅助函数，用于生成一个唯一ID
     *
     * @static
     * @final
     * @access public
     * @return string 用于PHP的唯一字符串字面量
     */
    public static final function compileUniqid()
    {
        return var_export(uniqid(), true);
    }

    // }}}

    // {{{ 单元测试辅助函数

    /**
     * 超全局变量 GET 类型
     */
    const SUPER_TYPE_GET = "get";
    /**
     * 超全局变量 COOKIE 类型
     */
    const SUPER_TYPE_COOKIE = "cookie";
    /**
     * 单元测试辅助变量，用于设置超全局变量
     */
    public static $superGlobals = array();
    /**
     * 单元测试辅助函数，得到超全局变量
     *
     * @param int $type 变量类型
     * @static
     * @access protected
     * @return mixed
     */
    private static function getSuperGlobal($type)
    {

        if (isset(self::$superGlobals[$type])) {
            return self::$superGlobals[$type];
        } else {
            switch ($type) {
                case self::SUPER_TYPE_GET:
                    return $_GET;
                case self::SUPER_TYPE_COOKIE:
                    return $_COOKIE;
            }
        }
        return null;
    }

    // }}}

    // 调试相关函数 {{{
    /**
     * 保存断言配置
     *
     * @static
     * @access private
     * @return void
     */
    private static function saveAssertOptions()
    {
        self::$savedAssertOptions = array();
        foreach (array(
            ASSERT_ACTIVE,
            ASSERT_WARNING,
            ASSERT_BAIL,
            ASSERT_QUIET_EVAL,
            ASSERT_CALLBACK
        ) as $key) {
            self::$savedAssertOptions[] = array(
                'key' => $key,
                'val' => assert_options($key)
            );
        }
    }

    /**
     * 断言回调
     *
     * @param mixed $file
     * @param mixed $line
     * @param mixed $code
     * @static
     * @access private
     * @return void
     */
    private static function assertCallback($file, $line, $code)
    {
        echo "<hr />Assertion Failed:<br />File '$file'<br />Line '$line'<br />Code '$code'<br /><hr />";
    }

    /**
     * 设置断言配置
     *
     * @static
     * @access private
     * @return void
     */
    private static function setAssertOptions()
    {
        if (defined("BIGPIPE_DEBUG") && BIGPIPE_DEBUG) {
            assert_options(ASSERT_ACTIVE, 1);
            assert_options(ASSERT_WARNING, 1);
            assert_options(ASSERT_BAIL, 1);
            assert_options(ASSERT_QUIET_EVAL, 0);
            assert_options(ASSERT_CALLBACK, array(
                "self",
                "assertCallback"
            ));
        } else {
            assert_options(ASSERT_ACTIVE, 0);
        }
    }
    // }}}

    public static function array_merge($arr1, $arr2){
        foreach ($arr2 as $key => $value) {
            $arr1[$key] = $value;
        }
        return $arr1;
    }
}

// vim600: sw=4 ts=4 fdm=marker syn=php

