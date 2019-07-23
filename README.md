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
