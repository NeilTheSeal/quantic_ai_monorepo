# Python II: User Input and Loops

## Overview

This Quantic course continues from Python I (variables, data types, indexing). It covers two things: getting information from the person running a program, and making Python repeat work with loops. The course summary describes it as code that "incorporates user input, branching structures, and loops that respond to changing conditions within a program." The two stated outcomes are:

- Collect user input with the `input()` function.
- Automate repeated actions with `for` loops.

The course has six lessons and a closing set of coding challenges:

| Lesson | Topic | Core ideas |
|---|---|---|
| 1.1 | User Input | `input()`, prompts, type conversion, `round()`, `help()` |
| 1.2 | Intro to For Loops | flow control, `for`/`in`, iterables, indentation, logical errors |
| 1.3 | Looping through Numbers with `range()` | `range(start, stop, step)`, iterations, building lists in loops |
| 1.4 | Strings, Tuples, and Indexing in For Loops | looping over strings and tuples, `range(len(...))` index loops |
| 1.5 | Pythonic Looping | avoiding indexes in loop bodies, building new lists, duck typing |
| 1.6 | Augmented Assignment Operators | `+=`, `*=` and the rest, initial values, `join()` |
| Final | Take a Hike...with Python! | three small programs that combine everything |

Each lesson ends with a coding challenge done in IDLE. Quantic's advice is to try each one yourself **before** looking at the sample answers: "It's one thing to fill in blanks of mostly pre-written code; it's another to stare down a blank IDLE screen and write code from scratch!"

### Course setup (brief)

- **Version.** The course was built on Python 3.9 and recommends it. Code may break on anything earlier than 3.7. Python 2 has been unsupported since 2020, and the course does not work with it. Versions that share their first two numbers (3.9.1 and 3.9.2, say) should behave the same, so pick the highest 3.9.x.
- **IDE.** An **Integrated Development Environment (IDE)** is an intermediary that "contains text editors, debuggers, and automation tools" and sends your code to the language's interpreter. The course uses **IDLE**, which ships with Python. You can use another IDE if you prefer.
- **Folders.** Make a course folder `python_02_user_input_and_flow_control` and put numbered lesson folders inside it (`01_user_input`, `02_introduction_to_for_loops`, ..., `07_take_a_hike`). Coding challenge files start with `cc_` for "Coding Challenge".
- **Testing an install.** Type `print("Hello World!")` exactly as shown, matching capitalization, punctuation, and spacing.

### Finding help (from Quantic's "Getting Started" guide)

"Part of learning Python is learning to debug your code." Quantic lists these resources in order:

1. **Google.** Search the error message, your goal, or the code that isn't working. Include the word *Python*, your operating system, and your Python version.
2. **Stack Overflow.** It usually tops Python search results. Post a question only "as a last resort," because the people answering are volunteers.
3. **Python.org.** The official site is "comprehensive and oriented towards experienced programmers."
4. **Python Wiki.** Search it for a specific function or method.
5. **`help()`.** Python's built-in help utility. Type `help()` at the command line.

---

## Lesson 1.1: User Input

**Goals:** collect information from users with `input()`, use `round()` to clean up calculation results, and look up syntax with `help()`.

### `input()` and prompts

Quantic's definition: Python's **`input()`** function "cues a user to enter information." The text passed in its parentheses is called a **prompt**.

```python
first_name = input("Enter your name: ")
print(f"Hello, {first_name.title()}!")
```

How it runs:

- Python shows the prompt, **pauses the program**, and **waits for the user to type a response**. It doesn't end the program or time out.
- To use the response later, **assign it to a variable**, here `first_name`.
- Line 2 prints a greeting with a title-case version of the name, using the `.title()` string method.
- The space at the end of `"Enter your name: "` isn't required, but it makes the exchange look nicer.

Assignment syntax: the variable name goes on the left of `=`, the function on the right, and the prompt text inside the parentheses.

```python
surname = input("Enter your surname: ")
```

Feedback on wrong answers: `prompt` would only work as the argument if you had already stored the message in a variable named `prompt`. `print` is wrong because you're reading input, not printing anything.

### Writing good prompts

"To get the best, most consistent responses from users, clear and unambiguous input prompts are essential." Quantic's examples:

| Better | Worse | Why |
|---|---|---|
| `"What's your first name? "` | `"What's your name? "` | Answers can range from "John P. Waddlesworth III" to "My friends call me Giggles." |
| `"What's your weight in kg? "` | `"How much do you weigh? "` | Without units, people may answer in pounds, kilos, or stones. |
| `"In which city do you live? "` | `"Where do you live? "` | Could be read as asking for a state, a street address, or a type of home. |

### Input always arrives as a string

"All input comes in as type *string*." To do math with it, convert it. Quantic shows two correct ways:

```python
# Option 1: wrap the right side in int()
adults = int(input("How many adult tickets? "))

# Option 2: reassign the variable to its integer version
adults = input("How many adult tickets? ")
adults = int(adults)
```

Two wrong approaches from the practice feedback:

- **`type()` can't change a type.** It only tells you what the type is.
- **`int(adults) = ...` is invalid.** `int()` *returns* a value, so it can't be assigned to: "That's like trying to go IN the OUT door."

The ticket script used in the lesson ($17 per adult, $14 per kid):

```python
adults = input("How many adult tickets? ")
kids = input("How many kids under 12? ")
adults = int(adults)
kids = int(kids)

cost = 17*adults + 14*kids
print(f"Total cost: ${cost}")
```

With 6 adults and 4 kids, the cost is **$158**. Quantic links to PEP 8's guidance on spacing around arithmetic operators. Writing `17*adults + 14*kids` without spaces around the higher-priority `*` follows that guidance.

> **Beyond the course:** Why does `print(f"Total cost: ${cost}")` print a dollar sign? In an f-string only `{...}` is special, so `$` is an ordinary character. (JavaScript template literals use `${...}`, which can confuse people coming from JS.) Conversion functions to know: `int()` for whole numbers, `float()` for decimals, and `str()` to turn numbers back into text. `int()` raises `ValueError` if the string isn't a valid integer literal. It accepts surrounding whitespace such as `" 42 "`, but not `"2.5"` or `"ten"`.

### Rounding with `round()`

The site needs to show the total including 7.8% sales tax:

```python
tax = cost * 1.078
print(f"With tax: ${tax}")
```

The output is `$170.324`, and nobody can pay that. The problem is rounding. Two other points from the feedback:

- `tax` doesn't need to be converted to a float, because Python makes it one automatically.
- The `1` in `1.078` means a single multiplication gives the total including tax, not just the tax.
- Quantic notes that `with_tax` would be a better variable name. The lesson uses `tax` to keep lines short.

**`round()`**, in the course summary's words, "rounds a numeric value to a certain number of digits."

### Looking up syntax with `help()`

**`help()`** "lets us look up an object and get information on how it works in Python." In the shell:

```python
>>> help(round)
```

In Python 3.9 the signature shows as:

```text
round(number, ndigits=None)
```

- `number` is the number to round.
- `ndigits` is how many digits to round to. It has a default value (`None`), so it's **optional**.
- If you leave out `ndigits`, `round()` returns **an integer**, rounded to **the nearest whole number**.

Two wrong answers from the practice:

- `number.round(ndigits)` is wrong because "`round()` is a function, not a method."
- `round(number[, ndigits])` is how older Pythons display the signature. Quantic's feedback says that if you see this, you're on Python 3.6 and should upgrade. The course summary PDF also prints this older form and explains that "The square brackets around `ndigits` imply that this argument is optional."

