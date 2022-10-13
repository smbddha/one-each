# CREATE_TABLE_SQL="CREATE TABLE messages (ip INTEGER, msg_8h TEXT, time_8h DATETIME NULL DEFAULT NULL, msg_24h TEXT, time_24h DATETIME NULL DEFAULT NULL, msg_7d TEXT, time_7d DATETIME NULL DEFAULT NULL, msg_30d TEXT, time_30d DATETIME NULL DEFAULT NULL, msg_1y TEXT, time_1y DATETIME NULL DEFAULT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(ip));"
SQL_FILE="./scripts/sqlite/create_table.sql"

if [ -z "$DBFILE" ]; then
    echo "no dbfile name specified"
    exit 1
fi

if [ -f "$DBFILE" ]; then
    echo "$DBFILE exists."
    exit 1
fi

if [ -f "$SQL_FILE" ]; then
    touch $DBFILE
    sqlite3 ${DBFILE} < ${SQL_FILE}
    exit 1
fi

