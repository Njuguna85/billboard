<?php
require 'dbase.php';

//create a helper class to fetch your records
class ModelController
{
    public static function getModelRecords(string $modelName): array
    {
        if (class_exists($modelName)) {
            $model = new $modelName;
            return $model->getRecords();
        } else {
            throw new BadMethodCallException("class " . $modelName . " not found");
        }
    }
}
class getData extends ArrayObject
{
    public function __construct()
    {
        //now use your helper class to call the models. cuts code in half
        $this->billboards = ModelController::getModelRecords('billboard');
        $this->uber = ModelController::getModelRecords('uber');
        $this->subCounties = ModelController::getModelRecords('subcounties');
        $this->subLocations = ModelController::getModelRecords('sublocations');
        $this->atms = ModelController::getModelRecords('atms');
        // $this->kibera = $kibera;
        // $this->mathare = $mathare;
        // $this->bank = $banks;
        // $this->hospital = $hospitals;
        // $this->police = $police;
        // $this->school = $school;
        // $this->university = $university;
        // $this->bar = $bars;
        // $this->petrolStation = $petrolStations;
        // $this->grocery = $grocery;
        // $this->kiosk = $kiosk;
        // $this->pharmacy = $pharmacy;
        // $this->restaraunt = $restaraunt;
        // $this->saloon = $saloon;
        // $this->supermarket = $supermarket;
        // $this->nssf = $nssf;

        echo json_encode($this);
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
new getData();
