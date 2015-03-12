<?php
/**
 * 资源管理类 
 * 
 * @author Tobias Schlitt <toby@php.net> 
 * @license PHP Version 3.0 {@link http://www.php.net/license/3_0.txt}
 */
class BigPipeResource
{
    private static $map = array(
        "res"=>array(),
        "tpl"=>array(),
        "pkg"=>array()
        );
    private static $registedMoudle = array();
    public static $knownResources = array();
    
    public static function setupMap($map)
    {
        # code...
        self::$map["res"] = array_merge(self::$map["res"], $map["res"]);
        self::$map["tpl"] = array_merge(self::$map["tpl"], $map["tpl"]);
        self::$map["pkg"] = array_merge(self::$map["pkg"], $map["pkg"]);
    }

    public static function registModule($name)
    {
        $intPos = strpos($name, ':');

        if($intPos === false){
            return;
        } else {
            $femodule = substr($name, 0, $intPos);
        }

        $configPath = BIGPIPE_CONF_DIR;
        
        if(!in_array($femodule, self::$registedMoudle)){
            $mapPath = $configPath . '/' . $femodule . '-map.json';
            $map     = json_decode(file_get_contents($mapPath), true);
            BigPipeResource::setupMap($map);
            self::$registedMoudle[] = $femodule;
        }
    }

    public static function getTplByPath($path)
    {
        return self::$map["tpl"][$path];
    }

    public static function getResourceByPath($path, $type = null){
        $map = self::$map["res"];
        foreach ($map as $id => $resource) {
            if( (!isset($type) || $type == $resource['type']) 
                && in_array($path, $resource['defines'])){
                $resource['id'] = $id;
                if(!isset($resource['requires'])) $resource['requires'] = array();
                if(!isset($resource['requireAsyncs'])) $resource['requireAsyncs'] = array();
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