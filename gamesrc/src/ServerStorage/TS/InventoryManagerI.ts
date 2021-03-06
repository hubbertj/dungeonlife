
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

export interface InventoryManagerI {
    GetInventoryStoreWait(player: Player): DataStore2<InventoryI>
    GetWait(player: Player): InventoryI
    GetActiveSkinsWait(player: Player): { monster: ActiveSkinSetI, hero: ActiveSkinSetI }
    PlayerInTutorial(player: Player): boolean
    GetCount(player: Player, itemKey: string): number
    AdjustCount(player: Player, itemKey: string, increment: number, analyticItemTypeS?: string, analyticItemIdS?: string): void
    IsStarFeedbackDue(player: Player): boolean
    SetNextStarFeedbackDueTime(player: Player): void
    BoostActive(player: Player): boolean
    EarnRubies(player: Player, increment: number, analyticItemTypeS: string, analyticItemIdS: string): void
}

