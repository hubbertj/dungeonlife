
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"

import { AuraServer } from "./AuraServer"
import { AreaEffect } from "./AreaEffect"
import { BarrierServer } from "./BarrierServer"
import { PlayerServer } from "./PlayerServer"

import * as CharacterI from "ServerStorage/Standard/CharacterI"
import * as CharacterXL from "ServerStorage/Standard/CharacterXL"
import * as Inventory from "ServerStorage/Standard/InventoryModule"
import * as Mana from "ServerStorage/Standard/ManaModule"
import * as Werewolf from "ServerStorage/Standard/WerewolfModule"

import * as FlexEquipUtility from "ReplicatedStorage/Standard/FlexEquipUtility"

import { ServerStorage, Workspace, TweenService, Teams } from "@rbxts/services"

interface Activateable {
    Activate(...args: unknown[]): void
}

export namespace PowerServer {

    let magicHealingModule = (ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild('MagicHealing') as ModuleScript|undefined)!
    let healthChangeModule = (ServerStorage.FindFirstChild('Standard')!.FindFirstChild('HealthChange') as ModuleScript|undefined)!
    let auraGlowModule = (ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild('AuraGlow') as ModuleScript|undefined)!
    let magicSprintModule = (ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild('MagicSprint') as ModuleScript|undefined)!


