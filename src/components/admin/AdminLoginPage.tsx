import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useTenant } from '../../context/TenantContext';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic
}) => {
  const { tenant } = useTenant();
  const [username, setUsername] = useState('adm');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await AuthService.login(username, password, tenant.id);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Falha ao autenticar. Verifique usuário e senha.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro inesperado ao realizar login.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Glow de Fundo */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(197, 168, 128, 0.12) 0%, rgba(6, 10, 18, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 36px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Cabeçalho do Card */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'var(--gold-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(197, 168, 128, 0.35)',
            marginBottom: '16px'
          }}>
            <Shield size={28} color="#0B1323" strokeWidth={2.2} />
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--gold-light)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '4px'
          }}>
            {tenant.name || 'Portal Imobiliário'}
          </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: '#FFF',
            margin: '0 0 8px 0',
            fontFamily: 'var(--font-serif)'
          }}>
            Acesso do Proprietário
          </h1>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1.5
          }}>
            Área restrita de gestão de imóveis, leads e corretores.
          </p>
        </div>

        {/* Alerta de Erro */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#F87171',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="admin-username">
              Usuário / Login
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: adm"
                required
                autoFocus
              />
              <User
                size={18}
                color="var(--gold-primary)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="admin-password">
              Senha de Acesso
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock
                size={18}
                color="var(--gold-primary)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Dica de Acesso Padrão */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed var(--border-gold)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Acesso Inicial:</span>
            <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
              Usuário: <strong>adm</strong> | Senha: <strong>123</strong>
            </span>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            className="btn btn-gold"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Botão Voltar ao Catálogo */}
          <button
            type="button"
            onClick={onBackToPublic}
            className="btn btn-ghost"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={15} />
            <span>Voltar ao Site Público</span>
          </button>
        </form>
      </div>
    </div>
  );
};
