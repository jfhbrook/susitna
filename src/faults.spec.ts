import { AssertionError } from 'assert';

import t from 'tap';
import { Test } from 'tap';

import { ExitCode } from './sysexits';

import {
  BaseFault,
  Fault,
  RuntimeFault,
  NotImplementedFault,
  UsageFault,
} from './faults';

const SIMPLE_FAULTS: Array<typeof BaseFault> = [BaseFault, Fault];

function simpleTest(t: Test, ctor: typeof BaseFault): void {
  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const traceback = {
      next: null,
      frame: { previous: null },
      lineNo: 100,
    };
    const fault = new ctor('Some fault', traceback);

    t.ok(fault);
    t.equal(fault.message, 'Some fault');
    t.type(fault, Error);
    t.same(fault.traceback, traceback);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const traceback = null;
      const fault = new ctor('Some fault', traceback);

      t.ok(fault);
      t.equal(fault.message, 'Some fault');
      t.type(fault, Error);
      t.same(fault.traceback, traceback);
    },
  );
}

t.test('For simple faults', async (t: Test) => {
  for (let ctor of SIMPLE_FAULTS) {
    simpleTest(t, ctor);
  }
});

const RUNTIME_FAULTS: Array<typeof RuntimeFault> = [
  RuntimeFault,
  NotImplementedFault,
];

function runtimeTest(t: Test, ctor: typeof RuntimeFault): void {
  const underlying = new AssertionError({
    message: 'underlying assertion',
    actual: false,
    expected: true,
    operator: '===',
  });

  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const traceback = {
      next: null,
      frame: { previous: null },
      lineNo: 100,
    };
    const fault = new ctor('Some runtime fault', underlying, traceback);

    t.ok(fault);
    t.equal(fault.message, 'Some runtime fault');
    t.type(fault, Error);
    t.equal(fault.error, underlying);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, traceback);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const traceback = null;
      const fault = new ctor('Some runtime fault', underlying, traceback);

      t.ok(fault);
      t.equal(fault.message, 'Some runtime fault');
      t.type(fault, Error);
      t.equal(fault.error, underlying);
      t.equal(fault.exitCode, ExitCode.Software);
      t.same(fault.traceback, traceback);
    },
  );
}

t.test('For runtime faults', async (t: Test) => {
  for (let ctor of RUNTIME_FAULTS) {
    runtimeTest(t, ctor);
  }
});

t.skip('UsageFault', async (t: Test) => {});
