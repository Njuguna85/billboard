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

        $this->subcounty = ModelController::getModelRecords('subcounty');
        $this->uber = ModelController::getModelRecords('uber');
        $this->billboard = ModelController::getModelRecords('billboard');
        $this->sublocation = ModelController::getModelRecords('sublocation');
        $this->atm = ModelController::getModelRecords('atm');
        $this->bank = ModelController::getModelRecords('bank');
        $this->hospital = ModelController::getModelRecords('hospital');
        $this->kibera = ModelController::getModelRecords('kibera');
        $this->mathare = ModelController::getModelRecords('mathare');
        $this->police = ModelController::getModelRecords('police');
        $this->school = ModelController::getModelRecords('school');
        $this->university = ModelController::getModelRecords('university');
        $this->bar = ModelController::getModelRecords('bar');
        $this->fuel = ModelController::getModelRecords('fuel');
        $this->grocery = ModelController::getModelRecords('grocery');
        $this->kiosk = ModelController::getModelRecords('kiosk');
        $this->pharmacy = ModelController::getModelRecords('pharmacy');
        $this->restaraunt = ModelController::getModelRecords('restaraunt');
        $this->saloon = ModelController::getModelRecords('saloon');
        $this->supermarket = ModelController::getModelRecords('supermarket');
        $this->nssf = ModelController::getModelRecords('nssf');
        $this->ugPopProj = ModelController::getModelRecords('ugPopProj');
        $this->ghanaDistrictPopPulation = ModelController::getModelRecords('ghanaDistrictPopPulation');
        $this->aq = ModelController::getModelRecords('aq');

    }
    //save to a file
    private function write_json_to_file($data)
    {
        //append a timestamp on the file to distinguish them
        $date = new DateTime();
        $str = $date->format("H_m_s");

        //create the file and set it to writable
        $json_file = fopen(__DIR__ . "/debug/debug_json_" . $str . ".json", "w");

        //write to file
        fwrite($json_file, $data);

        //close the file
        fclose($json_file);
    }
}
echo json_encode(new getData());
