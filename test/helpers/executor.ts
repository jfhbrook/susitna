import * as assert from 'assert';

import { discuss, Topic } from '@jfhbrook/swears';

import { container, Container } from '../../container';
import { Config } from '../../config';
import { Editor } from '../../editor';
import { Executor } from '../../executor';
import { Host } from '../../host';

import { CONFIG } from './config';
import { MockConsoleHost } from './host';

export interface MockExecutorConfig {
  answers?: string[];
  inputs?: string[];
  files?: Record<string, string>;
}

export class MockExecutor extends Executor {
  public initialized: boolean = false;
  public questions: string[];
  public inputCallCount: number = 0;
  public promptCallCount: number = 0;

  constructor(
    _config: Config,
    editor: Editor,
    host: Host,
    private answers: string[] = [],
    private inputs: string[] = [],
    public files: Record<string, string> = {},
  ) {
    super(_config, editor, host);
    this.questions = [];
  }

  async init(): Promise<void> {
    this.initialized = true;
  }

  async close(): Promise<void> {
    this.initialized = false;
  }

  async input(question: string): Promise<string> {
    this.inputCallCount++;
    this.questions.push(question);
    const ans = this.answers.shift();
    assert.ok(ans);
    return ans;
  }

  async prompt(): Promise<string> {
    this.promptCallCount++;
    const in_ = this.inputs.shift();
    assert.ok(in_);
    return in_;
  }

  async _readFile(filename: string): Promise<string> {
    const file = this.files[filename];
    assert.ok(file);
    return file;
  }

  async _writeFile(filename: string, source: string): Promise<void> {
    this.files[filename] = source;
  }
}

export interface MockContainer {
  config: Config;
  host: MockConsoleHost;
  editor: Editor;
  executor: MockExecutor;
}

export function executorTopic({
  answers,
  inputs,
  files,
}: MockExecutorConfig = {}): Topic<MockContainer> {
  return discuss(
    async () => {
      const host = new MockConsoleHost();
      const deps = container(
        CONFIG,
        host,
        ({ config, editor, host }) =>
          new MockExecutor(config, editor, host, answers, inputs, files),
      );

      await deps.executor.init();

      return deps as MockContainer;
    },
    async ({ executor }) => {
      await executor.close();
    },
  );
}
