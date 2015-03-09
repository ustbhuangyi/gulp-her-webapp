<?php
/**
 * smarty 模版函数 require
 * 处理 {require} 标签
 *
 * @param array $params
 * @param Smarty $smarty
 */
function smarty_function_require($params, $smarty){
    $link = $params['name'];
    unset($params['name']);

    BigPipeResource::registModule($link);

    $context   = BigPipe::currentContext();

    //$ext = substr(strrchr(json_decode($link), "."), 1);
    $ext = substr(strrchr($link, "."), 1);
    switch ($ext) {
        case 'css':
        case 'less':
            $on = isset($params['on']) ? $params['on'] : 'beforedisplay';
            break;
        case 'js':
            $on = isset($params['on']) ? $params['on'] : 'load';
            break;
    }

    $context->addRequire($on, $link);      
}
