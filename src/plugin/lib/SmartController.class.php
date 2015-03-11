<?php
BigPipe::loadClass("FirstController");
BigPipe::loadClass("BigPipeResource");

/**
 * 第一次请求页面时的输出控制器
 * 
 *    共分为4个阶段输出:
 *
 *    1.渲染并收集最外层结构(未被pagelet包裹的内容)并收集使用到的Js和CSS  
 *    2.输出html、head、body和最外层结构，并且输出前端库及使用到的CSS和Js资源  
 *    3.根据优先级输出各层结构，并输出依赖资源表  
 *    4.结束  
 *
 * @uses PageController
 * @author Zhang Yuanwei <zhangyuanwei@baidu.com> 
 */
class SmartController extends FirstController
{
    const STAT_COLLECT = 1; // 收集阶段
    const STAT_OUTPUT = 2; // 输出阶段
    
    private $state = self::STAT_COLLECT; //初始状态
    private $headInnerHTML = null;
    private $bodyInnerHTML = null;
    //private $pagelets = array();
    private $loadedResource = array();
    
    protected $sessionId = 0; //此次会话ID,用于自动生成不重复id,第一次默认为0
    protected $uniqIds = array(); //不重复id种子
    
    /**
     * 构造函数
     * 
     * @access public
     * @return void
     */
    public function __construct($sessions, $ids)
    {   
        $this->ids = $ids;
        $this->sessions = $sessions;
        
        $this->cids = array();
        $this->oids = $ids;

        $this->actionChain = array(
            //收集阶段
            /*'collect_html_open' => array(
                'outputOpenTag',
                true
            ),
            'collect_head_open' => array(
                'startCollect',
                true
            ),
            'collect_title_open' => array(
                'outputOpenTag',
                //FIXME collect and save title??
                true
            ),
            'collect_title_close' => array(
                'outputCloseTag'
            ),
            'collect_head_close' => array(
                'collectHeadHTML'
            ),
            'collect_body_open' => array(
                'startCollect',
                true
            ),*/
            'collect_pagelet_open' => array(
                //TODO 'outputPageletOpenTag',
                'addPagelet',
                'outputSmartOpenTag',
                'startCollect',
                true
            ),
            'collect_pagelet_close' => array(
                'collectHTML',
                'setupBigrender',
                'outputSmartCloseTag'
            ),
            /*'collect_body_close' => array(
                'collectBodyHTML'
            ),
            //'collect_html_close' => false,
            */
            'collect_more' => array(
                'changeState',
                true
            ),
            //输出阶段
            //'output_html_open' => false,
            /*'output_head_open' => array(
                'outputOpenTag',
                //TODO 'outputNoscriptFallback',
                'outputHeadHTML',
                false
            ),*/
            //'output_title_open' => false,
            //'output_title_close' => false,
            /*'output_head_close' => array(
                //TODO 'outputLayoutStyle',
                'outputLayoutStyle',
                'outputCloseTag'
            ),
            'output_body_open' => array(
                'outputOpenTag',
                'outputBodyHTML',
                false
            ),*/
            //'output_pagelet_open' => false,
            //'output_pagelet_close' => false,
            'output_body_close' => array(
                //'outputBigPipeLibrary',
                //'outputLoadedResource',
                //TODO 'sessionStart',
                //TODO 'outputLayoutPagelet',
                //'outputLayoutPagelet',
                'outputPagelets',
                //'outputCloseTag'
            ),
            /*'output_html_close' => array(
                'outputCloseTag'
            ),*/
            'output_more' => false,
            'default' => false
        );
    }
     
    /**
     * 将当前 pagelet 添加到输出列表中
     *
     * @param PageletContext $context
     */
    protected function addPagelet($context)
    {
        $id = $context->getParam(
            "id", 
            $this->sessionUniqId("__elm_"), 
            PageletContext::FLG_APPEND_PARAM
        );
        //$parentId = $context->parent->
        if(isset($context->parent)){
            $parentId = $context->parent->getParam("id");
            if(in_array($parentId, $this->ids)){
                $this->ids = array_merge($this->ids, array($id));
                $this->cids[] = $id;
            }
        }
        if(in_array($id, $this->ids)){
            $this->pagelets[] = $context;
        }
        //in_array($pagelet->getParam("id"), $this->ids)
    }
    
