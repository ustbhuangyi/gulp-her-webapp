<?php

function smarty_compiler_feature($params, Smarty $smarty){
	$feature_name = $params['name'];
	$strDoorKeeperApiPath = preg_replace('/[\\/\\\\]+/', '/', dirname(__FILE__) . '/lib/DoorKeeper.class.php');
	$strCode = '<?php ';
	$strCode .= 'if(!class_exists("DoorKeeper", false)){require_once(\'' . $strDoorKeeperApiPath . '\');}';
	$strCode .= '$featureResult = DoorKeeper::getFeature(' . $feature_name . ', $_smarty_tpl->smarty);';
	$strCode .= 'if($featureResult == \'true\'){';
	$strCode .= '?>';
	return $strCode;
}

function smarty_compiler_featureclose($params, Smarty $smarty){
	$strCode = '<?php } ?>';
	return $strCode;
}