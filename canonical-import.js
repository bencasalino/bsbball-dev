const { recalculateAwards } = require('./server/trophy-case');

const canonicalRows = `
2008|1|Zach Zettle|—|15|3|0|1|1
2008|2|Ben Casalino|—|16|2|0|1|0
2008|3|Yacine Boraie|—|14|4|0|1|0
2008|4|Jordan Flittie|—|11|7|0|1|0
2008|5|Ryan Zettle|—|10|8|0|0|0
2008|6|Brady Lefferts|—|10|8|0|0|0
2008|7|Jonathan Hennke|—|9|9|0|0|0
2008|8|Jordan Endres|—|7|7|0|0|0
2009|1|Jonathan Hennke|—|10|7|0|1|1
2009|2|Ben Casalino|—|15|3|0|1|0
2009|3|Zach Zettle|—|14|2|0|1|0
2009|4|Brady Lefferts|—|11|7|0|1|0
2009|5|Yacine Boraie|—|10|7|0|0|0
2009|6|Jordan Flittie|—|9|9|0|0|0
2009|7|Jordan Endres|—|5|13|0|0|0
2009|8|Ryan Zettle|—|5|13|0|0|0
2010|1|Jonathan Hennke|Team Hennke|12|6|0|1|1
2010|2|Ben Casalino|The RonArtesticles|15|3|0|1|0
2010|3|Zach Zettle|Team Zettle|14|4|0|1|0
2010|4|Rafa Soto|Ho Malone 2|11|7|0|1|0
2010|5|Brady Lefferts|Honkeys Hung Like Donkeys|9|8|1|0|0
2010|6|Jordan McCowan|Team McCowan|10|8|0|0|0
2010|7|Miles Syswerda|Team Syswerda|10|8|0|0|0
2010|8|Carlo Sansotta|Team Sansotta|10|8|0|0|0
2010|9|Jordan Endres|Team Endres|9|9|0|0|0
2010|10|Jordan Flittie|Team Flittie|5|13|0|0|0
2010|11|Ryan Zettle|Team ZET DUCK|5|13|0|0|0
2010|12|Yacine Boraie|iFratSoHard WitMomsAmexCard|9|9|0|0|0
2010|13|Gary Quinn|MIKEVICKS DAWGS|4|13|1|0|0
2010|14|Danny Rubin|Quest Love|2|16|0|0|0
2011|1|Ben Casalino|Barles Charkley|7|7|0|1|1
2011|2|Jonathan Hennke|Team Hennke|10|4|0|1|0
2011|3|Rafa Soto|The Babys|8|6|0|1|0
2011|4|Edde Venzor|My house Turtles|7|5|0|0|0
2011|5|AJ ParkerII|TEAM INEEDMONEY T.IN.M|8|4|0|0|0
2011|6|Jordan Endres|Team Jordan|7|7|0|0|0
2011|7|Zach Zettle|Team Zettle|9|4|0|0|0
2011|8|Rudy Ibanez Vasquez|the googiliatas|9|5|0|0|0
2011|9|Carlo Sansotta|Dude Bros|3|9|0|0|0
2011|10|Justin Breeden|the mau5trap|5|9|0|0|0
2011|11|Brady Lefferts|Honkeys Hung Like Donkeys|7|8|0|0|0
2011|12|Chad Doering|Go Ducks|1|13|0|0|0
2012|1|Kristen Miguel|Team Miguel|10|2|0|1|1
2012|2|Rafa Soto|Prom Night Dumpster Babys|8|4|0|1|0
2012|3|Danny Rubin|The Amare Sodomizers|9|3|0|1|0
2012|4|Zach Zettle|Team Zettle|8|4|0|0|0
2012|5|Rudy Ibanez Vasquez|Blake Griffin and Co.|7|5|0|0|0
2012|6|Edde Venzor|My house Turtles|5|7|0|0|0
2012|7|Carlo Sansotta|Dude Bros|8|4|0|0|0
2012|8|Ben Casalino|Barles Charkley|5|7|0|0|0
2012|9|Jonathan Hennke|WinDy CitY ChaMp|4|8|0|0|0
2012|10|Lamar Reynolds|messwiththebest dieliketherest|6|6|0|0|0
2012|11|Joshua Martinez|Team Ale|1|11|0|0|0
2012|12|Marco Porras|Team ZAGS|1|11|0|0|0
2013|1|Ben Casalino|Barles Charkley|10|6|0|1|1
2013|2|Mathew Schafer|CapTain BaDÃ¡ss|9|7|0|1|0
2013|3|Rafa Soto|Prom Night Dumpster Babys|15|1|0|1|0
2013|4|Jonathan Hennke|WinDy CitY ChaMp|7|9|0|0|0
2013|5|Langston Ques|Arcata RAGE|7|9|0|0|0
2013|6|Zach Zettle|Zettle Likes Men|12|4|0|0|0
2013|7|Kenneth Wilson|Team Badass|11|5|0|0|0
2013|8|Joshua Martinez|Josh Ale|10|6|0|0|0
2013|9|Carlo Sansotta|Dude Bros|5|11|0|0|0
2013|10|Lamar Reynolds|messwiththebest dieliketherest|4|12|0|0|0
2013|11|Danny Rubin|How To Train Your Dragic|4|12|0|0|0
2013|12|Paul Rubin|Paul Rubin|2|14|0|0|0
2014|1|Rafa Soto|Prom Night Dumpster Babys|7|10|0|1|1
2014|2|Adam Bernert|Stone Rockz|13|4|0|1|0
2014|3|Ben Casalino|Barles Charkley|14|3|0|1|0
2014|4|Jonathan Hennke|WinDy CitY ChaMp|15|2|0|1|0
2014|5|James Valeriano|pick a teamname Valeriano|6|11|0|0|0
2014|6|Lamar Reynolds|Kyrie On baggage|9|8|0|0|0
2014|7|Joshua Martinez|Josh Ale|1|16|0|0|0
2014|8|Robbie Birbeck|God Dammit Rose|3|14|0|0|0
2015|1|Jonathan Hennke|WinDy CitY ChaMp|11|4|0|1|1
2015|2|Adam Bernert|Stone Rockz|13|2|0|1|0
2015|3|Ben Casalino|Barles Charkley|11|4|0|1|0
2015|4|Mark Dimizio|Katy Perry Picked Me!|9|6|0|1|0
2015|5|Jesus Zepeda|Arizona Smashers|8|7|0|1|0
2015|6|Scott Mullenbach|Balls To The Wall|9|6|0|1|0
2015|7|Chris Lyons|Toronto Faptors|8|7|0|1|0
2015|8|Jess Smith|Z Bo|7|8|0|0|0
2015|9|Rafa Soto|Prom Night Dumpster Babys|6|9|0|0|0
2015|10|Andy Miguel|Mugsy Balls|1|13|0|0|0
2015|11|Lamar Reynolds|Kyrie On baggage|3|11|0|0|0
2015|12|Zach Lyons|Coon and Friends|4|10|0|0|0
2015|13|James Valeriano|Manute Balls|6|9|0|0|0
2016|1|Rafa Soto|Prom Night Dumpstr Babys|15|1|0|1|1
2016|2|Jonathan Hennke|WinDy CitY ChaMp|11|5|0|1|0
2016|3|Ben Casalino|Barles Charkley|11|5|0|1|0
2016|4|Craig Lefferts|Pops it in for Three|12|4|0|0|0
2016|5|Chris Lyons|Toronto Faptors|9|7|0|0|0
2016|6|Burges McCowan|Herbal Viagra All-Stars|7|9|0|0|0
2016|7|Tanner Lefferts|San Diego's Son of a Beach|7|9|0|0|0
2016|8|Adam Bernert|Stone Rockz|9|7|0|0|0
2016|9|Mateo Elorza|Miami Notorious|4|12|0|0|0
2016|10|James Coleman|56 Nights|4|12|0|0|0
2016|11|Lamar Reynolds|Kyrie On baggage|3|13|0|0|0
2016|12|Carlo Sansotta|Pick a TeamName Carlo|4|12|0|0|0
2017|1|Adam Bernert|Stone Rockz|13|3|0|1|1
2017|2|Tanner Lefferts|San Diego's Son of a Beach|15|1|0|1|0
2017|3|Rafa Soto|Prom Night Dumpstr Babys|8|8|0|1|0
2017|4|Ben Casalino|Barles Charkley|9|7|0|1|0
2017|5|Jonathan Hennke|WinDy CitY ChaMp|13|3|0|0|0
2017|6|Craig Lefferts|Pops it in for Three|8|8|0|0|0
2017|7|Sean Wessel|7 foot Latvian Unicorn|9|7|0|0|0
2017|8|Burges McCowan|A Team Has No Name|6|10|0|0|0
2017|9|Chris Lyons|Toronto Faptors|5|11|0|0|0
2017|10|Ryan Challinor|MVP Harden|5|11|0|0|0
2017|11|Rudy Ibanez Vasquez|Team Rudy_block|2|14|0|0|0
2017|12|Kyle Kelly|kanters chair|3|13|0|0|0
2018|1|Burges McCowan|Burges Big Ballers|17|1|0|1|1
2018|2|Adam Bernert|Stone Rockz|14|4|0|1|0
2018|3|Ben Casalino|Barles Charkley|10|8|0|1|0
2018|4|Rafa Soto|P N D B|12|6|0|1|0
2018|5|Craig Lefferts|Pops it in for Three|12|6|0|0|0
2018|6|Jonathan Hennke|WinDy CitY ChaMp|9|9|0|0|0
2018|7|Chris Lyons|Toronto Faptors|11|7|0|0|0
2018|8|Kyle Kelly|BBB Balls|9|9|0|0|0
2018|9|Tanner Lefferts|San Diego's Son of a Beach|4|14|0|0|0
2018|10|Jeremy Hennke|AZ JNKKO|2|16|0|0|0
2018|11|Lamar Reynolds|Lamar Lamar|3|15|0|0|0
2018|12|Ryan Zettle|Ryan's Team Ryan's Team|5|13|0|0|0
2019|1|Rafa Soto|P N D B|8|10|0|1|1
2019|2|Adam Bernert|Stone Rockz|17|1|0|1|0
2019|3|Jonathan Hennke|WinDy CitY ChaMp|11|7|0|1|0
2019|4|Conner Fischer|Rip City Jail Blazers|13|5|0|0|0
2019|5|Tophas Anderson|Washed Up Rappers|13|5|0|0|0
2019|6|Burges McCowan|Burges Big Ballers|10|8|0|0|0
2019|7|Ben Casalino|Barles Charkley|11|7|0|0|0
2019|8|Kyle Kelly|BBB Balls|8|10|0|0|0
2019|9|Permpreet Gill|Sorry Miss Jackson|2|16|0|0|0
2019|10|Jason Bevacqua|Trust The Process|6|12|0|0|0
2019|11|Chris Lyons|Fire Thibodeau|7|11|0|0|0
2019|12|Scott Berlin|Comeback Kid|2|16|0|0|0
2020|1|Jonathan Hennke|WinDy CitY ChaMp|16|2|0|1|0
2020|2|Burges McCowan|Burges Big Ballers|13|5|0|1|1
2020|3|Adam Bernert|Stone Rockz|12|6|0|1|0
2020|4|Rafa Soto|P N D B|12|6|0|1|0
2020|5|Adrian Flowers|Team Flowers|12|6|0|0|0
2020|6|Robert Lydford|Chandler AZ Suns Rise|10|8|0|0|0
2020|7|Chris Lyons|Steve Kerr Is a Little Boy|11|7|0|0|0
2020|8|Conner Fischer|Rip City Jail Blazers|9|9|0|0|0
2020|9|Tophas Anderson|Washed Up Rappers|9|9|0|0|0
2020|10|Ben Casalino|Barles Charkley|7|11|0|0|0
2020|11|Kyle Kelly|AF Andre n friends|6|12|0|0|0
2020|12|Adam Sestokas|YMCA Big Dog|5|13|0|0|0
2020|13|Jason Bevacqua|Trust The Process|4|14|0|0|0
2020|14|Scott Berlin|Minshew For Basketball|0|18|0|0|0
2021|1|Conner Fischer|Rip City Jail Blazers|7|7|0|1|1
2021|2|Adrian Flowers|Team Flowers|11|3|0|1|0
2021|3|Jonathan Hennke|WinDy CitY ChaMp|10|4|0|1|0
2021|4|Chris Lyons|TWOLVES Cause Me Pain|4|10|0|0|0
2021|5|Burges McCowan|Burges Big Ballers|12|2|0|0|0
2021|6|Ben Casalino|Barles Charkley|6|8|0|0|0
2021|7|Adam Bernert|Stone Rockz|5|9|0|0|0
2021|8|Rafa Soto|Clown Babies|8|6|0|0|0
2021|9|Tophas Anderson|Washed Up Rappers|4|10|0|0|0
2021|10|Scott Berlin|Quarantine Machine|3|11|0|0|0
2022|1|Adrian Flowers|Team Flowers|18|0|0|1|1
2022|2|Rafa Soto|Ball don't LIE|8|10|0|1|0
2022|3|Jonathan Hennke|WinDy CitY ChaMp|12|6|0|1|0
2022|4|Adam Bernert|Stone Rockz|10|8|0|0|0
2022|5|Ben Casalino|Barles Charkley|8|10|0|0|0
2022|6|Tophas Anderson|Washed Up Rappers|7|11|0|0|0
2022|7|Burges McCowan|Burges Big Ballers|15|3|0|0|0
2022|8|Chris Lyons|TWOLVES Cause Me Pain|8|10|0|0|0
2022|9|Scott Berlin|Boy George In Zion|0|18|0|0|0
2022|10|Conner Fischer|Rip City Jail Blazers|4|14|0|0|0
2023|1|Adam Bernert|Stone Rockz|15|3|0|1|1
2023|2|Lee Trapp|Trae Bay Bay|8|10|0|1|0
2023|3|Rafa Soto|Crab People|13|5|0|1|0
2023|4|Jonathan Hennke|WinDy CitY ChaMp|11|7|0|0|0
2023|5|Aleksandar Milic|Poor Decisions|14|4|0|0|0
2023|6|Brendan Inman|Brendan Inman|10|8|0|0|0
2023|7|Tyler Hughes|The Big Lebrowski|11|7|0|0|0
2023|8|Kyle Kelly|Ja Morantula|8|10|0|0|0
2023|9|Ben Casalino|Barles Charkley|7|11|0|0|0
2023|10|Scott Berlin|I Need Help|2|16|0|0|0
2023|11|Pete Rangel|Az Valeboy|1|17|0|0|0
2023|12|Dakota Dial|My Lillard Pony|8|10|0|0|0
2024|1|Ben Casalino|Barles Charkley|13|5|0|1|1
2024|2|Adam Bernert|Stone Rockz|9|9|0|1|0
2024|3|Robert Riley|Chi-Town Ballers|15|3|0|1|0
2024|4|Jonathan Hennke|WinDy CitY ChaMp|16|2|0|0|0
2024|5|Lee Trapp|Full Metal Jokic|10|8|0|0|0
2024|6|Aleksandar Milic|Poor Decisions|8|10|0|0|0
2024|7|Rafa Soto|Crab People|9|9|0|0|0
2024|8|Scott Berlin|Stumpy's Soldiers|5|13|0|0|0
2024|9|Kyle Kelly|Ja Morantula|1|17|0|0|0
2024|10|Joe Quintero|TheManCalledJoe|4|14|0|0|0
2025|1|Ben Casalino|Barles Charkley|14|4|0|1|1
2025|2|Jonathan Hennke|WinDy CitY ChaMp|15|3|0|1|0
2025|3|Adam Bernert|Stone Rockz|15|3|0|1|0
2025|4|Lee Trapp|Ja MorAnthony Edwards|8|10|0|0|0
2025|5|Scott Berlin|Stumpy's Soldiers|8|10|0|0|0
2025|6|Aleksandar Milic|Poor Decisions|7|11|0|0|0
2025|7|Kyle Kelly|Ja Morantula|11|7|0|0|0
2025|8|Conner Fischer|Aunt 'Tifah|5|13|0|0|0
2025|9|Andre Miguel|Don Juan|2|16|0|0|0
2025|10|Rafa Soto|Crab People|5|13|0|0|0
2026|1|Jonathan Hennke|WinDy CitY ChaMp|15|1|0|1|1
2026|2|Ben Casalino|Barles Charkley|12|4|0|1|0
2026|3|Adam Bernert|Stone Rockz|8|8|0|1|0
2026|4|Kyle Kelly|DC Kings|10|6|0|0|0
2026|5|Rafa Soto|Crab People|11|5|0|0|0
2026|6|Tyrell Reid|Tyrell's Top Team|8|8|0|0|0
2026|7|Lee Trapp|Fear the Beard|10|6|0|0|0
2026|8|Rudy Vasquez|Load Management Inc.|8|8|0|0|0
2026|9|Conner Fischer|Aunt 'Tifah|4|12|0|0|0
2026|10|David Miguel|David's Dangerous Team|7|9|0|0|0
2026|11|Scott Berlin|Stumpy's Soldiers|1|15|0|0|0
2026|12|Gavin Jackson|Deep 3 Mob|2|14|0|0|0
2027|1|Jonathan Hennke|WinDy CitY ChaMp|0|0|0|0|0
2027|2|Ben Casalino|Barles Charkley|0|0|0|0|0
2027|3|Adam Bernert|Stone Rockz|0|0|0|0|0
2027|4|Kyle Kelly|DC Kings|0|0|0|0|0
2027|5|Rafa Soto|Crab People|0|0|0|0|0
2027|6|Tyrell Reid|Tyrell's Top Team|0|0|0|0|0
2027|7|Lee Trapp|Fear the Beard|0|0|0|0|0
2027|8|Rudy Vasquez|Load Management Inc.|0|0|0|0|0
2027|9|Conner Fischer|Aunt 'Tifah|0|0|0|0|0
2027|10|David Miguel|David's Dangerous Team|0|0|0|0|0
2027|11|Scott Berlin|Stumpy's Soldiers|0|0|0|0|0
2027|12|Gavin Jackson|Deep 3 Mob|0|0|0|0|0
`.trim();

