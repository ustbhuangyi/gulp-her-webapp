<?php

abstract class Feature{
	
	protected $value = null;
	protected $name = null;

	public function __construct($name, $value){
		$this->name = $name;
		$this->value = $value;
	}

	abstract public function getFlag();
}

?>