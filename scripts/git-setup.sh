#!/bin/sh

echo Detecting git repository root...

PROJECTPATH=`git rev-parse --show-toplevel`
if [[ $? != 0 ]]
then
	echo "Error: failed to detect git repository root (is this a repository?)"
	exit 1
fi

GITPATH="$PROJECTPATH/.git"

echo "Making sure $GITPATH exists..."

if [[ ! -d "$GITPATH" ]]
then
	echo "Error: directory $GITPATH not found."
	exit 1
else
	echo "$GITPATH found."
fi


# set up git hooks

HOOKSPATH="$GITPATH/hooks"

if [[ ! -d "$HOOKSPATH" ]]
then
	echo "Directory $HOOKSPATH not found, creating..."
	mkdir -p "$HOOKSPATH"
fi


# pre-commit hook

PRECOMMITPATH="$HOOKSPATH/pre-commit"
MODE=775

echo -n "Make command to run before commit (default: commit-test): "
read INP

if [[ -z "$INP" ]]
then
	INP="commit-test"
fi

echo "Make command that will be run on commit: $INP"
echo "Creating pre-commit script..."

echo "#!/bin/sh" > "$PRECOMMITPATH"
echo "make -C \"$PROJECTPATH\" $INP" >> "$PRECOMMITPATH"

echo "Setting $PRECOMMITPATH to be executable ($MODE)"
chmod $MODE "$PRECOMMITPATH"

