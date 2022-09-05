CREATE USER IF NOT EXISTS 'oneeachRW'@'localhost' IDENTIFIED BY '';
GRANT SELECT,INSERT ON oneeach.messages TO 'oneeachRW'@'localhost';
