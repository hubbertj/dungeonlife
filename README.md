# dungeon life

Here's everything you need to build and run your own shard of Dungeon Life (https://www.roblox.com/games/2184151436/Dungeon-Life)!

Let me get this out of the way: I'm embarrassed to let people look at this code. My main excuse for the state it's in is that building up tech debt is a good idea for indies who don't know how long they're going to stick with a project, because it's a debt you probably never have to pay back. For me, the *most* embarrassing part are the Hero and Monster classes themselves; there is a lot of duplicate code in there. :scream:

The second most embarrassing part is that I switched to typescript partway through but it is still half in Lua.

But! I want to give back to the community, I want people to be able to do what they want with Dungeon Life, and I'm hoping that just maybe someone will make some cool stuff that they'll share back. So here goes.

And that said, there's more here I'm proud of than embarrassed of--at least half of it *is* in Typescript, it has a nice suite of automated tests that have saved my bacon multiple times, for the most part it is data driven, and it generally avoids stateful things when not necessary (the mob AI for example)--so if you see something you don't like chances are I did it that way for a reason. Feel free to ask why!

A good place to ask would be on the Discord (https://discord.gg/7BQNSu which requires a Roblox username) or Twitter (https://twitter.com/happionlabs.)

# don't download, clone

You must clone, you can't download, because Dungeon Life uses git-lfs. If you clone, it should prompt you to set git-lfs up automatically. (git-lfs is needed for the RBLX and other large files.)

# building

Anyways, here's how to build for the first time. Some of these instructions are adapted from (https://roblox-ts.github.io/docs/guides/github-installation.)

You'll need git. https://git-scm.com/

You'll need NodeJS if you don't already have it. https://nodejs.org/en/ 

You'll want to use VS Code for your text editor. https://code.visualstudio.com/

You'll need Rojo. https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo

Once you've got those things, you're ready to start. From a dos command line clone dungeon life:
```
  >git clone https://github.com/JamieFristrom/dungeonlife.git
```
I keep the version of roblox-ts I use in a submodule. To update the submodule (this command is overkill but habit for me)
```
>git submodule update --init --recursive
```
Then you can do the stuff from the roblox-ts github installation page:
```
>cd roblox-ts
>npm install
>tsc
>npm link
```
And now you should be able to build Dungeon Life:
```
  >cd ..\gamesrc
  >rbxtsc --verbose
```

Now you need the Roblox place to actually put this code! Open the rbxl/DungeonLifeOpenTemplate.rbxlx in Roblox and publish it. Go to Game Settings and enable Studio API Access. 

Give me credit! Configure your place and in your description put: "Made with Dungeon Life by Jamie Fristrom: https://www.roblox.com/games/2184151436"

The place won't do anything by itself; you still need to build the source and suck it in with Rojo. How to use Rojo is beyond the scope of this article. (https://github.com/rojo-rbx/rojo) The TL;DR is that you open the dungeonlife folder in VS Code and should then be able to use Rojo to transfer the files into Roblox.

Run the game from within Roblox! If you did everything exactly right and there are no unforseen problems with your setup it should work!

If you have problems let me know (join the Discord or message @happionlabs on twitter) but I can't promise speedy answers!

# turning off the automated tests

I usually leave quick-and-dirty suite of automated tests enabled that will run automatically in studio and take a couple of minutes. To turn those tests off, go to RunTests.server.ts and set

`const runTests = false`

# adding the localization table

If you play the game now it'll seem weird because it's showing you localization key entries instead of the actual translations. To fix, use the Localization Tools plug in in Studio; choose 'Click hereo to configure your cloud localization table' and on the website choose English as the source language. 
Then Replace the entire cloud table with CSV and choose loc/GameLocalizationTable.csv. That should upload all the translations. 

# importing the animations

Ok this is a pain because unlike other assets Roblox doesn't let you share them. If that ever changes let me know!

To get the animations into your place you'll need the Animation Editor plug-in.

In your place, right click Workspace and **Insert from file**; choose rbxm/DungeonLifeAnimations.rbxm. That will insert an AnimationDummy into your place.

Open the Animation Editor, select the Dummy you've just imported, and go to ... -> Load -> AttackBothHands1.
![alt text](https://i.gyazo.com/40997aff0094c3b2b814405ca770b76e.png "Logo Title Text 1")

Then File -> Export -> (Create New) and save it under the name AttackBothHands1.

Repeat the process for every animation in the Load menu. 

Now you have to teach the game the asset ids of those animations. You can find the animation ids by going to Create on the Roblox Website and choosing Animations. (If your place is under a group you'll also have to look under the Group Creations tab.) For each animation, click on it and copy the URL. Then go into the AnimationManifest.ts file and paste that URL into the AnimationId of the animation with the same name. Again, do this for every animation.

Thanks to that, your codebase now differs from the one in git, so you may want to have your own fork or branch with your own animation manifest. 

And now the animations should work! Your avatars should now swing their swords and fire their bows deliciously.

Sorry it's so much work! That's honestly the easiest way I've found for getting the animations up-and-running the first time, if anybody can think of a better way let me know.

# it's not you it's me

Known problem: the in-app purchases are still wired to the original Game; you'll have to create your own in-app purchases and change the ids in order to let people buy things in yours.

If you spot other problems, it's probably because there are other issues running the code in a standalone place. You can check my test place https://www.roblox.com/games/4476008779: if the bug happens there too, it's not you, it's me. :) Let me know! 
