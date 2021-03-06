
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { Teams } from "@rbxts/services"

import Monsters from "ServerStorage/Standard/MonstersModule"
import GameManagement from "ServerStorage/Standard/GameManagementModule"

import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"
import { TestContext } from "ServerStorage/TS/TestContext"
import { MobServer } from "ServerStorage/TS/MobServer"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { GameServer, LevelResultEnum } from "ServerStorage/TS/GameServer"
import { DungeonPlayerMap } from "ServerStorage/TS/DungeonPlayer"

import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

// unit tests on manager
{
    // assert that superboss isn't defeated until they're defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.createTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 1)
    TestUtility.assertTrue(!superbossMgr.superbossDefeated(1), "New character not defeated")
}

{
    // assert that superboss is defeated when their health <= 0
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.createTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 2);
    (character.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health = 0
    TestUtility.assertTrue(superbossMgr.superbossDefeated(2), "Health 0 superboss defeated")
}

{
    // assert that superboss that is lost is defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.createTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 3)
    character.Parent = undefined
    TestUtility.assertTrue(superbossMgr.superbossDefeated(3), "lost superboss defeated")
}

{
    // assert that superboss that is destroyed is defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.createTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 4)
    character.Destroy()
    TestUtility.assertTrue(superbossMgr.superbossDefeated(4), "destroyed superboss defeated")
}

{
    // assert that superboss destroyed in a previous session doesn't count 
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.createTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 1)
    character.Destroy()
    TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "destroyed superboss previous session not defeated")
}

// integration test of golden path  - player superboss
{
    let testSetup = new TestContext()
    let superbossMgr = new SuperbossManager()
    testSetup.getPlayer().Team = (Teams.FindFirstChild("Monsters") as Team|undefined)
    testSetup.getPlayerTracker().setClassChoice(testSetup.getPlayer(), "CyclopsSuper")
    let testCharacter = testSetup.makeTestPlayerCharacter("CyclopsSuper")
    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        Monsters.PlayerCharacterAddedWait(testSetup, testCharacter, testSetup.getPlayer(), superbossMgr, 1)
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(1), "Superboss not defeated yet")
        testCharacter.Destroy()
        TestUtility.assertTrue(superbossMgr.superbossDefeated(1), "Superboss defeated")
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated")
        // let's make a new superboss
        let testCharacter2 = testSetup.makeTestPlayerCharacter("CyclopsSuper")

        DebugXL.Assert(testCharacter2 !== undefined)  // this would be a malfunction in the test system, not a test assert
        if (testCharacter2) {
            Monsters.PlayerCharacterAddedWait(testSetup, testCharacter2, testSetup.getPlayer(), superbossMgr, 2)
            TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
            testCharacter2.Destroy()
            TestUtility.assertTrue(superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
        }
    }

    testSetup.clean()
}

// integration test of golden path  - mob superboss, player hero
{
    let testSetup = new TestContext()
    let dungeonPlayerMap = new DungeonPlayerMap()
    let superbossMgr = GameServer.getSuperbossManager()
    let playerTracker = new PlayerTracker()
    testSetup.getPlayer().Team = (Teams.FindFirstChild("Heroes") as Team|undefined)
    testSetup.getPlayerTracker().setClassChoice(testSetup.getPlayer(), "Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)

    let testCharacter = MobServer.spawnMob(testSetup, "CyclopsSuper", superbossMgr, GameServer.levelSession)
    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    DebugXL.Assert(testCharacter.Parent !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(GameServer.levelSession), "Superboss not defeated yet")
        TestUtility.assertTrue(GameServer.checkFloorSessionComplete(testSetup, dungeonPlayerMap, true, false) === LevelResultEnum.InProgress)
        testCharacter.Destroy()
        TestUtility.assertTrue(superbossMgr.superbossDefeated(GameServer.levelSession), "Superboss defeated")
        TestUtility.assertTrue(GameServer.checkFloorSessionComplete(testSetup, dungeonPlayerMap, true, false) === LevelResultEnum.BeatSuperboss)

        // test to make sure we don't think it's a TPK after; simulate loading next level
        testSetup.getPlayer().Character!.Destroy()
        GameServer.levelSession++
        GameServer.preparationPhaseWait(0.5)

        TestUtility.assertTrue(GameServer.checkFloorSessionComplete(testSetup, dungeonPlayerMap, true, false) === LevelResultEnum.InProgress)

        TestUtility.assertTrue(!superbossMgr.superbossDefeated(GameServer.levelSession), "Superboss next level not yet defeated")
        // let's make a new superboss

        let testCharacter2 = MobServer.spawnMob(testSetup, "CyclopsSuper", superbossMgr, GameServer.levelSession)
        DebugXL.Assert(testCharacter2 !== undefined)  // this would be a malfunction in the test system, not a test assert
        if (testCharacter2) {
            TestUtility.assertTrue(!superbossMgr.superbossDefeated(GameServer.levelSession), "Superboss next level not yet defeated after spawn")
            testCharacter2.Destroy()
            TestUtility.assertTrue(superbossMgr.superbossDefeated(GameServer.levelSession), "Superboss next level not yet defeated after spawn")
        }
    }
    testSetup.clean()
}
// make sure bookkeeping doesn't crash
{
    let testContext = new TestContext()
    testContext.getPlayer().Team = (Teams.FindFirstChild("Heroes") as Team|undefined)
    GameManagement.DoBeatSuperbossStuff(testContext)
    TestUtility.assertTrue(true, "DoBeatSuperbossStuff doesn't crash")
    testContext.clean()
}