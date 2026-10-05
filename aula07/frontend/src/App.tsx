import {
  ArrowRight,
  Download,
  FileAudio,
  History,
  Lock,
  LogIn,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

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

function AuthPlaceholder({ mode }: { mode: 'register' | 'login' }) {
  const isRegister = mode === 'register';

  return (
    <main className="page-shell auth-shell">
      <PublicHeader />
      <section className="auth-panel">
        <p className="eyebrow">{isRegister ? 'Cadastro' : 'Login'}</p>
        <h1>{isRegister ? 'Crie sua conta no Ditado.' : 'Entre no Ditado.'}</h1>
        <p className="lead">
          {isRegister
            ? 'Esta tela publica esta preparada para receber o formulario completo na etapa de cadastro.'
            : 'Esta tela publica esta preparada para receber a autenticacao completa na etapa de login.'}
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
      <Route path="/cadastro" element={<AuthPlaceholder mode="register" />} />
      <Route path="/entrar" element={<AuthPlaceholder mode="login" />} />

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
