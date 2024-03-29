# laudanum

Laudanum is a tool for running `cpp` against files to generate JavaScript or
TypeScript files.

The motivation for this tool is being able to conditionally compile debug
builds that do debug tracing. When releasing, I don't want end users to suffer
the overhead of constant debug trace calls.

Right now, this is just a proof of concept. It's not even typed! But if/when I
actually implement debug tracing, this will give me a place to start.
