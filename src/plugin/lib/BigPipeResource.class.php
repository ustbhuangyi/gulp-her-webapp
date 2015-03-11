<?php
/**
 * 资源管理类 
 * 
 * @author Tobias Schlitt <toby@php.net> 
 * @license PHP Version 3.0 {@link http://www.php.net/license/3_0.txt}
 */
class BigPipeResource
{
    private static $map = array();
    private static $fismap = array(
        "res"=>array(),
        "tpl"=>array(),
        "pkg"=>array()
        );
    private static $registedMoudle = array();
    public static $knownResources = array();
    
    public static function setupFisMap($map)
    {
        # code...
        self::$fismap["res"] = array_merge(self::$fismap["res"], $map["res"]);
        self::$fismap["tpl"] = array_merge(self::$fismap["tpl"], $map["tpl"]);
        self::$fismap["pkg"] = array_merge(self::$fismap["pkg"], $map["pkg"]);
    }

    public static function registModule($name)
    {
        $intPos = strpos($name, ':');

        if($intPos === false){
            return;
        } else {
            $femodule = substr($name, 0, $intPos);
        }

        //$configPath = SMARTY_TEMPLATE_DIR . '/config';
        //$configPath = SMARTY_CONF_DIR;
        $configPath = BIGPIPE_CONF_DIR;
        
        if(!in_array($femodule, self::$registedMoudle)){
            $fismapPath = $configPath . '/' . $femodule . '-map.json';
            $fismap     = json_decode(file_get_contents($fismapPath), true);
            BigPipeResource::setupFisMap($fismap);
            self::$registedMoudle[] = $femodule;
        }
        //var_dump(self::$fismap["tpl"]);
        //$hermap = BigPipe::array_merge($commonMap, $hermap);
    }

    public static function getFisResourceByPath($path, $type)
    {
        return self::$fismap[$type][$path];
    }

    public static function getResourceByPath($path, $type = null){
        $map = self::$fismap["res"];
        foreach ($map as $id => $resource) {
            if( (!isset($type) || $type == $resource['type']) 
                && in_array($path, $resource['defines'])){
                $resource['id'] = $id;
                if(!isset($resource['requires'])) $resource['requires'] = array();
                if(!isset($resource['requireAsyncs'])) $resource['requireAsyncs'] = array();
                //return array($id, $resource);
                return $resource;
            }
        }
        return false;
    }

    public static function pathToResource($pathArr, $type = null){
        $resources = array();

        foreach ($pathArr as $path) {
            $resource = self::getResourceByPath($path, $type);
            if($resource){
                $resources[$resource['id']] = $resource;
            }
        }
        return $resources;
    }

    public static function getDependResource($resources, $asyncs = true){
        $dependResources = array();
        //$dependResources = $resources;

        $depends = $resources;

        while(!empty($depends)){

            $last = end($depends);
            array_pop($depends);

            $id = $last['id'];

            if(isset($dependResources[$id])){
                continue;
            }            
            $dependResources[$id] = $last;

            $lastDepends = self::getDepend($last, $asyncs);
            if(!empty($lastDepends)){
                $depends = BigPipe::array_merge($depends, $lastDepends);
            }
        }

        return array_reverse($dependResources, true);
    }

    private static function getDepend($resource, $asyncs){
        $requires = $resource['requires'];

        if($asyncs){
            $requires = array_merge($requires, $resource['requireAsyncs']);
        }

        if(count($requires) > 0 ){
            return $dependResources = self::pathToResource($requires);
        }
        return array();
    }

}