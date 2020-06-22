<?php

class database
{

    private $host = "localhost";
    private $db = "billboard";
    private $username = "dennis";
    private $password = "1234567890";
    private static $instance = null;

    private function __construct()
    {
        // $dsn = "pgsql:host=$this->host; dbname=$this->db";
        $dsn = "mysql:host=$this->host; dbname=$this->db";
        $options = [
            PDO::ATTR_PERSISTENT,
            PDO::ATTR_ERRMODE
        ];
        try {
            self::$instance = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
        }
    }
    public static function getInstance()
    {
        if (self::$instance == null) {
            new database();
        }
        return self::$instance;
    }
}

class billboard
{
    public $billboardi;
    public $routename;
    public $selectmedi;
    public $site_light;
    public $zone_;
    public $size_;
    public $condition;
    public $orientatio;
    public $visibility;
    public $traffic;
    public $photo;
    public $photo_long;
    public $road_type;
    public $lat;
    public $long_;
    public $scoutname;
    public $date_;
    public $angle;
    public $billboard_;
    public $constituen;
    public $customerbr;
    public $customerin;
    public $direction_;
    public $height;
    public $mediaowner;
    public $site_run_u;
    public $db;

    public function __construct()
    {
        $this->db = database::getInstance();

        $sql = "INSERT INTO 
                    billboard_locations
                VALUES(
                    billboardi =:billboardi, routename=:routename, selectmedi=:selectmedi,
                    site_light=:site_light, zone_=:zone_, size_=:size, condition=:condition_, 
                    orientatio=:orientation, visibility=:visibility, traffic=:traffic, 
                    photo=:photo, photo_long=:photo_long, road_type=:road_type, lat=:lat, long_=:long_, scoutname=:scout_name, date_=:date_, angle=:angle, billboard_=:billboard_empty, constituen=:constituency, customerbr=:customer_brand, customerin=:customer_industry,
                    direction_=:direction_from_cbd, height=:height, mediaowner=:media_owner, 
                    site_run_u=:site_run_up )";
        //
        // prepare the statement
        $this->statement = $this->db->prepare($sql);
        //
        // bind parameters
        $this->statement->bindParam(':billboardi', $this->billboardi);
        $this->statement->bindParam(':routename', $this->routename);
        $this->statement->bindParam(':selectmedi', $this->selectmedi);
        $this->statement->bindParam(':site_light', $this->site_light);
        $this->statement->bindParam(':zone_', $this->zone_);
        $this->statement->bindParam(':size', $this->size_);
        $this->statement->bindParam(':condition_', $this->condition);
        $this->statement->bindParam(':orientation', $this->orientatio);
        $this->statement->bindParam(':visibility', $this->visibility);
        $this->statement->bindParam(':traffic', $this->traffic);
        $this->statement->bindParam(':photo', $this->photo);
        $this->statement->bindParam(':photo_long', $this->photo_long);
        $this->statement->bindParam(':road_type', $this->road_type);
        $this->statement->bindParam(':lat', $this->lat);
        $this->statement->bindParam(':long_', $this->long_);
        $this->statement->bindParam(':scout_name', $this->scoutname);
        $this->statement->bindParam(':date_', $this->date_);
        $this->statement->bindParam(':angle', $this->angle);
        $this->statement->bindParam(':billboard_empty', $this->billboard_);
        $this->statement->bindParam(':constituency', $this->constituen);
        $this->statement->bindParam(':customer_brand', $this->customerbr);
        $this->statement->bindParam(':customer_industry', $this->customerin);
        $this->statement->bindParam(':direction_from_cbd', $this->direction_);
        $this->statement->bindParam(':height', $this->height);
        $this->statement->bindParam(':media_owner', $this->mediaowner);
        $this->statement->bindParam(':site_run_up', $this->site_run_u);
    }

