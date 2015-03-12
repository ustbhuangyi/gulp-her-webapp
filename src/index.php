<?php
ini_set('display_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

function render_smarty($tpl = null, $data = array()) {
    $root = dirname(__FILE__) . DIRECTORY_SEPARATOR;
    if (!$tpl) {
        $path = $_SERVER['REQUEST_URI'];
        $split = explode('/', $path);
        $last = array_pop($split);
        $len = count($split);
        if(($pos = strpos($path, '?')) !== false){
            $path = substr($path, 0, $pos);
        }
        if(1 === $len){
            $path .= '/index.tpl';
        } else {
            $path .= '.tpl';
        }
        $tpl = $root . 'template' . $path;
    }
    if(!file_exists($tpl)){
        echo "404 Not Found";
        exit;
    }

    $data_path = str_replace('/template', '/test', $tpl);
    $data_path = str_replace('.tpl', '.php', $data_path);

    require_once ($root . 'smarty/Smarty.class.php');
    $smarty = new Smarty();
    $default_conf = array(
        'template_dir' => 'template',
        'config_dir' => 'config',
        'plugins_dir' => array( 'plugin' ),
        'left_delimiter' => '{%',
        'right_delimiter' => '%}'
    );

    $smarty->setTemplateDir($root . $default_conf['template_dir']);
    $smarty->setConfigDir($root . $default_conf['config_dir']);
    foreach ($default_conf['plugins_dir'] as $dir) {
        $smarty->addPluginsDir($root . $dir);
    }
    $smarty->setLeftDelimiter($default_conf['left_delimiter']);
    $smarty->setRightDelimiter($default_conf['right_delimiter']);
    if(file_exists($data_path)){
        require_once ($data_path);
        $smarty->assign($fis_data);
    }
    $smarty->display($tpl);
}

render_smarty();