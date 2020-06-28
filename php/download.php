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
        $data1 = $data;
        echo(json_encode($data));
    }
}

new getData();

?>