<?php

class database extends PDO
{

    private $host = "localhost";
    private $db = "billboard";
    private $username = "dennis";
    private $password = "1234567890";

    public function __construct()
    {
        // $dsn = "pgsql:host=$this->host; dbname=$this->db";
        $dsn = "mysql:host=$this->host; dbname=$this->db";
        try {

            parent::__construct($dsn, $this->username, $this->password);

            // set the PDO error mode to exception
            $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
        }
    }
    public function getBillboardLocations()
    {
        // sql
        $sql = "
            SELECT 
                billboardi, routename, selectmedi, site_light, zone_, size_,'condition', orientatio, visibility, traffic, photo, road_type, lat As latitude, long_ As longitude
            FROM 
                billboard_locations
            ";
        // query the sql
        $statement =  $this->query($sql);
        // fetch result
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        echo JSON_encode($results);
    }
    public function getNairobiSublocations()
    {
        // sql
        $sql = "
            SELECT 
                objectid, divname as Division, sub_name as Sublocation,
                ST_AsGeoJSON(SHAPE) As geojson
            FROM 
                nairobi_sublocations
            ";
        // query the sql
        $statement =  $this->query($sql);
        // fetch result
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        echo JSON_encode($results);
    }
    public function getPointsOfInterest()
    {
        // sql
        $sql = "
            SELECT 
                title, type, subtype, level, ST_AsGeoJSON(SHAPE, 5) As geojson
            FROM 
                points_of_interest
            ";
        // query the sql
        $statement =  $this->query($sql);
        // fetch result
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        echo JSON_encode($results);
    }
    public function getPopulationDensity()
    {
        // sql
        $sql = "
            SELECT 
                subloactio as Area, areasqkm as AreaSize, totpop_cy as Population,
                males_cy as Male, females_cy as Female, ST_AsGeoJSON(SHAPE, 5) As geojson
            FROM 
                population_density
            ";
        // query the sql
        $statement =  $this->query($sql);
        // fetch result
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        echo JSON_encode($results);
    }
    public function getUberMeanTime()
    {
        // sql
        $sql = "
            SELECT 
                movement_i, display_na, moveid, objectid_1, origin_mov, origin_dis, destinatio, destinat_1, date_range, mean_trave, range___lo, range___up, destiid, shape_leng, shape_area, ST_AsGeoJSON(SHAPE) As geojson
            FROM 
                uber_mean_travel_time
            ";
        // query the sql
        $statement =  $this->query($sql);
        // fetch result
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);
       
        echo JSON_encode($results);
    }
}
