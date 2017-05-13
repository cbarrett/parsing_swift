<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Parsing and Grammars with Swift</title>
<link rel="stylesheet" href="katex.min.css" />
</head>
<body>
<article>

# 1. Grammars and Parsing

Often the input to a program is given as a text, but internally in the program it is better represented more abstractly: by a Swift value, for instance.
The program must read the input text, check that it is well-formed, and convert it to the internal form.
This is particularly challenging when the input is in 'free format', with no restrictions on the lay-out.

For example, think of a program for doing symbolic differentiation of mathematical expressions.
It needs to read an expression involving arithmetic operators, variables, parentheses, etc.
It must check that the parentheses match, it should allow any number of blanks around operators, and so on, and must build a suitable internal representation of the expression. 
Doing this without a systematic approach is very hard.

<aside>

# Example 1

This text file describes the probable states of a slightly defective gas gauge in a car, given the state of the car's battery and its gas tank:

<pre>
probability(GasGauge | BatteryPower, Gas)
{
    (0, 0): 100.0,  0.0;
    (0, 1): 100.0,  0.0;
    (1, 0): 100.0,  0.0;
    (1, 1):   0.1, 99.9;
} 
</pre>

These lecture notes explain how to create programs that can read an input text file such as the above, check that its format is correct, and build an internal representation (an array or a list) of the data in the input file.
Here we shall not be concerned with the meaning[^3] of these data.

</aside>

[^3]: The lines `\mathtt(0, 0)` and `\mathtt(0, 1)` say that if the battery is completely uncharged (0) and the tank is empty (0) or non-empty (1), then the meter will indicate Empty with probability 100%.
    The line `\mathtt(1, 0)` says that if the battery is charged (1) and the tank is empty (0), then the gas gauge will indicate Empty with probability 100% also.
    Finally, the line `\mathtt(1, 1)` says that even when the battery is charged (1) and the tank is non-empty (1), the gas gauge will (erroneously) indicate Empty with probability 0.1% and Nonempty with probability 99.9%.

This chapter provides simple tools to perform these tasks:

* systematic description of the structure of input data, and
* systematic construction of programs for reading and checking the input, and for converting
it to internal form.

The input descriptions are called grammars, and the programs for reading input are called parsers.
We explain grammars and the construction of parsers in Swift.
The methods shown here are essentially independent of Swift, and can be applied also to imperative languages with recursive procedures (Ada, C, Modula, Pascal, Standard ML, etc.)

The order of presentation is as follows.
First we introduce grammars, then we explain parsing, formulate some requirements on grammars, and show how to construct a parser skeleton from a grammar which satisfies the requirements.
These parsers usually read sequences of symbols instead of raw texts.
So-called <dfn>scanners</dfn> are introduced to convert texts to symbol sequences.
Then we show how to extend the parsers to build an internal representation of the input while reading and checking it.

Throughout we illustrate the techniques using a very simple language of arithmetic expressions.
At the end of the chapter, we apply the techniques to parse and evaluate more realistic arithmetic expressions, such as `3.1*(7.6-9.6/~3.2)+(2.0)`.

When reading this chapter, keep in mind that although it may look 'theoretical' at places, the goal is to provide a *practically* useful tool.

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
