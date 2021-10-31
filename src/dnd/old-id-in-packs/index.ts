/**
 * Replace anchor ID (outdated) with new anchor referring to a list of compendiums
 *
 * Replace item / entity ID on incoming compendiums with the old ID in the custom compendiums
 *
 * - Item on own compendium does not match item on incoming ==> Change item on incoming with old ID
 * - Item on own compendium doesn't exist on incoming ==> Add own item with own ID on incoming compendium
 * - New item on incoming compendium ==> Keep new item on incoming
 *
 * /FoundryVTT/Data/systems/dnd5e/packs --> Compendium (Incoming) (kept in .db files, line break separated JSON in 1 file)
 * /FoundryVTT/Data/worlds/size-does-matter/data --> Own (with custom data) (kept in .db files, line break separated JSON in 1 file)
 *
 */
