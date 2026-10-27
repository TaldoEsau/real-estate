import { AdminUser } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'moliaria_admin_session_v1';
const LOCAL_USERS_KEY = 'moliaria_local_admin_users_v1';

// Usuário padrão inicial solicitado
const DEFAULT_SEED_ADMIN: AdminUser = {
  id: 'u1111111-1111-1111-1111-111111111111',
  tenantId: 'tenant-aura-001',
  username: 'adm',
  name: 'Administrador Principal',
  role: 'owner',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Armazenamento inicial de senhas em modo local/fallback
const DEFAULT_PASSWORDS: Record<string, string> = {
  'adm': '123'
};

export class AuthService {
  private static listeners: Array<(user: AdminUser | null) => void> = [];

  /**
   * Retorna os usuários cadastrados localmente
   */
  public static getLocalUsers(): AdminUser[] {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários locais:', e);
    }
    return [DEFAULT_SEED_ADMIN];
  }

  /**
   * Salva os usuários cadastrados localmente
   */
  public static saveLocalUsers(users: AdminUser[]): void {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Erro ao persistir usuários locais:', e);
    }
  }

  /**
   * Realiza login do administrador consultando o banco ou fallback local
   */
  public static async login(
    usernameInput: string,
    passwordInput: string,
    tenantId?: string
  ): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Por favor, informe o usuário e a senha.' };
    }

    // 1. Tenta autenticar pelo Supabase (se configurado)
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('admin_users')
          .select('*')
          .ilike('username', cleanUser)
          .eq('password_hash', cleanPass)
          .eq('is_active', true);

        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          const authenticatedUser: AdminUser = {
            id: data.id,
            tenantId: data.tenant_id,
            username: data.username,
            name: data.name,
            role: data.role as 'owner' | 'admin' | 'manager',
            isActive: data.is_active,
            avatar: data.avatar,
            createdAt: data.created_at
          };

          this.setSession(authenticatedUser);
          return { success: true, user: authenticatedUser };
        }
      } catch (err) {
        console.warn('Falha na autenticação via Supabase, tentando validação local:', err);
      }
    }

    // 2. Validação Local de Fallback (Padrão adm / 123)
    const localUsers = this.getLocalUsers();
    const matchedUser = localUsers.find(
      u => u.username.toLowerCase() === cleanUser && u.isActive
    );

    const validPassword = DEFAULT_PASSWORDS[cleanUser] || '123';

    if (matchedUser && cleanPass === validPassword) {
      this.setSession(matchedUser);
      return { success: true, user: matchedUser };
    }

    // Suporte direto caso seja o primeiro acesso com "adm" e "123"
    if (cleanUser === 'adm' && cleanPass === '123') {
      this.setSession(DEFAULT_SEED_ADMIN);
      return { success: true, user: DEFAULT_SEED_ADMIN };
    }

    return {
      success: false,
      message: 'Usuário ou senha incorretos. Verifique suas credenciais.'
    };
  }

  /**
   * Grava a sessão do usuário ativo
   */
  public static setSession(user: AdminUser): void {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Erro ao salvar sessão de autenticação:', e);
    }
    this.notify(user);
  }

  /**
   * Retorna o usuário atualmente logado (ou null se deslogado)
   */
  public static getCurrentUser(): AdminUser | null {
    try {
      const session = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        return JSON.parse(session) as AdminUser;
      }
    } catch (e) {
      console.warn('Erro ao recuperar sessão de autenticação:', e);
    }
    return null;
  }

  /**
   * Verifica se há um administrador autenticado
   */
  public static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.isActive;
  }

  /**
   * Desconecta o usuário
   */
  public static logout(): void {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao remover sessão:', e);
    }
    this.notify(null);
  }

  /**
   * Inscreve ouvinte para alterações de login/logout
   */
  public static subscribe(callback: (user: AdminUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static notify(user: AdminUser | null): void {
    this.listeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error('Erro no listener de autenticação:', err);
      }
    });
  }
}
