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
        // $this->ugPopProj = ModelController::getModelRecords('ugPopProj');
        $this->aq = ModelController::getModelRecords('aq');
    }
}

echo json_encode(new getData());