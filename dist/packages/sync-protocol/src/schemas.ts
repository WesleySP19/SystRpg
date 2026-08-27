import { z } from 'zod';

// Flexible table / session ID format (supports 'Mesa-01', 'table-Mesa-01', 'session:X', numeric IDs, or UUIDs)
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

// ============================================================================
// SYNC-MESH SCHEMAS (Fase 2) — Real-world synchronization events
// ============================================================================

// --- Chat Message Schema (matches normalizeChatMessage output) ---
export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  message: z.string(),
  isSystem: z.boolean().default(false),
  isRoll: z.boolean().default(false),
  formula: z.string().default(''),
  total: z.number().nullable().default(null),
  details: z.string().default(''),
  timestamp: z.number(),
  avatar: z.string().default(''),
  tipo: z.enum(['geral', 'sistema', 'rolagem', 'sussurro', 'voz_divina', 'alerta']).default('geral'),
  nome: z.string(),
  de: z.string(),
  para: z.string().default('todos'),
  conteudo: z.string(),
});

// --- Player Profile Schema (jogador connecting via QR/token) ---
export const PlayerProfileSchema = z.object({
  characterId: z.string(),
  tableId: z.string(),
  sessionToken: z.string().optional(),
  nome: z.string(),
  avatar: z.string().default(''),
  classe: z.string().default(''),
  connected: z.boolean().default(false),
});

// --- Delta State Update Schema (RFC 6902 JSON Patch) ---
export const PatchOperationSchema = z.object({
  op: z.enum(['add', 'remove', 'replace']),
  path: z.string(),
  value: z.any().optional(),
});

export const DeltaStateUpdateSchema = z.object({
  patches: z.array(PatchOperationSchema),
  version: z.number(),
});

// --- Player Presence Schema (Awareness/Heartbeat) ---
export const PlayerPresenceSchema = z.object({
  charId: z.string(),
  name: z.string(),
  tableId: z.string(),
  status: z.enum(['online', 'idle', 'offline']).default('online'),
  lastSeen: z.number(),
});

// --- State Update with Version (full state broadcast with version tracking) ---
export const VersionedStateSchema = z.object({
  version: z.number(),
  data: z.record(z.any()),
});

// ============================================================================
// Type Exports
// ============================================================================

// Original types
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

// Sync-Mesh types (Fase 2)
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type DeltaStateUpdate = z.infer<typeof DeltaStateUpdateSchema>;
export type PlayerPresence = z.infer<typeof PlayerPresenceSchema>;
export type VersionedState = z.infer<typeof VersionedStateSchema>;