**Banker's rounding.** Python rounds an exact .5 to the nearest *even* digit:

```python
round(7.5)    # 8
round(6.5)    # 6
round(-1.5)   # -2
```

Rounding to cents in one step:

```python
tax = round(cost*1.078, ndigits=2)
# or, positionally:
tax = round(cost*1.078, 2)
print(f"With tax: ${tax}")
```

`ndigits=0` would round to the nearest dollar. Quantic also notes that 0 digits is the default, so you wouldn't need to write it.

### Try to break your program

| Test | Result | Quantic's explanation |
|---|---|---|
| Type `ten` for a ticket count | **Error** | Python can't convert `"ten"` to an integer. A complete program would ask again after invalid input. |
| Negative ticket counts | Works | *We* see it as an error, but Python carries on. Validation comes later. |
| Type `11` as your name | Works | Python just uses the string `"11"`. |
| Type `2.5` for a ticket count | **Error** | `int(2.5)` works (it drops the decimal part), but `int("2.5")` fails, because the input is a *string*. |
| 1 adult and 3 kids | Works, but looks odd | Prints `$63.6`, not `$63.60`. `round()` did its job. `print()` just doesn't add the trailing zero. Quantic says fixing this "is beyond the scope of this course." |

Checking the last case in the shell:

```python
>>> 59 * 1.078
63.602000000000004
>>> round(59 * 1.078, 2)
63.6
```

> **Beyond the course:** Three things the lesson skips.
>
> - **Showing two decimal places.** Use a format specifier: `f"${tax:.2f}"` gives `$63.60`. For money, the specifier controls how the number is *shown*, and `round()` controls the *value*. Real financial code often uses `decimal.Decimal` to avoid binary floating-point error.
> - **Floating-point surprises.** `round(2.675, 2)` returns `2.67`, not `2.68`. That isn't banker's rounding at work. `2.675` can't be stored exactly in binary and is actually a little less than 2.675. The Python tutorial's floating-point chapter explains why.
> - **`ndigits=0` vs. no `ndigits`.** `round(3.7)` returns the int `4`, but `round(3.7, 0)` returns the float `4.0`. Quantic calls 0 the default, which is right about the digits but not the return type.
> - **Re-prompting on bad input.** This needs a `while` loop and `try`/`except ValueError`, which come later in the curriculum:
>
> ```python
> while True:
>     try:
>         adults = int(input("How many adult tickets? "))
>         break
>     except ValueError:
>         print("Please enter a whole number.")
> ```

### Review answers (Lesson 1.1)

- Data from `input()` always comes in as a **string**.
- `flavor = input("Flavor? ")` is correct. In real code the prompt should be more descriptive. `flavor.input() = ...` and `flavor = print(...)` are wrong.
- With no digits given, `round()` rounds to **0** digits after the decimal point.

### Coding Challenge I: tip calculator (`cc_tip_calculator.py`)

Prompt for the user's name, the total bill, and the tip percentage, then print a message like `Hi, Zev!` / `A 15% tip on $34.57 is $5.19.` The lesson's hints are to use type conversion (`float()`, `str()`), `round()` for the tip, and `title()` for the name.

Quantic's sample answer:

```python
user_name = input("What's your name? ")
bill = float(input("Total bill: $"))
percent = int(input("Tip percentage: 0."))

tip = round(bill * percent / 100, 2)

print(f"Hi, {user_name.title()}!")
print(f"A {percent}% tip on ${bill} is ${tip}.")
```

Quantic's note: "Adding `$` and `0.` at the start of your bill and percentage input lines helps the user enter their values in a way our code will understand." The user types `34.57` after a `$`, and `15` after `0.`, which reads on screen as "0.15".

**IDLE tip:** error messages give the line number where the error happened. Turn on line numbers under *Options > Show Line Numbers*.

### What the practice questions checked

- That `input()` shows a prompt, pauses, waits, and returns what was typed, and that you must assign the result to a variable.
- Writing a correct `input()` assignment, with the variable on the left and the prompt inside the parentheses.
- Choosing specific prompts (first name, units, city).
- That input is always a string. The two valid ways to convert it, and why `type()` and `int(x) = ...` fail.
- Calculating ticket cost (6 adults + 4 kids = $158).
- Spotting unrounded output. Reading `help(round)` as `round(number, ndigits=None)`. That omitting `ndigits` returns an int. Banker's rounding.
- Building `round(cost*1.078, ndigits=2)` and knowing `ndigits=0` would round to dollars.
- Predicting which test inputs raise errors (`"ten"`, `"2.5"`) and which silently "work" (negatives, a numeric name, `63.6`).

---

## Lesson 1.2: Intro to For Loops

**Goals:** use `for` loops to repeat actions, and indent correctly in Python.

### Flow control

"Python doesn't have to run in a straight line. It can loop through code blocks multiple times, check conditions before executing code, and branch to different blocks." **Flow control** is "how to tell Python the order in which to execute your code." Loops come first.

### Your first `for` loop

```python
flavors = ["beet", "green", "mango"]

for flavor in flavors:
    print(f"We have {flavor} juice!")
```

Output:

```text
We have beet juice!
We have green juice!
We have mango juice!
```

New things in this code: the colon, the keywords `for` and `in`, and an indented last line. The curly braces aren't new (they're f-string placeholders), and blank lines are only for readability. When you type the colon and press Return, IDLE indents the next line for you. If it doesn't, check for the colon. If it's there, type 4 spaces yourself.

### Definitions

- A **`for` loop** is "a flow control structure that uses `for` / `in` syntax to repeat actions for each element in a given iterable object."
- An **iterable object**, usually just called an **iterable**, is "an object that can return its items one at a time." The course summary puts it as "a collection of elements that can return those elements one item at a time." Iterables you already know: **lists, tuples, and strings**. A string counts because it is "an ordered set of characters" that can be returned one at a time.

General form, from the summary:

```python
for variable in iterable:
    expression
```

- **The loop variable.** The word after `for` is a variable. It "takes on the values, one by one, of the elements in the iterable." By convention it's often the singular of the iterable's name. `for f in flavors` or `for x in flavors` work just as well, though `for penguin in flavors` would confuse readers.
- **The body.** The indented block under the `for` line runs once per element. Here that's **three** times, because `flavors` has three elements.
- **Counters.** Python's `for` doesn't count with a numeric counter the way some languages' loops do. For numbers you use `range()` (next lesson). `enumerate()` gives you a counter and comes later in the curriculum.

### Bodies with more than one line

```python
flavors = ["beet", "green", "mango"]

for flavor in flavors:
    print(f"We have {flavor} juice!")
    print("Yum!")
```

`Yum!` prints **3** times. Lines in the body don't have to use the loop variable.

### Indentation decides what's in the loop

"Indentations tell Python what's included in the loop and what isn't." Quantic stresses that indentation *means* something in Python, which differs from languages where it's only style.

Dedenting the last line takes it out of the loop:

```python
for flavor in flavors:
    print(f"We have {flavor} juice!")
print("Yum!")
```

```text
We have beet juice!
We have green juice!
We have mango juice!
Yum!
```

In this classification exercise:

```python
flavors = ["beet", "green", "mango"]       # NOT part of the loop (it's above it)

for flavor in flavors:
    print(f"We have {flavor} juice!")      # part of the loop
    print("Yum!")                          # part of the loop
print("What would you like?")              # NOT part of the loop; runs once afterward
```

