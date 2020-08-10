
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as GameManagement from "ServerStorage/Standard/GameManagementModule"

import { PlayerProxy, PlayerSessionKey } from "ReplicatedStorage/TS/PlayerProxy"
import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"
import { PlayerTracker } from 'ServerStorage/TS/PlayerServer'

import { Players, Workspace, ReplicatedStorage, Teams } from '@rbxts/services'
import { PlayerUtility } from 'ReplicatedStorage/TS/PlayerUtility'
import { TestUtility } from 'ReplicatedStorage/TS/TestUtility'


class InstanceFake implements Instance {
    _dummyInstance: Instance

    constructor(dummyInstance?: Instance) {
        if (dummyInstance) {
            this._dummyInstance = dummyInstance
        }
        else {
            this._dummyInstance = new Instance("Folder")
        }
        this.AncestryChanged = this._dummyInstance.AncestryChanged
        this.ChildAdded = this._dummyInstance.ChildAdded
        this.ChildRemoved = this._dummyInstance.ChildRemoved
        this.DescendantAdded = this._dummyInstance.DescendantAdded
        this.DescendantRemoving = this._dummyInstance.DescendantRemoving
        this.ClassName = "Player"
    }

    RobloxLocked: boolean = false
    //get RobloxLocked() { return this._basePart.Locked }

    GetDebugId(scopeLength?: number): string { return "I don't know what this is" }

