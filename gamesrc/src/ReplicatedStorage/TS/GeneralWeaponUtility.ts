
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL, LogArea } from "./DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)
import { CollectionService, Players, Teams, Workspace } from "@rbxts/services"

import * as WeaponUtility from "ReplicatedStorage/Standard/WeaponUtility"
import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"

import CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"

import { Character, ModelUtility } from "./ModelUtility"

// because collision happens on the server but clients need to predict whether projectiles will collide we need another way to indicate
// something is unhittable. A tag is an obvious possibility
const porousCollisionGroupIdObject = (Workspace.WaitForChild("GameManagement").WaitForChild("PorousCollisionGroupId") as NumberValue)

export namespace GeneralWeaponUtility {

    export function isPorous(part: BasePart) {
        return part.CollisionGroupId === porousCollisionGroupIdObject.Value || CollectionService.HasTag(part, 'MobExclusion')
    }

    export function findNontransparentPartOnRayWithIgnoreList(
        ray: Ray,
        ignoreDescendantsVolatile: Instance[],
        terrainCellsAreCubes: boolean = false,
        ignoreWater: boolean = false):
        [BasePart | undefined, Vector3, Vector3, Enum.Material] {

        const [partHit, intersectionV3, normalV3, material] = Workspace.FindPartOnRayWithIgnoreList(ray, ignoreDescendantsVolatile, terrainCellsAreCubes, ignoreWater)
        if (partHit && (partHit.Transparency > 0.9 || !partHit.CanCollide || isPorous(partHit))) {
            ignoreDescendantsVolatile.push(partHit)
            return findNontransparentPartOnRayWithIgnoreList(ray, ignoreDescendantsVolatile, terrainCellsAreCubes, ignoreWater)
        }
        else {
            return [partHit, intersectionV3, normalV3, material]
        }
    }

    // needs to work on client so not using character records
    export function findValidTargetsAndRanges(attackingCharacter: Character, attackingTeam: Team, maxRange: number): [Character, number][] {
        DebugXL.Assert(attackingCharacter.IsA("Model"))
        DebugXL.Assert(attackingTeam.IsA("Team"))
        if (!attackingCharacter.Name) {
            DebugXL.logD(LogArea.Combat, "WTF")
        }
        DebugXL.logV(LogArea.Combat, "Find closest target for " + (attackingCharacter.Name ? attackingCharacter.Name : "(nil)"))
        const characters = CollectionService.GetTagged("CharacterTag")
        DebugXL.logV(LogArea.Combat, "All characters: " + DebugXL.stringifyInstanceArray(characters))
        characters.forEach((char) => DebugXL.Assert(char.IsA("Model")))
        const modelCharacters = characters as Model[]
        const validTargetCharacters = modelCharacters.filter((char) => CharacterClientI.ValidTarget(attackingTeam!, char))
        DebugXL.logV(LogArea.Combat, "Valid targets: " + DebugXL.stringifyInstanceArray(validTargetCharacters))
        const primaryPartCharacters = validTargetCharacters.filter((char) => char.PrimaryPart !== undefined)
        DebugXL.logV(LogArea.Combat, "Targets with primary parts: " + DebugXL.stringifyInstanceArray(primaryPartCharacters))
        const forcefieldlessCharacters = primaryPartCharacters.filter((char) => char.FindFirstChild("ForceField") === undefined)
        DebugXL.logV(LogArea.Combat, "Targets without force fields: " + DebugXL.stringifyInstanceArray(forcefieldlessCharacters))
        const charactersWithHeads = forcefieldlessCharacters.filter((char) => char.FindFirstChild("Head") !== undefined)
        DebugXL.logV(LogArea.Combat, "Targets with heads: " + DebugXL.stringifyInstanceArray(charactersWithHeads))
        const targetsAndRanges: [Character, number][] = charactersWithHeads.map((char) =>
            [char, WeaponUtility.GetTargetPoint(char).sub(ModelUtility.getPrimaryPartCFrameSafe(attackingCharacter).Position).Magnitude] as [Character, number])
        const filteredTargetsAndRanges = targetsAndRanges.filter((targetAndRange) => targetAndRange[1] < maxRange)
        return filteredTargetsAndRanges
    }

