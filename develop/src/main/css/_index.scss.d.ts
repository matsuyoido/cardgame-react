export type Styles = {
  'center': string;
  'enterOverall': string;
  'leaningOverall': string;
  'leftSide': string;
  'rightSide': string;
}

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
