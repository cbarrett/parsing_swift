<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Parsing and Grammars with Swift - Grammars and Parsing</title>
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="katex.min.css" />
<link rel="stylesheet" href="style.css" />
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

<pre><code>
probability(GasGauge | BatteryPower, Gas)
{
    (0, 0): 100.0,  0.0;
    (0, 1): 100.0,  0.0;
    (1, 0): 100.0,  0.0;
    (1, 1):   0.1, 99.9;
} 
</code></pre>

These lecture notes explain how to create programs that can read an input text file such as the above, check that its format is correct, and build an internal representation (an array or a list) of the data in the input file.
Here we shall not be concerned with the meaning<a name="rel.3" href="#ref.3"><sup>3</sup></a> of these data.

</aside>

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

<footer>

<a name="ref.3" href="#rel.3"><sup>3</sup></a>: The lines `\mathtt(0, 0)` and `\mathtt(0, 1)` say that if the battery is completely uncharged (0) and the tank is empty (0) or non-empty (1), then the meter will indicate Empty with probability 100%.
    The line `\mathtt(1, 0)` says that if the battery is charged (1) and the tank is empty (0), then the gas gauge will indicate Empty with probability 100% also.
    Finally, the line `\mathtt(1, 1)` says that even when the battery is charged (1) and the tank is non-empty (1), the gas gauge will (erroneously) indicate Empty with probability 0.1% and Nonempty with probability 99.9%.

</footer>

</article>
</body>
</html>
