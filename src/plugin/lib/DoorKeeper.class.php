<?php

require_once(dirname(__FILE__) . DIRECTORY_SEPARATOR . "Feature.class.php");

class DoorKeeper {

	private static $featureMap = array();
	private static $featureDirs = array();
	private static $configDir = null;
	private static $defaultDir = null;

	private static function triggerError($msg){
		trigger_error(date('Y-m-d H:i:s') . ' ' . $msg, E_USER_ERROR);
	}

    /**
     * 通过featureName查找配置文件中的feature信息
     * @param $featureName  "common:featureA"
     * @param $smarty
     * @return null
     *   array(
     *      "name" : feature名字
     *      "namespace" : feature的命名空间
     *      "type" ： feature的类型
     *      "value" : feature的取值
     *      "desc" : feature的描述信息
     *   )
     */
    private static function _getFeature($featureName, $smarty){
		$featureToken = explode(":", $featureName);
		if(count($featureToken) > 1){
			$strNamespace = $featureToken[0];
			$featureName = $featureToken[1];
		} else {
			self::triggerError("Feature name is illegal");
		}
		if(isset(self::$featureMap[$strNamespace]) || self::registerFeatureMap($strNamespace, $smarty)) {
			$arrMap = &self::$featureMap[$strNamespace];
			$featureInfo = &$arrMap[$featureName];
			if (isset($featureInfo)) {
				$featureInfo["name"] = $featureName;
				$featureInfo["namespace"] = $strNamespace;
				return $featureInfo;
			}
		}
		return null;
	}

    /**
     * 读取feature定义文件，将features注册到全局数组中
     * @param $nameSpace
     * @param $smarty
     * @return bool
     */
    private static function registerFeatureMap($nameSpace, $smarty){

		$strMapName = $nameSpace . '-features';

		$arrConfigDir = $smarty->getConfigDir();
		foreach ($arrConfigDir as $strDir) {
			$strPath = preg_replace('/[\\/\\\\]+/', '/', $strDir . '/' . $strMapName);
			if (is_file($strPath . '.json')) {
                $file = $strPath . '.json';
				$featureResult = self::decodeJson($file);
				self::$featureMap[$nameSpace] = $featureResult["features"];
				if(isset($featureResult["feature_dir"])){
					self::$featureDirs[$nameSpace] =  $featureResult["feature_dir"];
				}
				self::$configDir = $strDir;
				return true;
			}
		}
		return false;
	}

    private static function decodeJson($file){
        $result = json_decode(file_get_contents($file), true);
        /*switch(json_last_error())
        {
            case JSON_ERROR_DEPTH:
                $error =  ' - Maximum stack depth exceeded';
                break;
            case JSON_ERROR_CTRL_CHAR:
                $error = ' - Unexpected control character found';
                break;
            case JSON_ERROR_SYNTAX:
                $error = ' - Syntax error, malformed JSON';
                break;
            case JSON_ERROR_NONE:
            default:
                $error = '';
        }
        if (!empty($error)){
            self::triggerError('JSON Error: ' . $error);
        }*/
        //var_dump($result);
        return $result;
    }

    /**
     * 通过feature信息查找对应的feature类
     * @param $featureConfig
     * @return string
     */
    private static function getFeatureFile($featureConfig){
		$featureType = ucfirst($featureConfig["type"]);
		$nameSpace = $featureConfig["namespace"];
		
		if(isset(self::$featureDirs[$nameSpace])){
			foreach(self::$featureDirs[$nameSpace] as $dir){
				$featureFile = realpath(self::$configDir . $dir .  DIRECTORY_SEPARATOR . $featureType . "Feature.class.php");
				if(is_file($featureFile)){
					return $featureFile;
				}
			}
		}

		if(isset(self::$defaultDir)){
			$userDefaultFile = realpath(self::$defaultDir . DIRECTORY_SEPARATOR . $featureType . "Feature.class.php");
			if(is_file($userDefaultFile)){
				return $userDefaultFile;
			}
		}

		$systemDefaultFile = dirname(__FILE__) . DIRECTORY_SEPARATOR . $featureType . "Feature.class.php";
		if(is_file($systemDefaultFile)){
			return $systemDefaultFile;
		}else{
			self::triggerError("Not find " . $featureType);
		}

	}

    /**
     * 通过feature信息返回对应的feature实例
     * @param $featureConfig
     * @return string
     */
	private static function initFeature($featureConfig){
		/**
		 * 1. require对应的class文件 ： 判断文件是否存在
		 * 2. 反射对应的class实例 ： 验证是否是Feature子类
		 * 3. 返回初始化的对象
		 */
		$fatherClazz = new ReflectionClass("Feature");
		$featureType = ucfirst($featureConfig["type"]);
		$featureValue = $featureConfig["value"];
		$featureName = $featureConfig["name"];
		$classFile = self::getFeatureFile($featureConfig);
		$className = $featureType . "Feature";

		if(is_file($classFile)){
			require_once($classFile);
			$featureClazz = new ReflectionClass($className);
			if($featureClazz->isSubclassOf($fatherClazz)){
				$featureClass = $featureClazz->newInstance($featureName, $featureValue);
				return 	$featureClass;
			}else{
				self::triggerError($className . " must extends class Feature!");
			}
		}else{
			self::triggerError("Not find " . $className);
		}
		return null;
	}

    /**
     * 添加扩展feature部署的目录
     * @param $dir
     */
    public static function addFeatureDir($dir){
		if(is_dir($dir)){
			self::$defaultDir = $dir;
		}else{
			self::triggerError($dir . " is not a dir!");
		}
	}

    /**
     * 通过featureName查找计算对应feature是否生效
     * @param $featureName
     * @param $smarty
     * @return Boolean
     */
    public static function getFeature($featureName, $smarty){
		/**
		 * 1. 调用_getFeature
		 * 2. 调用initFeature
		 * 3. 调用子类的getFlag获得最终结果
		 */
		$featureInfo = self::_getFeature($featureName, $smarty);
		$featureClass = self::initFeature($featureInfo);
		$featureResult = $featureClass->getFlag();
		return $featureResult;
	}

} 
?>