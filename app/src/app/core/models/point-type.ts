export class PointType {
  static readonly MILITARY = new PointType('MILITARY', 1, 'punkty za wojsko', [
    'military',
  ]);
  static readonly COINS = new PointType('COINS', 2, 'punkty za pieniądze', [
    'image',
  ]);
  static readonly WONDERS = new PointType(
    'WONDERS',
    3,
    'punkty za cuda świata',
    ['image']
  );
  static readonly CULTURE = new PointType('CULTURE', 4, 'punkty za kulturę', [
    'culture',
  ]);
  static readonly TRADE = new PointType('TRADE', 5, 'punkty za handel', [
    'trade',
  ]);
  static readonly GUILD = new PointType('GUILD', 6, 'punkty za gildie', [
    'guild',
  ]);
  static readonly SCIENCE = new PointType('SCIENCE', 7, 'punkty za naukę', [
    'science',
  ]);
  static readonly CITIES = new PointType('CITIES', 8, 'punkty za miasta', [
    'cities',
  ]);
  static readonly LEADERS = new PointType('LEADERS', 9, 'punkty za liderów', [
    'leaders',
  ]);
  static readonly SHIPYARD = new PointType(
    'SHIPYARD',
    10,
    'punkty za stocznię',
    ['shipyard']
  );
  static readonly ISLANDS = new PointType('ISLANDS', 11, 'punkty za wyspy', [
    'islands',
  ]);

  private constructor(
    private readonly key: string,
    public readonly value: any,
    public readonly placeholder: string,
    public readonly cssClasses: string[]
  ) {}

  toString(): string {
    return this.key;
  }
}
