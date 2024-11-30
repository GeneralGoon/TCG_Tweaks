import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ImporterUtil } from "@spt/utils/ImporterUtil";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ImodTGCDatabase } from "@spt/modTGC/ImodTGCDatabase";
import { ImodTGCItem, ImodTGCLocale } from "@spt/modTGC/ImodTGCItem";

class Mod implements IPostDBLoadMod
{
    private mydb:       ImodTGCDatabase;

    //private modConfig = require("../config/config.json");
    public postDBLoad(container: DependencyContainer): void
    {
        const modLoader =           container.resolve<PreSptModLoader>("PreSptModLoader");
        const databaseImporter =    container.resolve<ImporterUtil>("ImporterUtil");
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables: IDatabaseTables = databaseServer.getTables();
        const items = Object.values(tables.templates.items);

        const modFolderName =   "MoxoPixel-TacticalGearComponent";

        this.mydb = databaseImporter.loadRecursive(`${modLoader.getModPath(modFolderName)}database/`);


        // put all the headsets in the game into an array
        const headsets = [];

        for (const item of items) 
        {
            if (itemHelper.isOfBaseclass(item._id, BaseClasses.HEADPHONES))
            {
                headsets.push(item._id)
            }
        }

        // put all TGC items with parent of headgear into an array
        const tgcHeadgear = [];

        for (const [modTGCID, modTGCItem] of Object.entries(this.mydb.modTGC_items))
        {
            if (modTGCItem.handbook.ParentId == "5b47574386f77428ca22b330")
            {
                tgcHeadgear.push(modTGCID)
            }
        }

        // iter thru db , if item is in tgc headgear list, change the headset slot filter to include all headsets
        for (const item of items) 
        {
            if (tgcHeadgear.includes(item._id))
            {
                for (const slot of item._props.Slots)
                {
                    if (slot._name == "mod_equipment_001") {
                        slot._props.filters[0].Filter = headsets
                    }
                }
            }
        }
    }
}

export const mod = new Mod();