    /**
     * 输出pagelet开始标签
     *
     * @param PageletContext $context
     */
    protected function outputSmartOpenTag($context)
    {
        if( in_array($context->getParam("id"), $this->cids )) {
            $this->outputOpenTag($context);
        }
    }
    /**
     * 输出pagelet结束标签
     *
     * @param PageletContext $context
     */
    protected function outputSmartCloseTag($context)
    {
        if( in_array($context->getParam("id"), $this->cids )) {
            $this->outputCloseTag($context);
        }
    }

    /**
     * 输出Quickling请求的pagelets
     *
     * @param PageletContext $context
     */
    protected function outputPagelets($context)
    {   
        $pagelets = array();
        foreach ($this->pagelets as $pagelet) {
            $id = $pagelet->getParam("id");
            if( in_array($id, $this->ids) ){
                $config = $this->outputPagelet($pagelet);
                
                if( isset($this->sessions[$id]) ){
                    $config["session"] = $this->sessions[$id];
                }else{
                    //$config["session"] = 0;
                }
                $pagelets[] = $config;
            }
        }
        
        echo json_encode($pagelets);
    }
    /**
     * 按Quickling模式输出一个pagelet
     *
     * @param PageletContext $context
     */    
    protected function outputPagelet($pagelet)
    {
        $resourceMap = array();
        $hooks = array();
        $config = $this->getPageletConfig($pagelet, $html, $resourceMap, $hooks);
        $config['quickling'] = true;

        if (!empty($hooks)) {
            foreach ($hooks as $id => $hook) {
                // echo "BigPipe.hooks[\"$id\"]=function(){{$hook}};\n";
            }
        }
        
        //设置资源表 
        if (!empty($resourceMap)) {
            $resourceMap = BigPipeResource::pathToResource($resourceMap);
            $resourceMap = BigPipeResource::getDependResource($resourceMap);

            $resourceMap = BigPipe::array_merge($resourceMap, $this->loadedResource);

            $outputMap = array();
            foreach ($resourceMap as $id => $resource) {
                
                if(isset(BigPipeResource::$knownResources[$id])){
                    continue;
                }

                $requires = $resource['requires'];
                unset($resource['requires']);
                unset($resource['requireAsyncs']);

                $requireIds = array();
                if(!empty($requires)){
                    $requires = BigPipeResource::pathToResource($requires);
                    $requireIds = array_keys($requires);
                }
                $resource['deps'] = $requireIds;
                $resource['mods'] = $resource['defines'];

                unset($resource['defines']);
                unset($resource['id']);
                $outputMap[$id] = $resource;
                BigPipeResource::$knownResources[$id] = $resource;
            }

            //echo "BigPipe.setResourceMap(", json_encode($outputMap), ");\n";
        }
        
        $config["resourceMap"] = $outputMap;
        
        return $config;
        //echo json_encode($config);
        //输出 pagelet 配置 
        //echo "BigPipe.onPageletArrive(", json_encode($config), ");\n";
        //echo "</script>";
        
    }

    /**
     * 得到 pagelet 的配置，用于Quickling输出
     *
     * @param PageletContext $pagelet
     * @param string $html
     * @param array $resourceMap
     * @param array $hooks
     */
    private function getPageletConfig($pagelet, &$html, &$resourceMap, &$hooks)
    {
        $config      = array();
        
        $config["id"] = $pagelet->getParam("id");
        $config["children"] = array();

        foreach ($pagelet->children as $child) {
            $config["children"][] = $child->getParam("id");
        }

        if($pagelet->parent) {
            $config["parent"] = $pagelet->parent->getParam("id");
        }
        
        if (!empty($pagelet->html)) {
            //生成容器ID
            $containerId = $this->sessionUniqId("__cnt_");
            
            //生成注释的内容
            //$html = "<code id=\"$containerId\" style=\"display:none\"><!-- ";
            //$html = $this->getCommentHTML($pagelet->html);
            $html = $pagelet->html;
            //$html .= " --></code>";
            
            //设置html属性
            $config["html"]["container"] = $containerId;
            $config["html"]["html"] = $html;
        }
                
        foreach (self::$knownEvents as $type) {
            $event = $pagelet->getEvent($type);

            if ($event !== false) {
                foreach ($event->hooks as $hook) {
                    //$hookId                   = $this->sessionUniqId("__cb_");
                    //$hooks[$hookId]           = $hook;
                    $config["hooks"][$type][] = $hook;
                }
                
                //deps
                $requireResources = BigPipeResource::pathToResource($event->requires);
                $config["deps"][$type] = array_keys($requireResources);

                $resourceMap = array_merge($resourceMap, $event->requires, $event->requireAsyncs);
            }
        }
        return $config;
    }    
}

// vim600: sw=4 ts=4 fdm=marker syn=php