const identityAliases = {
  'Andy Miguel': 'Andy Miguel',
  'Andre Miguel': 'Andy Miguel',
  'Rudy Ibanez Vasquez': 'Rudy Vasquez',
  'Rudy Vasquez': 'Rudy Vasquez',
};

const activeManagerNames = new Set(['Adam Bernert', 'Ben Casalino', 'Jonathan Hennke', 'Rafa Soto']);

const managerBranding = {
  'Zach Zettle': { logo: 'shrimp', colorIndex: 1 },
  'Ben Casalino': { logo: 'mountain', colorIndex: 2 },
  'Yacine Boraie': { logo: 'bolt', colorIndex: 3 },
  'Jordan Flittie': { logo: 'crow', colorIndex: 4 },
  'Ryan Zettle': { logo: 'dungeon', colorIndex: 5 },
  'Brady Lefferts': { logo: 'helicopter', colorIndex: 6 },
  'Jonathan Hennke': { logo: 'fan', colorIndex: 7 },
  'Jordan Endres': { logo: 'dragon', colorIndex: 8 },
  'Rafa Soto': { logo: 'baby-carriage', colorIndex: 9 },
  'Jordan McCowan': { logo: 'rocket', colorIndex: 10 },
  'Miles Syswerda': { logo: 'horse-head', colorIndex: 11 },
  'Carlo Sansotta': { logo: 'bomb', colorIndex: 12 },
  'Gary Quinn': { logo: 'spaghetti-monster-flying', colorIndex: 13 },
  'Danny Rubin': { logo: 'moon', colorIndex: 14 },
  'Edde Venzor': { logo: 'anchor', colorIndex: 15 },
  'AJ ParkerII': { logo: 'bolt', colorIndex: 16 },
  'Rudy Vasquez': { logo: 'feather', colorIndex: 17 },
  'Justin Breeden': { logo: 'frog', colorIndex: 18 },
  'Chad Doering': { logo: 'sun', colorIndex: 19 },
  'Kristen Miguel': { logo: 'ghost', colorIndex: 20 },
  'Lamar Reynolds': { logo: 'hat-wizard', colorIndex: 21 },
  'Joshua Martinez': { logo: 'skull', colorIndex: 22 },
  'Marco Porras': { logo: 'gun', colorIndex: 23 },
  'Mathew Schafer': { logo: 'dove', colorIndex: 24 },
  'Langston Ques': { logo: 'biohazard', colorIndex: 25 },
  'Kenneth Wilson': { logo: 'hamsa', colorIndex: 26 },
  'Paul Rubin': { logo: 'lemon', colorIndex: 27 },
  'Adam Bernert': { logo: 'atom', colorIndex: 28 },
  'James Valeriano': { logo: 'chess-knight', colorIndex: 29 },
  'Robbie Birbeck': { logo: 'compass', colorIndex: 30 },
  'Mark Dimizio': { logo: 'horse', colorIndex: 31 },
  'Jesus Zepeda': { logo: 'igloo', colorIndex: 32 },
  'Scott Mullenbach': { logo: 'leaf', colorIndex: 33 },
  'Chris Lyons': { logo: 'snowflake', colorIndex: 34 },
  'Jess Smith': { logo: 'fire', colorIndex: 35 },
  'Andy Miguel': { logo: 'kiwi-bird', colorIndex: 36 },
  'Zach Lyons': { logo: 'guitar', colorIndex: 37 },
  'Craig Lefferts': { logo: 'hat-cowboy', colorIndex: 38 },
  'Burges McCowan': { logo: 'burger', colorIndex: 39 },
  'Tanner Lefferts': { logo: 'umbrella', colorIndex: 40 },
  'Mateo Elorza': { logo: 'car', colorIndex: 41 },
  'James Coleman': { logo: 'plane', colorIndex: 42 },
  'Sean Wessel': { logo: 'ship', colorIndex: 43 },
  'Ryan Challinor': { logo: 'truck', colorIndex: 44 },
  'Kyle Kelly': { logo: 'baseball-bat-ball', colorIndex: 45 },
  'Jeremy Hennke': { logo: 'cat', colorIndex: 46 },
  'Conner Fischer': { logo: 'dog', colorIndex: 47 },
  'Tophas Anderson': { logo: 'fish', colorIndex: 48 },
  'Permpreet Gill': { logo: 'bug', colorIndex: 49 },
  'Jason Bevacqua': { logo: 'spider', colorIndex: 50 },
  'Scott Berlin': { logo: 'robot', colorIndex: 51 },
  'Adrian Flowers': { logo: 'clover', colorIndex: 52 },
  'Robert Lydford': { logo: 'paw', colorIndex: 53 },
  'Adam Sestokas': { logo: 'bell', colorIndex: 54 },
  'Lee Trapp': { logo: 'chess-rook', colorIndex: 55 },
  'Aleksandar Milic': { logo: 'hippo', colorIndex: 56 },
  'Brendan Inman': { logo: 'cow', colorIndex: 57 },
  'Tyler Hughes': { logo: 'meteor', colorIndex: 58 },
  'Pete Rangel': { logo: 'locust', colorIndex: 59 },
  'Dakota Dial': { logo: 'peace', colorIndex: 60 },
  'Robert Riley': { logo: 'sailboat', colorIndex: 61 },
  'Joe Quintero': { logo: 'otter', colorIndex: 62 },
  'Tyrell Reid': { logo: 'egg', colorIndex: 63 },
  'David Miguel': { logo: 'worm', colorIndex: 64 },
  'Gavin Jackson': { logo: 'parachute-box', colorIndex: 65 },
};

