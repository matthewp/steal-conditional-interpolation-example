/*[slim-loader-config]*/
(function(global) {
	global.steal = global.steal || {};

	global.steal.map = {
		"locale/ar": 4,
		"locale/en": 5,
		"locale/es": 6,
		"locale/hi": 7,
		"locale/zh": 8
	};
	global.steal.paths = {
		"9": "dist/bundles/steal-conditional-interpolation-example/index.js",
		"10": "dist/bundles/locale/ar.js",
		"11": "dist/bundles/locale/hi.js",
		"12": "dist/bundles/locale/en.js",
		"13": "dist/bundles/locale/es.js",
		"14": "dist/bundles/locale/zh.js"
	};
	global.steal.bundles = {
		"2": 9,
		"3": 9,
		"4": 10,
		"5": 12,
		"6": 13,
		"7": 11,
		"8": 14
	};
	global.steal.plugins = {};
})(window);

/*[slim-loader-shim]*/
(function(modules) {
	var modulesMap = {};
	var loadedModules = {};

	function addModules(mods) {
		mods.forEach(function(m) {
			modulesMap[m[0]] = m[1];
		});
	}
	addModules(modules);

	function stealRequire(moduleId) {
		if (loadedModules[moduleId]) {
			return loadedModules[moduleId].exports;
		}

		var stealModule = (loadedModules[moduleId] = {
			exports: {}
		});

		modulesMap[moduleId].call(
			stealModule.exports,
			stealRequire,
			stealModule.exports,
			stealModule
		);

		return stealModule.exports;
	}

	// extends the loader to support progressive/async loading
	var LOADED = 0;
	var resolves = [];
	var loadedBundles = {};
	var SCRIPT_TIMEOUT = 120000;

	// bundles are pushed to this array during eval
	__steal_bundles__ = window.__steal_bundles__ || [];

	// register bundles executed before the main bundle finished loading
	__steal_bundles__.forEach(function(bundle) {
		var bundleId = bundle[0];
		var bundleModules = bundle.slice(1);

		addModules(bundleModules);
		loadedBundles[bundleId] = LOADED;
	});

	// handle bundles loading after main has loaded
	__steal_bundles__.push = function(bundle) {
		var bundleId = bundle[0];
		var bundleModules = bundle.slice(1);

		if (loadedBundles[bundleId]) {
			resolves.push(loadedBundles[bundleId].resolve);
		}

		loadedBundles[bundleId] = LOADED;
		addModules(bundleModules);

		// resolve each promise, first in first out
		while (resolves.length) resolves.shift()();
		return Array.prototype.push.call(this, bundle);
	};

	stealRequire.dynamic = function(rawModuleId) {
		var moduleId = steal.map[rawModuleId] || rawModuleId;
		var bundleId = steal.bundles[moduleId];

		if (!bundleId) {
			throw new Error("Missing bundle for module with id: " + moduleId);
		}

		// if the bundle has been loaded already,
		// return a promise that resolves to the module being imported
		if (loadedBundles[bundleId] === LOADED) {
			return Promise.resolve(stealRequire(moduleId));
		}

		// the bundle is loading, return its promise
		if (loadedBundles[bundleId]) {
			return loadedBundles[bundleId].promise.then(function() {
				return stealRequire(moduleId);
			});
		}

		// add deferred to the bundles cache
		var deferred = makeDeferred();
		loadedBundles[bundleId] = deferred;

		// check if the bundle is being loaded using a script tag
		var script = getBundleScript(steal.paths[bundleId]);
		var scriptAttached = true;

		// load the bundle using a script tag otherwise
		if (!script) {
			script = makeScript();
			script.src = steal.paths[bundleId];
			scriptAttached = false;
		}

		var head = document.getElementsByTagName("head")[0];
		var timeout = setTimeout(onScriptLoad, SCRIPT_TIMEOUT);

		function onScriptLoad() {
			// avoid memory leaks in IE.
			script.onerror = script.onload = null;
			clearTimeout(timeout);

			var bundle = loadedBundles[bundleId];
			if (bundle !== LOADED) {
				if (bundle) {
					bundle.reject(
						new Error("Failed to load bundle with id: " + bundleId)
					);
				}
				loadedBundles[bundleId] = undefined;
			}
		}

		if (!scriptAttached) head.appendChild(script);
		return deferred.promise.then(function() {
			return stealRequire(moduleId);
		});
	};

	function makeScript() {
		var script = document.createElement("script");

		script.type = "text/javascript";
		script.charset = "utf-8";
		script.async = true;
		script.timeout = SCRIPT_TIMEOUT;

		return script;
	}

	function makeDeferred() {
		var def = Object.create(null);

		def.promise = new Promise(function(resolve, reject) {
			def.resolve = resolve;
			def.reject = reject;
		});

		return def;
	}

	function getBundleScript(src) {
		var len = document.scripts.length;

		for (var i = 0; i < len; i += 1) {
			var script = document.scripts[i];

			if (script.src.indexOf(src) !== -1) {
				return script;
			}
		}
	}

	// import the main module
	stealRequire(3);
})([
	[
		2,
		function(stealRequire, stealExports, stealModule) {
			Object.defineProperty(stealExports, "__esModule", { value: true });
			stealExports.default = locales[getRandomInt(0, locales.length)];
			("use strict");
			var locales = ["en", "es", "hi", "zh", "ar"];
			function getRandomInt(min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min)) + min;
			}
		}
	],
	[
		3,
		function(stealRequire) {
			var _lang = stealRequire("locale/#{lang}");
			("use strict");
			var _lang2 = _interopRequireDefault(_lang);
			function _interopRequireDefault(obj) {
				return obj && obj.__esModule ? obj : { default: obj };
			}
			document.getElementById("header").textContent = _lang2.default.helloWorld;
		}
	]
]);