    export function findClosestVisibleTarget(attackingCharacter: Character, attackingTeam: Team, maxRange: number): [Character | undefined, number] {
        DebugXL.Assert(attackingCharacter.IsA("Model"))
        DebugXL.Assert(attackingTeam.IsA("Team"))
        const targetsAndRanges = findValidTargetsAndRanges(attackingCharacter, attackingTeam, maxRange)
        if (!targetsAndRanges.isEmpty()) {
            // stupid optimization? It does nothing for the worst case ; all heroes are in range but behind walls
            // probably better to sporadically collect los on n*m options
            targetsAndRanges.sort((a, b) => b[1] > a[1])
            const attackingCharacterPos = ModelUtility.getPrimaryPartCFrameSafe(attackingCharacter).Position
            for (let i = 0; i < targetsAndRanges.size(); i++) {
                // use head for target because some destructibles make their primary part something else for positioning purposes. Everyone has a head
                const targetPart = (targetsAndRanges[i][0].FindFirstChild("Head") as BasePart|undefined)
                if (!targetPart) {
                    DebugXL.logD(LogArea.Combat, "Target " + targetsAndRanges[i][0].Name + " missing Head")
                }
                else {
                    const losRay = new Ray(attackingCharacterPos, targetPart.Position.sub(attackingCharacterPos))
                    const [hitPart] = findNontransparentPartOnRayWithIgnoreList(losRay, [attackingCharacter, targetsAndRanges[i][0]])
                    if (!hitPart) {
                        // clear LOS
                        DebugXL.logV(LogArea.Combat, "Closest target: " + DebugXL.stringifyInstance(targetsAndRanges[i][0]))
                        return targetsAndRanges[i]
                    }
                    else {
                        DebugXL.logV(LogArea.Combat, "Blocked LOS between " + attackingCharacter.Name + " and " + targetsAndRanges[i][0].Name + " by " + hitPart.GetFullName())
                    }
                }
            }
            // no LOS on anyone
            return [undefined, math.huge]
        }
        else {
            return [undefined, math.huge]
        }
    }

    // it is nonobvious how to both have IsCoolingDown check IsFrozen and have this not mess things
    // up when playing from studio without messy code. From the local/client scripts we could pass in something
    // different than a player except for IsCoolingDown, so we could have a flag or something that tells
    // us to save to a different variable ...

    let cooldownDurations = new Map<Character, number>()
    let cooldownFinishTimes = new Map<Character, number>()
    let walkSpeedMuls = new Map<Character, number>()

    export function lastWeaponWalkSpeedMul(character: Character) {
        return walkSpeedMuls.get(character)
    }

    export function getAdjustedCooldown(character: Character, cooldownDuration: number) {
        DebugXL.Assert(character.IsA("Model"))
        const adjCooldown = cooldownDuration / CharacterUtility.GetSlowCooldownPct(character)
        DebugXL.Assert(adjCooldown < 1000)
        return adjCooldown
    }

    export function startCooldown(character: Character, cooldownDuration: number, walkSpeedMul: number) {
        DebugXL.Assert(character.IsA("Model"))
        const cooldownFinishTime = cooldownFinishTimes.get(character)
        if (!cooldownFinishTime || (time() + cooldownDuration > cooldownFinishTime)) {
            // not currently cooling; start another
            // wishlist; update cooldown on the fly, so when you thaw you go back to full speed
            const _cooldownDurationN = getAdjustedCooldown(character, cooldownDuration)
            cooldownFinishTimes.set(character, time() + _cooldownDurationN)
            cooldownDurations.set(character, _cooldownDurationN)
            walkSpeedMuls.set(character, walkSpeedMul)
        }
    }

    export function isEquippedBy(tool: Tool, character: Character) {
        // more reliable than an equipped flag
        return tool.Parent === character;
    }

    export function cooldownPctRemaining(character: Character) {
        DebugXL.Assert(character.IsA("Model"))
        const cooldownFinishTime = cooldownFinishTimes.get(character)
        return cooldownFinishTime ?
            math.max((cooldownFinishTime - time()) / cooldownDurations.get(character)!, 0) : 0
    }


    export function isCoolingDown(character: Character) {
        DebugXL.Assert(character.IsA("Model"))
        return CharacterUtility.IsFrozen(character) || cooldownPctRemaining(character) > 0
    }

    export function cooldownWait(character: Character, cooldownDuration: number, walkSpeedMul: number = 1) {
        const startTime = time()
        startCooldown(character, cooldownDuration, walkSpeedMul)
        while (isCoolingDown(character)) {
            wait()
        }
        DebugXL.logV(LogArea.Combat, `${character.Name} took ${time() - startTime} seconds to cool down`)
    }

    // garbage collection
    spawn(() => {
        for (; ;) {
            wait(1)
            for (let char of cooldownFinishTimes.keys()) {
                if (!char.Parent) cooldownFinishTimes.delete(char)
            }
            for (let char of cooldownDurations.keys()) {
                if (!char.Parent) cooldownDurations.delete(char)
            }
            for (let char of walkSpeedMuls.keys()) {
                if (!char.Parent) walkSpeedMuls.delete(char)
            }
        }
    })
}
