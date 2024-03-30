import { basename } from 'path';
import strftime from 'strftime';

import { Host } from './host';
import { MATBAS_VERSION } from './versions';

const shortVersion = MATBAS_VERSION.split('.').slice(0, 2).join('.');

let tildeRe: RegExp | null = null;

const OCTAL_DIGITS = new Set('01234567'.split(''));

// My initial research suggested that the biggest code point was 65535 (also
// known as 0xffff, also known as o177777). But I've passed much larger code
// points to String.fromCharCode on accident and it seems to
// do something sensible with them. On the other hand, it despises emojis.
//
// There's someone out there who's an expert in How JavaScript Does Unicode
// and I should probably reach out to them, and they could tell me what
// values will work reliably with charCodeAt and which aren't. But for now, I'm
// going to cap it at 6, since o177777 is 6 digits long.
const LONGEST_OCTAL = 6;

/**
 * Abbreviate the user's home directory in a path with a ~.
 *
 * @param path The path to abbreviate.
 * @param host A Host.
 */
export function abbreviateHome(path: string, host: Host): string {
  if (tildeRe === null) {
    tildeRe = new RegExp(`^${host.homedir()}`);
  }
  return path.replace(tildeRe, '~');
}

/**
 * Render a prompt string's special characters. This is an implementation,
 * more or less, of how Bash renders $PS1 (and $PS2, $PS3 and $PS4).
 *
 * Like in bash, special characters are preceded with a backslash. Most of
 * Bash's special characters are supported, with some caveats:
 *
 *     \a: A bell character.
 *     \d: The date in "Weekday Month Date" format (e.g., "Tue May 26").
 *     \D: The format is passed to strftime (a node module compatible with
 *       strftime(3). If no format is specified, the default is %H:%M:%S.
 *     \e: An escape character, ie. \u001b.
 *     \h: The hostname up to the first period.
 *     \H: The entire hostname.
 *     \j: Once I actually support shell jobs, this will be the number of jobs.
 *     \l: The basename of the user's TTY.
 *     \s: The basename of the current shell (ie, this program).
 *     \t: The time in 24 hour HH:MM:SS format.
 *     \T: The time in 12 hour HH:MM:SS format.
 *     \@: The time in 12 hour am/pm format.
 *     \A: The time in 24 hour HH:MM format.
 *     \u: The username of the current user.
 *     \v: The Matanuska BASIC version without the patch.
 *     \V: The full Matanuska BASIC version *with* the patch.
 *     \w: The current working directory, where $HOME is abbreviated with a tilde.
 *     \!: When I have history and feel like keeping count, the history number
 *       of the command.
 *     \#: When I can run commands and feel like keeping count, the command
 *       number. This is different from history in that history carries
 *       across sessions.
 *     \$: If the uid is 0 (ie, you're root), a #. Otherwise a $.
 *     \nnn: When a backslash is followed by some amount of octal digits, use
 *       those digits to represent a unicode character by code. In Bash, this is
 *       necessarily 3 digits long and is an ASCII lookup. However, JavaScript
 *       uses UTF-16 and so can handle pretty big numbers. This implementation
 *       is arbitrarily limited to 8.
 *     \\: Just a cheeky little backslash.
 *     \[: Blank, for compatibility with Bash. See the note on non-printing
 *       characters.
 *     \]: Blank, for compatibility with Bash. See the note on non-printing
 *       characters.
 *
 * In cases where there's a backslash but no escape code, the backslash is
 * dropped and the rest of the characters are left alone.
 *
 * NOTE On OS-Related Functionality:
 * ---------------------------------
 *
 * OS-related functionality (such as the hostname or username) are provided
 * by the Host object, and may vary significantly between implementations.
 * While the Host object may return 'null' for certain operations, this
 * renderer tries to gracefully degrade to sensible defaults that might be
 * lying but at least look cool. For more details, peruse 'host.ts'.
 *
 * NOTE on Non-Printing Characters:
 * --------------------------------
 *
 * Bash's equivalent to this procedure counts the length of the prompt,
 * in character widths, while scanning it. In order to get the layout right, it
 * needs to avoid counting non-printing characters. However, it doesn't have
 * an exhaustive sense of which characters are non-printing - apparently.
 *
 * The way Bash solves this is by using \[ to signal to the procedure to
 * stop counting characters, and by using \] to tell it to start up again.
 *
 * In my case, I'm using node's readline module, and it seems to solve the
 * problem by knowing a set of characters that are zero width - presumably
 * ANSI escape characters and a few common unicode zero-width glyphs. I
 * honestly don't know if this approach is better or worse than Bash's. All I
 * know is that I don't need to tell the readline module how long the prompt
 * is.
 *
 * From a rendering perspective, the output looks the same. However, as far
 * as giving rendering hints to the interpreter goes, it does nothing.
 *
 * @param promptString The prompt string to render.
 * @param host a Host.
 */
