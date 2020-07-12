type ConditionalFn = (input: any) => boolean;
type Condition = string | number | symbol | ConditionalFn;

type Statement = [Condition, any] | [any];
type MatchPattern = [Symbol, Condition, any];

/**
 * @export
 * @class Match
 *
 * Match creates an instance with match patterns, a collection of tuples of Conditions and Predicates.
 * Conditions can be functions or values, as can Predicates.
 *
 * Upon running the .match() public method with an input, "input",
 * the Match class will check, in order, if any condition matches.
 *
 * If the condition checked is a function, it will use the input in that
 * function and return "true" if it is truthy.
 *
 * If the condition checked is a value, it will return true if there is === equality.
 *
 * When the first condition checked matches, if THAT condition's predicate is a value, it will
 * return the value.  If that condition's predicate is a function, it will run the function
 * with the input as the parameter and return the result.
 *
 * If no condition "matches", a defaultMatch parameter can be defined as either a function
 * or a value, this will be returned instead.
 */
export default class Match {
  private matchPatterns: MatchPattern[];

  constructor(
    statements: Statement[] = [],
    private defaultMatch: any = undefined
  ) {
    // we add symbols in the constructor here so that we can grab the patterns by
    // reference later for deleting or retrieving them.
    this.matchPatterns = statements.map(([condition, predicate]: Statement) => [
      Symbol(),
      condition,
      predicate,
    ]);
  }
  // Match.fromMap converts Map to Match, with the key "_" assigned to default.
  public static fromMap = (map: Map<any, any>) => {
    const dMatch = map.get("_");
    const matchPatterns = Array.from(map.entries()).filter(
      ([key, _val]: [any, any]) => key !== "_"
    );
    return new Match(matchPatterns, dMatch);
  };

  // Match.fromObject converts Objects to Match, with the key "_" assigned to default.
  public static fromObject = (obj: Record<string | number, any>) => {
    const dMatch: any = obj["_"];
    const matchPatterns = Array.from(Object.entries(obj)).filter(
      ([key, _val]: [any, any]) => key !== "_"
    );
    return new Match(matchPatterns, dMatch);
  };
  // alias for Match.fromObject;
  public static fromObj = Match.fromObject;

  // list returns an array of symbols, in order, of all the existing match patterns.
  public list = (): Symbol[] =>
    this.matchPatterns.map(([sym, _cond, _pred]: MatchPattern): Symbol => sym);

  // Given a symbol (presumably retrieved via list), grab the condition and predicate that corresponds to it.
  public getPattern = (reference: Symbol): Statement | undefined => {
    for (let pattern of this.matchPatterns) {
      const [sym, condition, predicate] = pattern;
      if (sym === reference) {
        return [condition, predicate];
      }
    }
    return undefined;
  };
  // Checks if the condition matches.
  private checkCondition = (condition: Condition, input: any): boolean => {
    if (typeof condition === "function") {
      return condition(input);
    }
    return condition === input;
  };

  // adds a new case to the end of the matchPatterns list.
  public case = (condition: Condition, predicate: any): this => {
    this.matchPatterns.push([Symbol(), condition, predicate]);
    return this;
  };

  // replaces the default predicate - the function
  // to evaluate or the value to return if there is no match.
  public default = (defaultPredicate: any): this => {
    this.defaultMatch = defaultPredicate;
    return this;
  };

  // removes a match pattern from it's symbol reference.
  public remove = (reference: Symbol): this => {
    this.matchPatterns = this.matchPatterns.filter(
      ([sym, _cond, _pred]: MatchPattern) => reference !== sym
    );
    return this;
  };

  // takes an input, checks against the conditions in order,
  // then returns the predicate value or predicate function evaluated with input
  // as the parameter.
  public match = (input: any) => {
    for (let [_symbol, condition, value] of this.matchPatterns) {
      if (this.checkCondition(condition, input)) {
        return typeof value === "function" ? value(input) : value;
      }
    }
    return typeof this.defaultMatch === "function"
      ? this.defaultMatch(input)
      : this.defaultMatch;
  };
}
