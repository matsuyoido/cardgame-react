export type Styles = {
  'boardLayout': string;
  'cardsLayout': string;
  'copyBtn': string;
  'deckLayout': string;
  'fieldCards': string;
  'handCards': string;
  'headerLayout': string;
  'moreText': string;
  'navLayout': string;
  'playersLayout': string;
  'startBtn': string;
}

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
