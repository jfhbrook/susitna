declare module 'consts:matbas' {
  type Constants = {
    build: 'debug' | 'release';
    version: string;
  };
  const constants: Constants;
  export default constants;
}

declare module 'consts:versions' {
  type Versions = {
    matbas: string;
    vite: string;
    swc: string;
  };
  const versions: Versions;
  export default versions;
}
