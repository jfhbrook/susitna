import { Module } from '@nestjs/common';

import { Editor } from './editor.service';

// Editor handles adding/removing lines from the program you're editing,
// abstracting dictionary-like operations.

@Module({
  providers: [Editor],
  exports: [Editor],
})
export class EditorModule {}
