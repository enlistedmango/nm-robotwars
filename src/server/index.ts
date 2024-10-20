import Config from '@common/config';
import { addCommand, cache } from '@overextended/ox_lib/server';

const TMC = (globalThis as any).exports.core.getCoreObject();

Config.usableItems.forEach((item: { name: string; netEvent: string }) => {
  TMC.Functions.CreateUseableItem(item.name, (source: number) => {
    emitNet(item.netEvent, source);
  });
});

// OLD FUNCTIONS USED TO CREATE SEPERATE USEABLE ITEMS

// TMC.Functions.CreateUseableItem("electrodisk", (source: number) => {
//   emitNet("consumables:client:useElectrodisk", source);
// });
//
// TMC.Functions.CreateUseableItem("gravestone", (source: number) => {
//   emitNet("consumables:client:useGravestone", source);
// });
//
// TMC.Functions.CreateUseableItem("buckler", (source: number) => {
//   emitNet("consumables:client:useBuckler", source);
// });
//
// TMC.Functions.CreateUseableItem("uppercut", (source: number) => {
//   emitNet("consumables:client:useUppercut", source);
// });


if (Config.EnableNuiCommand) {
  addCommand('startGame', async (playerId) => {
    if (!playerId) return;

    emitNet(`${cache.resource}:startGame`, playerId);
  });
}
