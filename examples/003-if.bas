10  rem a simple if/then/else
20  if 1 + 1 == 2 then
30    print "1 + 1 is 2!"
40  else
50    print "1 + 1 does NOT equal 2! math has gone upside down!"
60  endif
70
80  rem you can put then on the next line if you want
90  if 1 + 1 == 2
100 then
110   print "1 + 1 is still 2!"
120 else
130   print "1 + 1 does NOT equal 2! how can this be?"
140 endif
150
160 rem the 'else' is optional, of course
170 if 1 + 1 == 2 then
180   print "1 + 1 remains equal to 2!"
200 endif
210
220 rem one-liners are also supported
230 if 1 + 1 == 2 then print "still 2!" endif
240
250 rem else if works too
260 if 1 + 1 < 2 then
270   print "1 + 1 is less than 2!"
280 else if 1 + 1 > 2 then
290   print "1 + 1 is greater than 2!"
300 else
310   print "thank goodness, 1 + 1 is still 2!"
320 end
