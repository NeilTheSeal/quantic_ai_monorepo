# Python I: Fundamentals

## Overview

Python I is Quantic's first Python course. It takes you from installing Python to working with the language's basic data types. The course says you will:

- Set up Python and get it running smoothly.
- Store and display data using variables.
- Tap into Python's built-in math capabilities.
- Work with the fundamental data types: strings, integers, floats, lists, and tuples.

There are nine lessons. Each one is a series of short interactive slides, and you type the examples into Python yourself as you go ("any time we show examples, you should type them into Python too"). Each lesson ends with a **Coding Challenge** to do on your own, and most end with a "pro tip." The course was built on **Python 3.9** and the **IDLE** editor/shell. It also comes with a printable Summary, a Syntax Reference Sheet, a "Getting Started with Python" setup guide, and a Coding Challenges answer document. All of that material is folded into this guide.

| Lesson | Topic |
|---|---|
| 1.1 | Welcome to Python: shell, `print()`, quotes and escapes, errors |
| 1.2 | Scripts and Variables: files, comments, assignment, naming |
| 1.3 | Strings, Integers, and Floats: types, concatenation, type casting |
| 1.4 | Calculations and Expressions: operators, precedence, expressions |
| 1.5 | Modular Arithmetic: `%` and `//` |
| 1.6 | Working with Strings: methods, escape sequences, whitespace, f-strings |
| 1.7 | Indexing and Slicing |
| 1.8 | Lists: creating, adding, removing, modifying; mutability |
| 1.9 | Analyzing and Organizing Lists: `len`, `count`, copying, sorting, tuples |

---

## Setup: Getting Started with Python

This comes from Quantic's "Getting Started with Python" handout and Lesson 1.1, slides 3–4.

**Version.** The course uses **Python 3**. Python 2 is incompatible with it ("a small number of critical differences"), and "As of 2020, Python 2 is no longer supported." The course was built with **Python 3.9**. Versions 3.7 and later run the code, though outputs may differ slightly. Some code won't work before 3.7. Version numbers have three parts (3.9.2), and versions that share the first two numbers should behave the same, so pick the highest 3.9.x available. Install a **stable** release, not an "early developer preview."

**Installing.** On Windows, use the 64-bit installer from python.org and tick **"Add Python 3.9 to PATH"** on the first screen. On Mac, use the macOS 64-bit Intel installer. The handout notes that Macs shipped with Python 2, so you still need to install Python 3, and that the "universal2" installer for Apple M1 was considered experimental as of December 2020.

**IDE.** An **Integrated Development Environment (IDE)** is an intermediary that contains "text editors, debuggers, and automation tools," which let you write code and send it to the language's interpreter. The course uses **IDLE**, which comes with Python. It is "great for beginners," and you'll move to other environments as you improve. If you already have a Python IDE you like, you can use it.

**Testing the install.** Open IDLE, type `print("Hello World!")` exactly as shown, and press Enter. It should print `Hello World!`. "Always match capitalization, punctuation, and spacing!"

**Lesson setup.** Have the lessons open on one device or screen and Python on another. Double monitors are "common practice in the world of coding."

**Finding help.** In Quantic's order:

1. **Google**: search for the error message, your goal, or the code that isn't working. Include the word *Python*, your operating system, and your Python version.
2. **Stack Overflow**: usually the top search results. Post a question there only "as a last resort," because everyone answering is a volunteer.
3. **Python.org**: comprehensive, and aimed at experienced programmers.
4. **Python Wiki**: maintained by the writers of Python and the community. Good for looking up a specific function or method.
5. **`help()`**: Python's built-in help utility. Type `help()` at the prompt.

> **Beyond the course:** Python 3.9 reached end-of-life on 31 October 2025 and no longer gets security fixes. For new work, install a currently supported 3.x release. Everything in this course still works, though some error messages look different (see Lesson 1.1). Newer IDLE versions also behave the same for everything taught here. Recent macOS releases no longer include Python 2.

---

## Lesson 1.1: Welcome to Python

### Why Python

Quantic gives six reasons. The slide marks all of them correct:

- **Easy to learn as a beginner.** It "looks and feels intuitive compared to a lot of other languages."
- **Strong community.** The community is large and supportive.
- **Used by many companies**, among them Google, Instagram, YouTube, Dropbox, and Netflix.
- **Versatile.** It's "all-purpose code," and its libraries support web and game development, statistical analysis, image processing, and more.
- **Monty Python references.** Python is named after the comedy troupe, and the course is full of references to it (spam, Ni!, the Holy Grail).
- **Runs on many platforms.** Mac, Windows, Linux, iOS, and Android all have Python, and almost any program runs on all of them unchanged.

Someone who knows Python is a *Pythonista*. Someone who invents new techniques with it is a *Pythoneer*.

### The shell and the interpreter

- The Python **shell** is "a user interface that allows you to interact with the guts of Python." In the summary's words, it "interacts with the interpreter, which executes the code." IDLE's shell window shows the `>>>` prompt.
- The **interpreter** is "the part of Python that executes commands."
- In the interactive shell you type one line at a time. When you press Enter, the interpreter runs it and writes any output to the screen. The interactive shell window "allows you to execute just one command at a time."

**Line width.** Most text editors open at a preset width of **79 characters**, a habit that goes back to punch cards. Quantic's advice is to **leave the window width as is**. Changing it is "generally frowned upon," because someone else viewing your code at 79 characters "will see all sorts of confusing line breaks."

### Your first function: `print()`

Tradition says the first program in a new language prints *Hello World!*, which also confirms that your setup works.

```pycon
>>> print("Hello World!")
Hello World!
```

Python prints the text without the quotation marks but keeps the exclamation mark.

Definitions:

- **Syntax**: "placement of commands and punctuation", which "must be precisely followed."
- **Function**: a "pre-programmed operation." The summary adds that it "tells Python to do something with the argument." In the review matching it is "a built-in Python command that performs a specific task."
- **Argument**: "the input that we pass to the function in parentheses."
- **Calling**: what programmers call using a function, defined as "using a function by providing its name and arguments." *Call* works as a verb ("call the `print()` function") and as a noun ("a great call to `print()`").
- **`print()`** outputs its argument to the screen. With empty parentheses it prints a blank line.

General form: `function(argument)`. As the summary puts it, "print() is a key term, but it's also a function!"

For `print("Hello World!")`, the input is *some text in quotes* and the output is *text without quotes*. "Every function has syntax requirements that must be followed exactly."

### Testing the rules of `print()`

| Code | Result | Why |
|---|---|---|
| `primt("I love Python!")` | Error | "Python doesn't have AutoCorrect" |
| `Print("Continue shopping?")` | Error | Capitalization matters: `Print`, `PRINT`, `priNt` are all different from `print` |
| `print("#Pythonista")` | Works | Most special characters are fine inside quotes |
| `print("He said, "Ni!"")` | Error | The double quote before `Ni` closes the text early |

**Unfinished code and `<ctrl>-C`.** If you type `print("Missing something?"` without the closing parenthesis, Python waits for more input. **`<ctrl>-C`** (`<control>-C` on Mac) gets you out. It "stops the code and sends you back to the command prompt," and works as an escape whenever code "can't finish or takes too long to run." The technical term is that it *interrupts* the code, so you'll see a `KeyboardInterrupt` message.

### Quotes inside text, and the backslash

You can wrap text in single **or** double quotes. Pick whichever kind doesn't appear in the text:

```python
print('She's a witch!')            # Error: the ' in She's closes the string
print("She's a witch!")            # Works
print("He said, "No cheese!"")     # Error
print('He said, "No cheese!"')     # Works
```