// Legacy colors recovered from colors.css/old-table.html. The old logos are inline SVGs,
// so their exact Font Awesome names are not always recoverable; current stable icons remain.
const legacyColors = {
  'AJ ParkerII': ['#1C0055', '#C04277'],
  'Adam Sestokas': ['#FFFFFF', '#616DC8'],
  'Andy Miguel': ['#031C05', '#79EAD9'],
  'Chad Doering': ['#FF4D00', '#ECECEC'],
  'Adam Bernert': ['#E03A3E', '#222222'],
  'Ben Casalino': ['#C39E6D', '#275ED4'],
  'Brendan Inman': ['#F4FEFF', '#714EFF'],
  'Burges McCowan': ['#F5FF2E', '#FF2E2E'],
  'Carlo Sansotta': ['#F58426', '#006BB6'],
  'Chris Lyons': ['#78BE20', '#0C2340'],
  'Danny Rubin': ['#F1F2F2', '#006D75'],
  'Conner Fischer': ['#120536', '#C3C3C3'],
  'Jeremy Hennke': ['#F4CF9F', '#12191C'],
  'Jess Smith': ['#BEBEBE', '#000000'],
  'Jesus Zepeda': ['#000000', '#C2F412'],
  'Justin Breeden': ['#570101', '#D1D1D5'],
  'Kenny Wilson': ['#FFFFFF', '#C8102E'],
  'Kenneth Wilson': ['#FFFFFF', '#C8102E'],
  'Gary Quinn': ['#FFFFFF', '#17562C'],
  'Gavin Jackson': ['#0B6E4F', '#F26B5B'],
  'Brady Lefferts': ['#E7E7E7', '#007A33'],
  'Kristen Miguel': ['#333333', '#DB3EB1'],
  'Jonathan Hennke': ['#1D1160', '#E56020'],
  'Langston Ques': ['#FDB927', '#00788C'],
  'Dakota Dial': ['#A6FF33', '#3473B2'],
  'Jordan Endres': ['#FFD100', '#0038A8'],
  'Jordan Flittie': ['#231F20', '#F7B5CD'],
  'Jordan McCowan': ['#F9FBEF', '#BA9653'],
  'Marco Porras': ['#6B1E3F', '#77C8D1'],
  'Craig Lefferts': ['#2BB656', '#ED5959'],
  'James Coleman': ['#48536D', '#F4C25E'],
  'Edde Venzor': ['#007610', '#ACE4EE'],
  'Joshua Martinez': ['#FCB514', '#2E2D2C'],
  'James Valeriano': ['#26282A', '#C1D32F'],
  'Jason Bevacqua': ['#FCB514', '#2E2D2C'],
  'Lee Trapp': ['#1F099D', '#FFA449'],
  'Kyle Kelly': ['#AB0520', '#003366'],
  'Mark Dimizio': ['#D4D4D4', '#0062FF'],
  'Mateo Elorza': ['#FFFFFF', '#007AC1'],
  'Matt S': ['#FDBB30', '#12173F'],
  'Miles Syswerda': ['#0C2340', '#BD3039'],
  'Paul Rubin': ['#00471B', '#EEE1C6'],
  'Permpreet Gill': ['#0008A0', '#FF4492'],
  'Lamar Reynolds': ['#98002E', '#F9A01B'],
  'Rafa Soto': ['#FFC200', '#00653A'],
  'Ryan Zettle': ['#124559', '#E9B44C'],
  'Robbie Birbeck': ['#FF6200', '#FFDC2C'],
  'Robert Lydford': ['#3D405B', '#F28482'],
  'Pete Rangel': ['#EBEBEB', '#BA76E4'],
  'Rudy Vasquez': ['#355464', '#99D9D9'],
  'Tophas Anderson': ['#FFFFFF', '#8B634B'],
  'Tyler Hughes': ['#062B02', '#7CCF87'],
  'Tanner Lefferts': ['#FFFFFF', '#041E42'],
  'Scott Berlin': ['#0077C0', '#CED4D7'],
  'Scott Mullenbach': ['#F5D130', '#0C2340'],
  'Sean Wessel': ['#000000', '#8DF163'],
  'Zach Lyons': ['#FFB5B5', '#090511'],
  'Adrian Flowers': ['#FDBB30', '#860038'],
  'Zach Zettle': ['#FEE123', '#154733'],
  'Yacine Boraie': ['#DB3EB1', '#000000'],
};

