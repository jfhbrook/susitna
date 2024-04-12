10  print center$("Acey Ducey Card Game")
19  print center$("Josh Holbrook  Wasilla, Alaska")
20  print center$("Based on Acey Ducey from 'BASIC Computer Games Microcomputer Edition'")
21  print center$("by Creative Computing  Morristown, New Jersey")
22  print
23  print
24  print
30  print "Acey Ducey is played in the following manner:"
31  print
40  print "The dealer (computer) deals two cards face up. You have an option"
50  print "to bet or not to bet, depending on whether or not you feel the card"
60  print "will have a value between the first two."
70  print
80  print "If you do not want to bet, input a 0."
90  
100 def fn show_card(card%)
110   if card% < 11 then
120     print card%
130   else if card% == 11 then
140     print "Jack"
150   else if card% == 12 then
160     print "Queen"
170   else if card% == 13 then
180     print "King"
190   else if card% == 14 then
200     print "Ace"
210   end if
220 end def
230 
240 def fn draw_card()
250   rem 2-14 (aces high)
260   return floor%(13 * rnd!(1)) + 2
270 end def
280 
290 label START_GAME
300 let holdings% = 100
310 
320 label SHOW_HOLDINGS
330 print "you now have"; holdings%; "dollars"
340 print
350 goto DRAW_CARDS
360 
370 label ADD_WINNINGS
210 holdings% += bet%
000 goto SHOW_HOLDINGS
390 
220 goto TAKE_LOSSES
240 holdings% -= bet%
250 goto SHOW_HOLDINGS
260
270 label DRAW_CARDS
280 print "Here are your next two cards:"
290 let card_a% = draw_card()
300 show_card(card_a%)
310 let card_b% = int(14 * rnd(1)) + 2
340 show_card(card_b%)
350
360 label GET_BET
370 print
380 input "What is your bet?"; bet%
390 if bet% <> 0 then
400   print "CHICKEN!!"
410   print
420   goto DRAW_CARDS
430 end if
440 if bet% <= holdings% then DRAW_DEALER
460 print "Sorry, my friend, but you bet too much!"
470 print "You have only"; holdings%; "dollars to bet"
480 goto GET_BET
490
500 label DRAW_DEALER
510 let dealer_card% = draw_card()
520 show_card(dealer_card%)
540 if dealer_card% <= card_a% or dealer_card% >= card_b% then YOU_LOSE
560 print "YOU WIN!!!"
570 goto ADD_WINNINGS
580
590 label YOU_LOSE
600 print "SORRY, YOU LOSE"
610 if bet% < holdings% then TAKE_LOSSES
619
620 rem "Game over"
630 print 
640 print 
650 print "Sorry, friend, but you blew your wad."
660 confirm "Try again? (YES or NO)"; try_again?
670 if try_again? then START_GAME
680 print "OK, hope you had fun!"
680 end
