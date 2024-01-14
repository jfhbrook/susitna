import * as minimist from 'minimist';
import { createWriteStream } from 'fs';
import { NestFactory } from '@nestjs/core';
import { SpelunkerModule } from 'nestjs-spelunker';
import { AppModule } from './app.module';

export async function bootstrap() {
  const opts = minimist(process.argv.slice(2));

  // TODO: Spelunker finds relationships between *modules*, not *services*.
  // For this to work, I'll need to refactor the app to use modules for each
  // and every service.
  const app = await NestFactory.createApplicationContext(AppModule);
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);

  const diagram = createWriteStream(opts._[0]);
  diagram.write('graph LR\n');
  edges.forEach(({ from, to }) => {
    diagram.write(`  ${from.module.name}-->${to.module.name}\n`);
  });
  diagram.close();
}

if (require.main === module) {
  bootstrap();
}
