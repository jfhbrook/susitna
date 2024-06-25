export function activate(script: string): string {
  return script.replace(/''\); \/\/ /g, '');
}
