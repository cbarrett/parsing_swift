module.exports.lex = (args) => {
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

module.exports.parse = (lexed, defaults, options, args) => {
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

