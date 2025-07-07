"use strict";
const path = require("path");
const os = require("os");
const schemaUtils = require("schema-utils");
// Fix for older versions where validate is a default export
const validate = schemaUtils.validate || schemaUtils;
const {
  throttleAll,
  memoize,
  terserMinify,
  uglifyJsMinify,
  swcMinify,
  esbuildMinify
} = require("./utils");
const schema = require("./options.json");
const {
  minify
} = require("./minify");
