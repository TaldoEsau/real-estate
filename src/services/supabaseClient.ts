import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * O site funciona exclusivamente com dados locais.
 *
 * Mantemos estes exports para que os serviços existentes possam continuar
 * usando seus fallbacks locais sem criar um cliente ou fazer requisições
 * para um banco de dados.
 */
export const isSupabaseConfigured = false;
export const supabase: SupabaseClient | null = null;
