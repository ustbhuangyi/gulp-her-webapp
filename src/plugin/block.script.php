<?php
/**
 * smarty 块函数 script
 * 处理 {script} 标签
 *
 * @param array $params
 * @param string $content
 * @param Smarty $smarty
 * @param bool $repeat 
 * @see BigPipe::currentContext
 * @see PageletContext->addRequire
 * @see PageletContext->addRequireAsync
 * @see PageletContext->addHook
 */
function smarty_block_script($params, $content, $smarty, &$repeat)
{
    if (!$repeat && isset($content)) {
        $eventType = isset($params['on']) ? $params['on'] : "load";
        $context   = BigPipe::currentContext();
        
        if (isset($params["sync"])) {
            $context->addRequire($eventType, $params["sync"]);
        }
        
        if (isset($params["async"])) {
            $context->addRequireAsync($eventType, $params["async"]);
        }

        $context->addHook($eventType, $content);
    }
}

