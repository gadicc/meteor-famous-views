#!/bin/bash

cd laika
if [ -n "$LAIKA_OPTIONS" ] ; then
	laika $LAIKA_OPTIONS
else
	laika -V -t 5000 $@
fi

