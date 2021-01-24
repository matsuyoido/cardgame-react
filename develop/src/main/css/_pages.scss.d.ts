export type Styles = {
  'board': string;
  'btn': string;
  'cardAction': string;
  'cardBody': string;
  'cardTitle': string;
  'center': string;
  'deck': string;
  'dTextCenter': string;
  'dTransition': string;
  'enter': string;
  'fields': string;
  'hands': string;
  'hover': string;
  'index': string;
  'invitationCard': string;
  'loader': string;
  'loading': string;
  'main': string;
  'paper': string;
  'players': string;
  'playing': string;
  'reset': string;
  'scrolls': string;
  'start': string;
  'startBtn': string;
  'switchBtn': string;
  'textCenter': string;
}

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
