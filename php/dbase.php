<?php
require "config.php";
class database
{
    private $host = HOSTNAME;
    private $db = DATABASE;
    private $username = USERNAME;
    private $password = PASSWORD;
    private static $instance = null;

    private function __construct()
    {
        $dsn = "mysql:host=$this->host;charset=utf8; dbname=$this->db";
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

abstract class Model
{
    protected static $db;
    public $sql;

    public function __construct()
    {
        self::$db = database::getInstance();
    }

    public function getRecords()
    {
        // query the sql
        $statement =  self::$db->query($this->sql);
        // fetch result
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

class subcounty extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, subcontnam, total5abov, male5above,
            fema5above, totaldisab, maledisabl, femaledisa, totalable, maleable, 
            femaleable, totalnotst, malenotsta, femalenots, percentdis, totalvisua, 
            malevisual, femalevisu, totalheari, malehearin, femalehear, totalmobil,
            malemobili, femalemobi, totalcogni, malecognit, femalecogn, totalselfc,
            maleselfca, femaleself, totalcommu, malecommun, femalecomm, totalpopul,
            malepopula, femalepopu, totalalbin, malealbini, femalealbi
        FROM 
            nairobisubcounties
    ";
    }
}

class billboard extends Model
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

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            billboardi, routename, selectmedi, site_light, zone_, size_,'condition', orientatio, visibility, traffic, photo, road_type, lat As latitude, long_ As longitude
        FROM 
            billboard_locations
        ";
    }
    public function addBillboard()
    {
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
        // $this->statement = $this->db->prepare($sql);

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

class uber extends Model
{

    public function __construct()
    {
        $this->sql =  "
        SELECT 
            movement_i, display_na, moveid, objectid_1, origin_mov, origin_dis, destinatio, destinat_1, date_range, mean_trave, range___lo, range___up, destiid, shape_leng, shape_area, ST_AsGeoJSON(SHAPE) As geojson
        FROM 
            uber_mean_travel_time";
    }
}

class aq extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            customer_n, customer_t, address_1, address_2, latitude, longitude, customer_1, created_da, gt_country, bt_territo, bt_area, bt_town, cs_chanel, cs_type_of 
        FROM 
            africanqueenregister 
        ";
    }
    public function getRecords()
    {
        // query the sql
        $statement =  self::$db->query($this->sql);
        // fetch result
        $this->values = $statement->fetchAll(PDO::FETCH_ASSOC);
        // start with an empty categories array
        // this will store all our data in their specific arrays
        $data = array();

        $custCategories = array('Airline', 'Bar', 'Beauty shop', 'Bookshop', 'Border Duty Free Shop', 'Canteen', 'Cash', 'Clinic/ Surgery', 'College', 'Convenience store', 'Cosmetics', 'Dairy shop', 'Drug store', 'Foods', 'General Merchandiser', 'Hospital', 'Hotel', 'Hypermarket', 'Inn/ Motel', 'Key Account', 'Kiosk', 'Mini supermarket', 'Office', 'Other', 'Petrol station', 'Pharmacy', 'Primary School', 'Recreational', 'Restaurant', 'Sales Rep', 'Saloon', 'Secondary School', 'Spa', 'Staff', 'Stationary', 'Supermarket', 'University', 'Washing bay', 'Wholesaler');

        foreach ($custCategories as $cat) {
            $custCategory = new stdClass();
            $category = array();
            $passedFilter = array_filter($this->values, function ($key) use ($cat) {
                return $key['customer_t'] == $cat;
            });
            array_push($category, $passedFilter);
        }
        $custCategory->$cat = $category;
        array_push($data, $custCategory);

        return $data;
    }
}

class sublocation extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, slname, aligned_su, subloc_20, count_, pop_09, male_09, female_09, pop_19, male_19, female_19, makeshift_, pop_makesh, total_hh, hh_convern, hh_group_q, densityper, percnt_50Plus, percnt_65Plus, percnt_pop, improved_w, unimproved, likely_pri, open_waste, percent_mo, mean_habit, median_hab, informal_s, selfemploy, percent_in, ratio_avg_ 
        FROM 
            nairobisublocations
    ";
    }
}

class atm extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
            SELECT
                ST_AsGeoJSON(SHAPE) As geojson, operator 
            FROM 
                atms
            LIMIT
                    20  
        ";
    }
}

class bank extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
            SELECT 
                ST_AsGeoJSON(SHAPE) As geojson, name 
            FROM 
                banks
            LIMIT
                20
        ";
    }
}

class hospital extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            hospitals
        ";
    }
}

class kibera extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            kibera
        ";
    }
}

class mathare extends Model
{

    public function __construct()
    {
        parent::__construct();

        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            mathare
        ";
    }
}

class police extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name 
        FROM 
            police_post
        LIMIT
            20
        ";
    }
}

class school extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name
        FROM 
            schools
        LIMIT
            20
        ";
    }
}

class university extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, name
        FROM 
            universities
        LIMIT
            20
        ";
    }
}

class POI extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            title, type, subtype, level, ST_AsGeoJSON(SHAPE, 5) As geojson
        FROM 
            points_of_interest
        ";
    }
}

class bar extends Model
{
    public function __construct()
    {
        parent::__construct();

        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name 
        FROM 
            bars 
        LIMIT
            20
     ";
    }
}

class fuel extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name 
        FROM 
            fuel 
     ";
    }
}

class grocery extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            grocery 
        LIMIT
            20
     ";
    }
}

class kiosk extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            kiosks
        LIMIT
            20
     ";
    }
}

class pharmacy extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            pharmacy
        LIMIT
            20
     ";;
    }
}

class restaraunt extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            restaurant
        LIMIT
            20
     ";
    }
}

class saloon extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            saloon
        LIMIT
            20
     ";
    }
}

class supermarket extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE, 5) As geojson, name
        FROM 
            supermarket
        LIMIT
            20
     ";
    }
}

class nssf extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->sql = "
            SELECT
                ST_AsGeoJSON(SHAPE) As geojson, name 
            FROM ug_nssf  
            ";
    }
}

class ugPopProj extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, county, district, subcounty, male, female, total
        FROM 
            ugcensusproj 
        ";
    }
}

class ghanaDistrictPopPulation extends Model
{
    public function __construct()
    {
        parent::__construct();

        $this->sql = "
        SELECT 
            ST_AsGeoJSON(SHAPE) As geojson, adm2_name, totpop_cy, mrstsingle, mrstmarrie, mrstdiv, purchppc, males_cy, females_cy, tothh_cy, ttfoodbeva, alcoholbev, tobacco, clothing, electronis, toysportsg 
        FROM 
            ghanapopulation ";
    }
}
