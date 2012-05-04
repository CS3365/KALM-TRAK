DROP DATABASE IF EXISTS `kt`;

CREATE DATABASE `kt`;

-- Create tables
CREATE TABLE `kt`.`users` (
  `uid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  `pass` VARCHAR(30) NOT NULL,  -- note: raw text, not secure!!!
  PRIMARY KEY(`uid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`areas` (
  `aid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  CONSTRAINT `fk_area_user` FOREIGN KEY(`uid`)
    REFERENCES `kt`.`user` (`uid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY(`aid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`trakers` (
  `tid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `aid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('smart','brilliant') NOT NULL DEFAULT 'smart',
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `avgPowerUsage` DECIMAL(10,3) NOT NULL,
  `avgHoursUsage` DECIMAL(4,2) NOT NULL,
  `stdevHoursUsage` DECIMAL(3,2) NOT NULL,
  `avgBlocks` DECIMAL(4,2) NOT NULL,
  CONSTRAINT `fk_traker_area` FOREIGN KEY(`aid`)
    REFERENCES `kt`.`area` (`aid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY(`tid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `kt`.`powerticks` (
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

INSERT INTO `kt`.`users`(uid,name,pass) VALUES
  (1,'user','pass');

INSERT INTO `kt`.`areas`(uid,aid,name) VALUES
  (1,1,'Foyer'),
  (1,2,'Master Bedroom'),
  (1,3,'Living Room'),
  (1,4,'Billy\'s Bedroom'),
  (1,5,'Upstairs Hallway'),
  (1,6,'Games Room'),
  (1,7,'Mary\'s Bedroom');

INSERT INTO `kt`.`trakers`
  (tid,aid,name,avgPowerUsage,avgHoursUsage,stdevHoursUsage,avgBlocks) VALUES
  (1,1,'Lamp 1',500,2,.5,2),
  (1,2,'Lamp 2',500,2,.5,2),
  (1,3,'Lamp 3',500,2,.5,2),
  (2,4,'Lamp 4',500,2,.5,2),
  (2,5,'Lamp 5',500,2,.5,2),
  (2,6,'Television 1',500,2,.5,2),
  (3,7,'Lamp 6',500,2,.5,2),
  (3,8,'Lamp 7',500,2,.5,2),
  (3,9,'Television 2',500,2,.5,2),
  (4,10,'Lamp 8',500,2,.5,2),
  (4,11,'Lamp 9',500,2,.5,2),
  (4,12,'Televsion 3',500,2,.5,2),
  (5,13,'Lamp 10',500,2,.5,2),
  (5,14,'Lamp 11',500,2,.5,2),
  (6,15,'Lamp 12',500,2,.5,2),
  (6,16,'Lamp 13',500,2,.5,2),
  (6,17,'XBox',500,2,.5,2),
  (6,18,'Wii',500,2,.5,2),
  (6,18,'Television 4',500,2,.5,2),
  (7,20,'Lamp 14',500,2,.5,2),
  (7,21,'Lamp 14',500,2,.5,2),
  (7,22,'Television 5',500,2,.5,2);
