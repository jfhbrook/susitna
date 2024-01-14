import { NestFactory } from '@nestjs/core';

import { Logger } from './logger';
import { AppModule } from './app.module';
import { Translator } from './translator/translator.service';

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new Logger(),
  });
  app.enableShutdownHooks();

  const translator = app.get(Translator);

  await translator.run();
}

if (require.main === module) {
  bootstrap();
}
