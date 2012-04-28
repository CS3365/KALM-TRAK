DROP DATABASE IF EXISTS `kt`;

CREATE DATABASE `kt`;

-- Create tables
CREATE TABLE `kt`.`users` (
  `uid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  `pass` VARCHAR(30) NOT NULL,  -- note: raw text, not secure!!!
  PRIMARY KEY(`uid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`area` (
  `aid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  CONSTRAINT `fk_area_user` FOREIGN KEY(`uid`)
    REFERENCES `kt`.`user` (`uid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY(`rid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`traker` (
  `tid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `aid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('smart','brilliant') NOT NULL DEFAULT('smart'),
  `status` TINYINT(1) NOT NULL,
  `avgPowerUsage` DECIMAL(10,3) NOT NULL,
  `avgHoursUsage` DECIMAL(4,2) NOT NULL,
  `stdevHoursUsage` DECIMAL(3,2) NOT NULL,
  `avgBlcoks` DECIMAL(4,2) NOT NULL,
  CONSTRAINT `fk_traker_area` FOREIGN KEY(`aid`)
    REFERENCES `kt`.`area` (`aid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY(`tid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`powertick` (
  `tid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `when` DATETIME NOT NULL,
  `level` DECIMAL(10,3) UNSIGNED NOT NULL,
  CONSTRAINT `fk_power_traker` FOREIGN KEY(`tid`)
    REFERENCES `kt`.`traker` (`tid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY(`tid`, `when`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- TODO: Input sample trakers
