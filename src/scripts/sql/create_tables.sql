CREATE DATABASE IF NOT EXISTS oneeach;
CREATE TABLE IF NOT EXISTS oneeach.messages (
    ip INT,
    day_msg VARCHAR(99),
    day_time TIMESTAMP NULL DEFAULT NULL,
    week_msg VARCHAR(99),
    week_time TIMESTAMP NULL DEFAULT NULL,
    month_msg VARCHAR(99),
    month_time TIMESTAMP NULL DEFAULT NULL,
    year_msg VARCHAR(99),
    year_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ip)
);
