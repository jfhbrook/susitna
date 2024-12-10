declare module 'consts:matbas' {
  type Constants = {
    build: 'debug' | 'release';
    version: string;
  };
  const constants: Constants;
  export default constants;
}
