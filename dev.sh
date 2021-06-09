#!/bin/sh

VERSION="v1.0.3"

scp html/* celliwig:/var/www/www_root/test/dyf-$VERSION
scp README.md celliwig:/var/www/www_root/test/dyf-$VERSION
