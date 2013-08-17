# DMT Specification

DMT is the codename for the language and engine for creating minigames. The
minigames are for the js13k 2013 competition (http://js13kgames.com/)

# Problem

The challenge is to create a minigame language for submitting an entry to the
js13k contest, while making the games fun and sticking within the contest
restrictions.

# Restrictions

- Contest restrictions:

  - Package size below 13Kb.
  - Include an index.html and when unzipped works in the browser
  - Provide two sources: minified and readable on Github
  - No server libraries (it should work offline)
  - Can use libraries but will count towards the kb limit
  - The competition theme is bad luck (NOT MANDATORY, IGNORE)
  - The competition starts at Aug 13 13:00 CEST, and finishes Sep 13 same time
  - Server category has 13k for server and 13k for client (IGNORE)
  - We need to have the rights for all content
  - New content only
  - It should run in at least one browser. The more the better
  - Bonus points for mobile support
  - Price is fixed for the team
  - Send a link to the repo and provide zipped package

- Project restrictions
    - DMT program files must be the shortest possible for submitting many
      of them, without sacrificing too much interpreter code space
    - Provide a gameplay or sequence for the minigames to form a game as its
      own, making it fun

# Background

The idea started as a challenge in both programming and game design. Create a
micro-language with very minimal but powerful syntax to create minigames based
on a small display and low memory, as in the first generations of games that
worked on very limited resources.

The idea for making it a series of minigames is because of the genre of
minigames with titles such as WarioWare and Raving Rabbids that provide a good
gameplay by keeping the player's reflexes and quick action.

# Hypothesis

We can design an engine with a syntax that describe actions, rather than dealing
with individual pixel drawing. By defining small entities with behaviors, and by
fixing some restrictions on the running engine (such a fixed screen size or
number of colors), we can interpret full programs that are minigames, with a
very small size.

# Solution Proposal

Start by designing the simplest minigames that we can create, and create a
language specification for it. Then program the required modules for parsing and
executing them, trying to keep the program size small. From there, iterate
creating more complex games, until either the file size limit is reached or
the games become so complex they cannot me abstracted into behaviors.

The game should consist on

- A parser
- A game engine, with the concept of game cycle ticks, and win/lose conditions
- A minigame language specification (instructions and values)
- An interpreter that can execute the behaviors during the game cycle ticks
- A game manager, that loads and executes the minigames

# Black box


    +--------------+                   start new game / game over
    | Game Manager |<----------------------------------------------------+
    +--------------+                                                     |
        +                                                                |
        |                                     Game cycle (tick)          |
        +> launches --------> Game Engine  +-------------------+         |
        |                       ^                              |         |
        |                       |                              |         |
        | +----------+          |                              |         |
        +>|  Parser  |-------------> Entities +-> Behaviors    |         |
          +----------+          |                     +        |         |
                                |                     |        |         +
                                |                     v        |    win or lose
                                |                Interpreter +-----> condition
                                |                              |
                                +------------------------------+
# Theory of operation

A dmt program will consist of a small file with instructions that represent
entities with behaviors. The set of entities and behaviors in the system is
fixed (may be continuously expanded, but it is always limited by the engine).

The screen will be a 16 x 16 pixel grid.

The game engine has a game cycle, in which all the entities are refreshed in one
tick.

The game has two possible outcomes: win or lose. These states are reached with
some of the defined behaviors, and when one of these conditions is reached, the
game is over.

An entity is defined by an initial set of pixels, and a set of behaviors.

A behavior is a set of flags and instructions that the entity will execute each
cycle update. For example, an object may have the behavior 'harmable', and upon
contact with another entity with the behavior 'harming', the entity will perform
some defined task. If the entity also has the behavior 'wins on destroy', and
is destroyed, the game will be won.

For the presentation as a whole game, a manager that constantly runs minimages
is needed.

# Implementation

The language specification is defined in the spreadsheet with the behavior
specification

(WIP)

NOTE: Since the 13k restriction implies code golfing, some of the components may
blend or be modified to not be a unit on their own, but the behaviors must be
there. The code will be ugly.