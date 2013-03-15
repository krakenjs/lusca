AUTO-ISTANBUL = ./node_modules/.bin/auto-istanbul

cover:
	$(AUTO-ISTANBUL) cover
publish.report:
	$(AUTO-ISTANBUL) publish-report
