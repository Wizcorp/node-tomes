#!/bin/bash

# this script requires:
# - the user to be in a git repo
# - git to be installed
# - jshint to be installed


path=`pwd`
cd `git rev-parse --show-toplevel`

staged=`git diff --name-only --cached |grep -e '\.js$'`
if [[ -z "$staged" ]]
then
	echo No staged JavaScript files to lint.
	exit 0
fi

exitCode=0
let success=0
let failures=0

for file in $staged
do
	# ignore non-existing files (caused by renames or removal)
	if [[ -e $file ]]
	then
		jshint $file --config ./scripts/jshint.cfg
		if [[ $? != 0 ]]
		then
			exitCode=1
			let failures=$failures+1
		else
			let success=$success+1
		fi
	fi
done

echo "LINT failures: $failures"
echo "LINT successes: $success"

cd "$path"

exit $exitCode

