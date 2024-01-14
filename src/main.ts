import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Translator } from './translator.service';

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  const translator = app.get(Translator);

  await translator.run();
}

if (require.main === module) {
  bootstrap();
}
