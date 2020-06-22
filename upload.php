<?php
require 'dbase.php';

$data = json_decode($_POST['billboardData']);
$billboard = new billboard();
$billboard->createBillboard($data);
