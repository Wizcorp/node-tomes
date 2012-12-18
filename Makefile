# target: help, Display callable targets.
help:
	egrep "^# target:" [Mm]akefile

# target: setup, Do a full setup (currently an alias for git-setup).
setup: git-setup

# target: clean, Cleans the NPM cache.
clean:
	npm cache clean

# target: install, Installs all Node.js dependencies.
install:
	npm install

# target: test, Runs all tests.
test:
	npm test

# target: lint, Lints every JavaScript file in the project that is staged to be comitted.
lint:
	./scripts/lint-staged.sh

# target: lint-all, Lints every JavaScript file in the project.
lint-all:
	./scripts/lint-all.sh

# target: commit-test, Runs all tests and lints every JavaScript file in the project that is staged to be comitted..
commit-test: test lint

# target: git-setup, Sets up git hooks.
git-setup:
	./scripts/git-setup.sh

.PHONY: test
