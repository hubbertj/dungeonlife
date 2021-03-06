
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local Costumes          = require( game.ServerStorage.Standard.CostumesServer )

local FlexEquip         = require( game.ServerStorage.FlexEquipModule )
local Inventory         = require( game.ServerStorage.InventoryModule )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )

local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
local ToolCaches = require( game.ServerStorage.TS.ToolCaches ).ToolCaches

local Werewolf = {}

-- werewolf module assumes we've used costumesserver to save the original player's costume


function Werewolf:TakeHumanFormWait( playerTracker, player, activeSkins )
	DebugXL:Assert( self == Werewolf )
	DebugXL:Assert( player:IsA("Player") )
	
	if( not PlayerUtility.IsPlayersCharacterAlive( player )) then return end

	local character = player.Character
	local taggerFlavorS = playerTracker:getClassWait( player ) 
	if taggerFlavorS == "Werewolf" then  -- safety check for hackers
		local heldTool = character:FindFirstChildWhichIsA("Tool")
		if heldTool then heldTool:Destroy() end
--		warn( "Clearing "..player.Name.."'s backpack" )
		
		DebugXL:logD( LogArea.Characters, 'WerewolfModule - Costumes:LoadCharacter for '..player.Name )
		Costumes:LoadCharacter( player, {}, {}, false, character )
		DebugXL:logV( LogArea.Characters, 'WerewolfModule - character loaded for '..player.Name )

		local pcData = playerTracker:getCharacterRecordFromPlayerWait( player )
		pcData:equipAvailableArmor()		

		-- we don't need to unequip held weapon, the costume application did that for us
		-- clear claws from hotbar		
		for i = 1,4 do
			CharacterClientI:AssignPossessionToSlot( pcData, nil, i )
		end
		FlexEquip:ApplyEntireCostumeWait( playerTracker, player, pcData, activeSkins )

		-- put non-claws in hotbar; not bothering to equip 
		local slot = 1
		pcData.gearPool:forEach( function( toolInst, k )
			local baseDataS = toolInst.baseDataS
			if baseDataS ~= "ClawsWerewolf" then
				if ToolData.dataT[ baseDataS ].useTypeS ~= "worn" then
					CharacterClientI:AssignPossessionToSlot( pcData, k, slot )
					slot = slot + 1
				end
			end
		end )
		
		local characterKey = playerTracker:getCharacterKeyFromPlayer( player )
		ToolCaches.updateToolCache( playerTracker, characterKey, pcData, activeSkins )

		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )		
		
		local humanoid = player.Character:FindFirstChild("Humanoid")
		if humanoid then
			-- they can tell you're a werewolf if they hit you and your health bar goes down
			humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
		end
	end
end


function Werewolf:WolfOutWait( playerTracker, player, activeSkins, noAttachSet )
	DebugXL:Assert( self == Werewolf )
	DebugXL:Assert( player:IsA("Player") )
	
	if( not PlayerUtility.IsPlayersCharacterAlive( player )) then return end

	local character = player.Character
	local taggerFlavorS = playerTracker:getClassWait( player )
	if taggerFlavorS == "Werewolf" then		
		local heldTool = player:FindFirstChildWhichIsA("Tool")
		if heldTool then heldTool:Destroy() end
		
		local destCharacter = Costumes:LoadCharacter( player, { game.ServerStorage.Monsters.Werewolf }, noAttachSet, true, character )
		
		local humanoid = destCharacter:FindFirstChild("Humanoid")
		
		-- set health display back to normal
		humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.Viewer

		-- we don't need to unequip held weapon, the costume application did that for us
		-- remove cosmetic armor
		local pcData = playerTracker:getCharacterRecordFromPlayerWait( player )
		pcData.gearPool:forEach( function(item)
			item.equippedB = nil
		end )

		-- clear human weapons from hotbar		
		for i = 1,4 do
			CharacterClientI:AssignPossessionToSlot( pcData, nil, i )
		end

		-- put claws in hotbar and equip
		pcData.gearPool:forEach( function(toolInst, k)
			if toolInst.baseDataS == "ClawsWerewolf" then
				CharacterClientI:AssignPossessionToSlot( pcData, k, 1 )
			elseif toolInst.baseDataS == "TransformWerewolf" then
				CharacterClientI:AssignPossessionToSlot( pcData, k, 2 )
			end
		end )
		
		local characterKey = playerTracker:getCharacterKeyFromPlayer( player )

		ToolCaches.updateToolCache( playerTracker, characterKey, pcData, activeSkins )

		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
	end
end


function Werewolf:ToggleForm( playerTracker, inventoryManager, player )
	if not Costumes:ApplyingCostume( player.Character ) then
		if player.Character:FindFirstChild("Werewolf Head") then
			Werewolf:TakeHumanFormWait( playerTracker, player, inventoryManager:GetActiveSkinsWait( player ).hero )
		else
			local inventory = inventoryManager:GetWait( player )
			local noAttachSet = Costumes.allAttachmentsSet
			if inventory then
				if not inventory.settingsT.monstersT[ "Werewolf" ].hideAccessoriesB then
					noAttachSet = {}
				end
			end	
			Werewolf:WolfOutWait( playerTracker, player, inventoryManager:GetActiveSkinsWait( player ).monster, noAttachSet )
		end
	end
end


workspace.Signals.WerewolfRE.OnServerEvent:Connect( function( player, funcName, ... )
	if Werewolf[ funcName ] then
		local classS = PlayerServer.getClassWait( player.Character )
		if classS == "Werewolf" then		
			Werewolf[ funcName ]( Werewolf, PlayerServer.getPlayerTracker(), Inventory, player, ... )
		end
	else
		-- probably a hacker 
		DebugXL:Error( "Attempt to call nonexistent function Werewolf:"..tostring( funcName ) )
	end
		
end )


return Werewolf

