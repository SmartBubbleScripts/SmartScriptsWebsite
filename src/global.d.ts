// src/global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    // Define w3m-button as a valid element
    'W3m-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
