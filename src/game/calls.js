// The whole night, written out.
// Each call: the caller's lines, then a dispatch decision. One option follows
// protocol and survives; the others cost you ground.

const L = (t, fx) => ({ t, fx })

export const BULLETIN = [
  {
    head: 'ROAD STATUS · 22:00',
    body: 'Route 9 / Ridge Road is plowed to the summit. It is the only lit road in the county.',
  },
  {
    head: 'MILL CREEK BRIDGE',
    body: 'Closed. Ice fracture. No vehicle or foot access east of the creek.',
  },
  {
    head: 'QUARRY ACCESS',
    body: 'Gate locked. Unmaintained since the slide.',
  },
  {
    head: 'TOWER BEACON',
    body: 'Two flashes every ten seconds. Visible from above 1,400 ft.',
  },
  {
    head: 'PROTOCOL 7',
    body: 'Never advise a caller to leave shelter in a whiteout unless a lit structure is visible within 200 yards.',
  },
  {
    head: 'PROTOCOL 9',
    body: 'Never open the exterior door to an unverified party. Verify on the landline.',
  },
  {
    head: 'PRIOR LOG · 23:58',
    body: 'E. Pruitt admitted to Cedar Hollow clinic. Hip fracture. Overnight observation.',
  },
  {
    head: 'PRIOR LOG · 00:41',
    body: 'Car 12 (Voss) dispatched to Route 9, mile 12. Plow blade sheared.',
  },
]

export const MAP = {
  viewBox: '0 0 360 300',
  roads: [
    'M 58 272 L 96 236 L 122 200 L 143 172 L 160 136 L 172 112 L 180 62 L 214 34',
    'M 74 118 L 112 138 L 143 172',
    'M 288 158 L 252 150 L 208 148 L 172 112',
    'M 96 252 L 118 224 L 143 172',
    'M 252 150 L 268 104 L 262 60',
  ],
  river: 'M 250 14 L 246 78 L 252 150 L 238 212 L 258 292',
  points: {
    tower: { x: 180, y: 62, label: 'RELAY', sub: 'KETTLE RIDGE' },
    substation: { x: 172, y: 112, label: 'SUBSTATION', sub: 'LIT' },
    cedar: { x: 74, y: 118, label: 'CEDAR HOLLOW', sub: 'CARE HOME' },
    mile12: { x: 143, y: 172, label: 'MILE 12', sub: 'CAR 12' },
    millcreek: { x: 288, y: 158, label: 'MILL CREEK RD', sub: 'RESIDENCE' },
    quarry: { x: 96, y: 252, label: 'QUARRY', sub: 'GATE LOCKED' },
    ridge: { x: 150, y: 214, label: "SURVEYOR'S RIDGE", sub: 'UNMARKED' },
  },
  bridge: { x: 252, y: 150 },
}

