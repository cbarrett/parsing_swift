#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let process = require('process');

let katex = require('katex');
let md = require('simple-markdown');

let { scanArguments, argv0 } = require('./args');

function exitWithUsage(err) {
  console.log('usage: ' + argv0 + ' [-v|--verbose] INPUT [OUTPUT]');
  if (err !== undefined) {
    console.log();
    console.log(err);
    process.exit(1);
  } else {
    process.exit();
  }
}
function foldOptions(opts, token) {
  if (/^v(erbose)?/.test(token)) {
    opts.verbose = true;    
  } else if (/^h(elp)?/.test(token)) {
    exitWithUsage();
  } else {
    throw SyntaxError("unexpected option '"+token+"'.");
  }
  return opts;
}
function foldArguments(args, token) {
  args._idx = args._idx + 1 || 0;
  switch (args._idx) {
    case 0: args.input = path.resolve(token); break;
    case 1: args.output = path.resolve(token); break;
    default: throw SyntaxError("unexpected argument '"+token+"'."); 
  }
  return args;
}
function readInput(defaults) {
  try {
    return scanArguments(process.argv, defaults, foldOptions, foldArguments);
  } catch (err) {
    if (err instanceof SyntaxError) {
      exitWithUsage(err);
    } else {
      throw err;
    }
  }
}
function transform(raw) {
  let rules = Object.assign({}, md.defaultRules);
  rules.codeBlock.html = (node, output, state) => 
    (katex.renderToString(node.content, { displayMode: true }));
  rules.inlineCode.html = (node, output, state) => 
    (katex.renderToString(node.content, { displayMode: false }));
  let parser = md.parserFor(rules);
  let printer = md.htmlFor(md.ruleOutput(rules, 'html'));
  return printer(parser(raw));
}

let defaults = [{ verbose: false }, { input: undefined, output: '' }]
let [{ verbose }, { input, output }] = readInput(defaults);

if (output === '') {
  const { dir, name } = path.parse(input);
  output = path.format({ dir, name, ext: '.html' });
}

if (verbose) {
  console.log('verbose: ' + verbose);
  console.log('input: ' + input);
  console.log('output: ' + output);
}

let raw = fs.readFileSync(input) + '\n\n'; // recommended by simple-markdown docs
let result = transform(raw);
fs.writeFileSync(output, result);