The list line is referenced by the loop but sits *above* it, so it isn't part of the loop.

### Tracing a loop step by step

1. The `for` line assigns the first element, `"beet"`, to `flavor`.
2. Python runs the indented block with `flavor = "beet"`.
3. It reaches the unindented `print`, which isn't part of the loop, so one cycle is done. Python goes **back up to the `for` statement**. It doesn't go back to the start of the program, so the list isn't redefined.
4. `flavor` is reassigned to `"green"` and the body runs again. Then the same for `"mango"`.
5. After one pass per element, Python leaves the loop and moves **on to the next line of code**, `print("What would you like?")`.

### Indentation errors and logical errors

Forgetting to indent the body:

```python
types = ["cup", "bottle", "jug"]
for t in types:
print(t)
```

Python **throws an error**, either `SyntaxError` or `IndentationError` depending on how you run it. Either way it says it expected an indented block. The loop variable here is `t` rather than `type` on purpose: `type` is already a built-in function name, so it's better not to use it.

Indenting something that shouldn't be:

```python
types = ["cup", "bottle", "jug"]
    for t in types:
    print(t)
```

This also errors, because Python doesn't expect the `for` line to be indented.

**Logical error.** "When code runs without error but doesn't do what you want, it's called a **logical error**."

```python
orders = ["A62", "A63", "A64"]

for order in orders:
    print(f"Order {order} is complete!")
print("Thank you!")      # meant to print after each order, but prints only once
```

The fix is to **indent the last line**. "Logical errors can be hard to spot because they don't usually crash a program. They just give undesirable results."

### Review: predicting output

```python
boosters = ["wheatgrass", "probiotics"]
for booster in boosters:
    print(f"Add {booster}?")
```

```text
Add wheatgrass?
Add probiotics?
```

```python
sizes = ["small", "medium", "large"]
for size in sizes:
    print(f"You can get a {size}.")
print("That size is great!")
```

```text
You can get a small.
You can get a medium.
You can get a large.
That size is great!
```

```python
seeds = ["chia", "flax"]
for seed in seeds:
    print(f"Add {seed} seeds?")
    print("They're good for you!")
print("Seeds are healthy!")
```

```text
Add chia seeds?
They're good for you!
Add flax seeds?
They're good for you!
Seeds are healthy!
```

### Indentation conventions

- PEP 8 says to use **4 spaces** per indent level, and IDLE adds them automatically. Technically any number of spaces works if you're consistent within a block.
- You can indent with tabs, but "you can't mix tabs and spaces in the same script." PEP 8 advises against tabs in general, so Quantic suggests avoiding them unless your company requires them. In IDLE, the indent width is under *Settings > Fonts/Tabs > Indentation Width*.

> **Beyond the course:** How `for` works under the hood. `for x in obj` calls `iter(obj)` to get an *iterator*, then calls `next()` on it repeatedly. When `next()` raises `StopIteration`, the loop ends. Anything that supports `iter()` is an iterable. That includes dicts, sets, files, generators, and `range`, not only "collections." Also worth knowing:
>
> - The loop variable is an ordinary variable. It still holds the last value after the loop ends, as Lesson 1.4 shows.
> - Reassigning the loop variable inside the body doesn't change the list.
> - Python 3 raises `TabError` when tabs and spaces are mixed in a way that makes indentation ambiguous.
> - Loop control statements you'll meet later: `break` (exit early), `continue` (skip to the next iteration), and a `for ... else` clause that runs only if the loop wasn't broken.

### Coding Challenge II: meeting invitations (`cc_meeting.py`)

Make a list of five first names. Loop to print a message to each person, add a second per-person line, print a meeting location once at the end, then show the names in ALL CAPS with `upper()`.

```python
invitees = ["Enya", "Elliot", "Edie", "Eduard", "Elgin"]

for invitee in invitees:
    print(f"\n{invitee.upper()}, can you meet today?")
    print(f"We'd love to have you, {invitee.upper()}!")

print("\nThe meeting location is the East conference room.")
```

The `\n` newline escapes "aren't necessary, but they make the output look a bit cleaner."

### What the practice questions checked

- Spotting the new syntax: the colon, `for`, `in`, and the indented body.
- Predicting loop output and counting iterations (three elements means three runs; `Yum!` prints 3 times).
- That the loop variable takes each element in turn and its name is up to you.
- Effects of dedenting, and which lines are inside or outside a loop, including a line *above* the loop.
- Tracing order: back to the `for` statement after each pass, then on to the next line after the last element.
- That a missing indent or an unexpected indent raises `SyntaxError`/`IndentationError`. Why `type` is a poor loop variable name.
- Recognizing a logical error (`Thank you!` printed once) and fixing it by indenting.

---

## Lesson 1.3: Looping through Numbers with `range()`

**Goals:** use `range()` to build sequences of numbers, and combine it with `for` to repeat an action a set number of times.

### `range()` and its arguments

```python
for i in range(1, 9, 2):
    print(i)
```

Output: `1 3 5 7`.

**`range()`** "generates an ordered set of numbers." Its three arguments:

| Argument | Meaning | In `range(1, 9, 2)` |
|---|---|---|
| **start** | the first value in the output | `1` |
| **stop** | goes up to but does *not* include this number, as with slicing | `9` is not printed |
| **step** | the difference between each output value | counts by 2s |

- **`step` is optional** and defaults to `1`. The default is "the value Python will use if you don't provide a third argument." So `range(7, 11)` gives `7, 8, 9, 10`.
- **One argument is treated as stop.** Counting starts at 0 and goes up by 1s, so `range(3)` gives `0, 1, 2`.
- **It returns a range object, not a list.** A range object is iterable, so it works in a `for` loop. Python sets `i` to each number in turn and runs the body for each one.

Prediction practice:

```python
for i in range(4):        # 0 1 2 3
    print(i)

for i in range(6, 10):    # 6 7 8 9
    print(i)

for i in range(5, 11, 3): # 5 8
    print(i)
```

Common wrong answers from the feedback:

- **Starting at 1.** With one argument, `range()` starts at 0.
- **Including the stop value.** Answering `6 7 8 9 10` is "a classic off-by-one error."
- **Skipping the start value.** The start value *is* printed.

### Reading `help(range)`

Try `help(range)` in the shell and scroll to the top for the syntax and description. Documentation sometimes marks optional arguments with square brackets. You don't type those brackets: call `range(5, 11, 3)`, not `range(5, 11[, 3])`.

### Iterations and repeating an action

Each pass through a loop is called an **iteration**. A `for` loop can iterate over a list's elements or over the numbers `range()` generates, which makes it easy to "repeat an action a specified number of times."

```python
for i in range(5):
    print("We love cacti!\nYes we do!")

print("How 'bout you?")
```

- `range(5)` gives `0, 1, 2, 3, 4`, so the body runs **5** times.
- The final line isn't part of the loop **because it isn't indented**. The blank line above it has no effect.
- `i` is never **used** in the body. Python's syntax needs a variable there, but the iteration count is tracked internally.
- Output: **11** lines (5 × 2 lines, plus `How 'bout you?`).
- You could write two separate `print()` calls instead of `\n`, both indented.

### Building a list from user input

Plan the program first. Create an empty list, then loop four times doing these steps in order: (1) **prompt the user to enter a word**, (2) **add the entered word to the list**. Print the list once, after the loop.