    ClassName: "Instance" | "ABTestService" | "Accoutrement" | "AdService" | "AdvancedDragger" | "AnalyticsService" | "Animation" | "AnimationController" | "AnimationTrack" | "Animator" | "AssetService" | "Attachment" | "Backpack" | "BackpackItem" | "BadgeService" | "BasePlayerGui" | "Beam" | "BindableEvent" | "BindableFunction" | "BodyMover" | "BrowserService" | "CacheableContentProvider" | "Camera" | "ChangeHistoryService" | "CharacterAppearance" | "Chat" | "ClickDetector" | "ClusterPacketCache" | "CollectionService" | "Configuration" | "Constraint" | "ContentProvider" | "ContextActionService" | "Controller" | "ControllerService" | "CookiesService" | "CorePackages" | "CoreScriptSyncService" | "CustomEvent" | "CustomEventReceiver" | "DataModelMesh" | "DataStoreService" | "Debris" | "DebugSettings" | "DebuggerBreakpoint" | "DebuggerManager" | "DebuggerWatch" | "Dialog" | "DialogChoice" | "Dragger" | "Explosion" | "FaceInstance" | "Feature" | "File" | "Fire" | "FlagStandService" | "FlyweightService" | "Folder" | "ForceField" | "FriendService" | "FunctionalTest" | "GamePassService" | "GameSettings" | "GamepadService" | "Geometry" | "GlobalDataStore" | "GoogleAnalyticsConfiguration" | "GroupService" | "GuiBase" | "GuiService" | "GuidRegistryService" | "HapticService" | "Hopper" | "HttpRbxApiService" | "HttpRequest" | "HttpService" | "Humanoid" | "HumanoidDescription" | "InputObject" | "InsertService" | "JointInstance" | "JointsService" | "KeyboardService" | "Keyframe" | "KeyframeMarker" | "KeyframeSequence" | "KeyframeSequenceProvider" | "Light" | "Lighting" | "LocalStorageService" | "LocalizationService" | "LocalizationTable" | "LogService" | "LoginService" | "LuaSettings" | "LuaSourceContainer" | "LuaWebService" | "MarketplaceService" | "Message" | "MessagingService" | "Mouse" | "MouseService" | "NetworkMarker" | "NetworkPeer" | "NetworkReplicator" | "NetworkSettings" | "NoCollisionConstraint" | "NotificationService" | "PVInstance" | "PackageLink" | "PackageService" | "Pages" | "PartOperationAsset" | "ParticleEmitter" | "Path" | "PathfindingService" | "PhysicsPacketCache" | "PhysicsService" | "PhysicsSettings" | "Player" | "PlayerScripts" | "Players" | "Plugin" | "PluginAction" | "PluginDragEvent" | "PluginGuiService" | "PluginManager" | "PluginMenu" | "PluginToolbar" | "PluginToolbarButton" | "PointsService" | "Pose" | "PostEffect" | "RbxAnalyticsService" | "ReflectionMetadata" | "ReflectionMetadataCallbacks" | "ReflectionMetadataClasses" | "ReflectionMetadataEnums" | "ReflectionMetadataEvents" | "ReflectionMetadataFunctions" | "ReflectionMetadataItem" | "ReflectionMetadataProperties" | "ReflectionMetadataYieldFunctions" | "RemoteEvent" | "RemoteFunction" | "RenderSettings" | "RenderingTest" | "ReplicatedFirst" | "ReplicatedStorage" | "RobloxPluginGuiService" | "RobloxReplicatedStorage" | "RunService" | "RuntimeScriptService" | "ScriptContext" | "ScriptDebugger" | "ScriptService" | "Selection" | "ServerScriptService" | "ServerStorage" | "ServiceProvider" | "Sky" | "Smoke" | "SocialService" | "Sound" | "SoundEffect" | "SoundGroup" | "SoundService" | "Sparkles" | "SpawnerService" | "StarterGear" | "StarterPack" | "StarterPlayer" | "StarterPlayerScripts" | "Stats" | "StatsItem" | "StopWatchReporter" | "Studio" | "StudioData" | "StudioService" | "StudioTheme" | "TaskScheduler" | "Team" | "Teams" | "TeleportService" | "TerrainRegion" | "TestService" | "TextFilterResult" | "TextService" | "ThirdPartyUserService" | "TimerService" | "TouchInputService" | "TouchTransmitter" | "Trail" | "Translator" | "TweenBase" | "TweenService" | "UIBase" | "UserGameSettings" | "UserInputService" | "VRService" | "ValueBase" | "VersionControlService" | "VirtualInputManager" | "VirtualUser" | "Visit" | "WeldConstraint" | "Accessory" | "Hat" | "HopperBin" | "Tool" | "Flag" | "CoreGui" | "PlayerGui" | "StarterGui" | "BodyAngularVelocity" | "BodyForce" | "BodyGyro" | "BodyPosition" | "BodyThrust" | "BodyVelocity" | "RocketPropulsion" | "MeshContentProvider" | "SolidModelContentProvider" | "BodyColors" | "CharacterMesh" | "Clothing" | "ShirtGraphic" | "Skin" | "Pants" | "Shirt" | "AlignOrientation" | "AlignPosition" | "AngularVelocity" | "BallSocketConstraint" | "HingeConstraint" | "LineForce" | "RodConstraint" | "RopeConstraint" | "SlidingBallConstraint" | "SpringConstraint" | "Torque" | "VectorForce" | "CylindricalConstraint" | "PrismaticConstraint" | "HumanoidController" | "SkateboardController" | "VehicleController" | "BevelMesh" | "FileMesh" | "BlockMesh" | "CylinderMesh" | "SpecialMesh" | "Decal" | "Texture" | "Hole" | "MotorFeature" | "CSGDictionaryService" | "NonReplicatedCSGDictionaryService" | "OrderedDataStore" | "GuiBase2d" | "GuiBase3d" | "GuiObject" | "LayerCollector" | "Frame" | "GuiButton" | "GuiLabel" | "ScrollingFrame" | "TextBox" | "ViewportFrame" | "ImageButton" | "TextButton" | "ImageLabel" | "TextLabel" | "BillboardGui" | "PluginGui" | "ScreenGui" | "SurfaceGui" | "DockWidgetPluginGui" | "QWidgetPluginGui" | "GuiMain" | "FloorWire" | "PVAdornment" | "PartAdornment" | "SelectionLasso" | "HandleAdornment" | "ParabolaAdornment" | "SelectionBox" | "SelectionSphere" | "BoxHandleAdornment" | "ConeHandleAdornment" | "CylinderHandleAdornment" | "ImageHandleAdornment" | "LineHandleAdornment" | "SphereHandleAdornment" | "HandlesBase" | "SurfaceSelection" | "ArcHandles" | "Handles" | "SelectionPartLasso" | "SelectionPointLasso" | "DynamicRotate" | "Glue" | "ManualSurfaceJointInstance" | "Motor" | "Rotate" | "Snap" | "VelocityMotor" | "Weld" | "RotateP" | "RotateV" | "ManualGlue" | "ManualWeld" | "Motor6D" | "PointLight" | "SpotLight" | "SurfaceLight" | "AppStorageService" | "UserStorageService" | "BaseScript" | "ModuleScript" | "CoreScript" | "Script" | "LocalScript" | "Hint" | "PlayerMouse" | "PluginMouse" | "NetworkClient" | "NetworkServer" | "ClientReplicator" | "ServerReplicator" | "BasePart" | "Model" | "CornerWedgePart" | "FormFactorPart" | "Terrain" | "TriangleMeshPart" | "TrussPart" | "VehicleSeat" | "Part" | "WedgePart" | "FlagStand" | "Platform" | "Seat" | "SkateboardPlatform" | "SpawnLocation" | "MeshPart" | "PartOperation" | "NegateOperation" | "UnionOperation" | "Status" | "Workspace" | "DataStorePages" | "FriendPages" | "InventoryPages" | "StandardPages" | "EmotesPages" | "BloomEffect" | "BlurEffect" | "ColorCorrectionEffect" | "SunRaysEffect" | "ReflectionMetadataClass" | "ReflectionMetadataEnum" | "ReflectionMetadataEnumItem" | "ReflectionMetadataMember" | "DataModel" | "GenericSettings" | "AnalysticsSettings" | "GlobalSettings" | "UserSettings" | "ChorusSoundEffect" | "CompressorSoundEffect" | "DistortionSoundEffect" | "EchoSoundEffect" | "EqualizerSoundEffect" | "FlangeSoundEffect" | "PitchShiftSoundEffect" | "ReverbSoundEffect" | "TremoloSoundEffect" | "StarterCharacterScripts" | "RunningAverageItemDouble" | "RunningAverageItemInt" | "RunningAverageTimeIntervalItem" | "TotalCountTimeIntervalItem" | "Tween" | "UIComponent" | "UIConstraint" | "UILayout" | "UIPadding" | "UIScale" | "UIAspectRatioConstraint" | "UISizeConstraint" | "UITextSizeConstraint" | "UIGridStyleLayout" | "UIGridLayout" | "UIInlineLayout" | "UIListLayout" | "UIPageLayout" | "UITableLayout" | "BinaryStringValue" | "BoolValue" | "BrickColorValue" | "CFrameValue" | "Color3Value" | "DoubleConstrainedValue" | "IntConstrainedValue" | "IntValue" | "NumberValue" | "ObjectValue" | "RayValue" | "StringValue" | "Vector3Value";
    // get ClassName() { return this._basePart.ClassName }

