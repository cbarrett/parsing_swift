let process = require('process');
let path = require('path');

const defaults = [{ verbose: false }, { input: undefined, output: '' }]
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

function lex(argv) {
  let raw = false;
  function lexer(token) {
    let m;
    if (!raw && token === '--') {
      raw = true;
      return null;
    } else if (!raw && (m = /^-{1,}(.*)$/.exec(token))) {
      return { option: m[1] };
    } else {
      return { argument: token };
    }
  }
  return argv.map(lexer).filter((x) => x != null);
}

function parse(lexed, defaults) {
  function alg([opts, args], token) {
    if (token.option) {
      if (/^v(erbose)?/.test(token.option)) {
        opts.verbose = true; 
      } else if (/^h(elp)?/.test(token.option)) {
        exitWithUsage();
      } else {
        throw SyntaxError("unexpected option '"+token.option+"'.");
      }
    } else if (token.argument) {
      args._idx = args._idx + 1 || 0;
      switch (args._idx) {
        case 0: args.input = path.resolve(token.argument); break;
        case 1: args.output = path.resolve(token.argument); break;
        default: throw SyntaxError("unexpected argument '"+token.argument+"'."); 
      }
    } else {
      throw SyntaxError("unexpected token '"+token+"'.");
    }
    return [opts, args];
  }
  return lexed.reduce(alg, defaults || [{}, {}]);
}

function read(argv, defaults) {
  try {
    const tokens = argv.filter((_, idx) => idx >= 2);
    const result = parse(lex(tokens), defaults);
    if (defaults) {
      for (name in defaults.map(Object.keys).concat()) {
        if (result[name] === undefined) {
          throw SyntaxError("expected value for '"+name+"'.");
        }
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

module.exports = { read, defaults }
