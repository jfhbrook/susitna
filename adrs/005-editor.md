# ADR 005 - Editor Operations

### Status: Accepted

### Josh Holbrook

## Context

The editor needs to insert, update and delete lines from a Program. These
lines are ordered in an array.

Inserting into arrays is not particularly efficient as compared to a hash map.
One way to handle this may be to store indexes line numbers in a `Map` - that
would give O(1) access to the location of a line. However, that lookup won't
work if the line doesn't exist yet, and requires an additional data structure.
Therefore, we will need to seek to the correct location within the array.

In general, binary search is going to be the most efficient mechanism for
finding the right location, scaling at O(log n). However, in terms of actual
use, lines are often being entered into the program in order - and in a new
program, at the very end.

## Decision

Line lookup for editing will follow this general algorithm:

1. Check if the location is at or following the most recently modified line.
   In that case, return this location.
2. Check if the location is at or following the last line. In that case, return
   this location.
3. If these checks fail, find the location with a binary search.
4. In all cases, save the location of the most recently inserted line.
