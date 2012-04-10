DROP DATABASE IF EXISTS `KALMTRAK`;

CREATE DATABASE `KALMTRAK`;
USE `KALMTRAK`;

CREATE TABLE users(
  `uid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `pass` CHAR(40) NOT NULL,        # SHA1
  PRIMARY KEY(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE accounts(
  `aid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY(`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE rooms(
  `rid` INT(10) UNSIGNED NOT NULL,
  `aid` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY(`rid`),
  KEY `fk_rooms_accounts` (`aid`),
  CONSTRAINT `fk_rooms_accounts` FOREIGN KEY (`aid`)
    REFERENCES `accounts`(`aid`)
    ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE trakers(
  `tid` INT(10) UNSIGNED NOT NULL,
  `rid` INT(10) UNSIGNED NOT NULL,
  `type` ENUM("smart", "brilliant"),
  `status` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY(`tid`),
  KEY `fk_trakers_rooms` (`rid`),
  CONSTRAINT `fk_trakers_rooms` FOREIGN KEY (`rid`)
    REFERENCES `rooms`(`rid`)
    ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
