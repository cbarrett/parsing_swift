<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Parsing and Grammars with Swift - Grammars</title>
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="katex.min.css" />
</head>
<body>
<article>

# 2 Grammars

## 2.1 Grammar notation

A <dfn>grammar</dfn> *G* is a set of rules for combining symbols to a well-formed text.
The symbols that can appear in a text are called <dfn>terminal symbols</dfn>.
The combinations of terminal symbols are described using <dfn>grammar rules</dfn> and <dfn>nonterminal symbols</dfn>.
Nonterminal symbols cannot appear in the final texts; their only role is to help generating texts: strings of terminal symbols.

A <dfn>grammar rule</dfn> has the form `\mathtt{A} = \mathtt{f}_1 | \ldots | \mathtt{f}_n` where the `\mathtt A` on the left hand side is the nonterminal symbol defined by the rule, and the `\mathtt{f}_i` on the right hand side show the legal ways of deriving a text from the nonterminal `\mathtt A`.

Each <dfn>alternative</dfn> `\mathtt f` is a <dfn>sequence</dfn> `\mathtt{e}_1 \ldots \mathtt{e}_m` of symbols.
We write `\Lambda` for the empty sequence (that is, when `m = 0`).

A <dfn>symbol</dfn> is either a nonterminal symbol `\mathtt A` defined by some grammar rule, or a <dfn>terminal symbol</dfn> `\mathtt{"c"}` which stands for 'c'. 

The <dfn>starting symbol</dfn> `\mathtt S` is one of the nonterminal symbols.
The well-formed texts are precisely those derivable from the starting symbols.

The grammar notation is summarized in Figure 1.

<figure>

A <dfn>grammar</dfn> `G = (T, N, R, \mathtt S)` has a set `T` of terminals, a set `N` of nonterminals, a set `R` of rules, and a starting symbol `\mathtt S \in N`.

A <dfn>rule</dfn> has form `\mathtt{A} = \mathtt{f}_1 | \ldots | \mathtt{f}_n` where `\mathtt{A} \in N` is a nonterminal, each alternative `f_i` is a sequence, and `n \ge 1`.

A <dfn>sequence</dfn> has form `\mathtt{e}_1 \ldots \mathtt{e}_m`, where each `\mathtt{e}_j` is a symbol in `T \subset N`, and `m \ge 0`. When `m = 0`, the sequence is empty and is written `\Lambda`.

<figcaption>Figure 1: Grammar notation</figcaption>

</figure>

<aside>

# Example 2

Simple arithmetic expressions of arbitrary length built from the subtraction operator ‘`-`’ and the numerals `0` and `1` can be described by the following grammar:

<pre>
E = T "-" E | T .
T = "0" | "1" .
</pre>

The grammar has terminal symbols *T* = {`"-"`, `"0"`, `"1"`}, nonterminal symbols *N* = {`E`, `T`}, two rules in *R* with two alternatives each, and starting symbol `E`. Usually the starting symbol is listed first.

</aside>

## 2.2 Derivation

The grammar rule <code>T = "0" | "1"</code> above says that we may derive either the string `"0"` or the string `"1"` from the nonterminal `T`, by replacing or substituting either "0" or "1" for `T`.
These <dfn>derivations</dfn> are written `T \Longrightarrow "0"` and `T \Longrightarrow "1"`.

Similarly, from nonterminal `E` we can derive `T`, for instance.
From `T` we could derive `"0"`, for example, which shows that from `E` we can derive `"0"`, written `E \Longrightarrow "0"`.

Choosing the other alternative for `E` we might get the derivation

    E \Longrightarrow T "-" E
      \Longrightarrow "0" "-" E
      \Longrightarrow "0" "-" T
      \Longrightarrow "0" "-" "1"

In each step of a derivation we replace a nonterminal with one of the alternatives on the right hand side of its rule.
A derivation can be shown as a tree; see Figure 2.

Every internal node in the tree is labeled by a nonterminal, such as `E`.
The sequence of children of an internal node, such as `T`, `"-"`, `E`, represents an alternative from the corresponding grammar rule.

A leaf of the tree is labelled by a terminal symbol, such as `"-"`. Taking the leaves in sequence from left to right gives the string derived from the symbol at the root of the tree: `"0" "-" "1"`.

<figure>
<figcaption>Figure 2: A derivation tree</figcaption>
</figure>

One can think of a grammar *G* as a generator of strings of terminal symbols.
Let *T*<sup>\*</sup> be the set of all strings of symbols from *T*, including the empty string &Lambda;.
When `A` is a nonterminal, the set of all strings derivable from `A` is called *L*(`A`):

</article>
</body>
</html>
