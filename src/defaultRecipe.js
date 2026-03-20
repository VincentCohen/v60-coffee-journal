export const JH_RECIPE = {
  id: '__jh_default__',
  name: "James Hoffmann's V60",
  description: "Single cup V60 recipe by James Hoffmann. A balanced approach with two main pours after the bloom.",
  doseG: 15,
  waterG: 250,
  tempC: 94,
  steps: [
    { label: 'Bloom',       duration: 45, pourTarget: 50,  cue: 'Pour 50 g — slow spiral, saturate all grounds' },
    { label: 'First pour',  duration: 45, pourTarget: 150, cue: 'Pour steadily to 150 g — gentle continuous spiral' },
    { label: 'Second pour', duration: 60, pourTarget: 250, cue: 'Pour to 250 g — slow and steady to finish' },
    { label: 'Drawdown',    duration: 90, pourTarget: null, cue: 'Swirl the dripper gently, then wait for full drawdown' },
  ],
}
