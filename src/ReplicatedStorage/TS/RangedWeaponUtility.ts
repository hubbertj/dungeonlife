import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { BaseWeaponUtility } from './BaseWeaponUtility'
import { FlexTool } from './FlexToolTS'

import { Players } from '@rbxts/services'

type Character = Model

export class RangedWeaponUtility extends BaseWeaponUtility {
    weaponBE: BindableEvent

    constructor(tool: Tool, public flexTool: FlexTool, private readonly projectileName: string) {
        super(tool, flexTool)
        DebugXL.logI('Items', 'RangedWeaponUtility constructor for ' + tool.GetFullName())
        this.weaponBE = tool.WaitForChild<BindableEvent>('RangedWeaponBE')
    }

    _aimAtTarget(character: Character, target?: Character) {
        const projectileDisplay = this.tool.FindFirstChild<BasePart>(this.projectileName)

        this.tool.Enabled = false
        if (projectileDisplay) {    // display projectile when nocked or held, disappears when fired
            projectileDisplay.Transparency = 1
        }

        if (target) {
            // if PC, then the mouse-aim is pointing us in the correct direction
            const player = Players.GetPlayerFromCharacter(character)
            if (!player) {
                // the CFrame technique hitched rather badly
                this._mobAimAtTarget(character, target)
            }
        }
    }

    _afterEffects() {
        const projectileDisplay = this.tool.FindFirstChild<BasePart>(this.projectileName)
        if (projectileDisplay) {
            projectileDisplay.Transparency = 0
        }
    }

    static projectileCounter = 0

    _mobActivate(target: Character) {
        const targetV3 = target.GetPrimaryPartCFrame().p
        // bindable rather than a direct function call seems the most consistent way to communicate -
        // with players it's a client-server remote event, so this dovetails
        this.weaponBE.Fire('OnActivated', targetV3, 'MobProjectile' + RangedWeaponUtility.projectileCounter)
        RangedWeaponUtility.projectileCounter++
    }
}
