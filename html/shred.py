#!/usr/bin/env python3

import sys
import os
import csv
import json
import sqlite3
from sqlite3 import Error

def connect(db):
    try:
        return sqlite3.connect(db)
    except Error as e:
        print(e)
        sys.exit(1)


def main():
    dirname = os.path.dirname(os.path.realpath(__file__))
    dbfile = os.path.join(dirname, 'data.sqlite')
    db = connect(dbfile)
    db.row_factory = sqlite3.Row

    c = db.cursor()
    c.execute('SELECT * FROM dyf')
    for row in c.fetchall():
        pid = row['pid']
        timestamp = row['timestamp']
        version = row['version']
        if pid == '' or pid == None:
            continue

        outpath = os.path.join(dirname, 'data', f'{pid}.csv')
        with open(outpath, 'w') as csvfile:
            out = csv.writer(csvfile)
            out.writerow(['PID', 'Version', 'Timestamp', 'Kind', 'X', 'Y', 'MS'])
            
            def parse_chunk(name):
                chunk = json.loads(row[name])
                for point in chunk:
                    out.writerow([pid, version, timestamp, name, point['x'], point['y'], point['time']])

            parse_chunk('NegativeFace')
            parse_chunk('PositiveFace')
            parse_chunk('EMAWin')
            parse_chunk('EMALose')
            parse_chunk('TSST')


if __name__ == '__main__':
    main()
