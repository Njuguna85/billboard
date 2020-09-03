<?php

require 'dbase.php';
class ModelController
{
    public static function getModelRecords($modelName)
    {
        if (class_exists($modelName)) {
            $model = new $modelName;
            return $model->getRecords();
        } else {
            throw new BadMethodCallException("class" . $modelName . 'not found');
        }
    }
}


class getData
{
    public $subcounty = [];
    public function __construct()
    {
        $this->billboard = ModelController::getModelRecords('billboard');
        $this->atm = ModelController::getModelRecords('atm');
        $this->bank = ModelController::getModelRecords('bank');
        $this->police = ModelController::getModelRecords('police');
        $this->university = ModelController::getModelRecords('university');
        $this->eabl = ModelController::getModelRecords('eabl');
    }
}

echo json_encode(new getData());