    public function getBillboardLocations()
    {
        // sql
        $sql = "SELECT 
                billboardi, routename, selectmedi, site_light, zone_, size_,'condition', orientatio, visibility, traffic, photo, road_type, lat As latitude, long_ As longitude
            FROM 
                billboard_locations
            ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_CLASS);
    }
    public function createBillboard($billboard)
    {
        foreach ($billboard as $data) {

            $this->billboardi = $data->billboard_id;
            $this->routename = $data->route_name;
            $this->selectmedi  = $data->select_medium;
            $this->site_light  = $data->site_lighting_illumination;
            $this->zone_  = $data->zone;
            $this->size_  = $data->size;
            $this->condition  = $data->condition;
            $this->orientatio  = $data->orientation;
            $this->visibility  = $data->visibility;
            $this->traffic  = $data->traffic;
            $this->photo  = $data->photo;
            $this->photo_long  = $data->photo_longrange;
            $this->road_type  = $data->road_type;
            $this->lat  = $data->lat;
            $this->long_  = $data->long;
            $this->scoutname  = $data->scout_name;
            $this->date_  = $data->date;
            $this->angle = $data->angle;
            $this->billboard_  = $data->billboard_empty;
            $this->constituen  = $data->constituency;
            $this->customerbr  = $data->customer_brand;
            $this->customerin  = $data->customer_industry;
            $this->direction_  = $data->direction_from_cbd;
            $this->height  = $data->height;
            $this->mediaowner  = $data->media_owner;
            $this->site_run_u  = $data->site_run_up;
            // execute
            if ($this->statement->execute()) {
                return http_response_code(201);
            }
            $x= $this->statement->errorCode();
        }
    }
}
class uber
{
    public $movement_i;
    public $display_na;
    public $moveid;
    public $objectid_1;
    public $origin_mov;
    public $origin_dis;
    public $destinatio;
    public $destinat_1;
    public $date_range;
    public $mean_trave;
    public $range___lo;
    public $range___up;
    public $destiid;
    public $shape_leng;
    public $shape_area;
    public $SHAPE;
    public $db;

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getUbertime()
    {
        // sql
        $sql = "
        SELECT 
            movement_i, display_na, moveid, objectid_1, origin_mov, origin_dis, destinatio, destinat_1, date_range, mean_trave, range___lo, range___up, destiid, shape_leng, shape_area, ST_AsGeoJSON(SHAPE) As geojson
        FROM 
            uber_mean_travel_time";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class sublocation
{

    public $divname;
    public $sub_name;
    public $SHAPE;
    public $OGR_FID;
    public $locname;
    public $distname;
    public $provname;
    public $code_sub;
    public $db;

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getSublocation()
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
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class populationDensity
{
    public $SHAPE;
    public $subloactio;
    public $areasqkm;
    public $shape__are;
    public $shape__len;
    public $id;
    public $sourcecoun;
    public $enrich_fid;
    public $aggregatio;
    public $population;
    public $apportionm;
    public $hasdata;
    public $totpop_cy;
    public $pppc_cy;
    public $males_cy;
    public $females_cy;
    public $page01_cy;
    public $page02_cy;
    public $page03_cy;
    public $page04_cy;
    public $page05_cy;
    public $tothh_cy;
    public $avghhsz_cy;
    public $educ01a_cy;
    public $educ02a_cy;
    public $educ03a_cy;
    public $educ04a_cy;
    public $educ05a_cy;
    public $educ06a_cy;
    public $educ07a_cy;
    public $educ08a_cy;
    public $educ09a_cy;
    public $pop_densit;
    public $hhld_densi;
    public $area_sqkm;
    public $shape_leng;
    public $shape_area;
    public $db;

    public function __construct()
    {
        $this->db = database::getInstance();
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
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class POI
{
    public $title;
    public $location;
    public $lat;
    public $lon;
    public $details;
    public $type;
    public $subtype;
    public $level;
    public $SHAPE;
    public $db;

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getPOI()
    {
        // sql
        $sql = "
         SELECT 
             title, type, subtype, level, ST_AsGeoJSON(SHAPE, 5) As geojson
         FROM 
             points_of_interest
         ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