```python
print("Welcome to Cactus World!")
print("Tell us a few words that")
print("remind you of cacti!")

words = []

for i in range(4):
    word = input("Enter a word: ")
    words.append(word)

print(words)
```

- `append` is the list method that adds an item to the end. There is no `add`.
- `print(words)` is unindented so it runs only once.
- `print(i)` would print the counter, not the list.

### Generating IDs

Make 500 unique IDs, `cactus1` to `cactus500`:

```python
cactus_ids = []

for i in range(1, 501):
    id = f"cactus{i}"
    cactus_ids.append(id)

print(cactus_ids)
```

- The first ID should be 1, so you need the form of `range()` that takes a *start* value. Because stop is excluded, the stop is 501.
- f-strings aren't limited to `print()` statements. You can assign them to variables.

### Review: a list of squares

```python
squares = []                    # creates an empty list

for i in range(1, 100):         # sets up a loop for numbers 1 through 99
    squared = i ** 2            # assigns the square of the current i to a variable
    squares.append(squared)     # adds the squared value to the end of the list

print(squares)                  # prints the list
```

The two body lines can be combined into one: `squares.append(i ** 2)`.

**Pro tip:** pass a range to `list()` to make a list of numbers.

```python
sizes = list(range(12, 21, 4))   # [12, 16, 20]  (coffee sizes in ounces)
```

> **Beyond the course:** More about `range`.
>
> - **Counting down.** Quantic describes stop as the number to count *up* to, but a negative step counts down: `list(range(10, 0, -3))` is `[10, 7, 4, 1]`.
> - **Empty ranges.** With a positive step, a start at or past the stop gives an empty range, so `range(4, 0)` produces nothing.
> - **Memory.** A range object stores only start, stop, and step, so `range(10**12)` takes almost no memory. It also supports `len()`, indexing, slicing, and fast `in` tests.
> - **Unused loop variables.** If you don't use the loop variable, the convention is `_`, as in `for _ in range(5):`. It tells readers the value is ignored on purpose.
> - **Shadowing built-ins.** The ID example's variable `id` hides the built-in `id()` function for the rest of the script. It's harmless here, but it's the same kind of problem Quantic pointed out with `type`. Names like `cactus_id` avoid it.

### Coding Challenge III

1. In `cc_range_practice.py`, print the even numbers from 100 to 500, including 500.
2. In `cc_ice_cream.py`, welcome the user, ask for three flavors, collect them in a list, then confirm the list and say thanks.

```python
# Challenge 1
for n in range(100, 501, 2):
    print(n)
```

```python
# Challenge 2
flavors = []

print("Welcome to Smartly 'Scream!")
print("Choose three flavors!")

for i in range(0, 3):
    flavor = input("Flavor: ")
    flavors.append(flavor)

print("Got it! Here are your flavors:")
print(flavors)
print("Thanks!")
```

Single letters like `i`, `n`, or `x` are common loop variables for numbers, "but you could also use something like `number`."

### What the practice questions checked

- Predicting `range()` output for one, two, and three arguments, including that stop is excluded and the default start (0) and step (1).
- Naming the start, stop, and step arguments.
- How many iterations a range produces, and counting output lines (11).
- That an unindented line after the loop runs once, and that blank lines don't matter.
- Ordering steps correctly: prompt, then append. Create the list before the loop, print after it.
- Writing `words = []`, `for i in range(4):`, `words.append(word)`, `print(words)`.
- Ordering the cactus-ID program. Matching each line of the squares program to what it does.

---

## Lesson 1.4: Strings, Tuples, and Indexing in For Loops

**Goals:** loop through strings and tuples, and use indexing with loops to change every element of a list.

### Looping over a string

A `for` loop over a string returns one character at a time. To print a forecast vertically in uppercase:

```python
forecast = "rainy"

for char in forecast:
    print(char.upper())
```

The iterable goes at the *end* of the `for` statement. Method syntax is `char.upper()`, not `upper(char)`.

A fancier version:

```python
for char in forecast:
    print(10 * f"{char.upper()} ")
```

This prints each character 10 times, **each followed by a space**, because the f-string `"R "` is built first and then repeated 10 times. Output starts with `R R R R R R R R R R `.

### Looping over a tuple

```python
conditions = ("sleet", "blizzard", "fog")
```

Python knows `conditions` is a tuple because of the **parentheses and commas**. Square brackets would make a list, and the quote marks only mark strings. Tuples are like lists but **immutable**: "Tuples can be completely reassigned, but they can't be modified."

```python
conditions = ("sleet", "blizzard", "fog")

for condition in conditions:
    print(f"\n{condition}pocalypse")
    print(f"franken{condition}")
    print(f"{condition}mania")
```

The `\n` puts a blank line between each condition's taglines.

> **Beyond the course:** It's the comma that makes a tuple, not the parentheses. `("fog")` is just the string `"fog"`. `("fog",)` and `"sleet", "fog"` are tuples. The one exception is `()`, which is an empty tuple.

### Changing list elements by index

Convert a list of Fahrenheit lows to Celsius:

```python
temps = [65, 32, 50, -2]
```

Writing one line per element works, but it's a bad idea:

```python
temps[0] = (temps[0] - 32) / 1.8
temps[1] = (temps[1] - 32) / 1.8
temps[2] = (temps[2] - 32) / 1.8
temps[3] = (temps[3] - 32) / 1.8
```

- **It's inefficient for the programmer.** A million elements would mean a million lines.
- **You'd have to edit the code whenever the list length changed.**
- The parentheses are needed for order of operations. Without them, Python would compute `32 / 1.8` first.
- Two wrong answers from the practice: Python *can* act on individual elements, and one line *can* do both the subtraction and the division.

Collapse it into a loop where `i` runs through the **indices** `0, 1, 2, 3`. Indexing starts at 0, so `1, 2, 3, 4` is an off-by-one mistake. The values `65, 32, 50, -2` are elements, not positions.

"`range(n)` generates consecutive integers from 0 to n-1. For an n-element list, `range(n)` produces exactly the correct indices!"

```python
for i in range(4):
    temps[i] = (temps[i] - 32) / 1.8
print(temps)
```

- `for i in temps:` would loop over the values, not the indices.
- The body must be an assignment with an `i` in it.
- Use `print(temps)` after the loop. `print(temps[i])` would print only the last value, because `i` is still 3 when the loop ends.