function hslToHex(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const intermediate = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const match = lightness - chroma / 2;
  const segment = hue < 60 ? [chroma, intermediate, 0]
    : hue < 120 ? [intermediate, chroma, 0]
      : hue < 180 ? [0, chroma, intermediate]
        : hue < 240 ? [0, intermediate, chroma]
          : hue < 300 ? [intermediate, 0, chroma]
            : [chroma, 0, intermediate];
  return `#${segment.map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function getTeamColors(colorIndex) {
  const hue = ((colorIndex - 1) * 137.508) % 360;
  return [hslToHex(hue, 0.65, 0.48), hslToHex((hue + 180) % 360, 0.65, 0.42)];
}

function generateAndInsertMatchups(db) {
  const insertMatchup = db.prepare(
    'INSERT INTO matchups (season_id, week, home_manager_id, away_manager_id, home_score, away_score, winner_manager_id, is_playoffs, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const seasons = db.prepare('SELECT * FROM seasons WHERE year <= 2026 ORDER BY season_id ASC').all();

  db.transaction(() => {
    seasons.forEach((season) => {
      const results = db.prepare('SELECT * FROM season_results WHERE season_id = ? ORDER BY regular_season_rank ASC').all(season.season_id);
      if (!results.length) return;

      const maxWeeks = Math.max(...results.map((r) => r.wins + r.losses + r.ties));
      if (!maxWeeks) return;

      const idList = results.map((m) => m.manager_id);
      if (idList.length % 2 !== 0) idList.push(null);
      const numTeams = idList.length;
      const numRounds = numTeams - 1;

      const games = [];
      for (let week = 1; week <= maxWeeks; week++) {
        const roundIndex = (week - 1) % numRounds;
        for (let i = 0; i < numTeams / 2; i++) {
          const team1 = idList[(roundIndex + i) % (numTeams - 1)];
          let team2 = idList[(numTeams - 1 - i + roundIndex) % (numTeams - 1)];
          if (i === 0) team2 = idList[numTeams - 1];

          if (team1 !== null && team2 !== null) {
            games.push({
              seasonId: season.season_id,
              week,
              homeId: team1,
              awayId: team2,
              winnerId: team1,
              label: `Week ${week}`,
            });
          }
        }
      }

      const managerWins = new Map();
      results.forEach((r) => managerWins.set(r.manager_id, r.wins));

      const currentWins = new Map();
      results.forEach((r) => currentWins.set(r.manager_id, 0));
      games.forEach((g) => currentWins.set(g.winnerId, currentWins.get(g.winnerId) + 1));

      // Augmenting path search
      for (let step = 0; step < 1000; step++) {
        let surplus = null;
        let deficit = null;
        for (const [mId, target] of managerWins.entries()) {
          const cur = currentWins.get(mId);
          if (cur > target && !surplus) surplus = mId;
          if (cur < target && !deficit) deficit = mId;
        }
        if (!surplus || !deficit) break;

        const parent = new Map();
        const queue = [surplus];
        const visited = new Set([surplus]);

        while (queue.length > 0) {
          const u = queue.shift();
          if (u === deficit) break;

          for (const g of games) {
            if (g.winnerId === u) {
              const v = g.winnerId === g.homeId ? g.awayId : g.homeId;
              if (!visited.has(v)) {
                visited.add(v);
                parent.set(v, { prev: u, game: g });
                queue.push(v);
              }
            }
          }
        }

        if (!visited.has(deficit)) break;

        let curr = deficit;
        while (curr !== surplus) {
          const p = parent.get(curr);
          p.game.winnerId = curr;
          curr = p.prev;
        }

        currentWins.set(surplus, currentWins.get(surplus) - 1);
        currentWins.set(deficit, currentWins.get(deficit) + 1);
      }

      // Assign scores and insert
      games.forEach((g) => {
        const hRank = results.find((r) => r.manager_id === g.homeId).regular_season_rank;
        const aRank = results.find((r) => r.manager_id === g.awayId).regular_season_rank;
        const baseH = 1150 + (15 - hRank) * 20 + Math.floor(Math.random() * 60);
        const baseA = 1150 + (15 - aRank) * 20 + Math.floor(Math.random() * 60);
        if (g.winnerId === g.homeId) {
          g.homeScore = Math.max(baseH, baseA + 15);
          g.awayScore = baseA;
        } else {
          g.awayScore = Math.max(baseA, baseH + 15);
          g.homeScore = baseH;
        }
        insertMatchup.run(g.seasonId, g.week, g.homeId, g.awayId, g.homeScore, g.awayScore, g.winnerId, 0, g.label);
      });

      // Playoff games
      const playoffTeams = results.filter((m) => m.playoffs_made).sort((a, b) => a.regular_season_rank - b.regular_season_rank);
      if (playoffTeams.length >= 2) {
        const champ = playoffTeams.find((m) => m.champion) || playoffTeams[0];
        const runnerUp = playoffTeams.find((m) => m.playoff_finish === 2) || playoffTeams[1];
        if (champ && runnerUp && champ.manager_id !== runnerUp.manager_id) {
          const scoreC = 1440 + Math.floor(Math.random() * 40);
          const scoreR = 1370 + Math.floor(Math.random() * 40);
          insertMatchup.run(season.season_id, maxWeeks + 2, champ.manager_id, runnerUp.manager_id, scoreC, scoreR, champ.manager_id, 1, 'Championship');
        }
      }
    });
  })();
}

function importCanonicalData(db) {
  const rows = canonicalRows.split('\n').map((line) => {
    const [year, rank, sourceName, teamName, wins, losses, ties, playoffsMade, champion] = line.split('|');
    const seasonTeamCount = canonicalRows
      .split('\n')
      .filter((candidateLine) => Number(candidateLine.split('|')[0]) === Number(year))
      .length;
    const effectivePlayoffsMade = Number(playoffsMade) || (Number(rank) <= Math.min(8, seasonTeamCount) ? 1 : 0);
    return { year: Number(year), rank: Number(rank), sourceName, teamName, wins: Number(wins), losses: Number(losses), ties: Number(ties), playoffsMade: effectivePlayoffsMade, champion: Number(champion), playoffFinish: null };
  });
  const years = [...new Set(rows.map((row) => row.year))];
  const managers = new Map();
  rows.forEach((row) => {
    const name = identityAliases[row.sourceName] || row.sourceName;
    if (!managers.has(name)) managers.set(name, { name, firstYear: row.year });
  });

  const insertSeason = db.prepare('INSERT INTO seasons (season_id, season_number, year) VALUES (?, ?, ?)');
  const insertManager = db.prepare('INSERT INTO managers (manager_id, name, team_logo, team_color_1, team_color_2, joined_season, active) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertResult = db.prepare('INSERT INTO season_results (season_id, manager_id, manager_display_name, team_name, wins, losses, ties, playoffs_made, champion, regular_season_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  db.transaction(() => {
    years.forEach((year, index) => insertSeason.run(index + 1, index + 1, year));
    [...managers.values()].forEach((manager, index) => {
      const branding = managerBranding[manager.name];
      if (!branding) throw new Error(`Missing branding assignment for ${manager.name}`);
      const colors = legacyColors[manager.name] || getTeamColors(branding.colorIndex);
      insertManager.run(index + 1, manager.name, `fa-solid fa-${branding.logo}`, colors[0], colors[1], years.indexOf(manager.firstYear) + 1, activeManagerNames.has(manager.name) ? 1 : 0);
    });
    db.prepare("INSERT INTO award_types (award_id, code, name) VALUES (1, 'CHAMPIONSHIP', 'Championship'), (2, 'RUNNER_UP', 'Runner-Up'), (3, 'THIRD_PLACE', '3rd'), (4, 'PLAYOFF_APPEARANCE', 'Playoffs'), (5, 'BEST_REGULAR_SEASON', 'Best Regular Season'), (6, 'LAST_PLACE', 'Last Place')").run();
    rows.forEach((row) => {
      const managerName = identityAliases[row.sourceName] || row.sourceName;
      const manager = managers.get(managerName);
      const seasonId = years.indexOf(row.year) + 1;
      insertResult.run(seasonId, [...managers.keys()].indexOf(managerName) + 1, row.sourceName, row.teamName, row.wins, row.losses, row.ties, row.playoffsMade, row.champion, row.rank);
    });
  })();
  recalculateAwards(db);
  generateAndInsertMatchups(db);
}

module.exports = importCanonicalData;