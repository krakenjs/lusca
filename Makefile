REPORTER = spec
JSHINT = ./node_modules/.bin/jshint
BASE = .

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require chai \
		--reporter $(REPORTER) \
		--timeout 15000
lint:
	$(JSHINT) ./index.js --config $(BASE)/.jshintrc

.PHONY: test

