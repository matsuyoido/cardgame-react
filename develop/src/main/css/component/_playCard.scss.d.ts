export type Styles = {
  'back': string;
  'fixed': string;
  'leftBottom': string;
  'minus': string;
  'playCard': string;
  'playerName': string;
  'playerRaw': string;
  'playerSelect': string;
  'plus': string;
  'pulloutBtn': string;
  'rightTop': string;
  'special': string;
}

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
