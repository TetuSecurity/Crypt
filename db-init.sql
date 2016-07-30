CREATE SCHEMA IF NOT EXISTS `crypt`;
USE `crypt`;

CREATE TABLE IF NOT EXISTS `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(200) DEFAULT NULL,
  `Salt` varchar(32) DEFAULT NULL,
  `PasswordHash` varchar(250) DEFAULT NULL,
  `Confirm` varchar(64) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `sessions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Session_ID` varchar(64) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `Expires` bigint(20) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Session_ID_UNIQUE` (`Session_ID`),
  KEY `user_idx` (`User_ID`),
  CONSTRAINT `user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `filemetadata` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FileID` varchar(100) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Size` bigint(20) unsigned DEFAULT NULL,
  `Owner` int(11) NOT NULL,
  `Location` text,
  `Key_ID` int(11) DEFAULT NULL,
  `Parent` int(11) NOT NULL DEFAULT '-1',
  `CreatedDT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ModifiedDT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `fname` (`Name`,`Owner`,`Parent`),
  UNIQUE KEY `FileID_UNIQUE` (`FileID`),
  KEY `FileOwner_idx` (`Owner`),
  KEY `parent_idx` (`Parent`),
  KEY `Key_idx` (`Key_ID`),
  CONSTRAINT `FileOwner` FOREIGN KEY (`Owner`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
