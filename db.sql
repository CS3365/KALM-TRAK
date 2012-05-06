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
  (2,1,'Lamp 2',500,2,.5,2),
  (3,1,'Lamp 3',500,2,.5,2),
  (4,2,'Lamp 4',500,2,.5,2),
  (5,2,'Lamp 5',500,2,.5,2),
  (6,2,'Television 1',500,2,.5,2),
  (7,3,'Lamp 6',500,2,.5,2),
  (8,3,'Lamp 7',500,2,.5,2),
  (9,3,'Television 2',500,2,.5,2),
  (10,4,'Lamp 8',500,2,.5,2),
  (11,4,'Lamp 9',500,2,.5,2),
  (12,4,'Televsion 3',500,2,.5,2),
  (13,5,'Lamp 10',500,2,.5,2),
  (14,5,'Lamp 11',500,2,.5,2),
  (15,6,'Lamp 12',500,2,.5,2),
  (16,6,'Lamp 13',500,2,.5,2),
  (17,6,'XBox',500,2,.5,2),
  (18,6,'Wii',500,2,.5,2),
  (19,6,'Television 4',500,2,.5,2),
  (20,7,'Lamp 14',500,2,.5,2),
  (21,7,'Lamp 14',500,2,.5,2),
  (22,7,'Television 5',500,2,.5,2);

INSERT INTO `kt`.`powerticks` (`tid`,`when`,`level`) VALUES
  (1, '2012-05-01', 500);
