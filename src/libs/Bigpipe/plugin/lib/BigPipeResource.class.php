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
        "her"=>array()
    );
    private static $registedMoudle = array();
    public static $knownResources = array();

    public static function setupMap($map)
    {
        self::$map["res"] = self::$map["res"] + $map["res"];
        self::$map["her"] = self::$map["her"] + $map["her"];
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
        return self::$map["res"][$path];
    }

    public static function getResourceByPath($path, $type = null){

        $map = self::$map["her"];
        $resource = self::getResource($map,$path,$type);
        if($resource)
          return $resource;
        return false;
    }

    public static function getResource($map,$path, $type){
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
