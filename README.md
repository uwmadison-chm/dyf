# Draw Your Feels

## aka Draw Your Emotional Timecourses

Client uses `jquery` and `D3` from CDNs.

Server requires `php` and `php-pdo`, with `sqlite`.

The directory it is in must be marked writable.

## About

`backend.php` stores to SQLite.

`view.php` shows totals and most recent entry dates, so experimenters can 
confirm things are working.

## AFCHRON deployment

Currently this is hosted on celliwig in `/var/www/www_root/dyf`.

Run `production.sh` to update it.

## Shredding the data

`shred.py sqlite.dbname output_path` creates per-participant CSV files from 
the SQLite data.

Kind documents which screen they are on. X and Y coordinates are values
from 0 to 1 starting in the lower left corner of the screen. MS is how many 
milliseconds since the start of that portion of the task.

EMA game was removed in cohort 2, so those records do not have EMAWin and 
EMALose.

For PandemicStress, added in cohort 2, there is no MS; those values are 
instead stored where X goes from 0 to 13, 0 is January 2020 and 13 is February 
2021.

StressLastMonth was also added for cohort 2, and is a value from 1 to 10.
