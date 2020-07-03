<?php
require 'dbase.php';

class getData
{
    public function __construct()
    {
        $data = new stdClass();

        $billboard = new billboard();
        $billboardData = $billboard->getBillboardLocations();

        $u = new uber();
        $uber = $u->getUbertime();

        $sub = new subcounties();
        $subcounties = $sub->getsubcounties();

        $at = new atm();
        $atms = $at->getAtm();

        $ba= new bank();
        $banks = $ba->getBank();

        $hos = new hospital();
        $hospitals = $hos->getHospital();

        $ki = new kibera();
        $kibera = $ki->getKibera();

        $ma = new mathare();
        $mathare = $ma->getMathare();

        $pol = new police();
        $police = $pol->getPolicePost();

        $sch = new schools();
        $school = $sch->getSchools();

        $uni = new universities();
        $university = $uni->getUniversity();
        
        // $po = new POI();
        // $poi = $po->getPOI();


        $data->billboards = $billboardData;
        $data->uber = $uber;
        $data->subCounties = $subcounties;
        $data->atms = $atms;
        $data->banks= $banks;
        $data->hospitals = $hospitals;
        $data->kibera = $kibera;
        $data->mathare = $mathare;
        $data->police = $police;
        $data->schools = $school;
        $data->universities = $university;
        // $data->poi = $poi;
        
        $final = json_encode($data);
        //$this->write_json_to_file($final);
        echo $final;
    }
    
    
    //save to a file
    private function write_json_to_file($data){
        //append a timestamp on the file to distinguish them
        $date = new DateTime();
        $str = $date->format("H_m_s");
        
        //create the file and set it to writable
        $json_file = fopen(__DIR__."/debug/debug_json_".$str.".json", "w"); 
        
        //write to file
        fwrite($json_file, $data);
        
        //close the file
        fclose($json_file);
    }
}
new getData();

?>