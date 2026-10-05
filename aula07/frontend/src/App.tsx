import {
  ArrowRight,
  Check,
  Download,
  FileAudio,
  History,
  Lock,
  LogIn,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { api } from './services/api';

const authStorageKey = 'ditado.auth';

function hasLocalSession() {
  return Boolean(window.localStorage.getItem(authStorageKey));
}

function PublicHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        Ditado
      </Link>
      <nav aria-label="Navegacao publica">
        <Link to="/cadastro">Criar conta</Link>
        <Link className="button button-ghost" to="/entrar">
          <LogIn aria-hidden="true" />
          Entrar
        </Link>
      </nav>
    </header>
  );
}

function LandingPage() {
  return (
    <main className="page-shell">
      <PublicHeader />

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Transcricao privada de audio</p>
          <h1>Ditado transforma arquivos de audio em texto consultavel.</h1>
          <p className="lead">
            Envie um audio, acompanhe a transcricao e mantenha um historico pessoal com reproducao
            e download do arquivo original.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/cadastro">
              <UserPlus aria-hidden="true" />
              Criar conta
            </Link>
            <Link className="button button-secondary" to="/entrar">
              Acessar minha conta
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flow-panel" aria-label="Fluxo do produto">
          <div className="flow-step">
            <FileAudio aria-hidden="true" />
            <span>1</span>
            <p>Selecione um arquivo de audio.</p>
          </div>
          <div className="flow-step">
            <ShieldCheck aria-hidden="true" />
            <span>2</span>
            <p>O backend valida e armazena com seguranca.</p>
          </div>
          <div className="flow-step">
            <History aria-hidden="true" />
            <span>3</span>
            <p>Consulte texto, player e historico privado.</p>
          </div>
          <div className="flow-step">
            <Download aria-hidden="true" />
            <span>4</span>
            <p>Baixe o audio original quando precisar.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function checkPassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasLetter: /[A-Za-zÀ-ÿ]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-zÀ-ÿ0-9]/.test(password),
  };
}

function getApiMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }

  return undefined;
}

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const passwordChecks = useMemo(() => checkPassword(password), [password]);
  const passwordIsValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordIsValid &&
    passwordsMatch &&
    status !== 'loading';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });
      setStatus('success');
      setMessage('Conta criada com sucesso. Agora voce pode entrar.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(getApiMessage(error) || 'Nao foi possivel criar a conta. Confira os dados.');
    }
  }

  return (
    <main className="page-shell auth-shell">
      <PublicHeader />
      <section className="auth-panel">
        <p className="eyebrow">Cadastro</p>
        <h1>Crie sua conta no Ditado.</h1>
        <p className="lead">
          Use uma senha forte para proteger seus audios e transcricoes privadas.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              autoComplete="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>

          <label>
            E-mail
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Senha
            <input
              autoComplete="new-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <ul className="password-checklist" aria-label="Criterios da senha">
            <PasswordCheck checked={passwordChecks.minLength} text="8 ou mais caracteres" />
            <PasswordCheck checked={passwordChecks.hasLetter} text="contem letra" />
            <PasswordCheck checked={passwordChecks.hasNumber} text="contem numero" />
            <PasswordCheck checked={passwordChecks.hasSpecial} text="contem caractere especial" />
          </ul>

          <label>
            Confirmar senha
            <input
              autoComplete="new-password"
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          {confirmPassword && !passwordsMatch ? (
            <p className="form-hint error-text">As senhas precisam ser iguais.</p>
          ) : null}

          {message ? <p className={`form-message ${status}`}>{message}</p> : null}

          <button className="button button-primary" disabled={!canSubmit} type="submit">
            <UserPlus aria-hidden="true" />
            {status === 'loading' ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordCheck({ checked, text }: { checked: boolean; text: string }) {
  return (
    <li className={checked ? 'valid' : ''}>
      {checked ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
      {text}
    </li>
  );
}

function LoginPlaceholder() {
  return (
    <main className="page-shell auth-shell">
      <PublicHeader />
      <section className="auth-panel">
        <p className="eyebrow">Login</p>
        <h1>Entre no Ditado.</h1>
        <p className="lead">
          Esta tela publica esta preparada para receber a autenticacao completa na etapa de login.
        </p>
        <Link className="button button-secondary" to="/">
          Voltar para a apresentacao
        </Link>
      </section>
    </main>
  );
}

function PrivateRoute() {
  const location = useLocation();

  if (!hasLocalSession()) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function PrivatePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <main className="page-shell private-shell">
      <section className="private-panel">
        <Lock aria-hidden="true" />
        <p className="eyebrow">Area autenticada</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
      </section>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="page-shell auth-shell">
      <PublicHeader />
      <section className="auth-panel">
        <p className="eyebrow">404</p>
        <h1>Pagina nao encontrada.</h1>
        <p className="lead">O caminho informado nao existe no Ditado.</p>
        <Link className="button button-primary" to="/">
          Voltar para o inicio
        </Link>
      </section>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/entrar" element={<LoginPlaceholder />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="/app"
          element={
            <PrivatePlaceholder
              title="Nova transcricao"
              description="A tela de upload e transcricao sera implementada na etapa de nova transcricao."
            />
          }
        />
        <Route
          path="/app/historico"
          element={
            <PrivatePlaceholder
              title="Historico"
              description="A listagem privada de transcricoes sera implementada na etapa de historico."
            />
          }
        />
        <Route
          path="/app/transcricoes/:id"
          element={
            <PrivatePlaceholder
              title="Detalhe da transcricao"
              description="Texto completo, player, download e exclusao entram nas proximas etapas do fluxo."
            />
          }
        />
        <Route
          path="/app/admin/usuarios"
          element={
            <PrivatePlaceholder
              title="Administracao de usuarios"
              description="A area administrativa sera protegida por papel admin em etapa propria."
            />
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
