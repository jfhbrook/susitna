import { AssertionError } from 'node:assert';

import t from 'tap';
import { Test } from 'tap';

import { ExitCode } from '../exit.mjs';
import {
  BaseFault,
  Fault,
  RuntimeFault,
  NotImplementedFault,
  UsageFault,
} from '../faults.mjs';
import { TRACEBACK } from './helpers/traceback.mjs';

const SIMPLE_FAULTS: Array<typeof BaseFault> = [BaseFault, Fault];

function simpleTest(t: Test, ctor: typeof BaseFault): void {
  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const fault = new ctor('Some fault', TRACEBACK);

    t.ok(fault);
    t.equal(fault.message, 'Some fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.same(fault.traceback, TRACEBACK);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const traceback = null;
      const fault = new ctor('Some fault', traceback);

      t.ok(fault);
      t.equal(fault.message, 'Some fault');
      t.type(fault, Error);
      t.type(fault, ctor);
      t.same(fault.traceback, traceback);
    },
  );
}

t.test('For simple faults', async (t: Test) => {
  for (const ctor of SIMPLE_FAULTS) {
    simpleTest(t, ctor);
  }
});

const RUNTIME_FAULTS: Array<typeof RuntimeFault> = [RuntimeFault];

function runtimeTest(t: Test, ctor: typeof RuntimeFault): void {
  const underlying = new AssertionError({
    message: 'underlying assertion',
    actual: false,
    expected: true,
    operator: '===',
  });

  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const fault = new ctor('Some runtime fault', underlying, TRACEBACK);

    t.ok(fault);
    t.equal(fault.message, 'Some runtime fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.equal(fault.error, underlying);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, TRACEBACK);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const fault = new ctor('Some runtime fault', underlying, null);

      t.ok(fault);
      t.equal(fault.message, 'Some runtime fault');
      t.type(fault, Error);
      t.type(fault, ctor);
      t.equal(fault.error, underlying);
      t.equal(fault.exitCode, ExitCode.Software);
      t.same(fault.traceback, null);
    },
  );
}

t.test('For runtime faults', async (t: Test) => {
  for (const ctor of RUNTIME_FAULTS) {
    runtimeTest(t, ctor);
  }
});

t.test('For NotImplementedFault', async (t: Test) => {
  t.test(
    `Can construct a NotImplementedFault with a traceback`,
    async (t: Test) => {
      const fault = new NotImplementedFault('Not implemented', TRACEBACK);

      t.ok(fault);
      t.equal(fault.message, 'Not implemented');
      t.type(fault, Error);
      t.type(fault, NotImplementedFault);
      t.equal(fault.error, fault);
      t.equal(fault.exitCode, ExitCode.Software);
      t.same(fault.traceback, TRACEBACK);
    },
  );

  t.test(
    `Can construct a NotImplementedFault without a traceback`,
    async (t: Test) => {
      const fault = new NotImplementedFault('Some runtime fault', null);

      t.ok(fault);
      t.equal(fault.message, 'Some runtime fault');
      t.type(fault, Error);
      t.type(fault, NotImplementedFault);
      t.equal(fault.error, fault);
      t.equal(fault.exitCode, ExitCode.Software);
      t.same(fault.traceback, null);
    },
  );
});

t.test('For UsageFault', async (t: Test) => {
  t.test(`Can construct a UsageFault`, async (t: Test) => {
    const fault = new UsageFault('Usage: lol');

    t.ok(fault);
    t.equal(fault.message, 'Usage: lol');
    t.type(fault, UsageFault);
    t.same(fault.traceback, null);
  });
});
