import Config from '@common/config';
import { cache } from '@overextended/ox_lib/client';
import * as cfx from "@nativewrappers/fivem/client"

const playerPed: number = PlayerPedId();
const [x, y, z] = GetEntityCoords(playerPed, false);
const currentCoords = [x, y, z];
const playerModels: Map< number, number> = new Map()
let isOpen: boolean = false

let buttonsHandle: number = 0
let interval: number = 0
let rcBotEntity: number | null = 0
let rcBotCam: number = 0
let isCameraActive: boolean = false;
let botController: string = `prop_controller_01`;


Config.usableItems.forEach((item: { netEvent: string; model: string }) => {
  onNet(item.netEvent, async (): Promise<void> => {
    if (DoesEntityExist(rcBotEntity)) return;
    if (playerModels.has(playerPed)) playerModels.delete(playerPed);

    await spawnBot(item.model);
  });
});

//TODO: Adding in function to check robot distance

async function spawnBot(rcBotModel: string): Promise<void> {
  const [x, y, z] = GetEntityCoords(playerPed, false) as [number, number, number];
  const h = GetEntityHeading(playerPed);

  RequestModel(rcBotModel);
  const startTime = GetGameTimer();

  while (!HasModelLoaded(rcBotModel)) {
    await cfx.Delay(0);
    if (GetGameTimer() - startTime > 5000) {
      console.log(`Failed to load model: ${rcBotModel}`);
      return;
    }
  }

  await playerAnim();
  await cfx.Delay(700);

  const [xOffset, yOffset, zOffset] = GetOffsetFromCoordAndHeadingInWorldCoords(x, y, z, h, 0.0, 1.0, 0.0) as [number, number, number];

  rcBotEntity = CreateVehicle(rcBotModel, xOffset, yOffset, zOffset, h, true, false);
  SetModelAsNoLongerNeeded(rcBotModel);
  SetVehicleOnGroundProperly(rcBotEntity);
  SetVehicleEngineOn(rcBotEntity, true, true, false);
  SetEntityAsMissionEntity(rcBotEntity, true, true);
  SetVehicleHasBeenOwnedByPlayer(rcBotEntity, true);
  SetVehicleDoorsLocked(rcBotEntity, 2);

  playerModels.set(playerPed, rcBotEntity);

  rcBotCam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  AttachCamToEntity(rcBotCam, rcBotEntity, 0.0, 0.0, 0.4, true);

  const entityHeading = GetEntityHeading(rcBotEntity);
  SetCamRot(rcBotCam, 0.0, 0.0, entityHeading, 2);


  // This is some boilerplate code that I kept in place for the UI
  if (Config.EnableNuiCommand) {
    onNet(`${cache.resource}:startGame`, () => {
      SetNuiFocus(true, true);

      SendNUIMessage({
        action: 'setVisible',
        data: {
          visible: true,
        },
      });
    });

    RegisterNuiCallback('exit', (data: null, cb: (data: unknown) => void) => {
      SetNuiFocus(false, false);
      cb({});
    });
  }

  await controllerLoop();
  loadInstructionalButtons();
  createBotLoop(rcBotEntity, rcBotCam);
}

function createBotLoop(entity: number, cam: number) {
  setInterval(() => {
    if (!DoesEntityExist(rcBotEntity!)) return;

    if (IsControlJustPressed(0, 47)) { // [G] enters POV camera
      if (isCameraActive) {
        deactivateCamera();
      } else {
        activateCamera();
      }
    }

    if (IsControlJustPressed(0, 48)) { // [E] picks up the RC Bot
      const playerCoords = GetEntityCoords(playerPed, false) as [number, number, number];
      const entityCoords = GetEntityCoords(rcBotEntity!, false) as [number, number, number];
      const distance = GetDistanceBetweenCoords(playerCoords[0], playerCoords[1], playerCoords[2], entityCoords[0], entityCoords[1], entityCoords[2], true);

      if (distance < 4.0) {
        pickupEntity();
      } else {
        notification("You're Too Far Away!")
      }
    }

    const entityHeading = GetEntityHeading(entity);
    SetCamRot(cam, 0.0, 0.0, entityHeading, 2);

    handleBotControls();
  }, 0);
}

function loadInstructionalButtons(): void {
  buttonsHandle = RequestScaleformMovie('INSTRUCTIONAL_BUTTONS');

  interval = setInterval(async () => {
    if (HasScaleformMovieLoaded(buttonsHandle)) {
      CallScaleformMovieMethod(buttonsHandle, 'CLEAR_ALL');
      CallScaleformMovieMethodWithNumber(buttonsHandle, 'TOGGLE_MOUSE_BUTTONS', 0);

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(0);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_FRONTEND_UP~');
      ScaleformMovieMethodAddParamPlayerNameString('Up');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(1);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_FRONTEND_DOWN~');
      ScaleformMovieMethodAddParamPlayerNameString('Down');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(2);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_FRONTEND_LEFT~');
      ScaleformMovieMethodAddParamPlayerNameString('Left');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(3);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_FRONTEND_RIGHT~');
      ScaleformMovieMethodAddParamPlayerNameString('Right');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(4);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_HUD_SPECIAL~');
      ScaleformMovieMethodAddParamPlayerNameString('Pickup');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(5);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_DETONATE~');
      ScaleformMovieMethodAddParamPlayerNameString('Enter POV');
      EndScaleformMovieMethod();

      BeginScaleformMovieMethod(buttonsHandle, 'SET_DATA_SLOT');
      ScaleformMovieMethodAddParamInt(5);
      ScaleformMovieMethodAddParamPlayerNameString('~INPUT_VEH_HORN~');
      ScaleformMovieMethodAddParamPlayerNameString('Flip');
      EndScaleformMovieMethod();

      CallScaleformMovieMethod(buttonsHandle, 'DRAW_INSTRUCTIONAL_BUTTONS');
      DrawScaleformMovieFullscreen(buttonsHandle, 255, 255, 255, 255, 0);
    } else {
      clearInterval(interval);
    }
  }, 0);
}

