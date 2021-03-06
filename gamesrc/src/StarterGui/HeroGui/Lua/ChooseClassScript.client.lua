
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local InstanceXL         = require( game.ReplicatedStorage.Standard.InstanceXL )
local InputXL            = require( game.ReplicatedStorage.Standard.InputXL )

local InventoryClient    = require( game.ReplicatedStorage.InventoryClient )
local PossessionData     = require( game.ReplicatedStorage.PossessionData )

local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize

local heroGuiFrame = script.Parent.Parent:WaitForChild("HeroGui") 
local chooseClassFrame = heroGuiFrame:WaitForChild("ChooseClass")

local function ChooseClass( classNameS )
	workspace.Signals.HeroesRE:FireServer( "ChooseClass", classNameS )
	workspace.Signals.MainRE:FireServer( "SignalReady" )	
	heroGuiFrame.Visible = false
	chooseClassFrame.Visible = false
--  jump into play with your new class, what is there to do?
end


local function Refresh()
	InstanceXL:ClearAllChildrenBut( chooseClassFrame.Grid, "UIGridLayout" )
	local idxN = 0
	for classId, heroDatum in pairs( CharacterClasses.heroStartingStats ) do
		
		local heroButton = chooseClassFrame.HeroButtonTemplate:Clone()
		heroButton.Name = "Hero"..idxN
		idxN = idxN + 1
		heroButton.HeroName.Text = PossessionData.dataT[ classId ].readableNameS
		heroButton.Description.Text = Localize.formatByKey( classId.."Description" )
		heroButton.Image.Image = PossessionData.dataT[ classId ].imageId
		heroButton.Visible = true
		
		function hasClass( heroDatum )
			return not heroDatum.gamePassId or InventoryClient:GetCount( classId ) > 0 
		end

		if not hasClass( heroDatum ) then
			heroButton.Padlock.Visible = true
			heroButton.Choose.Text = "Unlock"
		end

		local function clickChooseHero()
			if hasClass( heroDatum ) then
				ChooseClass( classId )
			else
				if( heroDatum.gamePassId )then
					game.MarketplaceService:PromptGamePassPurchase( game.Players.LocalPlayer, heroDatum.gamePassId )
				else
					DebugXL:Error( "Vanilla hero class unavailable")
				end
			end
		end

		heroButton.Image.MouseButton1Click:Connect( clickChooseHero )
		heroButton.Choose.MouseButton1Click:Connect( clickChooseHero )

		heroButton.Parent = chooseClassFrame.Grid

		if InputXL:UsingGamepad() then
			if idxN==1 then
				game.GuiService.SelectedObject = heroButton.Choose
			end 
		end		
	end
end

Refresh()

InventoryClient:InventoryUpdatedConnect( function()
	-- refresh window
	Refresh()
end)