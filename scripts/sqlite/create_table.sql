CREATE TABLE messages (
    ip INTEGER,
    msg_8h TEXT,
    time_8h DATETIME NULL DEFAULT NULL,
    msg_24h TEXT,
    time_24h DATETIME NULL DEFAULT NULL,
    msg_7d TEXT,
    time_7d DATETIME NULL DEFAULT NULL,
    msg_30d TEXT,
    time_30d DATETIME NULL DEFAULT NULL,
    msg_1y TEXT,
    time_1y DATETIME NULL DEFAULT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ip)
);