    Archivable: boolean = false
    // get Archivable() { return this._basePart.Archivable }
    // set Archivable(archivable: boolean) { this._basePart.Archivable = archivable }

    Name: string = "Name"
    // get Name() { return this._basePart.Name }
    // set Name(name: string) { this._basePart.Name = name }

    Parent: Instance | undefined = undefined
    // get Parent(): Instance | undefined { return this._basePart.Parent }
    // set Parent(parent: Instance | undefined) {this._basePart.Parent = parent}

    ClearAllChildren(): void { this._dummyInstance.ClearAllChildren() }

    Clone(): this { return new InstanceFake(this._dummyInstance.Clone()) as this }

    Destroy(): void { this._dummyInstance.Destroy() }

    FindFirstAncestor<T extends Instance = Instance>(name: string): T | undefined { return this._dummyInstance.FindFirstAncestor<T>(name) }

    FindFirstAncestorOfClass<T extends Instance["ClassName"]>(className: T): StrictInstances[T] | undefined {
        return this._dummyInstance.FindFirstAncestorOfClass<T>(className)
    }
    //	FindFirstAncestorOfClass(className: string): Instance | undefined { return undefined }

    FindFirstAncestorWhichIsA<T extends keyof Instances>(className: T): Instances[T] | undefined {
        return this._dummyInstance.FindFirstAncestorWhichIsA<T>(className)
    }
    //	FindFirstAncestorWhichIsA(className: string): Instance | undefined { return undefined }

    FindFirstChild<T extends Instance = Instance>(name: string, recursive?: boolean): T | undefined {
        return this._dummyInstance.FindFirstChild<T>(name, recursive)
    }

