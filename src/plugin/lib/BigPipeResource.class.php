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
    private static $fismap = array("res"=>array());
    private static $registedMoudle = array(
        'her' => array(),
        'fis' => array()
    );
    public static $knownResources = array();
    
    public static function setupMap($map)
    {
        # code...
        self::$map = BigPipe::array_merge(self::$map, $map);
    }

    public static function setupFisMap($map)
    {
        # code...
        self::$fismap["res"] = array_merge(self::$fismap["res"], $map["res"]);
    }

    public static function registModule($name, $fis = false)
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
        
        if(!in_array($femodule, self::$registedMoudle['her'])){
            $hermapPath = $configPath . '/' . $femodule . '-hermap.json';
            $hermap     = json_decode(file_get_contents($hermapPath), true);
            BigPipeResource::setupMap($hermap);
            self::$registedMoudle['her'][] = $femodule;
        }

        if($fis && !in_array($femodule, self::$registedMoudle['fis'])){
            $fismapPath = $configPath . '/' . $femodule . '-map.json';
            $fismap     = json_decode(file_get_contents($fismapPath), true);
            BigPipeResource::setupFisMap($fismap);
            self::$registedMoudle['fis'][] = $femodule;
        }
        //var_dump(self::$registedMoudle);
        //$hermap = BigPipe::array_merge($commonMap, $hermap);
    }

    public static function getFisResourceByPath($path)
    {
        return self::$fismap["res"][$path];
    }

    public static function getResourceByPath($path, $type = null){
        $map = self::$map;
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