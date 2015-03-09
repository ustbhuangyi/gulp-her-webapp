<?php
/** 
 *           File:  function.widget.php
 *           Path:  src/plugin
 *         Author:  zhangyuanwei
 *       Modifier:  zhangyuanwei
 *       Modified:  2012-05-02 12:48:53  
 *    Description:  
 *      Copyright:  (c) 2011 All Rights Reserved
 */

function smarty_function_widget($params, $template)
{
    $name = $params['name'];
    $method = $params['method'];
    unset($params['name']);
    unset($params['method']);

    if(isset($params['call'])){
        $call = $params['call'];
        unset($params['call']);
    }

    BigPipeResource::registModule($name, true);
    
    $path = BigPipeResource::getFisResourceByPath($name);

    // 添加widget依赖的css和less
    if(!empty($path["deps"])){

        $deps = $path["deps"];
        $context   = BigPipe::currentContext();

        foreach($deps as $dep){
            BigPipeResource::registModule($dep);

            $ext = substr(strrchr($dep, "."), 1);
            switch ($ext) {
                case 'css':
                case 'less':
                    $on = 'beforedisplay';
                    $context->addRequire($on, $dep);
                    break;
            }
        }
    }

    $smarty=$template->smarty;
    $tplpath = $path["uri"];

    // 先处理call方法调用，兼容fisp
    if(isset($call)){
        $call = 'smarty_template_function_' . $call;
        if(!function_exists($call)) {
            try {
                $smarty->fetch($tplpath);
            } catch (Exception $e) {
                throw new Exception("No tpl here, \"$name\" @ \"$tplpath\"");
            }
        }
        if(function_exists($call)) {
            return $call($template, $params);
        }
    }

    // 如果call不存在 则调用method
    $fn='smarty_template_function_' . $method;
    if(!function_exists($fn)) {
        try {
            $smarty->fetch($tplpath);
        } catch (Exception $e) {
            throw new Exception("No tpl here, \"$name\" @ \"$tplpath\"");
        }
    }

    if(function_exists($fn)) {
        return $fn($template, $params);
    } 
    // 如果method也不对 则尝试md5($name)，这是为了解决动态调用
    // 如果都没有则 throw error
    else
    {
        $methodName = preg_replace('/^_[a-fA-F0-9]{32}_/','',$method);

        if($method !== $methodName){
            $method = '_' . md5($name) . '_' . $methodName;

            $fn='smarty_template_function_' . $method;
            
            if(function_exists($fn)){
                return $fn($template, $params);
            }
        }
        throw new Exception("Undefined function \"$method\" in \"$name\" @ \"$tplpath\"");
        //echo "模板\"$name\"中未定义函数\"$method\"@\"$tplpath\"";
    }
}