If the text contains both kinds of quote, use the **backslash** (`\`). Placed in front of a quotation mark, it tells Python the mark is "not meant to close off the text." A backslash tells Python to treat the next character in a special way. The backslash together with the character after it is an **escape sequence** (covered fully in Lesson 1.6).

```python
print('She said, "I\'m home."')
print('He said, "Let\'s code!"')      # Summary example
print('"Infinite Jest" isn\'t short.')
print('"Let\'s!" he said.')
print("Meg's cat isn't \"nice.\"")
```

### Debugging and errors

- **Debug**: when you make an error, "Python gives you information that might help you debug it or figure out where the error is."
- **Traceback**: "a report showing where Python had trouble." In the review it is "a record of a coding error."

```pycon
>>> primt("Hello World!")
Traceback (most recent call last):
  File "<pyshell#7>", line 1, in <module>
    primt("Hello World!")
NameError: name 'primt' is not defined
```

A traceback like this one shows three things: **the error type**, **the word causing the issue**, and **the line where the error occurred**. It does *not* tell you exactly how to fix the problem, and not every message is this specific.

- **NameError**: you used "a word that Python doesn't recognize." Any misspelling of `print` produces one.
- **SyntaxError**, also called a *parsing error*: Python "can't understand a line of code due to, say, a missing parenthesis or characters being out of order." In IDLE's shell a syntax error has no traceback. Instead, "Python highlights what it thinks *might* be the error," which is usually the first character after the point where Python got lost.

| Bad code | Message | Fix |
|---|---|---|
| `print(Hello World!)` | `SyntaxError: invalid syntax` | add quotes |
| `print('My dog's name is Caspian')` | `SyntaxError: invalid syntax` | add a backslash (`dog\'s`), or use double quotes |
| `print"Hello World!"` | `SyntaxError: invalid syntax` | add parentheses |
| `print("hello"))` | `SyntaxError: unmatched ')'` | delete a parenthesis |

**Colour coding helps.** In `print('My dog's name is Caspian')`, the editor colours the text you meant to print in different colours. "The fact that the *s* in *dog's* is black is a visual alert to trouble": the single quote closed the string early. Colour schemes vary between editors.

**Quantic's tips for spotting syntax errors**, which are the errors you'll see most as a beginner:

1. Step away and come back. "Fresh eyes are keen eyes."
2. Compare your code character by character against a working example.
3. Check for tab and spacing errors.
4. Retype the line from scratch. Text copied from web pages can contain invisible non-printing characters that the interpreter *can* see.

### Coding Challenge I (with Quantic's sample answers)

Produce each output, then write one line that raises a `SyntaxError` and one that raises a `NameError`.

```python
print("Python's great!")
print('The book "Infinite Jest" has 1,079 pages.')
print('"Don\'t eat that," she said.')
```

Lines that raise `SyntaxError`: `print('shouldn't')` (needs a backslash or double quotes), `print(yes please)` (missing quotes), `print 'hello'` (missing parentheses). For `NameError`, any misspelling works, such as `primt("Python's great!")`. The sample answers choose quotes so that as few backslashes as possible are needed.

**Pro tip:** `<alt>-P` (Windows) or `<control>-P` (Mac) in IDLE recalls the previous line you typed. Press it again to step further back.

> **Beyond the course:** The shell is a REPL (read–eval–print loop). Newer Pythons (3.10 and later) give much more helpful error messages than the 3.9 messages the course shows. For example, `print 'hello'` now gives `SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?`, `primt(1)` gives `NameError: name 'primt' is not defined. Did you mean: 'print'?`, and `print('My dog's name')` gives `SyntaxError: unterminated string literal`. When you run a script from a terminal rather than IDLE, syntax errors also print the file name, the line, and a caret `^` under the problem. Also useful: triple-quoted strings (`"""..."""`) can hold both kinds of quote and span several lines without any escaping.

### What the practice questions checked

- Exact output of `print("Hello World!")`: no quotes, exclamation mark kept.
- That misspellings and capitalization (`primt`, `Print`) cause errors, while `#` inside quotes is fine.
- Which quoting choices work for text containing `'` or `"`, and where `\'` / `\"` are needed.
- That `<ctrl>-C` interrupts code (`KeyboardInterrupt`), not closes the window.
- Reading a traceback: error type, offending word, line number. Words in the `primt` error: `Traceback`, `NameError`, `primt`.
- The right fix for each of four SyntaxErrors.
- Matching: shell, interpreter, function, `<ctrl>-C`, traceback, call.

---

## Lesson 1.2: Scripts and Variables

### Scripts

A Python **script** is "a file that contains text-based code that the interpreter can read and execute." The summary says a script "allows you to send multiple lines of code to Python to execute at once." Scripts are also called **modules**. Quantic notes that modules "are used differently than scripts," so the course says "script," but IDLE's menu says *Run Module*. In the review, "script" is the answer to "another name for a Python file," and "file" and "script" are "basically interchangeable."

**Organizing your files.** Make a **directory** (a folder) called `python_01_fundamentals`, with one subfolder per lesson: `01_welcome_to_python`, `02_scripts_and_variables`, `03_strings_integers_and_floats`, `04_calculations_and_expressions`, `05_modular_arithmetic_in_python`, `06_working_with_strings`, `07_indexing_and_slicing`, `08_lists`, `09_analyzing_and_organizing_lists`.

**File-naming convention** (from PEP 8, the Python style guide):

> Files should have short, lowercase names with underscores for spaces, and they shouldn't begin with a number.

Script files end in `.py`, and IDLE adds the extension for you.

| Name | OK? | Why |
|---|---|---|
| `start_time.py` | Yes | short, lowercase, underscore |
| `answer42.py` | Yes | numbers are fine if they don't come first |
| `user_names.py` | Yes | |
| `pythonista_superstar_number_one.py` | No | too long (won't cause an error, just poor style) |
| `movie rec.py` | No | contains a space |
| `42answers.py` | No | starts with a number |
| `Alien_inv.py` / `UserNames.py` | No | capital letters |

(Quantic's lesson *folders* start with numbers so they sort in order. The script names follow the convention.)

**Writing and running a script in IDLE.** Choose *File → New File*. The new window has no `>>>` prompt because you're no longer in interactive mode, so pressing Enter **doesn't execute** the line. Save the file (for example `quotes.py`), then choose *Run → Run Module*. The output appears **in the shell window**, so it helps to put the script and shell side by side.

```python
print("A rose by any other name")
print("would smell as sweet.")
```

- **Save before running.** "Python reads your scripts from your computer's disk," so unsaved changes won't run.
- **Shell restart**: running a script shows a `RESTART:` line in the shell. It "means anything you did previously in the interactive window has been cleared so the script's code can be executed on a clean slate."

```text
RESTART: /02_scripts_and_variables/quotes.py
A rose by any other name
would smell as sweet.
>>>
```

### Comments

A hash mark `#` starts a **comment**. "Python generally ignores whatever comes after #." The one exception is when `#` is inside a string. A comment can take up a whole line or come after code on the same line:

```python
# This program prints quotes.
# Here's the first quote.
print("A rose by any other name")      # runs
print("would smell as sweet.")         # runs
# Here's the author of the quote.
print("- William Shakespeare")         # runs
print("Done!") # The End!              # print runs; the comment is ignored
```

**Why comment?** "Code is read more often than it is written." Comments:

- help **colleagues** understand your code, since most coding is collaborative
- help **you** remember what your code does six months from now
- let you track questions or ideas, such as code you want to rewrite

They do *not* make code run faster, because Python skips them. Quantic acknowledges a debate: some say good code is self-documenting, others that comments explain *why* and *how*. Its advice is to use comments while you're learning. It also suggests typing your lesson notes as comments in your scripts.

**Readability is part of the Python ethos.** Comments and strategic blank lines (whitespace) group code into sections that are easy to follow. Blank lines don't affect how code runs. A review answer: the ethos is "Make the code as readable as possible." Avoiding comments and eliminating blank lines are not part of it.

```python
# Create a blank list.
usernames = []

# Add three usernames.
usernames.append("r2d2_37")
usernames.append("HAL3000")
usernames.append("E.R1p13y")

# Print the list.
print(usernames)
```

### Variables and assignment

```python
# Print a customer's food order.
food = "burritos"
print(food)        # prints: burritos
```

- **Variable**: "a label for storing changeable information."
- **Assignment operator**: the equals sign `=`. `food = "burritos"` *assigns* the value `"burritos"` to the variable `food`. `print(food)` then prints the variable's **value**, not its name.
- Think of `=` as an action that connects the **variable on the left** to the **value on the right**. `taco_qty = 3` is correct. `10 = spice_level` and `"beans" = side_dish` are backwards.
- Text values need quotes (`food = "burritos"`). Numbers don't (`cats = 3`).
- A variable's value can change at any time. "When you change a value, the old value is erased and the new one stored":

```python
food = "burritos"
food = "enchiladas"
food = "tacos"
print(food)        # tacos
```

### Variable naming

**Rules** (break one and you get an error):

- Names can contain only letters, numbers, and underscores.
- They can't begin with a number.
- They can't be a Python "functional word" such as `print` or `import`.

**Conventions** (legal to break, but not ideal):

- Names should be short but descriptive.
- Avoid a lone capital `O` or lowercase `l`, which can be confused with `0`, `1`, or capital `I`.
- Avoid abbreviations: `example_variable`, not `ex_var`. Quantic admits it sometimes abbreviates names in the courses to save space on the platform.

| Name | Verdict |
|---|---|
| `2_username` | illegal (starts with a number) |
| `first+lastname` | illegal (`+` not allowed) |
| `u_n` | legal but not ideal (not descriptive) |
| `unique_user_identifier_for_app` | legal but not ideal (too long) |
| `username_2` | just fine |

**Style tip:** `food = "burritos"` is preferred to `food="burritos"`. Both work, but spaces around `=` are the readable convention.

### Practice: Rockin' Tacos drive-thru

To print `Customer's order:` / `cheese` / `burrito`:

```python
# Display order.
food = "burrito"
filling = "cheese"

print("Customer's order:")
print(filling)
print(food)
```

`print(cheese)` would fail. Without quotes, Python treats `cheese` as an undefined variable name.

### Coding Challenge II (Quantic's sample answer)

```python
# This program prints a statement saying which
# destination I'd like to visit.

destination = "Madagascar"

print("I'd like to visit this destination:")
print(destination)
```

To change the destination, edit the variable's value and run the script again.

> **Beyond the course:** Python variables are best understood as **names bound to objects**. `=` attaches a name to a value; it doesn't copy the value into a box. This model explains the list-copying surprise in Lesson 1.9. On the naming rules: strictly, only **keywords** (`import`, `if`, `for`, `class`, `True`, …) are forbidden. Built-in names such as `print`, `list`, `str`, and `len` *can* be reassigned (`print = 5` is legal), but that hides the built-in and breaks later code, so treat them as off-limits as Quantic says. The PEP 8 naming style for variables and files is `snake_case`. Running *Run Module* in IDLE is the same as running `python quotes.py` in a terminal.

### What the practice questions checked

- Which file names follow the convention.
- That a script line doesn't run when you press Enter, and that output appears in the shell.
- Which lines of a commented script execute, including inline comments.
- The reasons for commenting, and that readability (comments plus whitespace) is the Python ethos.
- That `print(food)` prints the value `burritos`, not `food` or `"burritos"`.
- Direction of assignment: variable left, value right. `topping = "lettuce"` is correct.
- Reassignment: the last assigned value wins (`tacos`).
- Classifying names as illegal, legal but not ideal, or just fine.

---

## Lesson 1.3: Strings, Integers, and Floats

### Data types

"Each piece of data in Python has a **type** that defines how it can and can't be used." Python *infers* types from the values you assign. In some languages you must declare a variable's type first, but Python works it out, and "the type can change as you change the content." With `var1 = 20`, `var2 = 5`, `var3 = "cat"`, `var4 = "dog"`, Python can divide `var1` by `var2` but not `var3` by `var4`.

### Strings and concatenation

A **string** is "a sequence of characters" such as *burritos* or *2-for-two!*. "Python identifies anything wrapped in quotes as a string", whether single or double quotes. Strings can contain spaces, numbers, letters, and punctuation. `num_sharks = "4"` is a string, because the quotes tell Python to treat it as non-numeric. `num_sharks = 11` and `5.5` are not strings. (Quantic uses double quotes throughout for consistency.)

To **concatenate** is to merge strings with `+`:

```python
item1 = "Earbuds"
status = " are in stock."      # note the leading space
report = item1 + status
print(report)                  # Earbuds are in stock.

item2 = "floppy disks"
print("Sorry, " + item2 + " are out of stock.")
```

Python knows that `+` between numbers means addition and `+` between strings means concatenation. You must be explicit about spaces and punctuation: "Python does exactly what you tell it to do," and it won't guess where spaces belong.

### Integers and floats

- **Integer**: "a whole number, such as 5, -2, or 17." The summary says "a number with no fractional part."
- **Float**: a number with a fractional part, "which shows up as digits to the right of the decimal point." The name comes from *floating point decimal*: there isn't a fixed number of places before or after the decimal.

```python
num1 = 7
num2 = 12
total = num1 + num2
print(total)       # 19
```

Identifying types:

| Value | Type | Note |
|---|---|---|
| `0` | integer | "a unicorn integer," but an integer |
| `17800923` | integer | no digits after a decimal point |
| `0.25`, `547.3`, `3.14159265358` | float | |
| `15.0`, `4.0` | float | "Python takes that `.0` very seriously!" |
| `"chartreuse"`, `"314"` | string | quotes make it a string; IDLE colours strings green |

A true/false item: floats do *not* need exactly 3 digits after the decimal. The whole point of floating point is that the number of places isn't fixed.

### Mixing types: TypeError

```python
num1 = "7"
num2 = "12"
print(num1 + num2)      # 712  (concatenated, not added)
```

```pycon
>>> temp = 21
>>> print("Today's high: " + temp)
Traceback (most recent call last):
  File "/data_types.py", line 7, in <module>
    print("Today's high: " + temp)
TypeError: can only concatenate str (not "int") to str
```

**TypeError**: "When you ask Python to do something with one data type that it can only do with another." Python can only concatenate a string with another string. Quantic notes that some other languages, such as JavaScript and C#, don't raise an error in this situation.

There are two ways around it:

1. **`str()`** returns a string version of its argument:

   ```python
   print("Today's high: " + str(temp))
   ```

   Functions **return** a value, and that value is used where the function was called. If `temp` is `72`, the line becomes `print("Today's high: " + "72")`. Quantic adds that `str()` is more accurately a *callable object*, but it behaves like a function, so the course calls it one.

2. **Commas in `print()`.** `print()` converts each argument to a string and separates them with spaces:

   ```python
   print("Today's high:", temp)
   ```

Which lines print `You have 3 followers!`?

```python
print("You have " + 3 + " followers!")        # TypeError
print("You have " + str(3) + " followers!")   # works
print("You have", 3, "followers!")            # works (spaces added by print)
print("You have" 3 "followers!")              # SyntaxError
```

### Checking and converting types

**`type()`** returns the type of the value you pass it:

```pycon
>>> var1 = "a"
>>> var2 = "7"
>>> var3 = 5
>>> var4 = 3.6
>>> type(var2)
<class 'str'>
```

Checking types matters most with user input, which might arrive as `2`, `two`, `2 ?`, and so on.

**`int()`** and **`float()`** return integer and float versions of their inputs. Using `str()`, `int()`, and `float()` to get different types is called **type casting** (a quiz option calls it "stereotyping," which is wrong).

```pycon
>>> float(var2)
7.0
>>> type(var2)          # unchanged
<class 'str'>
>>> int(var1)
ValueError: invalid literal for int() with base 10: 'a'
```

- These functions **don't change** the variable. They "just spit out different versions" of it.
- `int()` accepts strings like `"1"`. The string `"a"` has a *value* that can't be converted, which is why the error is a **ValueError** and not a TypeError or SyntaxError.

The Syntax Reference Sheet gives: `str(42)` → `'42'`, `int("42")` → `42`, `float("42")` → `42.0`, `type("42")` → `<class 'str'>`.

### Coding Challenge III (Quantic's sample answer)

```python
city_1 = "Paris"
city_2 = "Berlin"
distance = 1052

print(city_1 + " and " + city_2 + " are " + str(distance) + " km apart.")
```

```pycon
>>> float(distance)
1052.0
>>> str(distance)
'1052'
>>> int(distance)
1052
```

If a long `print()` won't fit on one line, break it before or after one of the `+` signs.

**Pro tip: commenting out.** To keep code without running it, add `#` to each line. In IDLE you can select the lines and use *Format → Comment Out Region* (which inserts `##`), then *Uncomment Region* to undo.

> **Beyond the course:** Python is **dynamically typed** (types belong to values, not to variable names) but **strongly typed** (it won't silently convert `"3" + 4`). That is why you get a TypeError here where JavaScript would produce `"34"`. Some useful conversion details: `int(3.9)` gives `3` because it truncates toward zero; `int("3.5")` raises ValueError, so use `int(float("3.5"))`; `int(" 42 ")` accepts surrounding whitespace; `float("1e3")` gives `1000.0`. Python integers have no size limit. Strictly, `str`, `int`, and `float` are classes, and "calling" them builds a new object of that type. The more common name for "type casting" in Python is *type conversion*.

### What the practice questions checked

- Which values are strings (anything in quotes, including `"4"`).
- The output of string concatenation, and the need for explicit spaces.
- Identifying ints vs floats (`15.0` and `4.0` are floats, `0` is an int).
- `"7" + "12"` gives `712`. `"Today's high: " + 21` raises TypeError.
- The two fixes: `str()` or commas in `print()`.
- `type(var2)` gives `str`. `float("7")` gives `7.0` without changing the variable. `int("a")` raises ValueError.
- The term *type casting*.

---

## Lesson 1.4: Calculations and Expressions

### Arithmetic operators

| Symbol | Operation |
|---|---|
| `+` | addition |
| `-` | subtraction |
| `*` | multiplication (also repeats strings) |
| `/` | division |
| `**` | exponentiation (`2 ** 3` is 2 cubed) |

```pycon
>>> 437 + 299 - 98
638
>>> 17 ** 4
83521
>>> 5 / 0
ZeroDivisionError: division by zero
```

Python has a dedicated **ZeroDivisionError** for dividing by zero, "a mathematical impossibility."

**Spacing conventions.** Put spaces on both sides of an operator. You may drop them to show that multiplication happens before addition.

```python
# Yes
6 - (3 - 2)
5 * 4
6*4 + 5
# No
5+8-9
( 7 + 3 )
```

### Order of operations

Python follows the standard order: grouping symbols (parentheses) first, then exponentiation, then multiplication and division (left to right), then addition and subtraction (left to right).

```pycon
>>> 2 * (5 - 1) ** 3      # 5-1 = 4; 4**3 = 64; 2*64
128
```

### Integers and floats in calculations

- Adding, subtracting, or multiplying two integers gives an integer.
- Any of these operations between an integer and a float gives a **float**: `1 + 2.5` is `3.5`.
- **Division always gives a float**, even when both numbers are integers and it comes out even: `6 / 2` is `3.0`, and `100 / 20` is a float. Quantic notes that other languages may return an integer here.
- `104293 * 573911` is an integer ("a very, very large integer"). `2.5 - 1.5` is a float (`1.0`) because one of the inputs is a float.

**Float precision:**

```pycon
>>> 0.1 + 0.2
0.30000000000000004
```

Because of the way computers store floats internally, most are not *exactly* the number you see. Quantic's explanation: floats are fractions whose numerator is an integer and whose denominator is a power of 2. 0.25 is exactly 1/2², but 0.1 and 0.2 can't be written that way. Floats are "accurate to within 15 decimal places," which is fine for almost every purpose. If you need more precision, look into the `decimal` module.

### String operators

Only two arithmetic operators work on strings: `+` (**concatenation**) and `*` (**repetition**).

```pycon
>>> "yo" + "ho"
'yoho'
>>> "ha" * 3
'hahaha'
>>> "fa" + "la" * 3      # * before +, as with numbers
'falalala'
```

### Expressions

An **expression** is "any combination of values, operators, delimiters, variables, and functions that evaluates to some value." A **delimiter** is a symbol that separates elements: parentheses, brackets, and commas are examples.

```pycon
>>> 4 + 3 ** 2
13
>>> "ho " * 3
'ho ho ho '
>>> str(3) + " french hens"
'3 french hens'
>>> 99
99
```

- If you enter almost any expression in the IDLE shell, it shows the value. The exception is expressions that evaluate to `None`.
- The shell shows strings in single quotes even if you typed them with double quotes.
- A lone value such as `99` or `"ni"` is an expression: it evaluates to itself.
- A lone operator such as `/` is **not** an expression.
- `knight = "lancelot"` is **not** an expression. It's a variable assignment and "doesn't evaluate to anything." The `"lancelot"` part *is* an expression.
- `knight` on its own **is** an expression *if the variable is already defined*. It evaluates to `'lancelot'`.

**Defining a variable means assigning an expression to it.** Python evaluates the expression and assigns the result: `variable_name = expression`. Before assignment the variable is undefined, and using it raises a `NameError`. You can put several variables on the left (`a = b = 42`), but the last element must be an expression. `a = (b = 42)` fails because an assignment is a statement, not an expression.

### Coding Challenge IV (Quantic's sample answers)

```python
print(2 + 11 - 3**2)
print(400 / 100)
print(-4 * -1)
print(16 ** 0.5)
print((-16 + 2*20) / (2 ** 3) + 1)

print("I'm a master of expressions, mwa" + "ha"*3 + "!")

print(2 ** 10000)
```

You must use `print()` to see results when running a script. "Technically," three of the five evaluate to the float `4.0`, not the integer `4`. Raising to the power `0.5` takes a square root. `2 ** 10000` "stymies the vast majority of calculators" but not Python. If a huge calculation freezes Python, it's fine to quit or "kill" it.

**Pro tip:** check **PEP 8**, Python's style guide, for conventions on spacing, naming, file names, and screen width.

> **Beyond the course:** Some precedence details that catch people out: `**` binds tighter than a leading minus, so `-2 ** 2` is `-4`. `**` is also right-associative, so `2 ** 3 ** 2` is `2 ** 9 = 512`. Never compare floats with `==` (`0.1 + 0.2 == 0.3` is `False`); use `math.isclose(a, b)`. "15 decimal places" is more precisely about 15–17 *significant digits* (IEEE-754 double precision), so very large floats have no decimal places of accuracy at all. `round()` rounds halves to the nearest even number (`round(2.5)` is `2`). Since Python 3.8, the "walrus" operator `:=` lets an assignment act as an expression, e.g. `(n := 10) * 2`.

### What the practice questions checked

- Evaluating `437 + 299 - 98` and `17 ** 4`.
- That `5 / 0` raises ZeroDivisionError.
- The step-by-step order of operations for `2 * (5 - 1) ** 3`.
- Result types: int + float gives float; `/` always gives float; `0.1 + 0.2` is a (slightly off) float.
- `"ha" * 3` gives `hahaha` (no spaces); `"fa" + "la" * 3` gives `falalala`.
- Which items are expressions (`/` no; `"ni"` yes; assignment no; a defined variable yes).
- Assignment form: `variable_name = expression`.

---

## Lesson 1.5: Modular Arithmetic in Python

### The idea

**Modular arithmetic** is "the mathematics of remainders and integer division." It answers questions such as how many full miles fit in a 30,000-foot perimeter, or how many of 10,227 onions are left over when you pack them in 4s.

**Thought experiment.** Make repeated 90° right turns. After 1 turn you face right, after 2 backwards, after 3 left, and after 4 you're right back where you started. So 4 turns is "equivalent" to 0 turns, and 1, 5, 9, 13, 17, … are all equivalent: each is 1 more than a multiple of 4.

**Modulo** (**mod**) "spit[s] out the *remainder* of a division problem."

```text
9 mod 4 = 1     (4 goes into 9 twice, remainder 1)
1 mod 4 = 5 mod 4 = 13 mod 4 = 1
6 mod 4 = 2     7 mod 4 = 3     20 mod 4 = 0
17 mod 5 = 2    33 mod 5 = 3    32 mod 10 = 2
9 mod 10 = 9    (10 goes into 9 zero times; all 9 left over)
12 mod 2 = 0
```

**Time wraps around.** A 30-hour juice cleanse that starts at 5 AM: 30 mod 24 = 6, and 5 + 6 = **11 AM** (on Tuesday). Mod is useful for anything that repeats or rotates, such as hours, months, or axles. Mod 24 steps through the hours of a day and mod 12 through the months of a year.

### In Python: `%` and `//`

The **modulo operator** is `%`:

```pycon
>>> 9 % 4
1
>>> 1000 % 24
16
>>> 51 % 2
1
>>> 204 % 12
0
>>> 215 % 12
11
```

**Integer division** is done in Python "by finding the decimal result of a division and rounding *downward*," and uses `//`. Python's version is called **floor division**. Quantic notes that languages treat integer division differently, but the details won't matter until you write more advanced code.

```pycon
>>> 11 // 4          # 11 / 4 = 2.75
2
>>> 4000 // 37       # not 4 (that's %), not 108.108... (that's /)
108
>>> 576 // 17
33
>>> -5 // 2          # rounds DOWN: to the left on the number line
-3
```

"Always watch for unexpected results with negative numbers."

**Time and date uses:** full days in 1000 hours is `1000 // 24`, years in 301 months is `301 // 12`, and hours in 525,600 minutes is `525600 // 60`. Always put the total first and the unit size second.

**Hayloft scenarios** (food-manufacturing efficiency):

| Question | Expression | Answer |
|---|---|---|
| Full 24-hour days in a 99-hour pickle ferment | `99 // 24` | 4 |
| Time of day ready, if started 7 AM Monday | `7 + (99 % 24)` | 10, i.e. 10 AM Friday |
| Full 12-egg cartons from 5000 eggs | `5000 // 12` | 416 |
| Eggs left over | `5000 % 12` | 8 |

**Precedence pro tip:** `%` and `//` rank with `*` and `/`. They come after exponentiation and before addition and subtraction.

```pycon
>>> 2 + 7 % 4
5
>>> 9 - 2 ** 3 // 4
7
```

### Coding Challenge V: crumpets (Quantic's sample answer)

You bake 1250 crumpets a day, 92% are completed, and they sell in packs of 6.

```python
crumpets_started = 1250
success_rate = 0.92
pack_size = 6

crumpets_completed = crumpets_started * success_rate

full_packs = crumpets_completed // pack_size
leftover = crumpets_completed % pack_size

print("Full packs: " + str(full_packs))
print("Leftover: " + str(leftover))
```

Pro tip from the handout: setting the inputs (`crumpets_started`, `success_rate`, `pack_size`) at the top lets you change them without touching the calculations. Check your answer with a calculator.

> **Beyond the course:** The sample prints `Full packs: 191.0` and `Leftover: 4.0`. Because `crumpets_completed` is a float, `//` and `%` also return floats. Wrap the result in `int()` (`int(crumpets_completed)` or `int(full_packs)`) if you want whole numbers. In general, `//` returns an int only when both operands are ints. Two identities always hold: `a == (a // b) * b + a % b`, and the result of `%` takes the **sign of the divisor**, so `-5 % 2` is `1` and `5 % -2` is `-1`. That is why Python floors rather than truncating. `divmod(a, b)` returns both results at once: `divmod(5000, 12)` gives `(416, 8)`. For clock arithmetic, `(start + duration) % 24` gives the hour directly: `(7 + 99) % 24 = 10`.

### What the practice questions checked

- The turning thought experiment, and which numbers are equivalent (1, 5, 9, 13).
- Computing remainders by hand (`6 mod 4`, `33 mod 5`, `9 mod 10`, …) and with `%`.
- The juice-cleanse time (30 mod 24 = 6, so 11 AM).
- `//` results, including `-5 // 2 = -3`.
- Choosing `//` or `%`, with operands in the right order, for the Hayloft scenarios.
- Matching: integer division, modulo, `%`, `**`, `//`.

---

## Lesson 1.6: Working with Strings

### Methods and case

```python
name = "SAM"
print("Hi, " + name.title() + "!")      # Hi, Sam!
```

A **method** is "an action performed on a specified object." The syntax is:

```text
object.method()
```

Like a function, a method takes arguments in its parentheses. Even when there are none, the parentheses are required (leaving them off was the source of the `TypeError` distractor). Using a method is also called *calling* it, or more formally *invoking* it. In `print("Hi, " + name.title() + "!")`, `print` is a function, `name` is an object, and `title` is a method.

- **`title()`** returns a title-case version of the string: "the first letter of *each* word is capitalized, and all remaining letters are lowercase."
- **`lower()`** and **`upper()`** return lowercase and uppercase versions.
- These methods **do not permanently alter** the variable. After `name.title()`, typing `name` in the shell still shows `'SAM'`. (IDLE shows strings in single quotes. Quantic jokes that Python's inventor, Guido van Rossum, is Dutch.)
- To keep the change, reassign the variable: `name = name.title()`. To keep the original as well, use a new name such as `name_title`.

```pycon
>>> device = "iPhone"
>>> device.title()
'Iphone'
>>> device.upper()
'IPHONE'
>>> device.lower()
'iphone'
```

The summary reminds you that `title()`, `lower()`, `upper()`, `strip()`, `lstrip()`, and `rstrip()` are all *methods*.

### Escape sequences and newlines

```pycon
>>> print("knock\nknock")
knock
knock
```

- The **backslash** `\` is an **escape character**. It tells Python that the character right after it has a special function.
- A backslash and the character after it together form an **escape sequence**. Escape sequences "can only exist within a string."
- You've already used one: `\'` (or `\"`) puts a quote mark in the text without closing the string.
- **`\n`** is the **newline** sequence. It starts a new line and is an example of a *whitespace* (non-printing) character.
- Others include `\t` (tab) and `\\` (a real backslash).

```python
print("Included:\nDrink\nSnack")     # correct
print("Check bag?\nYes\nNo")
```

Common mistakes from the feedback: a forward slash (`/n`), a missing `n` (`\Drink`), and missing quotes.

### Stripping whitespace

Extra whitespace (newlines, tabs, spaces) is common in user input and text files. *Trailing* whitespace at the front or back of a string is the main problem: a search for `"Toronto "` doesn't match `"Toronto"`.

```pycon
>>> status = "  on time  \n"
>>> status                  # the shell shows the full value, whitespace included
'  on time  \n'
>>> status.strip()
'on time'
```

- **`strip()`** removes "the whitespace on either side of a string". It does *not* remove all whitespace: the space inside `on time` stays.
- **`lstrip()`** and **`rstrip()`** strip only the left or only the right side.

```pycon
>>> economy = " full \n"
>>> economy
' full \n'
>>> status = " flight delayed "
>>> status.rstrip()
' flight delayed'
>>> security = " \nWait:\n1hr \n"
>>> security.lstrip()
'Wait:\n1hr \n'
>>> update = "\n Gate\nD1 \n"
>>> update.strip()            # the internal \n stays
'Gate\nD1'
>>> currency = " peso "
>>> currency.title(), currency.upper(), currency.strip(), currency.lstrip(), currency.rstrip()
(' Peso ', ' PESO ', 'peso', 'peso ', ' peso')
```

(Quantic's answer key writes `'Gate:\nD1'` with a colon. That's a typo, since the original string has no colon.)

Syntax Reference Sheet examples, with `var1 = "Spam and Eggs"` and `var2 = "    Norwegian blue    \n"`: `var1.title()` gives `'Spam And Eggs'`, `upper()` gives `'SPAM AND EGGS'`, `lower()` gives `'spam and eggs'`, `var2.strip()` gives `'Norwegian blue'`, `rstrip()` gives `'    Norwegian blue'`, and `lstrip()` gives `'Norwegian blue    \n'`.

### f-strings

An **f-string** "allows you to embed expressions *in* a string." Put `f` (or `F`; Quantic prefers lowercase) before the opening quote and wrap expressions in **curly braces** `{}`:

```python
name = "Sam"
# print("Hi, " + name + "!")
print(f"Hi, {name}!")          # Hi, Sam!
```

- f-strings arrived in Python **3.6**. If you get a SyntaxError, check your version with `import sys` then `sys.version`.
- Quantic says the `f` is short for "`format()`", "the Python 2 way of generating formatted strings."
- A single variable is an expression, so it can go in the braces. Any valid expression can.
- "Every time Python sees a pair of curly braces in an f-string, it evaluates what's inside them as an expression and replaces it in the returned string."
- Curly braces `{}` are not *brackets*; that word is reserved for square brackets `[]`.

**Rules for f-strings** (Quantic's four; the official spec is PEP 498):

- You can use single or double quotes around an f-string.
- For a literal curly brace, double it: `{{` or `}}`.
- Escape sequences can go anywhere in an f-string *except* inside an expression.
- `f` or `F` both work. Stick with `f`.

| Code | Output | Lesson |
|---|---|---|
| `bag_wt = 42`; `f"Weight: {bag_wt} lbs."` | `Weight: 42 lbs.` | the int is converted to a string automatically, so no TypeError |
| `f"Weight: {bag_wt / 1.6} kg."` | `Weight: 26.25 kg.` | any expression; int / float gives float |
| `name = "Phan"`; `f"Hi {name}!\nWelcome!"` | `Hi Phan!` / `Welcome!` | escapes outside the braces are fine |
| `f"Hi {\"name\"}!\nWelcome!"` | SyntaxError | no escape sequences inside the expression; Quantic's fix is `f'Hi "{name}"!\nWelcome!'` |
| `f'We'll have {meal} please.'` | SyntaxError | the apostrophe ends the single-quoted string |
| `f"We'll have {meal} please."` | `We'll have Spam please.` | double quotes outside allow single quotes inside |

### Coding Challenge VI (Quantic's sample answer)

```python
address = "742 Evergreen Terrace  "
address = address.strip()

print(address.title())
print(address.upper())
print(address.lower())

city = "Springfield"

print(f"I live at:\n{address}\n{city}")
```

The last print uses `\n`, not `+`, as the challenge requires. Real address validation involves steps like these and many more.

**Pro tip:** IDLE highlights matching parentheses. When you type a closing parenthesis, it shades the span back to the opening one it closes.

> **Beyond the course:** String methods return new strings because strings are **immutable** (Lesson 1.8), so `name.title()` *can't* change `name`. `strip()` also takes an argument listing the characters to remove: `"--hi--".strip("-")` gives `'hi'`. `title()` capitalizes after apostrophes: `"they're".title()` gives `"They'Re"`. f-strings support format specifiers: `f"{3.14159:.2f}"` gives `3.14`, `f"{1234567:,}"` gives `1,234,567`, and `f"{x=}"` (3.8+) prints `x=` followed by the value, which helps with debugging. **Python 3.12 (PEP 701)** removed most of the f-string restrictions taught here: expressions may now contain backslashes, comments, and strings that reuse the outer quote character, e.g. `f"Hello {"world"}"`. A backslash used *outside* a string literal inside the braces, as in `{\"name\"}`, is still invalid. Raw strings (`r"C:\new"`) turn off escape processing.

### What the practice questions checked

- The output of `name.title()` on `"SAM"`, and that the variable stays `'SAM'` unless reassigned.
- `title()`/`upper()`/`lower()` on `"iPhone"`.
- What `\n` does, and the correct single-line code for a multi-line output.
- That `\'` is an escape sequence you've already used.
- What `strip()`, `lstrip()`, and `rstrip()` remove, and that internal whitespace and `\n` remain.
- f-string anatomy: the `f` prefix, braces, and that a variable is an expression.
- Predicting f-string outputs, including both SyntaxError cases.
- Matching methods to outputs on `" peso "`.

---

## Lesson 1.7: Indexing and Slicing

### Indexing

Example: mattress model number `IF7680C` encodes type (I = innerspring), firmness (F = firm), width (76"), length (80"), and quality (C).

```python
model = "IF7680C"
```

Each character has an **index**: "its distance from the start of the string." The first character is index **0**. Negative indices count from the end, and the last character is **-1**.

| | | | | | | | |
|---|---|---|---|---|---|---|---|
| Positive | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| Character | I | F | 7 | 6 | 8 | 0 | C |
| Negative | -7 | -6 | -5 | -4 | -3 | -2 | -1 |

To get a character, put its index in square brackets: `variable[i]`.

```pycon
>>> model[1]
'F'
>>> model[6]
'C'
>>> model[0]
'I'
>>> model[4], model[-3]     # both are '8'; model[-4] is '6', model[5] is '0'
('8', '8')
```

**Off-by-one errors.** Counting from 0 is common but leads to "off-by-one" mistakes. Spaces and punctuation count as characters.

```pycon
>>> inquiry = "Topper? Yes/No"
>>> inquiry[10], inquiry[-5], inquiry[8], inquiry[6]
('s', 'e', 'Y', '?')
```

### Slicing

A **slice** has the form `variable[x:y]` and returns characters "from index *x* up to but not including *y*." Quantic says the exclusive end makes the system internally consistent and complete, and that you get used to it.

```pycon
>>> model[2:4]        # indices 2 and 3
'76'
>>> model[-4:-2]
'68'
>>> model[2:]         # from x to the end
'7680C'
>>> model[:3]         # from 0 up to but not including y
'IF7'
>>> model[-2:]
'0C'
```

Combining slices with an f-string:

```python
print(f"You chose: {inquiry[-2:]} {inquiry[0:6]}")   # You chose: No Topper
```

**Slices of strings are strings.** To do arithmetic with one, convert it:

```python
total = int(model[4:6]) + 4                # "80" -> 80, plus a 4-inch headboard
print(f"Total length: {total} inches")     # 84
```

`model[4:6] + 4` raises a TypeError. There is no `num()` or `integer()` function. Inside an f-string, `str(total)` would work but is unnecessary, and `"total"` would print the word *total*.

**Methods work on indexed and sliced strings:**

```python
print(f"Quality level: {model[-1].lower()}")   # Quality level: c
```

```pycon
>>> string = "welcome home"
>>> string[:7].upper()
'WELCOME'
```

Review with `category = "budget"`:

| Want | Expression | Common wrong answers |
|---|---|---|
| `b` | `category[-6]` or `category[0]` | `category[1]`, `category[-5]`; `category[0:0]` gives an empty string |
| `dg` | `category[2:4]` | `[2:3]` gives only `d`; `[3:5]` |
| `et` | `category[-2:]` | `[-2:-1]` gives only `e`; `[5:]` gives `t` |
| `bud` | `category[0:3]` | `[0:2]` gives `bu` |

### Coding Challenge VII: VINs (Quantic's sample answer)

A 17-character Vehicle Identification Number encodes the country, manufacturer, vehicle description, check digit, model year, assembly plant, and serial number.

```python
vin = "SCEDT26T1CD000001"

print(f"Country code: {vin[0]}")
print(f"Model year code: {vin[9]}")
print(f"Assembly plant code: {vin[10]}")

print(f"Manufacturer code: {vin[1:3]}")
print(f"Serial number: {vin[11:]}")
```

**Pro tip:** **F5** runs the current script in IDLE (*Run → Run Module*). Some systems need `<alt>`, `<fn>`, or `<ctrl>` with it.

> **Beyond the course:** Slices take an optional third number, the **step**: `s[::2]` gives every other character and `s[::-1]` reverses the string. Indexing past the end raises `IndexError`, but slicing is forgiving: `"abc"[1:100]` gives `'bc'`. The half-open `[x:y)` convention has handy properties: the slice length is `y - x`, `s[:k] + s[k:] == s` for any `k`, and `s[-n:]` gives the last `n` characters. The last valid positive index is `len(s) - 1`. Guido van Rossum's blog post (see Further reading) explains why 0-based indexing and half-open slices go together.

### What the practice questions checked

- Decoding the mattress model number.
- That the first index is 0, and which `model[i]` gives `F`, `C`, `I`.
- That the negative index of the last character is -1 (`model[4]` and `model[-3]` are both `8`).
- Indexing `inquiry` without off-by-one errors.
- Slice results: `model[2:4]`, `[-4:-2]`, `[2:]`, `[:3]`, `[-2:]`.
- Building `You chose: No Topper` from slices.
- `int(model[4:6])` for numeric use, and filling `{total}` in an f-string.
- `model[-1].lower()` gives `c`.
- The four `budget` index/slice questions.

---

## Lesson 1.8: Lists

**Line wrapping.** Lesson slides may wrap long lines. Keep each one on a single line in your code. "Python treats each line as a new instruction," so breaking a string across lines causes errors (there are proper ways to continue lines). If a list is too long for one line, you can break it after a comma.

### Creating and reading lists

```python
genres = ["romcom", "action", "drama", "anime"]
```

A **list** is a data type that "contain[s] multiple elements in a certain order." Lists are enclosed in **square brackets**, with elements separated by **commas**. The spaces after the commas are optional but conventional. Lists usually get **plural** names (`genres`, not `genre`), which is a convention, not a rule.

Lists are indexed and sliced just like strings:

```pycon
>>> genres[1]
'action'
>>> genres[-1]
'anime'
>>> genres[1:3]
['action', 'drama']
>>> genres[:-2]
['romcom', 'action']
>>> genres[2:]
['drama', 'anime']
>>> genres[7]
IndexError: list index out of range
```

Indexing doesn't "cycle" back to the start, so an out-of-range index raises an **IndexError**.

Lists can hold **any data type**, including other lists, and types can be mixed:

```pycon
>>> test = [17, "spam", 43.9]
>>> test[1]
'spam'
>>> test[2]
43.9
```

### Adding elements

Start with an empty list and fill it as the user acts:

```python
genres = []
genres.append("western")
genres.append("kung fu")
print(genres)          # ['western', 'kung fu']
```

- **`append()`** adds an element "always ... to the *end* of a list."
- **`insert()`** "places an item at a given index and shifts the remaining elements one position to the right":

```text
list.insert(index, value)
```

```python
genres.insert(1, "zombie")     # ['western', 'zombie', 'kung fu']
genres.append("musical")       # ['western', 'zombie', 'kung fu', 'musical']
genres.insert(2, "scifi")      # ['western', 'zombie', 'scifi', 'kung fu', 'musical']
genres.insert(-1, "biopic")    # ['western', 'zombie', 'scifi', 'kung fu', 'biopic', 'musical']
```

Common mistakes: `insert(2, "zombie")` to make it the *second* element (off by one), arguments in the wrong order (`insert("zombie", 1)`), and thinking `insert` *replaces* an element (it shifts the others right). `insert(-1, x)` puts `x` *before* the current last element.

### Removing elements: three ways

1. **`del`** statement, by index:

   ```python
   del genres[3]          # removes the 4th element ('kung fu'); 5 elements remain
   ```

2. **`remove()`** method, by value:

   ```python
   genres.remove("scifi")  # ['western', 'zombie', 'biopic', 'musical']
   ```

   If the value appears more than once, `remove()` deletes only the **first** instance:

   ```pycon
   >>> nums = [2, 5, 1, 5, 3, 5]
   >>> nums.remove(5)
   >>> nums
   [2, 1, 5, 3, 5]
   ```

3. **`pop()`** method. It "returns the deleted element as it's deleting it." Give it an index, or omit the index to delete the **last** item:

   ```pycon
   >>> test = ["a", "b", "c", "d"]
   >>> del test[0]
   >>> test.remove("b")
   >>> test.pop()
   'd'
   ```

   ```python
   del_genre = genres.pop(1)
   print(f"We deleted {del_genre}s.")
   ```

   `pop()` removes an element *and* lets you print it or assign it to a variable, which `del` and `remove()` can't. "If you ever need to *use* the item you're deleting, `pop()` is the way to go."

To remove `western` from the front, use `del genres[0]` or `genres.remove("western")`. The result is `['zombie', 'biopic', 'musical']`.

**Which deletion tool to use?** (`snacks = ["popcorn", "nuggets", "gummis", "nachos"]`)

| Situation | Tool |
|---|---|
| Remove gummis without knowing their position | `remove()`: `snacks.remove("gummis")` |
| Remove nachos and print "Sorry, we're out of nachos." | `pop()`: `snacks.pop()` in an f-string |
| Remove the first item regardless of value | `del snacks[0]` (or `snacks.pop(0)`) |

### Modifying elements; mutable vs immutable

Assigning to an index replaces that element:

```pycon
>>> snacks[2] = "hot dogs"
>>> snacks[3] = "pizza"        # or snacks[-1] = "pizza"; snacks[4] is out of range
```

Strings can't do this:

```pycon
>>> motto = "i love python"
>>> motto[3] = "i"
TypeError: 'str' object does not support item assignment
```

- **Immutable**: strings "can't be modified. We can append strings together, but we can't adjust their internal contents."
- **Mutable**: lists "can be changed around. We can add, remove, and swap out list elements with abandon!"

True/false review: elements in a list do *not* have to share a type; it's lists, not strings, that can be modified; `append()` always adds to the end (`'2D'` and `"2D"` are the same string); `gone = levels.remove("gold")` does *not* set `gone` to `"gold"`, because you'd need `pop()` for that.

### Coding Challenge VIII (Quantic's sample answer)

```python
cart_items = ["avocado", "onion", "cilantro", "limes"]
print(cart_items)

cart_items.insert(0, "chocolate")
print(cart_items)

cart_items.remove("onion")
del cart_items[2]
print(cart_items)

message = "Okay, we packed your "

print(f"{message} {cart_items.pop()}!")
print(f"{message} {cart_items.pop()}!")
print(f"{message} {cart_items.pop()}!")

print(cart_items)        # []
```

Hints from the handout: you can use `remove()` or `del`. Storing the text in `message` keeps the prints short. Count the elements so you know how many `pop()`s you need; in Python II, loops will do the counting for you.

**Pro tip:** type `import this` in the shell to read *The Zen of Python*. Come back to it now and then, because you'll understand more of it as you learn.

> **Beyond the course:** List methods that change the list in place return `None`, so `genres = genres.append("x")` is a classic bug that leaves you with `genres = None`. `remove(x)` raises `ValueError` if `x` isn't in the list. `pop()` on an empty list raises `IndexError`. `insert()` with an index past the end simply appends. Use `"x" in my_list` to check membership before removing, and `extend()` to add several items at once. Index assignment needs an existing index, so `snacks[4] = ...` on a 4-item list raises `IndexError`; to grow a list, use `append`.

### What the practice questions checked

- List syntax: square brackets, commas, plural names.
- Indexing and slicing `genres`, including `IndexError` for `genres[7]`.
- Choosing indices into a mixed-type list.
- `append` adds at the end. `insert(1, ...)` puts an item second. Predicting lists after `append`/`insert(2, ...)`/`insert(-1, ...)`.
- `del genres[3]` and the resulting length; `remove()` by value; `remove()` deletes only the first match.
- `pop()` returns the deleted element and can feed a variable.
- Choosing `remove`/`pop`/`del` for each scenario.
- Changing `nachos` to `pizza` with index 3 or -1.
- `motto[3] = "i"` gives TypeError, because strings are immutable.

---

## Lesson 1.9: Analyzing and Organizing Lists

Scenario: a cold study of the supplement HealthFull, with `"s"` for still sick and `"h"` for healthy.

```python
# This file summarizes study data.
outcomes = ["s", "h", "h", "s", "h"]
```

### `len()` and `count()`

**`len()`** is a **function**. It returns the *length* of a list, meaning the number of elements. The list's name goes in the parentheses.

```python
num_people = len(outcomes)
print(f"There are {num_people} patients.")
```

**`count()`** is a **method**. It tells you how many times a value appears.

```python
num_sick = outcomes.count("s")
print(f"{num_sick} people are sick.")
```

Function vs method syntax matters: `len(ages)`, not `ages.len()`; `ages.count(29)`, not `count(ages, 29)`.

```pycon
>>> ages = [34, 61, 34, 29, 40, 19]
>>> ages.count(29)        # not "29": the elements are integers
1
>>> len(ages)
6
>>> ages.count(20)        # no error, just zero
0
```

`ages.count()` with no argument doesn't count all elements. It only looks for a specific value. The Syntax Reference Sheet notes that `len()` and `count()` also work on strings and tuples.

### Copying lists: the trap

```pycon
>>> list1 = ["a", "b"]
>>> list2 = list1
>>> list1[0] = "c"
>>> list1
['c', 'b']
>>> list2
['c', 'b']
```

Why: when you create a list, "Python puts the list's data in a specific memory location" (a *memory address*) "then it sets the list's name to point to that memory address." So `list2 = list1` "does *not* create a new list. It simply creates a new *variable name* and attaches it to the original list's memory address." There is **only one set** of underlying data, and changes through one name **also change the other**.

Immutable types (strings, integers, floats) "work just like your intuition says":

```pycon
>>> float1 = 3.14
>>> float2 = float1
>>> float1 = 1.62        # float2 is still 3.14
```

**Making a real copy.** The **`copy()`** method "creates a copy of the list it's called on":

```pycon
>>> list1 = ["a", "b"]
>>> list2 = list1.copy()
>>> list1[0] = "c"
>>> list1, list2
(['c', 'b'], ['a', 'b'])
```

There are now two separate sets of data. The **`list()`** function also makes a unique copy, according to the summary and the Syntax Reference Sheet ("generates a list from the argument passed to it; used to create unique copies of lists"):

```python
old_chs = list(cheeses)
```

Archiving the study data:

```python
outcomes_old = outcomes.copy()

outcomes[3] = "h"

print(outcomes_old)      # ['s', 'h', 'h', 's', 'h']
print(outcomes)          # ['s', 'h', 'h', 'h', 'h']
```

### Sorting and reversing

```python
patients = ["davis", "lee", "jones", "bell", "garcia"]
```

- **`sorted()`** is a *function*. It returns an alphabetized version of a list "without altering the original."

  ```pycon
  >>> sorted(patients)
  ['bell', 'davis', 'garcia', 'jones', 'lee']
  >>> patients
  ['davis', 'lee', 'jones', 'bell', 'garcia']
  ```

- **`sort()`** is a *method* that "permanently alphabetizes a list," overwriting the original order.
- **`reverse()`** is a *method* that "permanently reverses a list's contents". It reverses the *current* order and does not sort:

  ```pycon
  >>> patients.reverse()
  >>> patients
  ['garcia', 'bell', 'jones', 'lee', 'davis']
  ```

  Calling `reverse()` twice restores the original order.

A sorted list can be indexed and have methods applied to it:

```pycon
>>> print(f"First subject: \n{sorted(patients)[0].title()}")
First subject: 
Bell
```

Taking it apart: `sorted(patients)` returns a sorted version without touching the original; `[0]` takes the first element *of the sorted list*; `.title()` returns it in title case; `\n` creates a line break. Quantic advises against packing too much into one statement. Split it up:

```python
pt = sorted(patients)[0]
print(f"First subject:\n{pt.title()}")
```

### Tuples

A **tuple** is "similar to a list except that it's *immutable*," so its contents can't be changed. Use one when the data shouldn't be altered. (Pronounce it however you like: "tupple," "toople," "tyoo-ple.") Tuples use **parentheses** instead of square brackets:

```pycon
>>> parameters = (300, "daily", "chewable")
>>> parameters[1]
'daily'
>>> parameters[0] = 500
TypeError: 'tuple' object does not support item assignment
```

Tuples can be indexed and sliced. The TypeError comes from their immutability.

**Tuple syntax traps** (check with `type(t)`):

```pycon
>>> t = ()                  # empty tuple
>>> t = ("HealthFull")      # NOT a tuple: just a string in grouping parentheses
>>> t = ("HealthFull",)     # tuple: the comma makes it unambiguous
```

**Tuple or list?** Quantic's rules of thumb:

- If you know how many elements you need, and their content and order won't change, use a **tuple**. Python accesses tuple data slightly faster.
- If you need to add, remove, or change elements, use a **list**.
- Avoid mixing data types in lists. Ints and floats together are fine; numbers and strings together are "less okay," because lists are for sorting and for applying the same operation to every element.
- From the summary: tuples often store data of different types where *position* has meaning, e.g. `("male", 64, 3.2)`. Lists often store data of the same type.

**Pro tip:** to modify a tuple's data, convert it with `list()`:

```pycon
>>> choices = ("spam", "spam", "eggs")
>>> new_choices = list(choices)
>>> new_choices[2] = "spam"
>>> new_choices
['spam', 'spam', 'spam']
```

### Review answers

- `numbers = [4, 5, 3, 5, 2]`: `numbers[1]`, `len(numbers)`, and `sorted(numbers)[3]` are all 5. `numbers.count(5)` is **2**.
- After `your_list = my_list` and `my_list[0] = "d"`, `your_list[0]` is `'d'`.
- `attribs = ("sedan", 2015, "diesel")` is a tuple.
- Of a list, a string, and a tuple, only the **list** is mutable.

### Coding Challenge IX (Quantic's sample answer)

```python
orders = ["latte", "chai tea", "latte", "green juice", "macchiato"]
print(orders)

print(f"I need to order {len(orders)} drinks.")
print(f"{orders.count('latte')} of the drinks are lattes.")

orders[1] = "cactus water"
print(orders)

tomorrow = list(orders)
del tomorrow[0]
print(tomorrow)
print(orders)
```

Note the single quotes around `'latte'` inside the double-quoted f-string. Use `list()` (the answer sheet) or `copy()` (the lesson hint) to copy. "Otherwise, the two lists will point to the same underlying data." To delete you could also write `tomorrow.remove("chai tea")`.

> **Beyond the course:** `copy()`, `list(x)`, and `x[:]` all make **shallow** copies: a new outer list holding the *same* element objects. If the elements are themselves mutable (a list of lists), changing an inner list shows up in both copies. Use `copy.deepcopy()` for those. "Names point to objects" also covers the float example: `float1 = 1.62` doesn't change the old object, it rebinds the name. Immutable objects simply can't be changed in place, so sharing them is never surprising. Use `a is b` to test whether two names refer to the same object. `sorted()` sorts by natural ordering, not strictly "alphabetically": capital letters sort before lowercase (`sorted(["bob", "Chad", "ana"])` gives `['Chad', 'ana', 'bob']`), and you can pass `key=str.lower` to ignore case or `reverse=True` for descending order. `sorted()` on a tuple returns a *list*. `sort()` and `reverse()` return `None`. Strictly, the comma makes a tuple, not the parentheses: `t = 1, 2` is a tuple too. Tuples are hashable when their contents are, so they can serve as dictionary keys, which you'll meet later.

### What the practice questions checked

- `#` starts a comment.
- Correct `len(outcomes)` and `{num_people}` in an f-string. `outcomes.count("s")`.
- Function vs method syntax for `len`/`count`; integer vs string arguments to `count`; `count` of an absent value is `0`.
- Predicting `list1`/`list2` after aliasing: both `['c', 'b']`.
- That a list name points to a memory address, and that aliasing means one shared data set.
- The correct memory diagram after `copy()`.
- What `outcomes_old = outcomes.copy()` plus reassignment does.
- `sorted()` doesn't alter the original; decoding `sorted(patients)[0].title()`.
- `reverse()` reverses the current order (first item becomes `'garcia'`).
- Tuple immutability (`TypeError`), and which of `()`, `("x")`, `("x",)` are tuples.

---

## Glossary

- **`\n` / newline**: the escape sequence that starts a new line in a string; a whitespace (non-printing) character.
- **`<ctrl>-C`** (`<control>-C` on Mac): interrupts code and sends you back to the command prompt, producing a `KeyboardInterrupt`. Use it on code that can't finish or takes too long.
- **`append()`**: list method that adds an element to the end of a list. `list.append(value)`.
- **Argument**: the input you pass to a function (or method) in its parentheses.
- **Assignment operator**: the equals sign `=`. It assigns the value (expression) on the right to the variable on the left.
- **Backslash** (`\`): the escape character. It tells Python the next character has a special meaning, e.g. `\'` is a literal quote that doesn't close the string.
- **Calling**: using a function or method by giving its name and arguments; also *invoking*. "Call" is both a verb and a noun.
- **Comment**: text after a hash mark `#`, which Python ignores unless the `#` is inside a string. Used to document code.
- **Concatenate**: to merge strings with `+`.
- **`copy()`**: list method that creates a standalone copy of the list it's called on, with its own underlying data.
- **`count()`**: method that returns how many times a given value occurs in a list (also strings and tuples). `list.count(value)`.
- **Debug**: to find and fix errors in code, helped by the information Python reports.
- **`del`**: statement that deletes a list element by index. `del list[index]`.
- **Directory**: a folder on your computer; used to organize scripts.
- **Escape character**: the backslash `\`, which gives the following character a special function.
- **Escape sequence**: a backslash plus the character(s) after it (`\n`, `\t`, `\\`, `\'`). Exists only inside strings.
- **Expression**: any combination of values, operators, delimiters, variables, and functions that evaluates to a value (e.g. `4 + 3 ** 2`, `"ni"`, a defined variable). An assignment is not an expression.
- **f-string**: a string prefixed with `f` (or `F`) that embeds expressions in curly braces, which Python evaluates and replaces with their values.
- **Float**: a number with a fractional part, shown as digits after a decimal point (`3.14`, `15.0`). From "floating point."
- **`float()`**: returns a float version of its input (`float("42")` gives `42.0`).
- **Function**: a pre-programmed operation (a built-in command that performs a specific task) that does something with its argument. Syntax: `function(argument)`.
- **IDE (Integrated Development Environment)**: a tool with a text editor, debugger, and automation features that sends code to the interpreter. The course uses **IDLE**, which ships with Python.
- **Immutable**: cannot be changed after creation. Strings and tuples are immutable.
- **Index**: a character's (or element's) position, counted from 0 at the start or from -1 at the end. Accessed with `variable[i]`.
- **IndexError**: raised when you index past the end of a sequence (`genres[7]` on a 4-item list).
- **`insert()`**: list method that places a value at a given index and shifts the remaining elements right. `list.insert(index, value)`.
- **`int()`**: returns an integer version of its input (`int("42")` gives `42`). Raises ValueError for strings like `"a"`.
- **Integer**: a whole number with no fractional part (`5`, `-2`, `17`, `0`).
- **Integer division** (`//`): divides and rounds the result *down* (floor division). `11 // 4` is `2`; `-5 // 2` is `-3`.
- **Interpreter**: the part of Python that actually executes commands.
- **`len()`**: function that returns the number of elements in a list (also string or tuple). `len(list)`.
- **List**: a mutable data type holding multiple elements in order, in square brackets and separated by commas. Can mix types.
- **`list()`**: function that generates a list from its argument; used to make unique copies of lists and to convert tuples to lists.
- **`lower()`**: string method returning a lowercase version.
- **`lstrip()`**: string method that strips whitespace from the left side.
- **Method**: an action performed on a specific object, written `object.method()`.
- **Mod / modulo** (`%`): returns the remainder of a division (`9 % 4` is `1`).
- **Modular arithmetic**: the mathematics of remainders and integer division.
- **Module**: another name for a Python file; the course mostly says "script."
- **Mutable**: can be changed; lists are mutable.
- **NameError**: raised when your code uses a word Python doesn't recognize, such as a misspelled function or an undefined variable.
- **`pop()`**: list method that deletes an element by index (default: the last item) and returns it. `list.pop([index])`.
- **`print()`**: function that displays its argument(s). With commas, prints several items separated by spaces, converting each to a string.
- **`remove()`**: list method that deletes the first element matching a value. `list.remove(value)`.
- **`reverse()`**: list method that permanently reverses the list's current order.
- **`rstrip()`**: string method that strips whitespace from the right side.
- **Script**: a file of text-based code (ending `.py`) that the interpreter can read and execute, sending many lines at once.
- **Shell**: a user interface for interacting with Python (and its interpreter). IDLE's shell shows the `>>>` prompt.
- **Shell restart**: the `RESTART` shown when you run a script; the interactive session is cleared so the script runs on a clean slate.
- **Slice**: a series of characters or elements, `variable[x:y]`, from index x up to but not including y. `[x:]` runs to the end and `[:y]` starts at 0.
- **`sort()`**: list method that permanently alphabetizes (sorts) the list.
- **`sorted()`**: function that returns a sorted version of a list (or tuple) without altering the original.
- **`str()`**: returns a string version of its input (`str(42)` gives `'42'`).
- **String**: a sequence of characters wrapped in single or double quotes. Immutable.
- **`strip()`**: string method that removes whitespace from both ends of a string (not from the middle).
- **Syntax**: the required placement of commands and punctuation.
- **SyntaxError**: a parsing error. Python can't understand a line (missing parenthesis, unescaped quote, characters out of order).
- **`title()`**: string method returning title case: the first letter of each word capitalized, the rest lowercase.
- **Traceback**: a report showing where Python ran into trouble: error type, offending word, and line.
- **Tuple**: an immutable ordered data type written in parentheses, e.g. `(300, "daily", "chewable")`. A one-element tuple needs a trailing comma: `("x",)`.
- **Type**: the category of a piece of data, which defines how it can and can't be used.
- **`type()`**: function that returns the type of its argument, e.g. `<class 'str'>`.
- **Type casting**: using `str()`, `int()`, and `float()` to get a value in a different type.
- **TypeError**: raised when you do something with one data type that's only possible with another (e.g. `"a" + 1`, assigning into a string or tuple).
- **`upper()`**: string method returning an uppercase version.
- **ValueError**: raised when a value of the right type can't be used, e.g. `int("a")`.
- **Variable**: a label for storing changeable information, created by assignment.
- **ZeroDivisionError**: raised when dividing by zero.

---

## Where Quantic differs from other sources

- **Errors in the course Summary PDF.** Three examples there don't behave as printed:
  - `list.pop("why")`: `pop()` takes an *index*, not a value. Passing a string raises `TypeError: 'str' object cannot be interpreted as an integer`. Use `remove("why")`, or `pop()` / `pop(2)`.
  - The `list()` copy example shows `list2` as `['c', 'b']` after `list1[0] = "c"`. With a real copy, `list2` stays `['a', 'b']`. The lesson's `copy()` diagram is the correct one.
  - `name = Sam` (no quotes) would raise a NameError. It should be `name = "Sam"`.
- **"Any type of division returns a float"** (Summary). That's true of `/`. For two integers, `//` returns an int (`11 // 4` is `2`); it returns a float only when an operand is a float.
- **`sort()` and `reverse()` don't print anything.** The Syntax Reference Sheet shows a list after `cheeses.sort()` and `cheeses.reverse()`, but both methods return `None`, so the shell shows nothing until you type `cheeses`.
- **"Alphabetized."** `sorted()`/`sort()` use Python's natural ordering: numbers numerically, strings by character code (uppercase before lowercase). Mixing numbers and strings raises TypeError. `sorted()` on a tuple returns a list.
- **`print` as a forbidden name.** Only *keywords* (`import`, `if`, `for`, …) are illegal names. `print`, `list`, `str`, and other built-ins can be reassigned. That's a bad idea, but it isn't an error. Identifiers may also contain non-ASCII letters.
- **"Script" vs "module."** Quantic says modules "are used differently than scripts." In Python every `.py` file is a module; "script" just means a module you run directly rather than import.
- **Float accuracy.** "Accurate to within 15 decimal places" is better stated as about 15–17 *significant digits*. "Floating point *decimal*" is a misnomer, since Python floats are binary (IEEE-754), which is exactly why 0.1 can't be stored exactly.
- **What the `f` stands for.** Quantic says "`format()`, the Python 2 way." f-strings are *formatted string literals*. `str.format()` exists in Python 2.6+ *and* Python 3 and is still widely used.
- **f-string rules changed in Python 3.12 (PEP 701).** "No escape sequences inside an expression" and "you can't reuse the outer quote" hold for 3.6–3.11, the course's era. From 3.12, expressions may contain backslashes inside string literals, comments, and the same quote type as the outer string.
- **Error messages.** The course shows Python 3.9 messages and says syntax errors have no traceback; that is true in IDLE's shell. Python 3.10+ adds suggestions ("Did you mean: 'print'?", "Missing parentheses in call to 'print'", "unterminated string literal"). Running a script from a terminal shows the file, the line, and a caret.
- **Assignment semantics.** Quantic implies lists and immutable types are assigned differently. Assignment always binds a name to an object; the difference is only that immutable objects can't be changed in place.
- **"Type casting."** The term comes from other languages. Python documentation talks about *type conversion*: `int()` and friends build new objects.
- **Copy depth.** `copy()` and `list()` are *shallow* copies; nested mutable elements are still shared.
- **Small answer-key typos.** `update.strip()` is shown as `'Gate:\nD1'` (no colon in the original). A feedback line says "`nuggets` is at index 3" when it means `nachos`. The Coding Challenge VIII sample prints a double space ("your  limes") because `message` ends with a space and the f-string adds another.
- **Copy method in Challenge IX.** The lesson hint says use `copy()` and the answer sheet uses `list()`. Both are correct.
- **Version advice.** The course recommends Python 3.9, which reached end-of-life in October 2025. Use a currently supported 3.x release. Macs no longer ship with Python 2.

---

## Further reading

### Official tutorial and reference

- [The Python Tutorial](https://docs.python.org/3/tutorial/index.html): the official tutorial, written for programmers. The best next step after this course.
- [An Informal Introduction to Python](https://docs.python.org/3.12/tutorial/introduction.html): numbers, strings, indexing and slicing, and lists, using the REPL as a calculator. A close match to Lessons 1.3–1.8.
- [Data Structures (tutorial)](https://docs.python.org/3/tutorial/datastructures.html): every list method, tuples, and the sequence operations used in Lessons 1.8–1.9.
- [Built-in Types](https://docs.python.org/3/builtins/stdtypes.html): the full reference for `str` methods (`strip`, `title`, …), numeric operations including `//` and `%`, and list/tuple behaviour.
- [Built-in Functions](https://docs.python.org/3.12/library/functions.html): exact behaviour of `print`, `len`, `sorted`, `type`, `int`, `float`, `str`, `list`.
- [Lexical analysis](https://docs.python.org/3/reference/lexical_analysis.html): the definitive list of keywords, identifier rules, and escape sequences.
- [Expressions](https://docs.python.org/3/reference/expressions.html): the language reference on expressions, including the full operator-precedence table.

### Style

- [How to Write Beautiful Python Code With PEP 8 (Real Python)](https://realpython.com/python-pep8/): a readable guide to the naming, spacing, and line-length conventions Quantic cites.

### Strings and f-strings

- [PEP 498: Literal String Interpolation](https://peps.python.org/pep-0498/): the original f-string specification that Quantic points to.
- [PEP 701: Syntactic formalization of f-strings](https://github.com/python/peps/blob/main/peps/pep-0701.rst): the 3.12 change that lifted the quote and backslash restrictions.
- [What's New in Python 3.12](https://docs.python.org/3/whatsnew/3.12.html): a short official summary of the f-string changes, with examples.
- [Python 3.12 Preview: More Intuitive and Consistent F-Strings (Real Python)](https://realpython.com/python312-f-strings/): a walkthrough of what now works in f-strings and why.

### Numbers and arithmetic

- [Floating-Point Arithmetic: Issues and Limitations](https://docs.python.org/3/tutorial/floatingpoint.html): why `0.1 + 0.2` isn't `0.3`, and what to do about it.

### Lists, names, and copying

- [Facts and myths about Python names and values (Ned Batchelder)](https://nedbatchelder.com/text/names): the clearest explanation of why `list2 = list1` aliases, and of mutability in general.
- [copy: Shallow and deep copy operations](https://docs.python.org/3/library/copy.html): when `copy()` isn't enough and you need `deepcopy`.
- [Sorting HOW TO](https://docs.python.org/3.9/howto/sorting.html): `sorted()` vs `sort()`, `key=` functions, case-insensitive and reverse sorts.

### Errors

- [Python Exceptions: An Introduction (Real Python)](https://realpython.com/python-exceptions/): reading tracebacks and handling the errors you met here (NameError, TypeError, ValueError, IndexError).

### Tools, versions, and history

- [IDLE: Python editor and shell](https://docs.python.org/3/library/idle.html): the official IDLE manual, with menus and keyboard shortcuts (Run Module, Comment Out Region, history recall).
- [Status of Python versions](https://devguide.python.org/versions/): which Python versions are supported, and until when.
- [Why Python uses 0-based indexing (Guido van Rossum)](http://python-history.blogspot.com/2013/10/why-python-uses-0-based-indexing.html): Python's creator on 0-based indices and half-open slices. The course links to this post too.

---

*Generated 2026-11-26 by `summarize.py` with claude-opus-5-5 from 9 ungraded lessons and Quantic's course PDFs. Quoted definitions are Quantic's; blockquotes marked Beyond the course are not.*
