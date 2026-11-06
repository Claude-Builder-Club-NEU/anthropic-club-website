/**
 * The Saturday workshops, open to the public as well as the hackers. One list
 * feeds both the timeline (src/lib/schedule.js makes a marker for each hour)
 * and the Workshops section (src/components/Workshops.jsx), so they cannot
 * disagree.
 *
 * Times, rooms and descriptions are the Workshops tab of the master sheet,
 * which wins over Partiful where the two disagree. `title` is the sheet's or
 * the Partiful event's name, so a visitor lands on the name they clicked; the
 * VC Panel keeps its longer name here.
 * `rsvp` is null where the sheet has no link, and the row then has no button.
 *
 * AI in Clinical and Admin Settings is at 2 PM from the organizers, though its
 * Partiful still says 1:30 PM.
 *
 * A session is { time, title, host, room, format, rsvp }, and may add `about`,
 * the description under the host, where a line break starts a new line.
 * `time` is 24-hour, as the schedule's rows are, and every session is on
 * Saturday.
 */
const FORMATS = { workshop: "WORKSHOP", fireside: "FIRESIDE CHAT", panel: "PANEL" };

const partiful = (id) => `https://partiful.com/e/${id}`;

export const WORKSHOPS = [
  {
    time: "14:00",
    title: "AI in Clinical and Admin Settings",
    host: "Abhinav Shrivastava, Founding Engineer at Ambra",
    about:
      "Abhinav Shrivastava, Founding Engineer at Ambra, will guide us all through how AI can solve one of the biggest problems for Americans: Healthcare. He will share some of his work building clinical AI systems for Ambra AI.",
    room: "Virtual",
    format: FORMATS.workshop,
    rsvp: partiful("3GTZttKQBMUOkN2NU5nA"),
  },
  {
    time: "14:00",
    title: "Fintech",
    host: "Disrupt",
    about:
      "Our workshop is Fintech Business Models, which is focused on understanding how financial technology companies create, deliver, and capture value. We will explore what makes up a business model, including identifying target customers, understanding their needs, finding value chains, and examining revenue and cost structures. This workshop will help us understand how fintech companies generate revenue, build partnerships, and create sustainable businesses in the financial technology industry.",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("51eo6VoN723aZcSFF19r"),
  },
  {
    time: "14:00",
    title: "Product Viability",
    host: "FuzionX",
    about:
      "Could your weekend project become a startup? Most hackathon projects work in the demo but can't answer the judges' toughest question: would anyone actually use this? In this hands-on workshop, you'll stress-test an idea live with the room, then look at your own project from both a business and a technology angle to sharpen what you're building. Whether you're still picking an idea or already coding, you'll walk away with a more defined product and more concrete strategies to assess product viability. Led by FuzionX, a Boston-based venture development firm that co-builds AI-native software and solutions companies with early-stage founders, taking them from idea to commercial viability and first institutional funding.",
    room: "Curry 346",
    format: FORMATS.workshop,
    rsvp: partiful("ToaofvVUOn2G8YDkXxaX"),
  },
  {
    time: "15:00",
    title: "Physical AI in Medical Devices - Laza Medical",
    host: "Puja Chaudhary",
    about:
      "Puja Chaudhary, a Robotics Software Engineer at Laza Medical, will take us through how AI is changing the physical world, and how she is building it.",
    room: "Virtual",
    format: FORMATS.workshop,
    rsvp: partiful("AxR7V1GkOTx8srPcz3TB"),
  },
  {
    time: "15:00",
    title: "How to Win a Hackathon",
    host: "Troy, Mouad and Ryan, moderated by Smyan",
    about:
      "Two HackMIT winners and a founder who just raised $1M. One hour. Steal everything. The people who've actually done it break down what separates a winning project from a pile of half-finished code: picking the idea, splitting up the team, surviving hour 18, and nailing the demo.\n\nPanelists:\n• Troy Gunawardene, Northeastern CS + Business. Won the entertainment track at HackMIT 2025 with EyeCraft, a Minecraft mod you control with your face, built for players with limited mobility. Founder of GradeScout.\n• Mouad Tiahi, Northeastern CS + Physics. One of MLH's Top 50 Hackers of 2025, the first Northeastern student ever on the list. Won the sustainability track at HackMIT 2025 by building a micro-grid out of homemade batteries.\n• Ryan Tran, co-founder and CTO of Stanza, a legal tech startup that raised a $1M pre-seed. Former cybersecurity intern at Calif and MIT Media Lab researcher. His first startup came out of Stanford's TreeHacks.\n\nModerated by Smyan Sengupta.\n\nWhat you'll walk away with:\n• How to scope an idea you can actually finish in 24 hours\n• How winning teams split roles (and who should never touch the demo)\n• What judges remember three minutes after your pitch\n• When a hackathon project is worth turning into a startup (hint: Most Startup-able prize)\n\nWho it's for: first-timers who want a game plan, and veterans who keep finishing second. Come with your team, or come solo and find one. Stay for the audience Q&A and ask them anything. It starts 3 hours into hacking, so there's still time to fix everything.",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("2NJ4Dgg2RyYg6GfGR1J1"),
  },
  {
    time: "15:00",
    title: "Privacy and Security in Data and AI",
    host: "Jhooma Coppisetti and Sanjay Krishna, participating in their individual capacities, moderated by Mehr",
    about:
      "Who gets to see your data once an AI touches it? An honest, unscripted conversation with two Boston data and engineering leaders on what privacy and security really look like when AI meets sensitive data: how to protect it, how to govern it, and how to still build fast. Moderated by Mehr Anand. Bring questions.\n\nSpeakers:\n• Jhooma Coppisetti, Director of Data Architecture. Nearly two decades in data management, data governance, and enterprise architecture.\n• Sanjay Krishna, Director of Architecture. Background in systems engineering and computational intelligence. Also judging HACK1984 on Sunday.\n\nWhat we'll get into:\n• The new privacy risks AI creates, and how to design around them\n• What \"privacy by design\" looks like in real code\n• What makes a privacy-first project stand out to a judge\n• How to break into data and security careers\n\nOpen to everyone. No coding needed. Speakers are participating in their individual capacities. Views are their own and not those of their employers.",
    room: "Curry 346",
    format: FORMATS.fireside,
    rsvp: partiful("Nzd4LVCSg1LHisIYysK5"),
  },
  {
    time: "15:00",
    title: "Intro to Options and Mathematics",
    host: "NUSA with Netochi",
    about:
      "Ever wondered how traders make money from predicting stock prices? Join NUSA for an interactive workshop exploring the world of options trading and the mathematics behind it. Learn how probability, risk, and payoff structures influence trading decisions, then put your knowledge to the test in a team-based trading simulation. No prior finance experience required!",
    room: "Curry 342",
    format: FORMATS.workshop,
    rsvp: partiful("3PoTvhAPTbSc3D14o0fU"),
  },
  {
    time: "16:00",
    title: "How to Build a Business Idea at a Hackathon",
    host: "E-Club with Troy, Ryan and Eunsu",
    about:
      "Have a cool hack but not sure it's a real business? Or still staring at a blank page? We'll start with how to come up with ideas at a hackathon, from spotting problems in your own life to brainstorming off the hackathon's themes. Then we'll show you how to focus on a real problem instead of a cool feature, pin down your customer, and sanity-check demand in an afternoon. You'll leave with a framework to pressure-test your idea, plus what makes it viable: a clear value prop.",
    room: "Curry 344",
    format: FORMATS.fireside,
    rsvp: partiful("heebpAICKalSIr6LH9DI"),
  },
  {
    time: "16:00",
    title: "Teaching Technical Concepts to Nontechnical Audiences",
    host: "FirstByte with Nick and Hector",
    about:
      "You built something brilliant. Now explain it to a judge in 60 seconds. FirstByte runs a hands-on session on turning dense technical ideas into explanations anyone can follow. We start with something painfully academic (Diffie-Hellman key exchange, in full textbook prose), then pull it apart and rebuild it live.\n\nWhat we'll cover:\n• Finding your message: organization, chunking (the rule of three), visuals, concrete examples, analogies\n• Bringing it to life: benefits over features (\"1,000 songs in your pocket,\" not \"5 GB of storage\"), giving context, taking people on the journey, making numbers relatable\n• Putting it together: we reteach the same concept using everything above\n\nWhy it matters: engineers pitch to PMs, marketers talk to customers, founders sell a strategy. And on Sunday, you pitch your project to judges. Hosted by Nick and Hector of FirstByte.",
    room: "Curry 342",
    format: FORMATS.workshop,
    rsvp: partiful("u89eXw09weyuSE9SdyDA"),
  },
  {
    time: "16:00",
    title: "Off the Telescreen - Setting up local AI",
    host: "Shourya, Rush Sanghrajka and EX",
    about:
      "Building for Privacy-First? Northeastern data science professor Rush Sanghrajka and Shourya Yadav show you how to run models on your laptop, plug them into an agent, and walk into judging with nothing leaving the device. Bring a laptop, install Ollama first.",
    room: "Curry 346",
    format: FORMATS.workshop,
    rsvp: partiful("TDi7BNV8XYH6pxh4AwBk"),
  },
  {
    time: "17:00",
    title: "Get the F**k Off Localhost (GTFOL)",
    host: "Shourya, BU Disruptors and Maritime (YC F26)",
    about:
      "Everything you need to know about getting your apps online. Deploy a Next.js app in minutes, and learn about how to deploy and host long-running agents for cheap.",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("lHdGl6FMDXdkGXwS2wgN"),
  },
  {
    time: "17:00",
    title: "VC Panel: Getting Venture-Backed in AI, Cybersecurity, and Robotics",
    host: "Organized with Jumbo Ventures (Tufts). Panelists Hani Azzam (Propeller) and Sage Singh (Cybernetix Ventures), moderated by Jahir Islam, President, Tufts Jumbo Ventures",
    about:
      "Building something and wondering if it's venture-backable? Take a break from your build and come talk to the people who write the checks. At this panel, investors will share what they're funding right now, what they wish founders were building, and what makes them pass quickly. We'll also get into capital efficiency and timelines for deep tech, how to plug into Boston's ecosystem, and what to do before you pitch.\n\nPanelists: Hani Azzam, Partner at Propeller; Sage Singh, Analyst at Cybernetix Ventures.\nModerator: Jahir Islam, President, Tufts Jumbo Ventures.\n\nBring your questions and whatever you're hacking on.",
    room: "Curry 346",
    format: FORMATS.panel,
    rsvp: partiful("njtdcB2Rgi0LbkVfw1Hi"),
  },
  {
    time: "17:00",
    title: "AI Policy Simulation",
    host: "NU Nexus",
    about:
      "Would You Let AI Watch Everything? Hosted by NU Nexus.\n\nOrwell Institute of Technology (OIT) wants an AI system that monitors every byte of campus network traffic. It could stop hackers in hours, but it would also see everything you do. Do you approve it?\n\nTake a break from your screen and step into a live policy simulation. You’ll join a team, get a secret objective, and hunt for loopholes in a real-style AI policy. Then make deals, survive a plot twist, and vote on what passes. No policy experience needed, and you can jump in anytime. Come argue, scheme, and see how AI rules actually get made.",
    room: "Curry 342",
    format: FORMATS.workshop,
    rsvp: partiful("2TRTzhaOlRmb3jCZKPGd"),
  },
];

/** The sessions by start time, in order: one slot per hour of the afternoon. */
export const WORKSHOP_SLOTS = [...new Set(WORKSHOPS.map((session) => session.time))].map((time) => ({
  time,
  sessions: WORKSHOPS.filter((session) => session.time === time),
}));

/** "13:00" becomes "1:00 PM", for visitors who are not reading a schedule. */
export function clockTime(time) {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
