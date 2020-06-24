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

        $po = new POI();
        $poi = $po->getPOI();

        $su = new sublocation();
        $sublocation = $su->getSublocation();

        $popD = new populationDensity();
        $popDensity = $popD->getPopulationDensity();

        $data->billboards = $billboardData;
        $data->uber = $uber;
        $data->poi = $poi;
        $data->sublocation = $sublocation;
        $data->popDensity = $popDensity;
        echo (json_encode($data));
    }
}
return new getData();

?>