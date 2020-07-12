type ConditionalFn = (input: any) => boolean;
type Condition = string | number | symbol | ConditionalFn;

type Statement = [Condition, any] | [any];
type MatchPattern = [Symbol, Condition, any];

export default class Match {
  private matchPatterns: MatchPattern[];
  constructor(
    statements: Statement[] = [],
    private defaultMatch: any = undefined
  ) {
    this.matchPatterns = statements.map(([condition, predicate]: Statement) => [
      Symbol(),
      condition,
      predicate,
    ]);
  }

  public static fromMap = (map: Map<any, any>) => {
    const dMatch = map.get("_");
    const matchPatterns = Array.from(map.entries()).filter(
      ([k, _v]: [any, any]) => k !== "_"
    );
    return new Match(matchPatterns, dMatch);
  };

  public static fromObject = (obj: Record<string | number, any>) => {
    const dMatch: any = obj["_"];
    const matchPatterns = Array.from(Object.entries(obj)).filter(
      ([k, _v]: [any, any]) => k !== "_"
    );
    return new Match(matchPatterns, dMatch);
  };

  public static fromObj = Match.fromObject;

  public list = (): Symbol[] =>
    this.matchPatterns.map(([sym, _c, _p]: MatchPattern): Symbol => sym);

  public getPattern = (reference: Symbol): Statement | undefined => {
    for (let pattern of this.matchPatterns) {
      const [sym, condition, predicate] = pattern;
      if (sym === reference) {
        return [condition, predicate];
      }
    }
    return undefined;
  };
  private checkCondition = (condition: Condition, input: any): boolean => {
    if (typeof condition === "function") {
      return condition(input);
    } else {
      return condition === input;
    }
  };

  public case = (condition: Condition, predicate: any): this => {
    this.matchPatterns.push([Symbol(), condition, predicate]);
    return this;
  };

  public default = (defaultPredicate: any): this => {
    this.defaultMatch = defaultPredicate;
    return this;
  };

  public remove = (sym: Symbol): this => {
    this.matchPatterns = this.matchPatterns.filter(
      ([s, _c, _p]: MatchPattern) => s !== sym
    );
    return this;
  };

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
