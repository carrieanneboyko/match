import Match from "./Match";

const simpleMatch = new Match(
  [
    ["reverse", (input: string) => input.split("").reverse().join("")],
    ["scream", (input: string) => input.toUpperCase()],
  ],
  (input: string) => `default output: ${input}`
);

const fizzBuzz = new Match(
  [
    [
      (input: number) => input % 15 === 0,
      (input: number) => `${input} - FizzBuzz!`,
    ],
    [(input: number) => input % 5 === 0, (input: number) => `${input} - Buzz`],
    [(input: number) => input % 3 === 0, (input: number) => `${input} - Fizz`],
  ],
  (input: number) => input
);

describe("Match", () => {
  describe("Simple match", () => {
    it("creates a matcher", () => {
      expect(simpleMatch.match("reverse")).toBe("esrever");
      expect(simpleMatch.match("scream")).toBe("SCREAM");
      expect(simpleMatch.match("foo")).toBe("default output: foo");
    });
  });
  describe("FizzBuzz", () => {
    it("does a fizzbuzz", () => {
      const fizzLog = [];
      for (let i = 0; i < 35; i++) {
        fizzLog.push(fizzBuzz.match(i));
      }
      expect(fizzLog).toEqual([
        "0 - FizzBuzz!",
        1,
        2,
        "3 - Fizz",
        4,
        "5 - Buzz",
        "6 - Fizz",
        7,
        8,
        "9 - Fizz",
        "10 - Buzz",
        11,
        "12 - Fizz",
        13,
        14,
        "15 - FizzBuzz!",
        16,
        17,
        "18 - Fizz",
        19,
        "20 - Buzz",
        "21 - Fizz",
        22,
        23,
        "24 - Fizz",
        "25 - Buzz",
        26,
        "27 - Fizz",
        28,
        29,
        "30 - FizzBuzz!",
        31,
        32,
        "33 - Fizz",
        34,
      ]);
    });
  });
  describe("static methods", () => {
    it("Match.fromMap", () => {
      const m = new Map();
      m.set("a", 1);
      m.set("b", 2);
      m.set("_", "none");
      const mfm = Match.fromMap(m);
      expect(mfm.match("a")).toBe(1);
      expect(mfm.match("b")).toBe(2);
      expect(mfm.match("c")).toBe("none");
    });
    it("Match.fromObject/Match.fromObj", () => {
      const o = {
        a: 1,
        b: 2,
        _: "none",
      };
      const mfo = Match.fromObject(o);
      expect(mfo.match("a")).toBe(1);
      expect(mfo.match("b")).toBe(2);
      expect(mfo.match("c")).toBe("none");
    });
  });
});

const scratch = new Match();

describe("Adapting and symbolism", () => {
  describe("Create a match from scratch", () => {
    it("can be created from scratch using method chaining", () => {
      scratch
        .case(
          (x: number) => x % 15 === 0,
          (x: number) => `FizzBuzz! (${x})`
        )
        .case(
          (x: number) => x % 5 === 0,
          (x: number) => `Buzz (${x})`
        )
        .case(
          (x: number) => x % 3 === 0,
          (x: number) => `Fizz (${x})`
        )
        .default((x: number) => x);

      expect(scratch.match(5)).toBe("Buzz (5)");
      expect(scratch.match(6)).toBe("Fizz (6)");
      expect(scratch.match(4)).toBe(4);
      expect(scratch.match(30)).toBe("FizzBuzz! (30)");
    });
    it("can get the list of patterns (by symbol)", () => {
      const [_fizbuz, _buzz, fiz]: Symbol[] = scratch.list();
      const [fizCon, fizPred] = scratch.getPattern(fiz);
      expect(fizCon(4)).toBe(false);
      expect(fizPred(4)).toBe("Fizz (4)");
    });
    it("can delete conditions", () => {
      const [fizbuz, buzz, fiz]: Symbol[] = scratch.list();
      scratch.remove(fizbuz);
      expect(scratch.getPattern(fizbuz)).toBe(undefined);
      expect(scratch.match(15)).toBe("Buzz (15)");
    });
  });
});
