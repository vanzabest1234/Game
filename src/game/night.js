// One night on Kettle County's roads, written out.
// Each address has a call you make from the car, then a choice:
// go in and handle it, or stay put and disclose it to dispatch.
// One of those two is right. Getting it wrong costs you.

const L = (t, fx) => ({ t, fx })

export const NIGHT = {
  opening: {
    lines: [
      '02:14. KETTLE COUNTY NIGHT DESK. UNIT 7, COUNTY CAR.',
      'The plow convoy is stuck at the pass. Power is on backup. You are the only unit on the road.',
      'Dispatch sends you an address. You drive. You call. You decide whether to go in.',
      'Go in and handle it. Or stay in the car and disclose the call. Get it wrong and someone pays.',
      'Do not leave the vehicle in a whiteout. Do not open a door to an unverified party. Those are the rules until they stop making sense.',
    ],
  },

  calls: [
    {
      id: 'halloway',
      clock: '02:19',
      caller: 'MARGE HALLOWAY',
      callerSub: 'CEDAR HOLLOW CARE HOME',
      address: '14 PINE HOLLOW RD · CEDAR HOLLOW',
      channel: 'EXT 214',
      voice: { piper: 'en_US-amy-medium', rate: 0.94, pitch: 1.18 },
      lines: [
        L("Unit 7, this is Marge at Cedar Hollow. I know you're the only one out tonight."),
        L("I've got Mr. Halloran standing out in the lot. Robe, no shoes, facing the trees."),
        L("He hasn't walked unaided since March. I'm watching him do it now."),
        L("There's a man in the treeline. Tall. Hood up. Mr. Halloran is talking to him."),
        L("The man's mouth is moving but I can't hear a thing. Please. I'm sixty-eight and I'm alone."),
        L('I put the porch light on for you. Hurry.'),
      ],
      arrive: 'Mr. Halloran is thirty feet from the treeline. Your headlights stop at the snow.',
      right: 'enter',
      enter: {
        scene: 'porch',
        intro: [
          'The door handle is cold enough to stick to your palm.',
          'Thirty feet of snow between you and an old man in a bathrobe. The treeline is closer than it was.',
        ],
        actions: [
          {
            key: 'A',
            label: 'TAKE HIS ARM. WALK HIM INSIDE.',
            result: [
              'He is cold the way a fence post is cold. He turns his head too far and smiles with the wrong half of his face.',
              'You let go. He walks into the trees without bending his knees.',
            ],
            consequence: 'Marge locks the door behind you. She does not stop crying until dawn.',
          },
          {
            key: 'B',
            label: 'SAY HIS NAME. TELL HIM THE SHIFT IS OVER.',
            correct: true,
            result: [
              'He blinks. "Already?" he says, like you woke him from a nap.',
              'You walk him in. Marge throws the deadbolt, the chain, the kitchen door.',
              'She counts her residents twice. Eleven. The chart says twelve. Mr. Halloran is asleep in his bed, robe still on the hook.',
            ],
          },
          {
            key: 'C',
            label: 'SHINE THE LIGHT AT THE TREELINE.',
            result: [
              'The beam finds a man-shaped absence between two pines. It does not move.',
              'Then it is closer. You back to the car and keep the light on it the whole way.',
            ],
            consequence: 'The treeline is a little nearer the building than it was.',
          },
        ],
      },
      disclose: {
        radio: 'DISPATCH: "Cedar Hollow, welfare check, no contact. Plow is four hours out."',
        result: [
          'You key the desk and log it. Protocol says stay in the vehicle.',
          'By the time you finish the sentence, the lot is empty and the porch light is off.',
        ],
        consequence: "Cedar Hollow's night line rings out for the rest of the shift.",
      },
    },

    {
      id: 'voss',
      clock: '02:34',
      caller: 'DANNY VOSS',
      callerSub: 'CAR 12 · ROUTE 9, MILE 12',
      address: 'ROUTE 9 · MILE 12 · RIDGE ROAD',
      channel: 'CH 4',
      voice: { piper: 'en_US-ryan-medium', rate: 1.03, pitch: 0.82 },
      lines: [
        L("Unit 7, Voss, Car 12. Mile twelve on Ridge. My engine just quit. Battery's fine. Everything's fine."),
        L("Something's walking the tree line. Keeping pace. Same speed I walk. Same speed I stop."),
        L("It's on the road now. Standing in my headlights. Hood up. Like my parka."),
        L("It's doing my door handle. Left, right, left. It knows the order."),
        L('I can see the substation light through the pines. Hundred yards. Maybe.'),
        L("Unit 7 — if you're close, don't get out. Do you hear me? Don't get out."),
      ],
      arrive: 'Car 12 is dark. Driver door open. Dome light on. Nobody inside.',
      right: 'disclose',
      enter: {
        scene: 'car',
        intro: [
          'You get out. The cold takes the hinge of your jaw.',
          'The dome light is on in an empty cab. The mic is keyed. Somewhere close, a man is breathing into it.',
        ],
        actions: [
          {
            key: 'A',
            label: "CHECK THE CAB. THE RADIO'S STILL WARM.",
            result: [
              'The cab smells like the inside of a coat. The heater is off. The seat is warm in the shape of a man who left in a hurry.',
              'The mic is keyed. The breathing stops when your hand touches it.',
            ],
            consequence: 'Something learns the sound of your breath on an open channel.',
          },
          {
            key: 'B',
            label: 'FOLLOW THE FOOTPRINTS UPHILL.',
            result: [
              'The prints go up the middle of the road, one stride apart, and stop in the shape of a man standing still.',
              'You are standing in the second shape when the wind drops.',
            ],
            consequence: 'Ridge Road reports a set of tracks with no return prints.',
          },
          {
            key: 'C',
            label: 'GET BACK IN THE CAR. LOCK IT.',
            correct: true,
            result: [
              'You get back in. In the mirror, the back seat is occupied.',
              "By the time you look, it isn't. The door handle moves, left, right, left.",
            ],
            consequence: "Car 12's channel stays open all night. Nobody speaks on it.",
          },
        ],
      },
      disclose: {
        radio: 'DISPATCH: "Car 12, mile twelve, vehicle abandoned, pedestrian on the roadway. Send the plow."',
        result: [
          'You stay in the car with the doors locked and the engine running.',
          'Eleven minutes later Danny answers from the substation, hoarse: "It stopped at the fence. It\'s just standing there. It\'s waiting for someone to turn a light on."',
        ],
      },
    },

    {
      id: 'ellie',
      clock: '02:51',
      caller: 'ELLIE PRUITT',
      callerSub: 'MILL CREEK ROAD · RESIDENCE',
      address: 'MILL CREEK RD · PRUITT RESIDENCE',
      channel: '911 · LINE 3',
      voice: { piper: 'en_US-amy-medium', rate: 1.1, pitch: 1.32 },
      lines: [
        L("Is this the police? My mom's at the clinic with my dad. I'm by myself and the power went out."),
        L("There's somebody knocking. He says he's my dad. He sounds exactly like my dad."),
        L('But my dad broke his hip. Mom called at midnight. They kept him.'),
        L("He's saying my name the way dad says it when he's angry."),
        L("The knocking stopped. He's at the kitchen window. He's asking me to turn off the light."),
        L("Please. The bridge is out, isn't it. You're not coming, are you."),
      ],
      arrive: 'The Pruitt house. One window lit. The bridge behind you is a black shape in the snow.',
      right: 'enter',
      enter: {
        scene: 'porch',
        intro: [
          'You leave the headlights on and walk up the drive. The porch step gives under you like a bad tooth.',
          'Inside, a girl is saying "I\'m not supposed to talk to you" through the door.',
        ],
        actions: [
          {
            key: 'A',
            label: "KNOCK. SAY YOU'RE COUNTY.",
            correct: true,
            result: [
              'She opens the door two inches, then all the way. You get her into the cellar with the cordless phone.',
              'Above you, the kitchen window opens. Something walks the length of the kitchen, stops at the cellar door, and waits.',
              'It waits nine minutes. She does not answer it. Then it leaves through the front door and closes it politely behind itself.',
            ],
          },
          {
            key: 'B',
            label: 'GO ROUND BACK. LOOK IN THE WINDOW.',
            result: [
              'Ellie is at the table with the phone. Behind her, a tall shape is learning the shape of her shoulders.',
              'It turns to the glass. It sees you seeing it.',
            ],
            consequence: 'The kitchen window is open when you get back to the car.',
          },
          {
            key: 'C',
            label: 'SHOUT HER NAME FROM THE PORCH.',
            result: [
              'A girl\'s voice answers from inside — "Coming!" — half a second before Ellie\'s real voice screams from the cellar to stay out.',
            ],
            consequence: "Two girls' voices argue in the walls of the Pruitt house for the rest of the night.",
          },
        ],
      },
      disclose: {
        radio: 'DISPATCH: "Pruitt residence, possible intruder, bridge impassable. Requesting second unit."',
        result: [
          'They tell you to hold the line and stay put. You hold. You stay put.',
          'At 03:06 the lit window goes dark. At 03:07 the line goes to carrier.',
        ],
        consequence: 'There are small boot prints on Mill Creek Road that stop in the middle of an open field.',
      },
    },

    {
      id: 'walt',
      clock: '03:12',
      caller: 'WALT PRUITT',
      callerSub: 'RIDGE ABOVE THE QUARRY',
      address: 'QUARRY ACCESS GATE · RIDGE ABOVE',
      channel: 'CH 2 · CARRIER OPEN',
      voice: { piper: 'en_US-ryan-medium', rate: 0.86, pitch: 0.72 },
      lines: [
        L("Unit 7. Walt Pruitt. I'm on the ridge above the quarry. Don't send anybody."),
        L("I surveyed this county forty-one years. I know what snow does to sound. Tonight it's doing something else."),
        L('Every call tonight is describing the same thing. Same height. Same coat. It follows what\'s lit.'),
        L('Your depot is the brightest thing in the county. Kill the beacon. Sixty seconds.'),
        L("I'll count for you. I can see the tower from here."),
        L('But Unit 7 — if you come up here, bring no light. None.'),
      ],
      arrive: "The quarry gate. Walt's truck is here. Up the ridge, a lantern is moving where no one should be walking.",
      right: 'disclose',
      enter: {
        scene: 'ridge',
        intro: [
          'You leave the car dark and climb. The snow takes your boots to the ankle.',
          'The lantern is patient. It keeps the same distance, the way a thing does when it wants to be followed.',
        ],
        actions: [
          {
            key: 'A',
            label: 'CLIMB THE RIDGE. KEEP THE LANTERN LOW.',
            correct: true,
            result: [
              "You climb. The lantern is not Walt's. It is a coat with a light in it, and it has been walking the same line since 1979.",
              'It stops. You stop. It waits for you to take one more step.',
            ],
            consequence: 'You come back down with snow in your coat and no memory of the last hundred yards.',
          },
          {
            key: 'B',
            label: 'CALL OUT FOR WALT.',
            result: [
              'Your voice goes out over the snow and comes back a half-second late, in a shape that is almost yours.',
              'Up the ridge, the lantern answers with your voice.',
            ],
            consequence: 'The quarry channel repeats your name every eleven minutes.',
          },
          {
            key: 'C',
            label: 'TAKE THE LANTERN FROM THE TRUCK.',
            result: [
              "You lift Walt's lantern off the seat. Up on the ridge, the other light stops moving.",
              'Then it turns toward you.',
            ],
            consequence: 'Two lights on the ridge now. One of them is coming down.',
          },
        ],
      },
      disclose: {
        radio: 'DISPATCH: "Relay, kill the beacon. Sixty seconds. On my mark."',
        result: [
          'You stay in the car and key the relay. The tower goes dark for the first time in thirty years.',
          'Walt counts with you. At forty: "It\'s stopped." At fifty: "It\'s just standing in the field." At sixty the beacon comes back.',
          '"It\'s walking south," he says. "Thank you, Unit 7." A pause. "Son — it just turned around. It\'s looking uphill. At your building."',
        ],
      },
    },

    {
      id: 'deadair',
      clock: '03:52',
      caller: 'UNKNOWN',
      callerSub: 'INTERNAL · YOUR DEPOT',
      address: 'KETTLE RIDGE RELAY · YOUR DEPOT',
      channel: 'CH 1 · SELF',
      voice: { piper: 'en_US-ryan-medium', rate: 0.92, pitch: 0.9 },
      lines: [
        L('Unit 7. Unit 7. This is the night desk.', 'static'),
        L('We have an address for you. Kettle Ridge Relay. Your depot.'),
        L("The caller says he's the operator. He says he's been at the door for six minutes."),
        L("He says if nobody answers, it has to keep walking. That's the rule."),
        L('Unit 7, do not go inside. Do you copy? Do not—', 'static'),
        L('[SWITCHBOARD] The transmitter is asking you to go off-air.', 'static'),
      ],
      arrive: 'Your own depot. The porch light is on. There is a shape in it.',
      right: 'disclose',
      enter: {
        scene: 'porch',
        intro: [
          'You walk up your own access road. Your boots know the way.',
          'The shape in the porch light is exactly your height. It is holding the door for you.',
        ],
        actions: [
          {
            key: 'A',
            label: 'OPEN THE DOOR.',
            fatal: true,
            result: [
              'You put your hand on the bar. The door opens easily.',
              'There is nothing in the doorway but snow, and the snow is the wrong shape.',
            ],
          },
          {
            key: 'B',
            label: 'LOOK THROUGH THE WINDOW.',
            fatal: true,
            result: [
              'Inside, the relay room is exactly as you left it. The clock says 03:52.',
              'A man is sitting at your desk with his back to the glass. He is writing in your log. He is very calm.',
            ],
          },
          {
            key: 'C',
            label: "KNOCK. SAY IT'S YOU.",
            fatal: true,
            result: [
              'The shape steps aside and lets you knock on your own door.',
              'From inside, your voice says, "Come in. You\'re home early."',
            ],
          },
        ],
      },
      disclose: {
        radio: 'DISPATCH: "Unit 7, no contact. Going dark until dawn."',
        result: [
          'You kill the headlights and sit in the cold with your hands on the wheel.',
          'The shape stays in the porch light, patient as a coat on a hook.',
          'At 04:00 the wind drops all at once, the way it does when a storm decides it is finished.',
          'When you look up, the porch light is off. There is no shape. There is no light.',
        ],
      },
    },
  ],

  endings: {
    dawn: {
      tag: 'SHIFT COMPLETE',
      title: '04:00',
      scene: 'dawn',
      lines: [
        "The plow finds the access road at 06:20. You are asleep in the driver's seat with the engine off and the keys in your hand.",
        'Marge is doing her med cart. Danny is at the substation. Ellie is in a cellar with the cordless phone. Walt is on the ridge, watching the quarry.',
        'The county logger holds a tape for the night. Six minutes of it are yours: a beacon, a bridge, your voice telling people to stay inside.',
        'Four minutes are not. On those, you can hear yourself breathing. And under that, someone else, keeping time.',
      ],
    },
    breach: {
      tag: 'SIGNAL LOST',
      title: 'DEAD AIR',
      scene: 'dawn',
      lines: [
        'Three times tonight you chose wrong, and the county kept a receipt for each one.',
        'The interference climbs past the top of the dial. Every light on the ridge comes on at once.',
        'The log continues for six more minutes. It is written in your handwriting. It is very calm.',
      ],
    },
    door: {
      tag: 'SIGNAL LOST',
      title: 'THE DOOR',
      scene: 'porch',
      lines: [
        'You opened the door because the voice was cold and afraid and it knew your name.',
        'There is nothing in the doorway but snow, and the snow is the wrong shape.',
        'The beacon keeps blinking for the rest of the night. Two flashes every ten seconds, over an empty depot, for nobody.',
      ],
    },
  },
}

export const MAX_MESS_UPS = 3
