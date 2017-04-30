#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let process = require('process');

let katex = require('katex');
let md = require('simple-markdown');

let args = require('./args');

let [{ verbose }, { input, output }] = args.read(process.argv, args.defaults);

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