export const CALLS = [
  {
    id: 'marge',
    clock: '02:19',
    caller: 'MARGE HALLOWAY',
    callerSub: 'CEDAR HOLLOW CARE HOME',
    channel: 'EXT 214',
    marker: 'cedar',
    voice: { rate: 0.9, pitch: 1.18 },
    lines: [
      L('Dispatch? It\'s Marge at Cedar Hollow. I\'m sorry, honey, I know it\'s late.'),
      L('I\'ve got a resident standing out in the parking lot. Mr. Halloran. He\'s in his robe, no coat, no shoes.'),
      L('He won\'t come in. He\'s just facing the tree line. Like he\'s waiting for somebody.'),
      L('There\'s a man out in the trees. Tall. I can\'t see his face, he\'s got a hood up. Mr. Halloran is talking to him.'),
      L('Honey, Mr. Halloran had a stroke in March. He hasn\'t walked unaided in two years.'),
      L('The man\'s mouth is moving but I don\'t hear anything. And Mr. Halloran keeps nodding.'),
    ],
    prompt: 'The lot is ice. Marge is sixty-eight and alone on shift.',
    options: [
      {
        key: 'A',
        text: 'Get him inside yourself. Right now, before he freezes.',
        result: [
          'Marge sets the phone down. You hear the door, the wind, her slippers on the ice.',
          'Forty seconds of static. Then breathing that isn\'t hers.',
          'At 02:44 the county log records an open line from Cedar Hollow: no voices, only wind, and a sound like a robe being folded.',
        ],
        lost: 'MARGE — line open, no response',
        consequence: 'Cedar Hollow called back at 02:41. Nobody spoke. The night nurse\'s chair is empty and the front door is standing open.',
      },
      {
        key: 'B',
        text: 'Lock every door. Stay inside. Watch him from the window.',
        correct: true,
        result: [
          'Marge locks the deadbolt, the chain, the kitchen door. You hear each one.',
          'Mr. Halloran walks into the trees without bending his knees. The tall man doesn\'t turn around.',
          'She counts her residents twice. Eleven. The chart says twelve. Mr. Halloran is in his bed, asleep, robe still on the hook.',
          'She whispers: "Honey, who did I just watch walk out of my parking lot?"',
        ],
        resolved: 'CEDAR HOLLOW — contained',
      },
      {
        key: 'C',
        text: 'Send someone from the kitchen out to grab him.',
        result: [
          'Marge: "The kitchen girl went home at eleven. There\'s nobody here but me and eleven sleepers."',
          'She goes out anyway. You hear her call his name once, twice.',
          'Then the line clicks. The carrier stays open for six minutes. Nothing on it but wind.',
        ],
        lost: 'MARGE — line open, no response',
        consequence: 'Cedar Hollow has gone quiet. Their night line rings out. You keep the receiver off the hook so you don\'t have to hear it.',
      },
    ],
  },
  {
    id: 'voss',
    clock: '02:34',
    caller: 'DANNY VOSS',
    callerSub: 'CAR 12 · ROUTE 9, MILE 12',
    channel: 'CH 4',
    marker: 'mile12',
    voice: { rate: 1.05, pitch: 0.82 },
    lines: [
      L('Dispatch, Voss. Car 12. I\'m at mile twelve on Ridge and my engine just quit. Battery\'s fine. Everything\'s fine. It just quit.'),
      L('There\'s something walking the tree line. Keeping pace with me. Same speed I walk. Same speed I stop.'),
      L('It\'s not in the trees. It\'s on the road now. It\'s standing in my headlights.'),
      L('It\'s got a hood. Like a parka. Like my parka. It doesn\'t have a face, dispatch, it\'s got a—'),
      L('...the substation light up on the ridge is on. I can see it through the pines. Maybe a hundred yards.'),
      L('It\'s doing my door handle. Left, right, left. It knows the order.'),
    ],
    prompt: 'Engine dead. One hundred yards of open snow to the substation light.',
    options: [
      {
        key: 'A',
        text: 'Stay in the cab. Lock the doors and wait for the plow.',
        result: [
          'He locks the doors. You hear the handle move left, right, left.',
          'Then the window. Then the handle again, in the same order, patient as a man checking a list.',
          'The last thing on the channel is Danny saying, very quietly, "It\'s not trying to get in. It\'s teaching me the order."',
        ],
        lost: 'CAR 12 — signal lost',
        consequence: 'The county radio is picking up a door handle. Left, right, left. It has been doing it for eleven minutes on an empty channel.',
      },
      {
        key: 'B',
        text: 'Get out. Walk uphill to the substation. It\'s lit, it\'s a hundred yards. Do not look back.',
        correct: true,
        result: [
          'He runs. You keep the channel open and count his breaths for him.',
          'Ninety-four yards. The substation light is sodium orange and it is the best thing you have ever heard of.',
          'He gets the door. He sits down against the transformer and cries, and the line goes to hissing.',
          '"It stopped at the fence," he says. "It\'s just standing there. It\'s waiting for someone to turn a light on."',
        ],
        resolved: 'CAR 12 — sheltered at substation',
      },
      {
        key: 'C',
        text: 'Walk north on Ridge Road. The tower is two miles up and we keep it lit.',
        result: [
          'Two miles in a whiteout. He doesn\'t argue. That\'s the worst part.',
          'At 02:58 you hear him say "I can see the beacon." At 03:01: "It\'s between me and the beacon."',
          'Then the crunch of snow, very close to the receiver, in a rhythm that is not his.',
        ],
        lost: 'CAR 12 — signal lost',
        consequence: 'Ridge Road is reporting a set of tracks that start at mile twelve and stop halfway up. No return prints.',
      },
    ],
  },
  {
    id: 'ellie',
    clock: '02:51',
    caller: 'ELLIE PRUITT',
    callerSub: 'MILL CREEK ROAD · RESIDENCE',
    channel: '911 · LINE 3',
    marker: 'millcreek',
    voice: { rate: 1.12, pitch: 1.32 },
    lines: [
      L('Is this the police? My mom\'s at the clinic with my dad. I\'m by myself and the power went out.'),
      L('There\'s somebody knocking. He says he\'s my dad. He sounds exactly like my dad.'),
      L('But my dad\'s at the clinic. He broke his hip. Mom called at midnight and said they were keeping him.'),
      L('He\'s saying my name. He\'s saying it the way dad says it when he\'s angry. Please.'),
      L('The knocking stopped. It\'s at the kitchen window now. It\'s asking me to turn off the light.'),
    ],
    prompt: 'She is fourteen. The bridge is out. The line is still open.',
    options: [
      {
        key: 'A',
        text: 'Answer the door. If it\'s really him, he\'ll prove it.',
        result: [
          'She puts the phone down. You hear the bolt slide.',
          'For eleven seconds the line is open and quiet, and then a man\'s voice says her name, softly, the way a father would.',
          'She says "Dad?" and the receiver is picked back up and set down very carefully, and nobody speaks again.',
        ],
        lost: 'MILL CREEK — line open, no response',
        consequence: 'Mill Creek Road has an open line. The tape has a man\'s voice on it, repeating a name, getting the vowels wrong by the fourth repetition.',
      },
      {
        key: 'B',
        text: 'Go to the cellar. Take the phone. No lights, no sound, and don\'t answer him again.',
        correct: true,
        result: [
          'She takes the cordless down the cellar stairs and pulls the door shut. You hear her breathing under the floorboards of her own house.',
          'Above her, the kitchen window opens. Something steps in. It walks the length of the kitchen, stops at the cellar door, and waits.',
          'It waits for nine minutes. She does not answer it. Then it leaves through the front door and closes it politely behind itself.',
          'At 03:07 her mother calls the landline. Ellie is still in the cellar, holding the phone with both hands.',
        ],
        resolved: 'ELLIE PRUITT — safe in cellar',
      },
      {
        key: 'C',
        text: 'Get out the back and run to the neighbour\'s. It\'s a quarter mile.',
        result: [
          'The bridge is out and she doesn\'t know it. You do. You tell her to run anyway.',
          'She counts her steps for you. At two hundred she says the snow is too deep. At three hundred she stops counting.',
          'The line stays open. Wind. Then a sound like a coat being taken off a hook.',
        ],
        lost: 'MILL CREEK — signal lost',
        consequence: 'There is a set of small boot prints on Mill Creek Road, heading east, that stop in the middle of an open field.',
      },
    ],
  },
  {
    id: 'walt',
    clock: '03:12',
    caller: 'WALT PRUITT',
    callerSub: 'UNREGISTERED · RIDGE ABOVE QUARRY',
    channel: 'CH 2 · CARRIER OPEN',
    marker: 'ridge',
    voice: { rate: 0.86, pitch: 0.72 },
    lines: [
      L('This is Walt Pruitt. I\'m on the ridge above the quarry. Don\'t send anybody. I\'m not the one who needs help tonight.'),
      L('I surveyed this county for forty-one years. I know what snow does to sound. Tonight it\'s doing something else.'),
      L('Every call you\'ve taken — they\'re all describing the same thing. Same height. Same coat. It walks one line, operator. It has walked that line since 1979.'),
      L('My brother answered it that year. He opened a door in a blizzard and said, "You\'re home early."'),
      L('It doesn\'t hunt. It follows what\'s lit. A porch light, a headlight, a beacon. That\'s how it finds a road.'),
      L('Your tower is the brightest thing in this county. Kill the beacon. Sixty seconds. Let it lose the road. I\'ll tell you when it\'s done.'),
    ],
    prompt: 'The beacon is the only navigation aid left in the county.',
    options: [
      {
        key: 'A',
        text: 'Kill the beacon. Sixty seconds. Counting for you.',
        correct: true,
        result: [
          'The relay room goes dark. On the map, the tower light stops blinking for the first time in thirty years.',
          'Walt counts with you. At forty: "It\'s stopped." At fifty: "It\'s just standing in the field. It\'s looking at the dark like a dog that lost a scent."',
          'At sixty the beacon comes back. Walt breathes out. "It\'s walking away. South, toward the quarry. Thank you, operator."',
          'A pause. Then, quietly: "Son — it just turned around. It\'s looking uphill. At your building."',
        ],
        resolved: 'BEACON — 60s dark, entity redirected',
      },
      {
        key: 'B',
        text: 'Keep it lit. Walk toward the beacon, Walt. You\'ll be safe in the tower.',
        result: [
          'He laughs at that, and it is not a good laugh.',
          '"You\'re not listening. The light is the road. You\'re telling me to walk up the road it\'s already on."',
          'You watch the beacon blink twice. Then twice more, off-rhythm, like something is standing in front of it.',
          'Walt\'s channel goes to carrier. The carrier keeps time with the blinking.',
        ],
        lost: 'WALT PRUITT — signal lost',
        consequence: 'The beacon is blinking off-rhythm now. Two flashes, then a pause that is a little too long, then two more.',
      },
      {
        key: 'C',
        text: 'Hold position. I\'m calling the sheriff.',
        result: [
          'Walt: "There\'s no sheriff tonight. There\'s a plow in a ditch and a kid on a phone and you."',
          'You call anyway. The line rings out. You call again. Somebody picks up and breathes.',
          'Walt\'s channel is still open when the breathing on the sheriff\'s line stops.',
        ],
        lost: 'WALT PRUITT — signal lost',
        consequence: 'The sheriff\'s line is off the hook. Every time you pick up the dispatch phone, you can hear snow.',
      },
    ],
  },
  {
    id: 'door',
    clock: '03:31',
    caller: 'MARGE HALLOWAY',
    callerSub: 'CEDAR HOLLOW CARE HOME',
    channel: 'EXT 214 · LINE DEAD',
    marker: 'tower',
    voice: { rate: 0.82, pitch: 1.1 },
    lines: [
      L('Dispatch. It\'s Marge. Honey, I\'m at your door.', 'static'),
      L('It\'s so cold out here. The plow never came. You said the plow would come.'),
      L('Open the door. I brought Mr. Halloran back with me. He wants to say thank you for the advice.'),
      L('He\'s standing right behind me. He\'s very tall now.'),
      L('...it\'s using my mouth. Don\'t listen to the words. Look at the—', 'static'),
      L('[OPEN CARRIER] The exterior light is on. There is a shape in it.', 'static'),
    ],
    prompt: 'The caller ID says Cedar Hollow. You disconnected that line eleven minutes ago.',
    options: [
      {
        key: 'A',
        text: 'Open the door. She\'s freezing to death out there.',
        fatal: true,
        result: [
          'You cross the relay room. The floor is cold through your socks. You put your hand on the bar.',
          'The door opens easily. There is nothing in the doorway but snow, and the snow is the wrong shape.',
          'The log continues for six more minutes. It is written in your handwriting.',
        ],
        lost: 'RELAY — exterior door opened',
      },
      {
        key: 'B',
        text: 'Say nothing. Cut the exterior lights and the intercom. Call Cedar Hollow on the landline.',
        correct: true,
        result: [
          'You kill the floodlights. The shape at the door is gone the moment there is nothing to stand in.',
          'The landline rings twice. Marge answers from her kitchen, wide awake, annoyed: "I never called you twice, honey. I\'ve been doing the med cart."',
          'You check the door camera. It is static. Then, three knocks — patient, unhurried — and the sound of boots walking away across gravel.',
          'The camera clears. There are no prints in the snow.',
        ],
        resolved: 'RELAY — door verified, line silent',
      },
      {
        key: 'C',
        text: 'Ask it something only Marge would know.',
        result: [
          'You ask for her husband\'s name. It answers. Her maiden name. It answers. The name of the dog she buried in 2019. It answers.',
          'There is a pause on the line, and then it says your name, and your mother\'s name, and the street you grew up on.',
          '"I know the shape of the answer," it says, in Marge\'s voice. "I have been collecting them all night."',
        ],
        lost: 'RELAY — caller verified itself',
        consequence: 'Something on the switchboard knows your mother\'s maiden name. The line is still open. It is humming.',
      },
    ],
  },
  {
    id: 'deadair',
    clock: '03:52',
    caller: 'UNKNOWN',
    callerSub: 'INTERNAL · RELAY ROOM',
    channel: 'CH 1 · SELF',
    marker: 'tower',
    voice: { rate: 0.8, pitch: 0.9 },
    lines: [
      L('[OPEN CARRIER] Wind. The room tone of your own relay room, eight seconds behind.', 'static'),
      L('Dispatch, this is the operator.', 'static'),
      L('I\'m at the door. I\'ve been at the door for six minutes. I need you to answer me.'),
      L('If nobody answers, it has to keep walking. That\'s the rule. That\'s the whole rule.'),
      L('Don\'t answer. Don\'t answer. Don\'t—', 'static'),
      L('[SWITCHBOARD] No carrier. No caller. The transmitter is asking you to go off-air.', 'static'),
    ],
    prompt: 'Every light in the county is listening. Dawn is eight minutes out.',
    options: [
      {
        key: 'A',
        text: 'Answer. It\'s your voice. It has to be you.',
        result: [
          'You key the mic and say hello.',
          'The room answers you in your own voice, from the speaker, half a second late — the way a room does when it has learned the shape of you.',
          'Then the door handle moves. Left, right, left.',
        ],
        lost: 'RELAY — answered',
        fatal: true,
      },
      {
        key: 'B',
        text: 'Cut the transmitter. Kill the lights. Dead air until dawn.',
        correct: true,
        result: [
          'You pull the breaker. The relay room goes black except for the clock and the meter.',
          'Ninety seconds of nothing. Wind in the mast. The radiator ticking as it cools.',
          'One knock at the door. You do not move. Your own breathing, and under it, someone else, keeping time.',
          'At 04:00 the wind drops. The clock turns over. The door does not knock again.',
        ],
        resolved: 'DEAD AIR — 04:00',
      },
      {
        key: 'C',
        text: 'Broadcast an all-call. Wake the whole county, tell them to kill their lights.',
        result: [
          'You key the county channel and tell them to go dark. It is the right advice, nine minutes too late.',
          'Across Kettle Ridge, porch lights come on. People step outside to see what the emergency is.',
          'Every lit window answers. The switchboard lights up with calls you cannot pick up fast enough.',
        ],
        lost: 'COUNTY — all-call',
        fatal: true,
      },
    ],
  },
]

