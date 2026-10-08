"""Number-guessing game: find a random number from 1 to 100 in seven guesses."""

import random

LOW = 1
HIGH = 100
MAX_GUESSES = 7


def check_guess(guess: int, secret: int) -> str:
    """Return "low", "high", or "correct" for a guess against the secret number."""
    if guess < secret:
        return "low"
    if guess > secret:
        return "high"
    return "correct"


def read_guess(attempt: int) -> int:
    """Prompt until the player enters a whole number in range; invalid input costs no guess."""
    while True:
        raw = input(f"Guess {attempt}/{MAX_GUESSES}: ").strip()
        try:
            guess = int(raw)
        except ValueError:
            print(f"'{raw}' is not a whole number.")
            continue
        if LOW <= guess <= HIGH:
            return guess
        print(f"Pick a number from {LOW} to {HIGH}.")


def main() -> None:
    secret = random.randint(LOW, HIGH)
    print(f"I'm thinking of a number from {LOW} to {HIGH}. You have {MAX_GUESSES} guesses.")

    for attempt in range(1, MAX_GUESSES + 1):
        match check_guess(read_guess(attempt), secret):
            case "low":
                print("Too low.")
            case "high":
                print("Too high.")
            case _:
                print(f"Correct! You got it in {attempt}.")
                return

    print(f"Out of guesses. The number was {secret}.")


if __name__ == "__main__":
    main()
