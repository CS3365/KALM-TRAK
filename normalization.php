<?php
define('db_hostname', 'localhost');
define('db_database', 'kt');
define('db_username', 'kt');
define('db_password', 'kt');

function login(){
  $db_server = mysql_connect(db_hostname, db_username, db_password);
  if (!$db_server) {
    die("Unable to connect to MYSQL: " . mysql_error());
  }
  mysql_select_db(db_database) 
    or die("Unable to select database: " . mysql_error());

  return $db_server;
}

// connect to the db
$db_server = login();
    
// Current time
$current_t = time();

// put the following in a loop for all trakers, only one traker in prototype {
// ***********************************************************************

$query = "SELECT `tid` FROM trakers";
$result = mysql_query($query);
    
$num_rows = mysql_num_rows($result);
echo 'Number of trakers: ' . $num_rows . '<br>';
    
for ($j = 0; $j < $num_rows; $j++){
  // Get the tracker ID you want to update here. Hardcoded for the prototype
  $tracker_row = mysql_fetch_row($result);
  $tracker_id = $tracker_row[0]; 
  echo 'Traker ID: ' . $tracker_id . '<br>';
  // Get the last entry of a traker
  $query = "SELECT * FROM powerticks WHERE tid=" . $tracker_id . " ORDER BY `when` DESC LIMIT 1";
  $result = mysql_query($query);

  // Print any errors from retrieving result
  if(!$result){
    die("Can't retrieve last entry for traker: " . mysql_error());
  }

  //-----------------------------------------------------------------
  $date_added = mysql_fetch_row($result);
 
  // Get the amount of time since the last update
  $trk_dt = explode(" ", $date_added[1]);
  echo 'Trk_dt: ' . $trk_dt[0] . ' ' . $trk_dt[1] . '<br>';

  // $trk_date[0] = YYYY; $trk_date[1] = MM; $trk_date[2] = DD
  $trk_date = explode("-", $trk_dt[0]);
  echo 'Trk_date: ' . $trk_date[0] . ' ' . $trk_date[1] . ' ' . $trk_date[2] . ' ' . '<br>';

  // $trk_time[0] = HH; $trk_time[1] = MM; $trk_time[2] = SS
  $trk_time = explode(":", $trk_dt[1]);
  echo 'Trk_time: ' . $trk_time[0] . ' ' . $trk_time[1] . ' ' . $trk_time[2] . ' ' . '<br>';

  // difference in years
  $year_diff = $trk_date[0] - date('Y');

  // difference of time in months 
  if($trk_date[1] >= date('m')){
    $month_diff = ($trk_date[1] - date('m')) + 12 * $year_diff;
  }
  else{
    $month_diff = (12 - date('m') + $trk_date[1]) + 12 * ($year_diff-1);
  }

  // difference of time in days - number of days in a month is variable
  $year = $trk_date[0];

  // Get the number of days until the end of the "first" month 
  $day_diff = date('t', mktime(0, 0, 0, $trk_date[1], 1, $trk_date[0])) - $trk_date[2];

  for($i=$trk_date[1]+1; $i<$month_diff+$trk_date[1]-1; $i++){

    // Accounts for leap years. The number of days in a month do not
    // fluctuate, except for February on leap years
    if ($i % 12 == 0){
      $year++;
    }
    $day_diff += date('t', mktime(0,0,0, (($i-1) % 12)+1, 1, $year));
  }

  // Get the number of days from the beginning of the current month until the current day    
  $day_diff += date('d');

  // Get the number hours until midnight on the first day and the number of hours until the current time of today
  $hour_diff = 23 - $trk_time[0] + date('G');
  // add to the number of hours of days inbetween the day of the last entry until the current day
  $hour_diff += 24 * ($day_diff -1);

  // Get the number of minutes until the end of the first hour and the number of minutes into the current hour
  $min_diff = 59 - $trk_time[1] + date('i');

  // Add to the number of minutes of all the hours between dates
  $min_diff += 60 * ($hour_diff -1 );
    
    echo 'min_diff: ' . $min_diff . '<br>';
  //-----------------------------------------------------------------

  // add data for every minute
  $month = $trk_date[1];

  // Get the power level for the traker
  $level_query = "SELECT `avgPowerUsage` FROM trakers WHERE `tid`=" . $tracker_id;
  $power_result = mysql_query($level_query);
  $power_row = mysql_fetch_row($power_result);
  $power = $power_row[0];
  echo 'Power: ' . $power . '<br>';
  // Print any errors from retrieving result
  if(!$power){
    die("Can't retrieve average power level for traker: " . mysql_error());
  }   

  for($i = 1; $i <= $min_diff; $i++){
    // Reset minutes to zero if loop reaches the 60th minute
    if (($trk_time[1] + $i) % 60 == 0){
      $minutes = 0;
      // Reset hours to zero if loop reaches the 24th hour
      if(($trk_time[0] + 1) % 24 == 0){
        $hours = 0;
        // Reset the day to 1 if it surpasses the last day of the month
        if(($trk_date[2] + 1) % (date('t', mktime(0,0,0,$month, 1, $year)) + 1 == 0)){
          $day = 1;
          // Reset the month to 1 if it surpasses the last month of the year
          if(($trk_date[1] + 1) % 13 == 0){
            $month = 1;
            // Starting the months over means a new year has started as well
            $year += 1;
          }
          else{
            $month += 1;
          }
        }
        else{
          $day = $trk_date[2] + 1;
        }
      }
      else{
        $hours = $trk_time[0] + 1;
      }
    }
    else{
      $minutes = $trk_time[1] + 1;
    }
    echo 'time to insert: ' . $year . '-' . $month . '-' . $day . ' ' . $hours . ':' . $minutes . '<br>';
    // The date and time for the entry to be entered has now been established. 
    // Implement a normalization algorithm to deduce whether or not the given traker
    //  should be registered as on or off

    // Case: The date of the entry is on a weekend. If the time is during the day, 
    //  give a high percentage for the traker to be on. Otherwise, give a low percentage
    //  for the traker to be on.

    // Generate a random number from 1 to 100
    $rand_num = rand(1, 100);

    // Day falls on the weekend
    if(strcasecmp("Friday", date('l', mktime($hours, $minutes, 0, $month, $day, $year)))== 0 || strcasecmp("Saturday", date('l', mktime($hours, $minutes, 0, $month, $day, $year)))== 0){

      // Check if the time is during the day or night
      // TODO - make code inside following if statement a function
      if ($hours >= 8 && $hours <= 22){
        // Use daytime percentages
        // 92% chance of being "on"
        if ($rand_num > 8){
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '" . $power . "')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned on during a weekend day: " . mysql_error());
          }
        }
        // traker is off
        else{
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '0')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned off during a weekend day: " . mysql_error());
          }
        }
      }
      // Night time during the weekend - lower percentage of being on
      // TODO - call function made for if statement above inside the else statement 
      //  instead of it's current contents
      else{
        // Use nighttime percentages
        // 8% chance of being "on"
        if ($rand_num <= 8){
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '" . $power . "')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned on during a weekend day: " . mysql_error());
          }
        }
        // traker is off
        else{
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (" . $tracker_id . ", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '0')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned off during a weekend day: " . mysql_error());
          }
        }
      }
    }
    // Day is a weekday
    else{
      // Check if the time is during the day or night
      // TODO - make code inside following if statement a function
      if (($hours >= 6 && $hours <= 8) || ($hours >=17 && $hours <= 22)){
        // Use daytime percentages
        // 95% chance of being "on"
        if ($rand_num > 5){
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '" . $power . "')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned on during a weekend day: " . mysql_error());
          }
        }
        // traker is off
        else{
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '0')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned off during a weekend day: " . mysql_error());
          }
        }
      }
      // Night time during the week - lower percentage of being on
      // TODO - call function made for if statement above inside the else statement 
      //  instead of it's current contents
      else{
        // Use nighttime percentages
        // 5% chance of being "on"
        if ($rand_num <= 5){
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '" . $power . "')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned on during a weekend day: " . mysql_error());
          }
        }
        // traker is off
        else{
          $traker_insert = "INSERT INTO powerticks (`tid`, `when`, `level`) VALUES (".$tracker_id.", '" . $year . "-" . $month . "-" . $day . " " . $hours . ":" . $minutes . ":00', '0')";
          $result = mysql_query($traker_insert);
          // Print any errors from retrieving result
          if(!$result){
            die("Can't insert data for traker turned off during a weekend day: " . mysql_error());
          }
        }
      }
    }
  }
}
// ***********************************************************************
mysql_close($db_server);

?>
