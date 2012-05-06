<?php

$db_server = mysql_connect('localhost','kt','kt');
$db = mysql_select_db('kt');

//{{{1 is functions
function isValidLogin($user, $pass) {
  return getRows(
    "SELECT * ".
    "FROM users ".
    "WHERE user='$user' AND pass='$pass'") > 0;
}
//}}}1
//{{{1 get functions
function getAreas() {
  return getAssoc(
    "SELECT * ".
    "FROM areas");
}
function getTrakersInArea($areaid) {
  return getAssoc(
    "SELECT * ".
    "FROM trakers JOIN areas ".
    "WHERE aid=$areaid");
}
function getTrakersTree() {
  $areas = getAssoc(
    "SELECT name AS text, aid AS id ".
    "FROM areas");
  for($i=0; $i<count($areas); $i++) {
    $area = $areas[$i];
    $area["items"] = getAssoc(
      "SELECT name AS text, tid AS id, 'true' AS leaf ".
      "FROM trakers ".
      "WHERE tid = ".$area["id"]);
  }
  return $areas;
}
//}}}1
//{{{1 set functions
//}}}1
//{{{1 graphing functions
function plotTraker() {//$trakerid) {
  $trakerid = 1;
  return getAssoc(
    "SELECT sum(level)/60 AS power, name, HOUR(Powerticks.when) AS hour, ".
      "DATE_FORMAT(powerticks.when, '%Y/%m/%d') AS day ".
    "FROM powerticks JOIN trakers USING(tid) ".
    "WHERE tid = 1 ".
    "GROUP BY day, hour ".
    "ORDER BY day, hour");
}
//}}}1
//{{{1 mysql funtions
function query($q) {
  return mysql_query($q);
}
function getAssoc($q) {
  $r = query($q);
  $arr = array();
  while($asc = mysql_fetch_assoc($r)) {
    array_push($arr,$asc);
  }
  return $arr;
}
function getRows($q) {
  $r = query($q);
  return mysql_num_rows($r);
}
//}}}1

?>
