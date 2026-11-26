import assert from "node:assert/strict";
import { test } from "node:test";
import { lessonFileName, romanToInt, snakeCase } from "../src/naming.ts";

test("romanToInt reads canonical numerals and rejects the rest", () => {
  assert.equal(romanToInt("I"), 1);
  assert.equal(romanToInt("IV"), 4);
  assert.equal(romanToInt("IX"), 9);
  assert.equal(romanToInt("XIV"), 14);
  assert.equal(romanToInt("IIII"), null);
  assert.equal(romanToInt("VX"), null);
  assert.equal(romanToInt("iv"), null);
  assert.equal(romanToInt("MIX"), null);
});

test("snakeCase turns course titles into folder names", () => {
  assert.equal(snakeCase("Python I: Fundamentals"), "python_1_fundamentals");
  assert.equal(snakeCase("Python II: Data Structures"), "python_2_data_structures");
  assert.equal(snakeCase("Strings, Integers, and Floats"), "strings_integers_and_floats");
  assert.equal(snakeCase("Café Résumé"), "cafe_resume");
  assert.equal(snakeCase("  ***  "), "untitled");
});

test("snakeCase only converts numerals where they read as numbers", () => {
  assert.equal(snakeCase("Mix it up, vi"), "mix_it_up_vi");
  assert.equal(snakeCase("What Can I Do"), "what_can_i_do");
  assert.equal(snakeCase("Statistics I"), "statistics_1");
  assert.equal(snakeCase("Part II Review"), "part_2_review");
  assert.equal(snakeCase("Python I - Fundamentals"), "python_1_fundamentals");
});

test("lessonFileName pads chapter and lesson numbers", () => {
  assert.equal(lessonFileName(1, 3, "Scripts and Variables"), "01-03_scripts_and_variables.json");
});
