const fs = require('fs');
const path = require('path');

// Path to terser-webpack-plugin file
const terserFilePath = path.resolve(__dirname, 'node_modules/terser-webpack-plugin/dist/index.js');

// Read the file
const content = fs.readFileSync(terserFilePath, 'utf8');

// Replace the import
const newContent = content.replace(
  `const {
  validate
} = require("schema-utils");`,
  `const schemaUtils = require("schema-utils");
// Fix for older versions where validate is a default export
const validate = schemaUtils.validate || schemaUtils;`
);

// Also fix the function call if needed
const finalContent = newContent.replace(
  /\(0, _schemaUtils\.validate\)/g, 
  'validate'
);

// Write the file back
fs.writeFileSync(terserFilePath, finalContent);

console.log('Patched terser-webpack-plugin successfully!');

// Now let's also patch the fork-ts-checker-webpack-plugin
const forkTsFilePath = path.resolve(__dirname, 'node_modules/fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPlugin.js');

if (fs.existsSync(forkTsFilePath)) {
  const forkTsContent = fs.readFileSync(forkTsFilePath, 'utf8');
  
  // Replace the schema utils import
  const newForkTsContent = forkTsContent.replace(
    `const schema_utils_1 = __importDefault(require("schema-utils"));`,
    `const schema_utils_1 = __importDefault(require("schema-utils"));
// Fix for older versions where validate is a default export
const validate = schema_utils_1.default.validate || schema_utils_1.default;`
  );
  
  // Replace any validate calls
  const finalForkTsContent = newForkTsContent.replace(
    /schema_utils_1\.default\(/g, 
    'validate('
  );
  
  // Write the file back
  fs.writeFileSync(forkTsFilePath, finalForkTsContent);
  
  console.log('Patched fork-ts-checker-webpack-plugin successfully!');
}

console.log('All patches applied!');
