CREATE USER IF NOT EXISTS 'oneeachRW'@'localhost' IDENTIFIED BY '';
GRANT SELECT,INSERT,UPDATE ON oneeach.messages TO 'oneeachRW'@'localhost';
