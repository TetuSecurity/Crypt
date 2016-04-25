CREATE SCHEMA IF NOT EXISTS crypt;

CREATE TABLE IF NOT EXISTS `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(200) DEFAULT NULL,
  `Salt` varchar(32) DEFAULT NULL,
  `PasswordHash` varchar(250) DEFAULT NULL,
  `Confirm` varchar(64) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

