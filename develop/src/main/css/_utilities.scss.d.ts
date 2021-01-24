export type Styles = {
  'btn': string;
  'dTextCenter': string;
  'dTransition': string;
  'hover': string;
  'loader': string;
  'paper': string;
  'scrolls': string;
  'textCenter': string;
}

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
