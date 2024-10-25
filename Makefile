.PHONY: test test-watch build

test:
	npm test

test-watch:
	npm test -- --watch

build:
	npm run build && npm test