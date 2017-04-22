#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let process = require('process');

let katex = require('katex');
let md = require('simple-markdown');

function exitWithUsage() {
  let argv0 = process.argv.length >= 2 ? path.basename(process.argv[1]) : process.argv0;
  console.log('usage: ' + argv0 + ' INPUT [OUTPUT]');
  process.exit(1)
}

function obtainArguments() {
  let input, output;
  let argc = process.argv.length;
  if (argc >= 5 || argc <= 2) {
    exitWithUsage();
  } else {
    input = process.argv[2];
    output = argc === 4 ? process.argv[3] : '';
  } 
  if (/^(-|--)(h|he|hel|help)/.test(input)) {
    exitWithUsage();
  }
  input = path.resolve(input);
  if (output === '') {
    let { dir, name } = path.parse(input);
    output = path.format({ dir, name, ext: '.html' });
  } else {
    output = path.resolve(output);
  }
  return { input, output }
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

let { input, output } = obtainArguments();
let raw = fs.readFileSync(input) + '\n\n'; // recommended by simple-markdown docs
let result = transform(raw);
fs.writeFileSync(output, result);