    export function activatePower(player: Player, flexToolInst: FlexTool) {
        let toolBaseData = ToolData.dataT[flexToolInst.baseDataS]
        let character = player.Character
        if (character) {
            if (flexToolInst.powerCooldownPctRemaining(player) <= 0) {
                if (flexToolInst.canLogicallyActivate(character)) {
                    let levelNerfFactor = 1
                    let pcData = CharacterI.GetPCDataWait(player)
                    if (pcData instanceof Hero) {
                        let localLevel = pcData.getLocalLevel()
                        let actualLevel = pcData.getActualLevel()
                        levelNerfFactor = localLevel < actualLevel ? localLevel / actualLevel : 1
                    }

                    let adjustedManaCost = math.ceil(flexToolInst.getManaCost() * levelNerfFactor) // to be fair, since you have less mana available, casting lower effect power spells should be cheaper
                    let success = Mana.SpendMana(character, adjustedManaCost)
                    if (success) {
                        flexToolInst.startPowerCooldown(player)
                        if (toolBaseData.idS === "MagicHealing") {
                            let effectStrength = flexToolInst.getEffectStrength(levelNerfFactor);
                            let team = player.Team
                            DebugXL.Assert(team !== undefined)
                            if (team) {
                                let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(236, 0, 15), Color3.fromRGB(150, 0, 0), team,
                                    (targetCharacter, deltaT) => {
                                        let humanoid = (targetCharacter.FindFirstChild("Humanoid") as Humanoid|undefined);
                                        if (humanoid)
                                            if (humanoid.Health < humanoid.MaxHealth) {
                                                humanoid.Health = math.min(humanoid.Health + effectStrength * deltaT, humanoid.MaxHealth);
                                                // requiring inline to avoid circular dependencies
                                                (require(magicHealingModule) as Activateable).Activate(targetCharacter, new Color3(1, 0, 0));
                                                (require(healthChangeModule) as Activateable).Activate(targetCharacter, effectStrength * deltaT);
                                            }
                                    })
                                newWisp.Name = "MagicHealing"
                            }
                        }
                        else if (toolBaseData.idS === "HasteWisp") {
                            let team = player.Team
                            DebugXL.Assert(team !== undefined)
                            if (team) {
                                let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(15, 79, 5), Color3.fromRGB(16, 150, 0), team,
                                    (targetCharacter, deltaT) => {
                                        (require(auraGlowModule) as Activateable).Activate(targetCharacter, 1, new Color3(0, 1, 0));
                                    })
                                newWisp.Name = "HasteWisp"
                                let effectStrength = flexToolInst.getEffectStrength(levelNerfFactor);
                                (newWisp.FindFirstChild("EffectStrength") as NumberValue|undefined)!.Value = effectStrength
                            }
                        }
                        else if (toolBaseData.idS === "CurseWisp") {
                            let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(34, 15, 53), Color3.fromRGB(68, 30, 106), Teams.FindFirstChild('Monsters') as Team,
                                (targetCharacter, deltaT) => {
                                    (require(auraGlowModule) as Activateable).Activate(targetCharacter, 1, new Color3(0.75, 0, 1));
                                })
                            newWisp.Name = "CurseWisp"
                            let effectStrength = flexToolInst.getEffectStrength(levelNerfFactor);
                            (newWisp.FindFirstChild("EffectStrength") as NumberValue|undefined)!.Value = effectStrength
                        }
                        else if (toolBaseData.idS === "MagicSprint" || toolBaseData.idS === "MonsterSprint") {
                            let duration = toolBaseData.durationFunc!(toolBaseData, flexToolInst.levelN)
                            CharacterXL.SpeedMulFor(character, flexToolInst.getEffectStrength(levelNerfFactor), 1, duration)

                                ; (require(magicSprintModule) as Activateable).Activate(character, duration)
                        }
                        else if (toolBaseData.idS === "TransformWerewolf") {
                            Werewolf.ToggleForm(PlayerServer.getPlayerTracker(), Inventory, player)
                        }
                        else if (toolBaseData.idS === "MagicBarrier" || toolBaseData.idS === "NecroBarrier") {
                            let duration = toolBaseData.durationFunc!(toolBaseData, flexToolInst.levelN)
                            // using the Roblox tool is really entrenched in the damage system right now even though it has become
                            // nearly irrelevant, so let's dig up the tool so we can apply damage :P
                            BarrierServer.ActivateWait(character, duration, flexToolInst)
                        }
                        else {
                            DebugXL.Error(toolBaseData.idS + " has no activate code")
                        }
                    }
                }
            }
        }
    }

    function createWisp(toolBaseData: ToolData.ToolDatumI,
        flexToolInst: FlexTool,
        player: Player,
        character: Model,
        colorMain: Color3, colorRim: Color3,
        affectedTeam: Team,
        effectFunc: (targetCharacter: Model, deltaT: number) => void) {
        let newWisp = ServerStorage.FindFirstChild('Summons')!.FindFirstChild('Wisp')!.Clone() as Model
        let wispCore = newWisp.FindFirstChild('Wisp')!
        let fireBigParticles = wispCore.FindFirstChild('RingCore')!.FindFirstChild('Fire') as ParticleEmitter
        let fireSmallParticles = wispCore.FindFirstChild('CloudCore')!.FindFirstChild('Fire') as ParticleEmitter
        let light = wispCore.FindFirstChild('WispLight') as PointLight
        fireBigParticles.Color = new ColorSequence(colorMain, Color3.fromRGB(0, 0, 0))
        fireSmallParticles.Color = new ColorSequence(colorRim, Color3.fromRGB(0, 0, 0))
        light.Color = colorMain
        let duration = toolBaseData.durationFunc!(toolBaseData, flexToolInst.levelN)
        let range = FlexEquipUtility.GetAdjStat(flexToolInst, "rangeN")
        new AreaEffect(newWisp, range, duration, affectedTeam, effectFunc)
        newWisp.SetPrimaryPartCFrame(ModelUtility.getPrimaryPartCFrameSafe(character).add(new Vector3(0, 7, 0)));
        (newWisp.FindFirstChild('Range') as NumberValue).Value = range
        newWisp.Parent = Workspace.FindFirstChild('Summons')
        delay(duration - 2, () => {
            let wispDescendants = newWisp.GetDescendants()
            for( let descendant of wispDescendants ) {
                if (descendant.IsA("ParticleEmitter")) {
                    descendant.Enabled = false
                }
                else if (descendant.IsA("BasePart")) {
                    TweenService.Create(descendant, new TweenInfo(2), { Transparency: 1 }).Play()
                }
            }
            (newWisp.PrimaryPart!.FindFirstChild("DisperseSound") as Sound).Play()
            wait(2)
            newWisp.Destroy()
        })
        return newWisp
    }

    AuraServer.run()
}
