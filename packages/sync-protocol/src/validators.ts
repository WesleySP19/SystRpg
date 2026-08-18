import { z } from 'zod';
import {
  ChatMessageSchema,
  PlayerProfileSchema,
  DeltaStateUpdateSchema,
  PlayerPresenceSchema,
  BattleSnapshotResponseSchema,
  EntityMoveEventSchema,
  EntityDamageEventSchema,
  EntityJoinEventSchema,
} from './schemas.js';

/**
 * VALIDATORS v1.0 — Safe Parse Helpers for Sync Protocol
 * 
 * Provides non-throwing validation functions for all sync events.
 * On failure, logs a warning and returns null instead of crashing the system.
 * This ensures the RPG session continues even if a malformed event arrives.
 */

interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Safe validator factory — wraps any Zod schema in a non-throwing parse.
 * @param schema - Zod schema to validate against
 * @param label - Human-readable label for logging
 * @returns Validation function
 */
function createValidator<T extends z.ZodTypeAny>(schema: T, label: string) {
  return (data: unknown): ValidationResult<z.infer<T>> => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data, error: null };
    }
    
    const errorMsg = result.error.issues
      .map(i => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    
    console.warn(`[SyncProtocol] Validação ${label} falhou: ${errorMsg}`);
    return { success: false, data: null, error: errorMsg };
  };
}

// --- Chat ---
export const validateChatMessage = createValidator(ChatMessageSchema, 'ChatMessage');

// --- Player ---
export const validatePlayerProfile = createValidator(PlayerProfileSchema, 'PlayerProfile');
export const validatePlayerPresence = createValidator(PlayerPresenceSchema, 'PlayerPresence');

// --- Delta Sync ---
export const validateDeltaStateUpdate = createValidator(DeltaStateUpdateSchema, 'DeltaStateUpdate');

// --- Battle ---
export const validateBattleSnapshot = createValidator(BattleSnapshotResponseSchema, 'BattleSnapshot');
export const validateEntityMove = createValidator(EntityMoveEventSchema, 'EntityMove');
export const validateEntityDamage = createValidator(EntityDamageEventSchema, 'EntityDamage');
export const validateEntityJoin = createValidator(EntityJoinEventSchema, 'EntityJoin');

/**
 * Validates incoming data and returns the parsed result.
 * If validation fails, returns the raw data as-is for backward compatibility.
 * 
 * @param schema - Zod schema
 * @param data - Raw incoming data
 * @param label - Label for logging
 * @returns Parsed data or raw data
 */
export function validateIncoming<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  label: string = 'Unknown'
): z.infer<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  
  console.warn(`[SyncProtocol] Incoming ${label} não passou na validação, usando dados brutos:`, 
    result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  
  return data as z.infer<T>;
}

/**
 * Validates outgoing data before sending.
 * Strips unknown fields and applies defaults via Zod parsing.
 * Returns null if validation fails completely.
 * 
 * @param schema - Zod schema
 * @param data - Data to send
 * @param label - Label for logging
 * @returns Cleaned data or null
 */
export function validateOutgoing<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  label: string = 'Unknown'
): z.infer<T> | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  
  console.warn(`[SyncProtocol] Outgoing ${label} falhou na validação:`,
    result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  
  return null;
}
