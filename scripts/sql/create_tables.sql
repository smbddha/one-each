CREATE DATABASE IF NOT EXISTS oneeach;
CREATE TABLE IF NOT EXISTS oneeach.messages (
    ip INT,
    8h_msg VARCHAR(99),
    8h_time TIMESTAMP NULL DEFAULT NULL,
    24h_msg VARCHAR(99),
    24h_time TIMESTAMP NULL DEFAULT NULL,
    7d_msg VARCHAR(99),
    7d_time TIMESTAMP NULL DEFAULT NULL,
    30d_msg VARCHAR(99),
    30d_time TIMESTAMP NULL DEFAULT NULL,
    1y_msg VARCHAR(99),
    1y_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ip)
);

create table if not exists oneeach.tmessages (
    ip INT,
    message VARCHAR(99),
    period ENUM('8h', '24h', '7d', '30d', '1y'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ip)
);
