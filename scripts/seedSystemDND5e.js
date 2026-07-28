import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting D&D 5e System Seeding...");

    // Limpar execuções anteriores para tornar o seed idempotente
    const existingSystems = await prisma.ruleSystem.findMany({
        where: { name: "D&D 5e (2024)" }
    });
    
    for (const sys of existingSystems) {
        await prisma.compendiumEntry.deleteMany({ where: { ruleSystemId: sys.id } });
        await prisma.ruleSystem.delete({ where: { id: sys.id } });
    }

    // 1. Definição do Sheet Schema (Estrutura da ficha de D&D 5e)
    const dnd5eSheetSchema = {
        version: "5e-2024",
        attributes: {
            STR: { label: "Strength", type: "number", default: 10 },
            DEX: { label: "Dexterity", type: "number", default: 10 },
            CON: { label: "Constitution", type: "number", default: 10 },
            INT: { label: "Intelligence", type: "number", default: 10 },
            WIS: { label: "Wisdom", type: "number", default: 10 },
            CHA: { label: "Charisma", type: "number", default: 10 }
        },
        skills: {
            Acrobatics: { stat: "DEX" },
            AnimalHandling: { stat: "WIS" },
            Arcana: { stat: "INT" },
            Athletics: { stat: "STR" },
            Deception: { stat: "CHA" },
            History: { stat: "INT" },
            Insight: { stat: "WIS" },
            Intimidation: { stat: "CHA" },
            Investigation: { stat: "INT" },
            Medicine: { stat: "WIS" },
            Nature: { stat: "INT" },
            Perception: { stat: "WIS" },
            Performance: { stat: "CHA" },
            Persuasion: { stat: "CHA" },
            Religion: { stat: "INT" },
            SleightOfHand: { stat: "DEX" },
            Stealth: { stat: "DEX" },
            Survival: { stat: "WIS" }
        },
        resources: {
            hp_current: { type: "number", default: 10 },
            hp_max: { type: "number", default: 10 },
            ac: { type: "number", default: 10 },
            speed: { type: "number", default: 30 }
        }
    };

    // 2. Definição do Rule Formulas (Regras Declarativas)
    const dnd5eRuleFormulas = {
        abilityCheck: "1d20+@stat_mod",
        skillCheck: "1d20+@stat_mod+@prof_bonus",
        attackRoll: "1d20+@stat_mod+@prof_bonus",
        damageRoll: "@weapon_dice+@stat_mod"
    };

    // 3. Criação do Sistema
    const dnd5eSystem = await prisma.ruleSystem.create({
        data: {
            name: "D&D 5e (2024)",
            edition: "5e",
            isActive: true,
            sheetSchema: dnd5eSheetSchema,
            ruleFormulas: dnd5eRuleFormulas
        }
    });

    console.log(`System module 'D&D 5e' created successfully with ID: ${dnd5eSystem.id}`);

    // 4. Inserção do Compêndio Básico (SRD)
    console.log("Seeding basic Compendium Entries...");
    
    await prisma.compendiumEntry.createMany({
        data: [
            {
                ruleSystemId: dnd5eSystem.id,
                type: "monstro",
                isSRD: true,
                data: {
                    name: "Goblin",
                    hp: 7,
                    ac: 15,
                    speed: 30,
                    actions: [
                        { name: "Scimitar", type: "melee", attackBonus: 4, damageDice: "1d6+2" }
                    ]
                }
            },
            {
                ruleSystemId: dnd5eSystem.id,
                type: "arma",
                isSRD: true,
                data: {
                    name: "Longsword",
                    damageType: "slashing",
                    damageDice: "1d8",
                    properties: ["versatile (1d10)"]
                }
            },
            {
                ruleSystemId: dnd5eSystem.id,
                type: "magia",
                isSRD: true,
                data: {
                    name: "Magic Missile",
                    level: 1,
                    school: "evocation",
                    castingTime: "1 action",
                    description: "You create three glowing darts of magical force..."
                }
            }
        ]
    });

    console.log("Basic Compendium seeded successfully.");
    console.log("Sprint 2 Seed Completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
