# Replace ID in packs

This script replaces item / entity ID on incoming compendiums with the old ID in the custom compendiums.

![Compendium Logic](compendium-logic.png)

- If the item on own compendium does not match item on incoming
  - Change item on incoming with old ID
- Item on own compendium doesn't exist on incoming
  - Keep new item on own compendium 
- New item on incoming compendium
  - ~~Add own item with own ID on incoming compendium~~

## How to use

- Install `node` on your shell package manager. If you are using Windows and do not know how to install `node`, you can [install Chocolately](https://gist.github.com/callunaborealis/d170ff62325aa2522f66947ee2558605).
- Once Chocolately is installed, run `choco install nodejs` and restart your Powershell environment.

```sh
node -v
# There should be a version here
```

- Add two folders on the same directory as the script: `data/` and `packs/`.
  - - `/FoundryVTT/Data/systems/dnd5e/packs`
    - Compendium (Incoming)
    - kept in `*.db` files, line break separated JSON in 1 file
  - `/FoundryVTT/Data/worlds/{your_world_name}/data`
    - Own data, worlds-specific (with custom data)
    - kept in `*.db` files, line break separated JSON in 1 file

```sh
# packs -> folder containing compendium data files
# data -> folder containing worlds-specific data
sh run.sh packs/ data/
```