export const OPENING = {
  lines: [
    '02:14 AM. KETTLE RIDGE RELAY. COUNTY EMERGENCY DISPATCH.',
    'The plow convoy is stuck at the pass. Power is on backup. You are the only operator on shift.',
    'Every call tonight routes to you. Listen. Cross-reference the board. Send help.',
    'And whatever you hear — do not go outside.',
  ],
}

export const ENDINGS = {
  dawn: {
    tag: 'SURVIVED',
    title: '04:00',
    lines: [
      'The wind drops all at once, the way it does when a storm decides it is finished.',
      'The plow finds the access road at 06:20. Danny is asleep in the substation with the door barred. Ellie is asleep in a cellar. Marge is doing her med cart and will not talk about the parking lot.',
      'The county logger holds a tape for the night. Six minutes of it are yours: static, a beacon, your voice telling people to stay inside.',
      'Four minutes are not. On those, you can hear yourself breathing. And under that, someone else, keeping time.',
    ],
  },
  breach: {
    tag: 'SIGNAL LOST',
    title: 'DEAD AIR',
    lines: [
      'The meter redlines. Every light in the tower comes on at once — the floods, the beacon, the little bulb over the door.',
      'The log continues for six more minutes. It is written in your handwriting. It is very calm.',
      'At 04:00 the county logger records a final transmission from Kettle Ridge Relay: a man breathing, and a door closing, politely, from the inside.',
    ],
  },
  door: {
    tag: 'SIGNAL LOST',
    title: 'THE DOOR',
    lines: [
      'You open the door because the voice on the line is cold and afraid and it knows your name.',
      'There is nothing in the doorway but snow, and the snow is the wrong shape.',
      'The beacon keeps blinking for the rest of the night. Two flashes every ten seconds, over an empty building, for nobody.',
    ],
  },
}
