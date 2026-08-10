import { z } from 'zod';

// Flexible table / session ID format (supports 'Mesa-01', 'table-Mesa-01', 'session:X', or UUIDs)
export const SessionIdSchema = z.string().min(1);
export const EntityIdSchema = z.string(); // Can be uuid or local id

// Common Event Meta
export const EventMetaSchema = z.object({
  sessionId: SessionIdSchema,
  timestamp: z.number().optional(), // Injected by server if missing
});

// Position Schema (Hex or Square Grid)
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional().default(0), // Elevation
});

// --- Server to Client Events (DM -> Map) ---

export const BattleStartEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    battleId: z.string(),
    combatants: z.array(z.string()),
  }),
});

export const BattleEndEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    battleId: z.string(),
  }),
});

export const EntityJoinEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
    name: z.string(),
    type: z.enum(['PC', 'NPC', 'MONSTER', 'PROP']),
    hp: z.number(),
    maxHp: z.number(),
    position: PositionSchema,
    visible: z.boolean().default(true),
  }),
});

export const EntityLeaveEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
  }),
});

export const EntityMoveEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
    position: PositionSchema,
    animate: z.boolean().default(true),
  }),
});

export const EntityDamageEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
    amount: z.number(),
    damageType: z.string().optional(),
    currentHp: z.number(),
  }),
});

export const EntityConditionEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
    condition: z.string(),
    action: z.enum(['ADD', 'REMOVE']),
  }),
});

export const TurnChangeEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    activeEntityId: EntityIdSchema.nullable(), // null means round ended or no combat
    roundNumber: z.number(),
  }),
});

export const MapRevealEventSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    // Reveal shapes: circles or polygons
    shapes: z.array(
      z.object({
        type: z.enum(['CIRCLE', 'POLYGON']),
        x: z.number().optional(),
        y: z.number().optional(),
        radius: z.number().optional(),
        points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
      })
    ),
  }),
});

// --- Client to Server Requests (Map -> DM) ---

export const RequestEntityMoveSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    entityId: EntityIdSchema,
    targetPosition: PositionSchema,
  }),
});

export const BattleSnapshotRequestSchema = z.object({
  meta: EventMetaSchema,
});

export const BattleSnapshotResponseSchema = z.object({
  meta: EventMetaSchema,
  payload: z.object({
    battleId: z.string().nullable(),
    roundNumber: z.number().default(0),
    activeEntityId: EntityIdSchema.nullable(),
    entities: z.array(
      z.object({
        entityId: EntityIdSchema,
        position: PositionSchema,
        hp: z.number(),
        maxHp: z.number(),
        conditions: z.array(z.string()),
        visible: z.boolean(),
      })
    ),
  }),
});

// Type Exports
export type SessionId = z.infer<typeof SessionIdSchema>;
export type Position = z.infer<typeof PositionSchema>;

export type BattleStartEvent = z.infer<typeof BattleStartEventSchema>;
export type BattleEndEvent = z.infer<typeof BattleEndEventSchema>;
export type EntityJoinEvent = z.infer<typeof EntityJoinEventSchema>;
export type EntityLeaveEvent = z.infer<typeof EntityLeaveEventSchema>;
export type EntityMoveEvent = z.infer<typeof EntityMoveEventSchema>;
export type EntityDamageEvent = z.infer<typeof EntityDamageEventSchema>;
export type EntityConditionEvent = z.infer<typeof EntityConditionEventSchema>;
export type TurnChangeEvent = z.infer<typeof TurnChangeEventSchema>;
export type MapRevealEvent = z.infer<typeof MapRevealEventSchema>;

export type RequestEntityMove = z.infer<typeof RequestEntityMoveSchema>;
export type BattleSnapshotRequest = z.infer<typeof BattleSnapshotRequestSchema>;
export type BattleSnapshotResponse = z.infer<typeof BattleSnapshotResponseSchema>;