    FindFirstChildOfClass<T extends Instance["ClassName"]>(className: T): StrictInstances[T] | undefined {
        return this._dummyInstance.FindFirstChildOfClass<T>(className)
    }
    //	FindFirstChildOfClass(className: string): Instance | undefined { return undefined }

    FindFirstChildWhichIsA<T extends keyof Instances>(className: T, recursive?: boolean): Instances[T] | undefined {
        return this._dummyInstance.FindFirstChildWhichIsA<T>(className, recursive)
    }
    //	FindFirstChildWhichIsA(className: string, recursive?: boolean): Instance | undefined { return undefined }

    GetChildren<T extends Instance = Instance>(): Array<T> {
        return this._dummyInstance.GetChildren<T>()
    }

    GetDescendants(): Array<Instance> {
        return this._dummyInstance.GetDescendants()
    }

    GetFullName(): string {
        return this._dummyInstance.GetFullName()
    }

    GetPropertyChangedSignal<T extends GetProperties<this>>(propertyName: T): RBXScriptSignal {
        return this._dummyInstance.GetPropertyChangedSignal(propertyName as GetProperties<BasePart>)
    }
    //	GetPropertyChangedSignal(propertyName: string): RBXScriptSignal { return undefined }

    IsA<
        T extends {
            [K in keyof Instances]: Instances[K]["ClassName"] extends this["ClassName"]
            ? this extends Instances[K]
            ? never
            : K
            : never
        }[keyof Instances]
    >(
        className: T,
    ): this is Instances[T] {
        return this._dummyInstance.IsA(className)
    }
    //	IsA(className: string): boolean { return false }

    IsAncestorOf(descendant: Instance): boolean { return this._dummyInstance.IsAncestorOf(descendant) }

    IsDescendantOf(ancestor: Instance): boolean { return this._dummyInstance.IsDescendantOf(ancestor) }

    WaitForChild<T extends Instance = Instance>(childName: string): T {
        return this._dummyInstance.WaitForChild<T>(childName)
    }
    // WaitForChild<T extends Instance = Instance>(childName: string, timeOut: number): T | undefined { 
    //     return this._basePart.WaitForChild<T>(childName, timeOut)
    // }

    AncestryChanged: RBXScriptSignal
    ChildAdded: RBXScriptSignal
    ChildRemoved: RBXScriptSignal
    DescendantAdded: RBXScriptSignal
    DescendantRemoving: RBXScriptSignal
}

class MouseFake extends InstanceFake {
    constructor() {
        super()
        this.ClassName = "Mouse"
    }

    readonly Hit: CFrame = new CFrame();

    Icon: string = "";

    readonly Origin: CFrame = new CFrame();

    readonly Target?: BasePart;

    TargetFilter?: Instance;

    readonly TargetSurface: Enum.NormalId = Enum.NormalId.Back;

    readonly UnitRay: Ray = new Ray(new Vector3(), new Vector3())

    readonly ViewSizeX: number = 0;

    readonly ViewSizeY: number = 0;

    readonly X: number = 0;

    readonly Y: number = 0;
}

class PlayerFake extends InstanceFake {
    constructor() {
        super()
        this.CharacterAdded = super._dummyInstance.ChildAdded
        this.CharacterAppearanceLoaded = super._dummyInstance.ChildAdded
        this.CharacterRemoving = super._dummyInstance.ChildRemoved
    }

    SetAccountAge(accountAge: number) { }
    SetSuperSafeChat(value: boolean) { }

