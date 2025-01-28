## Robot Wars Project

This is a tracking of a robot war script, built with Typescript for the TMC Framework.
I used a boilerplate from Overextended in this instance as it was up to date and allowed for expansion into a UI with React.

I have no doubt about the code being all over the place, and I've tried to keep it as standalone as possible so far.
The only part that's based on a framework is the `CreateUseableItem` that comes from the TMC framework that I help out with.

There's currently a basic UI as part of the boilerplate, and to open the UI you first need to use an item, then run the command
`/startGame`

---

**_DONE_**

- [x] Create useable items
- [x] Peds are shwon to be holding a controller
- [x] Make bots flip back over ( uses E )
- [x] Have bots control with arrow keys
- [x] Show controls on screen for using the bot
- [x] Don't allow multiple player bots at a time
- [x] Added in bot FPV Cam (optional, can be removed)
- [x] Animations for putting down bot
- [x] Cleanup tasks when picking up bot


**TODO**
- [ ] Handle player events (onSpawn, onDisconnect)
- [ ] Allow people to carry the bots around
  - [ ] Spawn model in hand
  - [ ] Give option to place item (similar to car spawning)
  - [ ] Once item is placed, then run `spawnBot` function
- [ ] Pickup annimation doesn't run properly
- [ ] If ped get's knocked over by RC car, it breaks the controls
- [ ] Add in distance checks to *disconnect* the bot if too far
- [ ] Basic RC customisations
- [ ] Point scoring UI


### Known Bugs

1. You're unable to see the bot you're trying to spawn, but you see all other options
    - After you spawn and use an item, there's a slight delay and then the control button text
    - will show on screen. Only after restarting the script, will you see a spawned entity
2. Controller stays attached to player after pickup - FIXED
3. Sometimes the POV camera bugs out, and it seems like the cam removes itself

### Performance
Base Resmon: 0.03ms <br>
Spawned Resmon: 0.24ms <br>
Second Client Resmon: 0.24ms <br>

**Credits** <br>
[Overextended Boilerplate](https://github.com/overextended/fivem-typescript-boilerplate)
