export interface CarrierMessage {
  id: number;
  text: string;
  xPercent: number;
  delay: number;
  duration: number;
  size: number;
  variant: number;
}

export interface ThemeCarrierProps {
  messages: CarrierMessage[];
  onAnimationEnd: (id: number) => void;
}
