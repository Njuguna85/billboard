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
                    (billboardi, routename, selectmedi, site_light, zone_, size_, `condition`, 
                    orientatio, visibility, traffic, photo, photo_long, road_type, lat, 
                    long_, scoutname, date_, angle, billboard_, constituen, customerbr, customerin,
                    direction_, height, mediaowner, site_run_u )
                VALUES(
                    :billboardi, :routename, :selectmedi,:site_light, :zone_, :size, :condition_, 
                    :orientation, :visibility, :traffic, :photo, :photo_long, :road_type,
                    :lat, :long_, :scout_name, :date_, :angle, :billboard_empty, :constituency,
                    :customer_brand, :customer_industry, :direction_from_cbd, :height, :media_owner, 
                    :site_run_up )";

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
    private function convertDate($date)
    {
        return date("Y-m-d", strtotime(str_replace('/', '-', $date)));
    }
    public function createBillboard($billboard)
    {
        foreach ($billboard as $data) {

            $this->billboardi = isset($data->billboard_id) ? $data->billboard_id : null;
            $this->routename = isset($data->route_name) ? $data->route_name : null;
            $this->selectmedi  = isset($data->select_medium) ? $data->select_medium : null;
            $this->site_light  = isset($data->site_lighting_illumination) ? $data->site_lighting_illumination : null;
            $this->zone_  = isset($data->zone) ? $data->zone : null;
            $this->size_  = isset($data->size) ? $data->size : null;
            $this->condition  = isset($data->condition) ?  $data->condition : null;
            $this->orientatio  = isset($data->orientation) ? $data->orientation : null;
            $this->visibility  = isset($data->visibility) ? $data->visibility : null;
            $this->traffic  = isset($data->traffic) ? $data->traffic : null;
            $this->photo  = isset($data->photo) ? $data->photo : null;
            $this->photo_long  = isset($data->photo_longrange) ? $data->photo_longrange : null;
            $this->road_type  = isset($data->road_type) ? $data->road_type : null;
            $this->lat  = isset($data->lat) ? $data->lat : null;
            $this->long_  = isset($data->long) ? $data->long : null;
            $this->scoutname  = isset($data->scout_name) ? $data->scout_name : null;
            $this->date_  = isset($data->date) ? $this->convertDate($data->date) : null;
            $this->angle = isset($data->angle) ? $data->angle : null;
            $this->billboard_  = isset($data->billboard_empty) ? $data->billboard_empty : null;
            $this->constituen  = isset($data->constituency) ? $data->constituency : null;
            $this->customerbr  = isset($data->customer_brand) ? $data->customer_brand : null;
            $this->customerin  = isset($data->customer_industry) ? $data->customer_industry : null;
            $this->direction_  = isset($data->direction_from_cbd) ? $data->direction_from_cbd : null;
            $this->height  = isset($data->height) ? $data->direction_from_cbd : null;
            $this->mediaowner  = isset($data->media_owner) ? $data->media_owner : null;
            $this->site_run_u  = isset($data->site_run_up) ? $data->site_run_up : null;
            // execute
            try {
                $this->statement->execute();
                http_response_code(201);
            } catch (Exception $e) {
                //throw $th;
                http_response_code(500);
            }
        }
        return http_response_code();
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

class subcounties
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getsubcounties()
    {
        // sql
        $sql = "
                SELECT 
                    ST_AsGeoJSON(SHAPE) As geojson, subcontnam, total5abov, totaldisab, totalpopul, malepopula, femalepopu
                FROM 
                    nairobisubcounties
            ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class atm
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getAtm()
    {
        // sql
        $sql = "
        SELECT
            ST_AsGeoJSON(SHAPE) As geojson, operator 
        FROM atms  
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class bank
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getBank()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            banks
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
class hospital
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getHospital()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            hospitals
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class kibera
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getKibera()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            kibera
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class mathare
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getMathare()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            mathare
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
class police
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getPolicePost()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            police_post
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
class schools
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getSchools()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name, accessibil
        FROM 
            schools
        ";
        // query the sql
        $statement =  $this->db->query($sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
class universities
{

    public function __construct()
    {
        $this->db = database::getInstance();
    }
    public function getUniversity()
    {
        // sql
        $sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name
        FROM 
            universities
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