**Hard-coded length.** `range(4)` has to be updated if the list changes. Use **`len()`**, which returns the number of elements (there's no `count()`, `length()`, or `number()` for this):

```python
temps = [65, 32, 50, -2]

for i in range(len(temps)):
    temps[i] = (temps[i] - 32) / 1.8
    temps[i] = round(temps[i], 1)

print(temps)   # [18.3, 0.0, 10.0, -18.9]
```

`len()` goes inside `range()`. `len(range(temps))` and `range(temps(len))` are wrong.

**Two correct ways to round to one decimal:**

```python
# Add a line at the end of the loop body
temps[i] = round(temps[i], 1)

# Or fold it into the conversion line
temps[i] = round((temps[i] - 32) / 1.8, 1)
```

The wrong option was `temps = round(temps, 1)` after the loop: "Python can only round data of numeric types like ints and floats," not a whole list. Quantic leaves out `ndigits=` here to keep lines short, but says writing it out is good practice because it makes the second number's meaning explicit.

**Quantic's verdict on `range(len(iterable))`:** it works, it teaches key loop concepts, and you'll see it in other people's code, "However, true Pythonistas would say doing things this way doesn't measure up." Lesson 1.5 shows the alternative.

### Debugging the intern's loop

```python
humidities = [87, 56, 80, 80, 37]

for i in range(len(humidities)):
    print(i)
```

- `len(humidities)` returns **the number 5**.
- `range(len(humidities))` returns **the range object 0, 1, 2, 3, 4**, the indices.
- So the code **prints the numbers 0 through 4**, not the humidity values.
- **Fix:** change the last line to `print(humidities[i])`. Better, loop over the values directly: `for humidity in humidities: print(humidity)`. Just changing the last line to `print(humidity)` fails because `humidity` is never defined. Changing to `range(5)` gives the same wrong output.

### Coding Challenge IV: basketball stats (`cc_basketball.py`)

1. Print each character of `"NBA"` in lowercase.
2. Convert the weights `190, 185, 250, 190` lb to kg (×0.45) with a loop.
3. Using the heights `1.98, 1.75, 2.03, 1.91` m, calculate and print each player's BMI. "Body mass index, or BMI, is calculated by dividing a person's weight in kg by the square of the person's height in m."

```python
# This section prints each letter of NBA in lowercase.
my_string = "NBA"
for char in my_string:
    print(char.lower())

# This section converts player weights from lbs to kgs.
weights = [190, 185, 250, 190]
for i in range(len(weights)):
    weights[i] = 0.45 * weights[i]
print(weights)

# This section calculates player BMIs.
heights = [1.98, 1.75, 2.03, 1.91]
bmis = []
for i in range(len(heights)):
    bmi = weights[i] / (heights[i] ** 2)
    bmi = round(bmi, 2)
    bmis.append(bmi)
print(bmis)
```

Output: weights `[85.5, 83.25, 112.5, 85.5]`, BMIs `[21.81, 27.18, 27.3, 23.44]`. You don't have to build the `bmis` list; printing each BMI as you go is fine. Quantic notes this is a task the next lesson does more Pythonically.

**IDLE tip:** *Format > Indent Region / Dedent Region* indents or dedents several lines at once, and *Comment Out Region* comments them out.

> **Beyond the course:** When two lists line up position by position, as weights and heights do here, the idiomatic loop uses `zip()`. It pairs elements without any indexes:
>
> ```python
> for weight, height in zip(weights, heights):
>     bmis.append(round(weight / height ** 2, 2))
> ```
>
> If you really need the index and the value together, use `enumerate()`: `for i, value in enumerate(values):`. Both come up later in the Python curriculum.

### What the practice questions checked

- Writing `for char in forecast:` with `char.upper()`.
- Reading `10 * f"{char.upper()} "` (10 repeats, each followed by a space).
- That parentheses and commas mark a tuple, and tuples are immutable.
- Writing a tuple loop with `\n` separators.
- Problems with one line per element. Index sets begin at 0. `range(n)` gives n indices.
- Choosing `for i in range(4):`, the indexed assignment, and `print(temps)` (not `temps[i]`).
- Replacing a hard-coded range with `range(len(temps))`. Which rounding placements work. The converted values `[18.3, 0.0, 10.0, -18.9]`.
- Debugging a loop that prints indices instead of values.

---

## Lesson 1.5: Pythonic Looping

**Goal:** explore alternatives to indexing in `for` loops.

### Why avoid indexes in loop bodies

"Pythonistas generally avoid using indexes in their `for` loops. Indexes are less efficient and less expressive than getting values directly from a `for` loop."

Quantic's own measurements: getting a value by index was "about 50% less efficient," and setting a value by index was "a whopping 2000% less efficient" than appending a new value to a list.

```python
# Pythonic
for value in values:
    do_something(value)

# Not Pythonic
for i in range(len(values)):
    do_something(values[i])
```

The feedback explains both sides. With the index version, "Having to mentally translate that `values[i]` is a value is an extra barrier to quick understanding." The direct version "saves a step for the interpreter."

### Rewriting the temperature converter

In the index version, three lines need to change: the `for` line, because it generates indexes instead of temperatures, and both body lines, because of their `temps[i]` references. The first line, `temps = [65, 32, 50, -2]`, is fine.

The goal is a list of converted values, but not necessarily the *same* list. Two plans:

- **Plan A (works):** create a new empty list, get the old values directly from the `for` loop, convert each one, and `append()` it to the new list.
- **Plan B (fails):** append converted values to the end of the original list and remove the originals with `pop()`. `pop()` with no argument removes the *last* item, which is the value you just converted. Removing the originals would need an index.

"Believe it or not, it's better to make a new list with the updated info than to update values by index."

Questions the lesson works through:

- **How do you get the values?** With `for temp in temps:`. Lists are iterable. `for temps in temp:` gives a `NameError`. `for temp in range(len(temps)):` still produces indexes.
- **How do you convert?** Reassign the loop variable: `temp = (temp - 32)/1.8`, then `temp = round(temp, 1)`. "It's okay to make changes to that value in the loop. At the next iteration, `temp` will get the next value." Writing `temps[temp]` is indexing again and would raise an `IndexError`.
- **How do you save the results?** `append()` them to a new list. Lists have no `add()` method, so that raises `AttributeError`. You can't modify `temps` in place without indexing.
- **Where do you create the new list?** **Before** the loop. Inside the loop it would be reset on every iteration. After the loop, there'd be nowhere to store values.
- **Where do you append?** **In the body** of the loop. Appending after the loop would only store the last value.

```python
temps = [65, 32, 50, -2]
cels_temps = []
for temp in temps:
    temp = (temp - 32)/1.8
    temp = round(temp, 1)
    cels_temps.append(temp)
print(cels_temps)
```

`cels_temps = list()` also creates an empty list. Quantic's summary of this version: it's more lines, "but it's also more expressive and efficient. As an added bonus, you still have the old temperature list available." It's "still not at the summit of Pythonic Peak". A more Pythonic way comes later in the curriculum.

Celsius to Kelvin (K = °C + 273.15):

```python
kel_temps = []
for temp in cels_temps:
    temp = temp + 273.15
    kel_temps.append(temp)
print(kel_temps)
```

Mistakes the feedback warns about:

- `()` makes an empty *tuple*, which can't be appended to. `""` makes an empty string.
- Looping over `kel_temps` gets nothing, because it's empty at that point. Looping over `temps` uses the Fahrenheit values.
- Append *after* converting.
- `kel_temps[] = temp` is PHP syntax, not Python.

> **Beyond the course:** The output is `[291.45, 273.15, 283.15, 254.24999999999997]`. The last value shows binary floating-point error again (−18.9 + 273.15). Rounding the result, or formatting with `:.2f`, cleans it up. The "summit of Pythonic Peak" Quantic mentions is almost certainly the *list comprehension*, which builds the new list in a single expression:
>
> ```python
> cels_temps = [round((t - 32) / 1.8, 1) for t in temps]
> kel_temps = [t + 273.15 for t in cels_temps]
> ```

### When indexes and slices are fine

"Does this mean you should never use indexes in lists, tuples, or strings? No way! If your code needs to reference a single entry, then indexing is the way to go." Slices, which **select multiple elements from a string, list, or tuple**, are also fine. "Just be wary of using indexes or slices inside the body of a `for` loop."

The course summary puts the rule this way: "Indexes should be used to reference a single entry and slicing should be used to select multiple elements from an iterable. In general, avoid using them in the body of a `for` loop."

| Situation | Verdict | Why |
|---|---|---|
| `day_1 = kel_temps[0]`, or assigning to `kel_temps[0]` | Fine | It's a single value. |
| Changing every value in `kel_temps` by index in a loop | UnPythonic | "Using an index inside the body of a `for` loop, whether to retrieve from a list or assign to it, is to be avoided if possible." |
| `elem = int(input("Element? "))` then `print(ls[elem])` | Pythonic | One entry, outside any loop. |
| `for i in range(len(tu)): print(tu[i] ** 2)` | Not Pythonic | Use `for num in tu: print(num ** 2)`. |
| `n = len(tu) // 2` then `for num in tu[:n]: print(num ** 2)` | Pythonic | The slice is in the `for` *header*, not the body. |
| `sen = sen + words[i] + " "` inside `for i in range(len(words))` | Not Pythonic | "`range(len(...` is the first clue to non-Pythonic code, and the square brackets inside the body of the `for` loop are the clincher." |

### Duck typing

"Python supports a concept called *duck typing*, which means that as long as an object has a particular attribute, it can be used anywhere that attribute is required." The name comes from "if it looks like a duck, swims like a duck, and quacks like a duck, then it's probably a duck." So any object with the attributes of an iterable (lists, strings, tuples, ranges) can be used in a `for` loop.

> **Beyond the course:** The official Python glossary defines *Pythonic* as code that "closely follows the most common idioms of the Python language, rather than implementing code using concepts common to other languages." That's why `range(len(...))` loops are frowned on: they're C-style index loops written in Python. Two cautions:
>
> - **Don't change a list's length while looping over it.** That's the hidden trap in Plan B. Elements get skipped or the loop never ends. Loop over a copy (`for x in items[:]`) or build a new list.
> - **Quantic's efficiency percentages are its own benchmarks.** Results vary by Python version and workload. In CPython, indexing a list is a constant-time operation either way. The stronger, more lasting argument is readability, plus fewer off-by-one and wrong-index bugs.

### Coding Challenge V: squares (`cc_squares.py`)

Start with `nums = [1, 2, 3, 4]` and build a list of each number's square without indexes. The lesson says "may not use indexes." The PDF is stricter: no square brackets at all apart from the first line. Extra credit: make `nums` a tuple or a range. Does it still work, and why?

```python
nums = [1, 2, 3, 4]

# create an empty list then fill it with squares
squares = []
for num in nums:
    squares.append(num ** 2)

print(squares)
```

Extra credit: `nums = (2, 4, 6, 8)` or `nums = range(1, 43)` also work. "Your code works with tuples and ranges because they're both iterables: they return their values one at a time in a `for` loop." Under the strict PDF rule, `squares = list()` would replace `squares = []`.

### What the practice questions checked

- Picking the Pythonic loop (direct values) over the index loop, and saying why.
- Finding which lines of the index-based converter must change.
- Why Plan A (new list plus `append`) works and Plan B (`pop()`) doesn't.
- Correct loop header, reassigning the loop variable, `append` vs. `add`, creating the new list *before* the loop, and appending *in the body*.
- Ordering the `cels_temps` code, then writing the Kelvin loop.
- That slices select multiple elements, and that single-index access outside a loop is fine.
- Classifying snippets as Pythonic or not, with slices in the header allowed.

---

## Lesson 1.6: Augmented Assignment Operators

**Goals:** compute a single value in several steps with `for` loops, and join many strings efficiently with `join()`.

### The operators

A common task is updating a variable using its own value. With 7% sales tax:

```python
price = price * 1.07
```

The tax is `0.07 × price`, so price plus tax equals `1.07 × price`. Three wrong answers: `price = 1.07` sets the price to 1.07, `price = price + 1.07` adds $1.07, and `tax = price * 1.07` uses a 107% rate.

**Augmented assignment operators** "perform an operation on a variable and store the result back into that variable." The summary calls them "a short, expressive syntax" for this.

```python
>>> price = 10
>>> price *= 2
>>> price
20
```

`price *= 2` does the same thing as `price = price * 2`.

**Syntax:** the variable, then a math operator (`+`, `-`, `*`, `/`, etc.) and `=` with **no space between them**, then an expression. "An expression is anything that evaluates to a value." That can be `42` or something like `diameter * 3.14`. Augmented assignment works with *all* the math operators covered so far.

| Task | Correct | Wrong answers and why |
|---|---|---|
| Add 42 to `n` | `n += 42` | `n =+ 42` (operator must come before `=`), `n ++ 42` (not Python), `n + = 42` (no space allowed) |
| Integer-divide `a` by 2 | `a //= 2` | `a /= 2` is true division, not integer division |
| Square `x` | `x **= 2` | `x *= 2` doubles; `x **= 0.5` is the square root |
| Add `a` squared to `z` | `z += a ** 2` | `z **= a + 2` raises `z` to a power; `a += z ** 2` swaps the variables |

"The right-hand side of the augmented assignment operation can be as complex an expression as you need."

### Building up a value in a loop

Bank account with a different interest rate each year:

```python
rates = [0.07, 0.04, 0.12, 0.06, 0.08]
balance = 1000
for rate in rates:
    balance *= 1 + rate
    print(balance)
```

- `balance *= 1 + rate` is the same as `balance = balance * (1 + rate)`. `balance += 1 + rate` adds instead of multiplying. `balance *= rate` forgets the 1. `balance += rate` adds only a few cents.
- Use `for rate in rates`, not `rates in rate` and not `range(len(rates))`.
- On each iteration, **`balance` increases**: 1070.0, 1112.8, 1246.336, 1321.11616, 1426.8054528000002. "Using a loop to perform repeated calculations on a single variable is a common programming practice."

**Initial values.** "When using a `for` loop to build a value over multiple iterations, it's important to select the correct *initial value*." For a balance the starting point is obvious. For a sum it takes a moment's thought:

```python
payments = [250, 250, 185]
total = 0
for payment in payments:
    total += payment
print(total)    # 685
```

This is the same as `total = 0 + 250 + 250 + 185`. "Any other value would give you a wrong answer." Starting at 1, 3, or 250 adds that number to the result. `total += payments` fails because you can't add a whole list to an integer. Quantic notes that the built-in `sum()` does this job and "It's better to use it than to build your own `for` loop." The loop is just a clear example.

For a product, the starting value has to be **1**. The coding challenge asks you to work this out: "a number that when multiplied by any other number equals that other number."

> **Beyond the course:** 0 and 1 are the *identity elements* for addition and multiplication. For strings, the identity for concatenation is `""`. For lists it's `[]`. That's why the accumulators in this course start as `0`, `1`, `""`, or `[]`. Python has no `++` or `--` operators; write `n += 1`. One subtle point: for mutable objects, `+=` may change the object *in place*. If `b = a` and `a` is a list, then `a += [4]` changes the list `b` also refers to. `a = a + [4]` creates a new list and leaves `b` alone. For ints, floats, strings, and tuples, which are immutable, the two forms always behave the same. For products, `math.prod()` is the equivalent of `sum()`.

### Concatenating strings, and why `join()` is better

Augmented assignment works with strings too, since `+` concatenates:

```python
words = ["I", "love", "Python"]
sen = ""
for word in words:
    sen += word + " "       # same as: sen = sen + word + " "
print(sen)                  # "I love Python " (note the trailing space)
```

`sen += f"{word} "` also works. `sen += word` drops the space. `sen += sen + word + " "` repeats `sen`, so the text is doubled.

"For short lists, this is fine. But for longer lists, it's inefficient to use a `for` loop and concatenation." The alternative is the **`join()`** method:

```python
separator.join(iterable)
```

It "returns a new string composed of each of the elements of the `iterable` (which must all be strings), separated by the string `separator`."

```python
words = ["I", "love", "Python"]
sen = " ".join(words)
print(sen)   # I love Python
```

- `words` is the *iterable*, and `" "` is the *separator*.
- `join()` is a method, so it needs an object to call it on: the separator string.
- "A separator can be any string, even an empty string."

### `join()` examples

| Code | Output | Note |
|---|---|---|
| `''.join(["Spam", "is", "tasty!"])` | `Spamistasty!` | Empty separator, so no spaces. |
| `''.join(("Are", "tuples", "iterable"))` | `Aretuplesiterable` | Tuples work, because they're iterable. |
| `" ".join([42, "is", "the", "answer"])` | `TypeError` | "All the elements of `iterable` must be strings." |
| `", ".join("ABCDEFG")` | `A, B, C, D, E, F, G` | Strings are iterable. The separator can be several characters. |
| `print('\n'.join(("That's", "my", "line!")))` | three lines | Without `print()`, the shell shows `That's\nmy\nline!`. |
| `" * ".join(["1", "2", "3"])` | `1 * 2 * 3` | Not `6`, because `join()` doesn't do arithmetic. |

### Why concatenating in a loop is inefficient

```python
scale = ""
for note in "ABCDEFG":
    scale += note + ", "
```

- **What it does:** builds a comma-separated string, `"A, B, C, ..."`. "This is the approach you'd take in many languages."
- **Can Python change a string's contents?** No. Strings are immutable.
- **What does the third line actually do?** It creates a *new* string from `scale + note + ", "` and assigns it to `scale`. "Since strings can't be altered, the only way to add to one is to create a new one."
- **How many new strings does it create?** Quantic's answer is **8**. "Creating eight new strings to get one at the end is where the inefficiency comes from."
- **The `join()` alternative** "only creates one new string."

**What to watch for:** loops that build a long string one fragment at a time. "The key indicator to look for is a `+=` or `string = string + `."

```python
# Fine: builds a list, not one long string
s_words = []
for word in words:
    s_words.append(word + "s")

# Should use join()
string = ""
for word in words:
    string += word + "/"
# Better:
string = "/".join(words)
```

> **Beyond the course:** Why this matters at scale. Each concatenation copies everything built so far, so joining *n* pieces this way costs roughly 1 + 2 + ... + *n* character copies. That's quadratic time. `join()` measures the total length once and copies each piece once, which is linear. Exactly how many strings get created depends on what you count as intermediate, but the growth pattern is the point. CPython sometimes optimizes `s += t` in place, but PEP 8 says not to rely on that and to use `''.join()` in performance-sensitive code. To join non-strings, convert them first: `", ".join(str(x) for x in nums)` or `", ".join(map(str, nums))`.

### Review answers (Lesson 1.6)

- "Only `+ - * /` have augmented forms" is **false**. You used `//=` and `**=`.
- Concatenating many strings with `+` is less efficient than `join()`. **True.**
- `join()` converts non-strings automatically. **False.** Every element must already be a string.
- The starting value when summing should be 0. **True.**

### Coding Challenge VI: product of squares (`cc_squares.py`)

Using the squares from Challenge V: compute their product with an augmented assignment operator, make a new list of the squares as strings, and print `1 * 4 * 9 * 16 = 576` with `join()` and a `*` separator.

```python
nums = [1, 2, 3, 4]  # this will work as any type of iterable (tuple, range, etc)

# create a list of squares of the numbers in nums
squares = []
for num in nums:
    squares.append(num ** 2)

# compute the product of each square and create a new list with values as strings
product = 1
join_squares = []
for square in squares:
    product *= square
    join_squares.append(str(square))

# print the product of the squares
print(f"{' * '.join(join_squares)} = {product}")
```

Notice the quote handling: the f-string uses double quotes outside, so the separator `' * '` uses single quotes inside.

**Pro tip: rubber duck debugging.** Explain your code line by line to a rubber duck. "Talking it out can help you discover where your logic is all quacked up." This is unrelated to duck typing.

### What the practice questions checked

- Writing a 7% price update (`price = price * 1.07`).
- Augmented assignment syntax order (variable, operator, `=`, expression) with no space.
- Choosing the right operator, including `//=`, `**=`, and a complex right-hand side.
- Compound interest with `balance *= 1 + rate`, and that the balance increases.
- Initial value 0 for sums. Correct loop header. `+=` with the element, not the list.
- The augmented form of string concatenation.
- `join()` syntax (separator, `.join(`, iterable), its outputs, and its `TypeError` on non-strings.
- Why loop concatenation is inefficient: immutable strings, a new string on each iteration.
- Spotting which loops should use `join()`.

---

## Final Coding Challenges: Take a Hike...with Python!

The course closes with three small programs (lesson folder `07_take_a_hike`).

**1. `hiking.py`:** ask for the trail, its length, and the number of days, then work out the target daily distance.

```python
trail = input("Which trail are you taking? ")
length = float(input("How long is it (in km)? "))
days = int(input("How many days will you take? "))
daily = length / days

print(f"Welcome to the {trail}!")
print(f"You should hike {round(daily, 1)} km/day.")
```

**2. `daily_log.py`:** ask for the distance hiked on each of the first four days, then compute the average so far.

```python
distances = []
for day in range(1, 5):
    dist = float(input(f"Day {day} dist.? "))
    distances.append(dist)

print(distances)

total = 0
for dist in distances:
    total += dist
print(f"Avg: {total / len(distances)}")
```

This uses an f-string as the prompt, `range(1, 5)` so days count from 1, a 0 starting value, and `+=`.

**3. `great_trails.py`:** use `join()` to print a comma-separated list of trails you've hiked.

```python
trails = ["Pennine Way", "Great Wall", "Silk Road"]
sorted_trails = sorted(trails)
print(', '.join(sorted_trails))
```

Quantic's style note: you could save a line with `', '.join(sorted(trails))`, "That said, there are benefits to taking small steps in each statement. For instance, it's often more readable and it makes finding bugs easier."

> **Beyond the course:** In practice, the average in `daily_log.py` is `sum(distances) / len(distances)`, or `statistics.mean(distances)`. Writing the loop by hand is still worth doing, because it's the general pattern behind any running total. `sorted()` returns a *new* list. `trails.sort()` sorts the list in place and returns `None`, so `', '.join(trails.sort())` fails.

---

## Glossary

- **Augmented assignment operator.** Operators such as `+=`, `-=`, `*=`, `/=`, `//=`, and `**=` that "perform an operation on a variable and store the result back into that variable." Written as the variable, a math operator and `=` with no space, then an expression. `price *= 2` means `price = price * 2`.
- **Default value.** "The value Python will use if you don't provide" an optional argument. For example, `range()`'s step defaults to 1, and `round()`'s `ndigits` defaults to `None`.
- **Duck typing.** "As long as an object has a particular attribute, it can be used anywhere that attribute is required." Any iterable can be used in a `for` loop.
- **Flow control.** "How to tell Python the order in which to execute your code." Loops, condition checks, and branching are examples.
- **For loop.** "A flow control structure that uses `for` / `in` syntax to repeat actions for each element in a given iterable object." The loop variable takes each element in turn, and the indented body runs once per element.
- **`help()`.** A built-in that "lets us look up an object and get information on how it works in Python," for example `help(round)` or `help(range)`. `help()` with no argument opens the interactive help utility.
- **IDE (Integrated Development Environment).** An intermediary containing "text editors, debuggers, and automation tools" that sends your code to the language's interpreter. The course uses **IDLE**, which comes with Python.
- **Indentation.** In Python, indentation shows what belongs to a loop and what doesn't. The standard is 4 spaces per level (PEP 8).
- **`input()`.** A function that "cues a user to enter information." It shows a prompt, pauses the program, waits for a response, and always returns a **string**.
- **Iterable (iterable object).** "An object that can return its items one at a time," for example lists, tuples, strings, and ranges.
- **Iteration.** "Each go-'round of a loop."
- **`join()`.** A string method, `separator.join(iterable)`, that "returns a new string composed of each of the elements of the `iterable` (which must all be strings), separated by the string `separator`." It is more efficient than concatenating in a loop.
- **Logical error.** "When code runs without error but doesn't do what you want."
- **Prompt.** "The text passed in parentheses to the `input()` function." It should be clear and specific.
- **Pythonic.** Quantic's term for code written in Python's own idioms, such as looping directly over values, rather than with index arithmetic.
- **`range()`.** A function that "generates an ordered set of numbers" from `start` (first value output), `stop` (not included), and `step` (the difference between values, default 1). A single argument is treated as `stop`, starting at 0. It returns an iterable **range object**, not a list.
- **`round()`.** A function that "rounds a numeric value to a certain number of digits": `round(number, ndigits=None)`. Without `ndigits` it returns an integer. Exact halves go to the nearest even digit ("Banker's rounding").
- **Rubber duck debugging.** Explaining your code line by line to a rubber duck to find bugs in your logic.
- **Slice.** Selects multiple elements from a string, list, or tuple. Quantic considers it fine outside a `for` loop body, including in the loop header.

---

## Where Quantic differs from other sources

- **How `round()`'s signature is shown.** The course summary PDF prints `round(number[, ndigits])`. The lesson treats that as a sign of an outdated Python (3.6) and expects `round(number, ndigits=None)`, as Python 3.9 displays it. Both mean `ndigits` is optional. Use the lesson's form for exam questions about what `help(round)` shows.
- **"0 digits is the default."** Quantic says rounding defaults to 0 decimal places. True in effect, but `round(x)` returns an `int` while `round(x, 0)` returns a `float` (`4` vs. `4.0`).
- **Typos in the course summary PDF.** Its "Not Pythonic" example has `values[1] = values[i] + 5`, which should be `values[i]`. Its "Pythonic" example appends to `new_value`, which should be `new_values`. The lesson slides have the correct versions.
- **"Iterable: a collection of elements."** The summary's definition implies iterables are collections. In Python generally, an iterable is anything that can produce an iterator, including generators and files, which don't store their elements. The slides' wording, "an object that can return its items one at a time," matches the official glossary.
- **"`range()` generates an ordered set."** Strictly, `range` is a lazy, immutable *sequence* type. It isn't a set and doesn't store its numbers. Quantic also describes `stop` as the number to "count up to," but negative steps count down.
- **Tuples are made by parentheses and commas.** Quantic credits both. Python's own docs say the comma is what makes a tuple, apart from the empty tuple `()`.
- **Efficiency figures.** The "50% less efficient" and "2000% less efficient" index figures come from Quantic's own testing. They aren't standard benchmarks and will vary. Most Python style guides argue for direct iteration mainly on readability and correctness.
- **String-building cost.** Quantic counts 8 new strings for the 7-note scale loop. The exact number depends on whether you count intermediates like `note + ", "`. The general point is standard: loop concatenation is roughly quadratic and `join()` is linear. PEP 8 makes the same recommendation.
- **"You can't mix tabs and spaces in the same script."** That's a good rule to follow. Precisely, Python 3 raises `TabError` when the mix makes indentation ambiguous.
- **Augmented assignment equals the long form.** Quantic says `x op= y` "evaluate[s] to the same thing" as `x = x op y`. That holds for numbers and strings. For mutable objects such as lists, `+=` changes the object in place, which matters if other variables refer to it.
- **Coding Challenge V's rule.** The lesson says "may not use indexes." The PDF says no square brackets apart from the first line, which also rules out `squares = []` (use `list()`).
- **Terminology.** Quantic says "logical error." Many sources say "logic error" for the same thing.

---

## Further reading

### Built-in functions (`input`, `round`, `range`, `len`, `sorted`, `sum`)

- [Built-in Functions (Python docs)](https://docs.python.org/3/builtins/functions.html): the official reference for every function used in this course, with exact signatures and edge cases.

### Loops and control flow

- [More Control Flow Tools (Python tutorial)](https://docs.python.org/3/tutorial/controlflow.html): the official tutorial on `for`, `range()`, `break`/`continue`, and loop `else`, which is where the course goes next.
- [Loop Like a Native (Ned Batchelder, PyCon 2013)](https://pyvideo.org/pycon-us-2013/loop-like-a-native-while-for-iterators-genera.html): a well-known talk on Pythonic iteration that goes from `range(len(...))` to iterators and generators. It fills out Lesson 1.5.
- [Data Structures (Python tutorial)](https://docs.python.org/3/tutorial/datastructures.html): list methods (`append`, `pop`) and list comprehensions, the "more Pythonic way" Quantic promises later.

### Types: strings, tuples, ranges, iterators

- [Built-in Types (Python docs)](https://docs.python.org/3/builtins/stdtypes.html): the reference for `range` objects, `str.join()`, string methods such as `upper()`/`title()`, tuples, and the iterator protocol.
- [Python Glossary](https://docs.python.org/3/glossary.html): official definitions of *iterable*, *duck-typing*, and *Pythonic*, useful for checking Quantic's informal definitions.

### Input, output, and formatting

- [Input and Output (Python tutorial)](https://docs.python.org/3/tutorial/inputoutput.html): f-strings and format specifiers such as `:.2f`, which fix the `$63.6` display problem from Lesson 1.1.
- [Floating-Point Arithmetic: Issues and Limitations (Python tutorial)](https://docs.python.org/3/tutorial/floatingpoint.html): why `59 * 1.078` prints `63.602000000000004` and why `round(2.675, 2)` gives `2.67`.

### Operators and assignment

- [Simple statements (Python language reference)](https://docs.python.org/3/reference/simple_stmts.html): the formal rules for augmented assignment statements, including in-place behavior.
- [Python's Assignment Operator (Real Python)](https://realpython.com/python-assignment-operator/): a readable tour of assignment and augmented assignment, with examples.

### Strings and `join()`

- [How to Join Strings in Python (Real Python)](https://realpython.com/python-join-string/): `join()` in practice, including joining non-string values.

### Style

- [How to Write Beautiful Python Code With PEP 8 (Real Python)](https://realpython.com/python-pep8/): a guided walkthrough of PEP 8 (indentation, operator spacing, naming), the style guide Quantic cites throughout.

### Debugging

- [Rubber duck debugging (Wikipedia)](https://en.wikipedia.org/wiki/Rubber_duck_debugging): the origin and reasoning behind the technique from Lesson 1.6's pro tip.

---

*Generated 2026-11-26 by `summarize.py` with claude-opus-5-5 from 6 ungraded lessons and Quantic's course PDFs. Quoted definitions are Quantic's; blockquotes marked Beyond the course are not.*