function removeInstructionalButtons(): void {
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
  }

  if (buttonsHandle) {
    SetScaleformMovieAsNoLongerNeeded(buttonsHandle);
    buttonsHandle = null;
  }
}

function activateCamera(): void {

  RenderScriptCams(true, true, 600, true, true);
  SetTimecycleModifier("heliGunCam")
  SetTimecycleModifierStrength(1.2)
  isCameraActive = true;
}

function deactivateCamera(): void {
  RenderScriptCams(false, true, 600, true, true);
  isCameraActive = false;
  ClearTimecycleModifier()
}

function handleBotControls(): void {

  // These checks are for opening and closing the door, for flipping.
  if (IsControlPressed(0, 86)) { // I've set this to E, which would be the horn
    setTimeout(() => {
      if (IsControlPressed(0, 86)) {
        if (!isOpen) {
          SetVehicleDoorOpen(rcBotEntity, 1, false, false);
          notification("Flip a Bitch");
          isOpen = true;
        }
      }
    }, 100);
  }

  if (isOpen) {
    setTimeout(() => {
      SetVehicleDoorShut(rcBotEntity, 1, false, false);
      isOpen = false;
    }, 500);
  }

  // The below will handle the controls for moving the bot around

  if (IsControlPressed(0, 172)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 9, 1);
  }
  if (IsControlPressed(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 22, 1);
  }
  if (IsControlJustReleased(0, 172) || IsControlJustReleased(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 6, 1500);
  }
  if (IsControlPressed(0, 174) && IsControlPressed(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 13, 1);
  }
  if (IsControlPressed(0, 175) && IsControlPressed(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 14, 1);
  }
  if (IsControlPressed(0, 174) && IsControlPressed(0, 172)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 7, 1);
  }
  if (IsControlPressed(0, 175) && IsControlPressed(0, 172)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 8, 1);
  }
  if (IsControlPressed(0, 174) && !IsControlPressed(0, 172) && !IsControlPressed(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 4, 1);
  }
  if (IsControlPressed(0, 175) && !IsControlPressed(0, 172) && !IsControlPressed(0, 173)) {
    TaskVehicleTempAction(PlayerPedId(), rcBotEntity, 5, 1);
  }
}

async function playerAnim(): Promise<void> {
  const animDict: string = "pickup_object"
  const animName: string = "pickup_low"

  RequestAnimDict(animDict);
  while (!HasAnimDictLoaded(animDict)) {
    await cfx.Delay(0)
  }

  TaskPlayAnim( playerPed, animDict, animName, 3.0, 1.0, 600,16, 0, false, false, false,)

  await cfx.Delay(700);
  ClearPedTasks(playerPed)
  RemoveAnimDict(animDict)
}

async function controllerLoop(): Promise<void> {
  const animDict: string = "anim@arena@amb@seat_drone_tablet@male@var_a@"
  const animName: string = "tablet_idle_c"

  RequestAnimDict(animDict);
  while (!HasAnimDictLoaded(animDict)) {
    await cfx.Delay(0)
  }

  RequestModel(botController)
  while (!HasModelLoaded(botController)) {
    await cfx.Delay(0);
  }

  const controllerObject = CreateObject(botController, currentCoords.x, currentCoords.y, currentCoords.z, true, true, false)
  AttachEntityToEntity(controllerObject, PlayerPedId(), GetPedBoneIndex(playerPed, 18905), 0.16, 0, 0.12, -137, -71, -14, true, true, false, true, 1, true)
  SetModelAsNoLongerNeeded(botController)

  TaskPlayAnim( playerPed, animDict, animName, 3.0, 1.0, -1 ,49 , 0, false, false, false,)

}

async function pickupEntity(): void {
  if (rcBotEntity)
  {
    await playerAnim();

    await cfx.Delay(800)

    DeleteEntity(rcBotEntity);

    if (isCameraActive) {
      deactivateCamera();
    }

    playerModels.delete(playerPed);

    removeInstructionalButtons()

    rcBotEntity = null;
  }
}

function notification(message) {
  SetNotificationTextEntry("STRING")
  AddTextComponentString(message)
  DrawNotification(0, 1)
}

on("onResourceStart", () => {
  ClearPedTasks(playerPed)
  deactivateCamera()
  removeInstructionalButtons()

  if (playerModels.has(playerPed)) {
    if (rcBotEntity) {
      DeleteEntity(rcBotEntity)
      playerModels.delete(playerPed)
    }
  }
});