export function renderPrompt(promptString: string, host: Host): string {
  let ps: string = '';
  let tmp: string[] = promptString.split('');

  let _now: Date | null = null;
  function now(): Date {
    if (!_now) {
      _now = host.now();
    }
    return _now;
  }

  while (tmp.length) {
    const c = tmp.shift();
    if (c === '\\') {
      const esc = tmp.shift();
      switch (esc) {
        case 'a':
          ps += '\u0007';
          break;
        case 'd':
          ps += strftime('%a %b %d', now());
          break;
        case 'D':
          const lbrace = tmp.shift();
          if (lbrace !== '{') {
            ps += `${esc}${lbrace}`;
            break;
          }
          let fmt: string = '';
          while (tmp.length && tmp[0] !== '}') {
            fmt += tmp.shift();
          }
          tmp.shift();
          if (!fmt.length) {
            fmt = '%H:%M:%S';
          }
          ps += strftime(fmt, now());
          break;
        case 'e':
          ps += '\u001b';
          break;
        case 'h':
          ps += host.hostname().split('.')[0];
          break;
        case 'H':
          ps += host.hostname();
          break;
        case 'j':
          ps += '0';
          break;
        case 'l':
          const tty = host.tty();
          if (tty) {
            ps += basename(tty);
          } else {
            // git bash shows this as cons0 in Windows. That's probably an
            // acceptable stand-in, nobody's using this for maintaining
            // the nukes or anything.
            ps += 'cons0';
          }
          break;
        case 's':
          ps += host.shell();
          break;
        case 't':
          ps += strftime('%H:%M:%S', now());
          break;
        case 'T':
          ps += strftime('%I:%M:%S', now());
          break;
        case '@':
          ps += strftime('%I:%M %p', now());
          break;
        case 'A':
          ps += strftime('%H:%M', now());
          break;
        case 'u':
          ps += host.username();
          break;
        case 'v':
          ps += shortVersion;
          break;
        case 'V':
          ps += MATBAS_VERSION;
          break;
        case 'w':
          ps += abbreviateHome(host.cwd(), host);
          break;
        case 'W':
          ps += abbreviateHome(basename(host.cwd()), host);
          break;
        case '!':
          // TODO: The Commander would probably know this.
          ps += '0';
          break;
        case '#':
          // TODO: The Commander would probably know this.
          ps += '0';
          break;
        case '$':
          ps += host.uid() === 0 ? '#' : '$';
          break;
        case '\\':
          ps += '\\';
          break;
        case '[':
          break;
        case ']':
          // NOTE: Bash calculates the apparent length of the prompt when
          // rendering it. What that means is that it counts every character
          // BUT the ones in between \[ and \].
          //
          // We don't have a use case for tracking that length right now.
          // Node's readline seems able to handle non-printing characters
          // without getting confused.
          //
          // For compatibility, we can just soak this up, and not count the
          // apparent length of the prompt and say we did.
          break;
        default:
          // \nnn in Bash is "the character whose ASCII code is the octal
          // value nnn." JavaScript can do utf16 without breaking a sweat, so
          // we just do that.
          if (OCTAL_DIGITS.has(esc)) {
            let digits = esc;
            let i = 1;
            while (OCTAL_DIGITS.has(tmp[0]) && i < LONGEST_OCTAL) {
              digits += tmp.shift();
              i++;
            }
            if (digits.length < 3) {
              ps += digits;
              break;
            }
            const code = parseInt(digits, 8);
            ps += String.fromCharCode(code);
            break;
          }

          // If the escape code is invalid, soak up the backslash and call it
          // a day.
          ps += `${esc}`;
      }
    } else {
      ps += c;
    }
  }

  return ps;
}
