#!/bin/bash

# this script requires:
# - the user to be in a git repo
# - git to be installed
# - jshint to be installed


path=`pwd`
cd `git rev-parse --show-toplevel`

files=`find . -name "*.js" -not -regex "^\./node_modules\(.*\)"`

if [[ -z "$files" ]]
then
	echo No JavaScript files to lint.
	exit 0
fi

jshint $files --config ./scripts/jshint.cfg
exitCode=$?

cd "$path"

exit $exitCode

