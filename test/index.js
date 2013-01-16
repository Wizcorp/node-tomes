var reporter = require('nodeunit').reporters['default'];
reporter.run(['test/modules'], null, function (errors) {
	if (errors) {
		process.exit(1);
	}
});
