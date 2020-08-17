export class ScienceCalculator {
  private ownTablets: number;
  private ownGears: number;
  private ownCompasses: number;

  private tablets: number;
  private gears: number;
  private compasses: number;

  private sum: number;

  constructor(ownTablets, ownGears, ownCompasses) {
    this.ownTablets = this.tablets = ownTablets;
    this.ownGears = this.gears = ownGears;
    this.ownCompasses = this.compasses = ownCompasses;

    this.sum = this.calculate(ownTablets, ownGears, ownCompasses);
  }

  public getSum(): number {
    return this.sum;
  }

  public getMaxSymbol(): string {
    const symbolNames = ['tablet', 'gear', 'compass'];
    const symbols = [this.ownTablets, this.ownGears, this.ownCompasses];
    const max = Math.max(...symbols);
    const index = symbols.indexOf(max);

    return symbolNames[index];
  }

  public getSumString(): string {
    const tabletPoints = Math.pow(this.tablets, 2);
    const gearPoints = Math.pow(this.gears, 2);
    const compassPoints = Math.pow(this.compasses, 2);
    const setPoints = Math.min(this.tablets, this.gears, this.compasses) * 7;

    const points = [
      tabletPoints,
      gearPoints,
      compassPoints,
      setPoints,
    ].map((x) => x.toString(10));
    return points.join('+');
  }

  public calculate(tablets, gears, compasses): number {
    const tabletPoints = Math.pow(tablets, 2);
    const gearPoints = Math.pow(gears, 2);
    const compassPoints = Math.pow(compasses, 2);
    const setPoints = Math.min(tablets, gears, compasses) * 7;

    return tabletPoints + gearPoints + compassPoints + setPoints;
  }

  private addGear(): void {
    this.gears++;
  }

  private addCompass(): void {
    this.compasses++;
  }

  private addTablet(): void {
    this.tablets++;
  }

  public findOptimumSymbol(useTablet, useGear, useCompass): string {
    let maxSum = 0;
    const sums = [0, 0, 0];
    if (useTablet) {
      const sum = this.calculate(this.tablets + 1, this.gears, this.compasses);
      maxSum = Math.max(maxSum, sum);
      sums[0] = sum;
    }

    if (useGear) {
      const sum = this.calculate(this.tablets, this.gears + 1, this.compasses);
      maxSum = Math.max(maxSum, sum);
      sums[1] = sum;
    }

    if (useCompass) {
      const sum = this.calculate(this.tablets, this.gears, this.compasses + 1);
      maxSum = Math.max(maxSum, sum);
      sums[2] = sum;
    }

    const index = sums.indexOf(maxSum);

    if (index === 0) {
      this.addTablet();
      return 'tablet';
    }

    if (index === 1) {
      this.addGear();
      return 'gear';
    }

    if (index === 2) {
      this.addCompass();
      return 'compass';
    }
  }
}