    readonly AccountAge: number = 0
    AutoJumpEnabled: boolean = false
    CameraMaxZoomDistance: number = 0
    CameraMinZoomDistance: number = 0
    CameraMode: Enum.CameraMode = Enum.CameraMode.Classic
    CanLoadCharacterAppearance: boolean = false
    Character?: Model = undefined
    CharacterAppearanceId: number = 0
    DevCameraOcclusionMode: Enum.DevCameraOcclusionMode = Enum.DevCameraOcclusionMode.Invisicam
    DevComputerCameraMode: Enum.DevComputerCameraMovementMode = Enum.DevComputerCameraMovementMode.Classic
    DevComputerMovementMode: Enum.DevComputerMovementMode = Enum.DevComputerMovementMode.UserChoice
    DevEnableMouseLock: boolean = false
    DevTouchCameraMode: Enum.DevTouchCameraMovementMode = Enum.DevTouchCameraMovementMode.Classic
    DevTouchMovementMode: Enum.DevTouchMovementMode = Enum.DevTouchMovementMode.UserChoice
    readonly FollowUserId: number = 0
    readonly GameplayPaused: boolean = false
    HealthDisplayDistance: number = 0
    readonly LocaleId: string = ""
    readonly MembershipType: Enum.MembershipType = Enum.MembershipType.None
    NameDisplayDistance: number = 0
    Neutral: boolean = false
    ReplicationFocus: BasePart | undefined
    RespawnLocation?: SpawnLocation
    Team?: Team
    TeamColor: BrickColor = new BrickColor(1)
    readonly UserId: number = 0

    ClearCharacterAppearance(): void { }
    DistanceFromCharacter(point: Vector3): number { return 0 }
    GetJoinData(): PlayerJoinInfo { return { SourcePlaceId: 0, Members: [] } }
    HasAppearanceLoaded(): boolean { return true }
    Kick(message?: string): void { }
    Move(walkDirection: Vector3, relativeToCamera?: boolean): void { }
    GetFriendsOnline(maxFriends?: number): Array<FriendOnlineInfo> { return [] }
    GetRankInGroup(groupId: number): number { return 0 }
    GetRoleInGroup(groupId: number): string { return "" }
    IsFriendsWith(userId: number): boolean { return false }
    IsInGroup(groupId: number): boolean { return false }
    LoadCharacter(): void { }
    LoadCharacterWithHumanoidDescription(humanoidDescription: HumanoidDescription): void { }

    readonly CharacterAdded: RBXScriptSignal<(character: Model) => void>
    readonly CharacterAppearanceLoaded: RBXScriptSignal<(character: Model) => void>
    readonly CharacterRemoving: RBXScriptSignal<(character: Model) => void>
}

// class PlayerProxyFake implements PlayerProxy {
//     private _dummyInstace: Instance
//     constructor() {
//         this._dummyInstace = new Instance("Part")
//     }
//     awaitStarterGear(): Folder {
//         return InstanceUtility.findOrCreateChild(this._dummyInstace, "StarterGear", "Folder")
//     }
//     awaitBackpack(): Folder {
//         return InstanceUtility.findOrCreateChild(this._dummyInstace, "Backpack", "Folder")
//     }
//     getTeam(): Team | undefined {
//         return Teams.GetTeams()[0]
//     }
//     getName(): string {
//         return this._dummyInstace.Name
//     }
//     awaitLeaderstatsFolder(): Model {
//         return InstanceUtility.findOrCreateChild(this._dummyInstace, "leaderstats", Model)
//     }
//     getSessionKey(): PlayerSessionKey {
//         return this._dummyInstace
//     }
//     fireClientEvent(remoteEvent: RemoteEvent, command: string, arg:unknown ): void {
//     }
//     getUserId(): number {
//         return 0
//     }
//     stillExists(): boolean {
//         return true
//     }
// }

// Test New Fakes
let testNewProxy = new InstanceFake()
DebugXL.Assert(testNewProxy !== undefined)

const testCharacter = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("AnimationDummy")!.Clone()
let playerDummy = TestUtility.getTestPlayer()
PlayerUtility.publishClientValues( playerDummy, 0, 0, "", false )
playerDummy.Team = Teams.FindFirstChild<Team>("Monsters")
//const playerDummy = new Instance("Player") as Player // ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Folder>("PlayerDummy")!.Clone() as unknown as Player
let testPlayerTracker = new PlayerTracker
testPlayerTracker.playerAdded(playerDummy)
testPlayerTracker.setClassChoice(playerDummy,"Orc")
// test that MonsterAddedWait returns before too long
let result = undefined
spawn( ()=>{
    result = GameManagement.MonsterAddedWait(testCharacter, playerDummy, testPlayerTracker)
})
wait(5)
DebugXL.Assert(result !== undefined)
TestUtility.cleanTestPlayer(playerDummy)


