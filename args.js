let process = require('process');
let path = require('path');

const lex = (args) => {
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
  return args.map(lexer).filter((x) => x != null);
};

const parse = (lexed, defaults, options, args) => {
  function alg(state, token) {
    if (token.option) {
      state[0] = options(state[0], token.option);
    } else if (token.argument) {
      state[1] = args(state[1], token.argument);
    } else {
      throw SyntaxError("unexpected token '"+token+"'.");
    }
    return state;
  };
  return lexed.reduce(alg, defaults || [{}, {}]);
};

module.exports.argv0 = process.argv.length >= 2 ? path.basename(process.argv[1]) : process.argv0;

module.exports.scanArguments = (argv, init, opts, args) => {
  let result = parse(lex(argv.filter((_, idx) => idx >= 2)), init, opts, args);
  for (name in init ? init.map(Object.keys).concat() : []) {
    if (result[name] === undefined) {
      throw SyntaxError("expected value for '"+name+"'.");
    }
  } 
  return result;
};
