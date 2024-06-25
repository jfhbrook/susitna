# Matanuska Test Generator

This tool procedurally generates tests for Matanuska.

## How to Generate Tests

This tool is called from Matanuska's main package.json.

To generate the initial tests, run:

```sh
npm run build:test
```

This will generate the first version of the tests.

At this point, you should run a `git status` and `git restore` any files
you don't want to regenerate.

These tests will initially be configured to have a blank snapshot, using a
technique like so:

```ts
t.matchSnapshot(''); // ast);
```

This allows you to generate blank snapshots, so that you can later "activate"
the snapshot and get a full diff. To generate those snapshots, run:

```sh
npm run snap
```

Then, to regexp out the blank snapshots, run:

```sh
npm run build:test:activate
```

Now, run tests to make sure the outputs are good:

```sh
npm t
```

Finally, run snap again to save the changes:

```sh
npm run snap
```
