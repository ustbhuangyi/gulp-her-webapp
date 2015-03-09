<?php
/**
 * smarty 编译插件 html
 *
 * 处理 {html} 标签
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function comlilerInitHer(){

	$strBigPipePath = preg_replace('/[\\/\\\\]+/', '/', dirname(__FILE__) . '/lib/BigPipe.class.php');
	//$strBigPipeResourcePath = preg_replace('/[\\/\\\\]+/', '/', dirname(__FILE__) . '/lib/BigPipeResource.class.php');
	//$configPath = SMARTY_TEMPLATE_DIR . '/config';

	//$femodule = '$_smarty_tpl->tpl_vars["root"]->value["app"]["runtime"]["actions"][0]';
	//$fismapPath = $configPath . '/' . $femodule . '-map.json';
	//$hermapPath = $configPath . '/' . $femodule . '-hermap.json';
	//$commonPath = $configPath . '/' . 'her-hermap.json';

	$phpCode = '<?php ';
	$phpCode .= 'if(!class_exists("BigPipe", false)){require_once(\'' . $strBigPipePath . '\');}';
	//$phpCode .= 'if(!class_exists("BigPipeResource", false)){require_once(\'' . $strBigPipeResourcePath . '\');}';

	//$phpCode .= '$fismap 	= json_decode(file_get_contents(\'' . $fismapPath . '\'), true);';
	//$phpCode .= '$hermap 	= json_decode(file_get_contents(\'' . $hermapPath . '\'), true);';
	//$phpCode .= '$commonMap = json_decode(file_get_contents(\'' . $commonPath . '\'), true);';
 	//$phpCode .= '$hermap 	= BigPipe::array_merge($commonMap, $hermap);';
	//$phpCode .= 'BigPipeResource::setupFisMap($fismap);';
  	//$phpCode .= 'BigPipeResource::setupMap($hermap);';

  	$phpCode .= '?>';

  	return $phpCode;

}

function smarty_compiler_html($params,  $smarty){
	$strBigPipePath = preg_replace('/[\\/\\\\]+/', '/', dirname(__FILE__) . '/lib/BigPipe.class.php');
	//$moduleName = $params["modulename"];
	//unset($params["modulename"]);

	if(!class_exists("BigPipe", false)){
		require_once($strBigPipePath);
	}

	$uniqid = BigPipe::compileUniqid();
	return 
comlilerInitHer() .
'<?php '.
'if(BigPipe::init()){'.
	'do{'.
		'if(' . BigPipe::compileOpenTag(BigPipe::TAG_HTML, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 htmlclose
 *
 * 处理 {/html} 标签
 * 
 * @param array $params 
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_htmlclose($params,  $smarty){
	return 
'<?php '.
        '}'.
        BigPipe::compileCloseTag(BigPipe::TAG_HTML, $params) . ";" .
	'}while(BigPipe::more());'.
'}'.
'?>';
}
