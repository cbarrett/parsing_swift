#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let process = require('process');

let katex = require('katex');
let md = require('simple-markdown');

let args = require('./args');

const argv0 = process.argv.length >= 2 ? path.basename(process.argv[1]) : process.argv0;

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
function readInput(argv, defaults) {
  try {
    const tokens = argv.filter((_, idx) => idx >= 2);
    const result = args.parse(args.lex(tokens), defaults, foldOptions, foldArguments);
    for (name in init ? defaults.map(Object.keys).concat() : []) {
      if (result[name] === undefined) {
        throw SyntaxError("expected value for '"+name+"'.");
      }
    } 
    return result;
  } catch (err) {
    if (err instanceof SyntaxError) {
      exitWithUsage(err);
    } else {
      throw err;
    }
  }
}

let defaults = [{ verbose: false }, { input: undefined, output: '' }]
let [{ verbose }, { input, output }] = readInput(process.argv, defaults);

if (output === '') {
  const { dir, name } = path.parse(input);
  output = path.format({ dir, name, ext: '.html' });
}

let rules = Object.assign({}, md.defaultRules);
rules.codeBlock.html = (node, output, state) => 
(katex.renderToString(node.content, { displayMode: true }));
rules.inlineCode.html = (node, output, state) => 
(katex.renderToString(node.content, { displayMode: false }));
let parser = md.parserFor(rules);
let printer = md.htmlFor(md.ruleOutput(rules, 'html'));

let raw = fs.readFileSync(input) + '\n\n'; // recommended by simple-markdown docs
fs.writeFileSync(output, printer(parser(raw)));
