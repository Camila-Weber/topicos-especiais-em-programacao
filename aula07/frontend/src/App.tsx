import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  FileAudio,
  History,
  Lock,
  LogIn,
  LogOut,
  PlayCircle,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { ChangeEvent, DragEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { api } from './services/api';
import { useAuthStore } from './stores/auth-store';

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

const demoStages = [
  {
    id: 'upload',
    label: 'Upload',
    title: 'Arquivo recebido',
    description: 'O audio entra por uma rota autenticada e passa pelas validacoes de formato e tamanho.',
    progress: 34,
  },
  {
    id: 'transcription',
    label: 'Transcricao',
    title: 'Whisper trabalhando',
    description: 'O backend envia o arquivo para a Groq e acompanha o retorno sem expor chaves no navegador.',
    progress: 68,
  },
  {
    id: 'done',
    label: 'Concluido',
    title: 'Texto pronto',
    description: 'A transcricao fica salva no historico privado, junto com o player e o download do audio.',
    progress: 100,
  },
] as const;

const productFlow = [
  {
    title: 'Envio do audio',
    description: 'O usuario seleciona um unico arquivo e visualiza nome, tamanho e formato antes de enviar.',
    icon: UploadCloud,
  },
  {
    title: 'Validacao privada',
    description: 'O backend valida autenticacao, formato e limite de 25 MB antes de gravar o arquivo.',
    icon: ShieldCheck,
  },
  {
    title: 'Transcricao',
    description: 'A Groq e chamada somente pela API, mantendo a chave fora do frontend.',
    icon: Sparkles,
  },
  {
    title: 'Historico',
    description: 'Cada usuario consulta apenas as proprias transcricoes, ordenadas da mais recente para a mais antiga.',
    icon: History,
  },
  {
    title: 'Player e download',
    description: 'O audio e reproduzido por Blob URL autenticada e pode ser baixado quando necessario.',
    icon: PlayCircle,
  },
  {
    title: 'Exclusao segura',
    description: 'Ao excluir, o registro e o arquivo fisico associado deixam de ficar disponiveis.',
    icon: Trash2,
  },
];

const transcriptionLanguages = [
  { value: 'pt', label: 'Portugues' },
  { value: 'en', label: 'Ingles' },
  { value: 'es', label: 'Espanhol' },
  { value: 'fr', label: 'Frances' },
  { value: 'de', label: 'Alemao' },
  { value: 'it', label: 'Italiano' },
] as const;

const maxUploadSizeBytes = 25 * 1024 * 1024;
const allowedUploadExtensions = new Set(['mp3', 'm4a', 'wav', 'ogg', 'webm', 'flac', 'mp4', 'mpeg']);
const allowedUploadMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'video/mp4',
]);

function LandingPage() {
  const [apiStatus, setApiStatus] = useState('Verificando API...');
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState(0);
  const currentStage = demoStages[selectedStage];
  const currentFlow = productFlow[selectedFlow];
  const CurrentFlowIcon = currentFlow.icon;

  useEffect(() => {
    let active = true;

    api
      .get<{ data: { status: string } }>('/health')
      .then((response) => {
        if (active) {
          setApiStatus(response.data.data.status === 'ok' ? 'API conectada' : 'API indisponivel');
        }
      })
      .catch(() => {
        if (active) {
          setApiStatus('API indisponivel');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <PublicHeader />

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Transcricao privada de audio</p>
          <h1>Ditado transforma audio em texto, historico e consulta segura.</h1>
          <p className="lead">
            Uma aplicacao full stack para enviar audios, acompanhar a transcricao, revisar o texto,
            reproduzir o arquivo original e manter tudo organizado em uma area privada.
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
          <div className="hero-metrics" aria-label="Resumo do sistema">
            <div>
              <strong>25 MB</strong>
              <span>limite por audio</span>
            </div>
            <div>
              <strong>5 min</strong>
              <span>validade do JWT</span>
            </div>
            <div>
              <strong>404</strong>
              <span>para recurso alheio</span>
            </div>
          </div>
        </div>

        <div className="demo-panel" aria-label="Demonstracao do produto">
          <div className="motion-orbit motion-orbit-one" aria-hidden="true" />
          <div className="motion-orbit motion-orbit-two" aria-hidden="true" />
          <div className="demo-toolbar">
            <span className="status-dot" />
            <span>{apiStatus}</span>
          </div>
          <div className="audio-card">
            <div>
              <p className="audio-name">reuniao-projeto.webm</p>
              <span>18.4 MB - audio privado</span>
            </div>
            <FileAudio aria-hidden="true" />
          </div>

          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <span key={index} style={{ animationDelay: `${index * 80}ms` }} />
            ))}
          </div>

          <div className="stage-tabs" aria-label="Etapas demonstrativas">
            {demoStages.map((stage, index) => (
              <button
                className={selectedStage === index ? 'active' : ''}
                key={stage.id}
                onClick={() => setSelectedStage(index)}
                type="button"
              >
                {stage.label}
              </button>
            ))}
          </div>

          <div className="demo-stage-card">
            <div className="stage-header">
              <Activity aria-hidden="true" />
              <span>{currentStage.title}</span>
            </div>
            <p>{currentStage.description}</p>
            <div className="progress-track" aria-label={`Progresso demonstrativo ${currentStage.progress}%`}>
              <span style={{ width: `${currentStage.progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section flow-showcase" aria-labelledby="flow-title">
        <div className="section-heading">
          <p className="eyebrow">Fluxo principal</p>
          <h2 id="flow-title">Da selecao do audio ate a consulta no historico.</h2>
          <p>
            O Ditado organiza o caminho completo da transcricao, separando interface, API, banco,
            armazenamento privado e provedor externo.
          </p>
        </div>

        <div className="flow-grid">
          <div className="flow-list" role="tablist" aria-label="Etapas do fluxo">
            {productFlow.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <button
                  aria-selected={selectedFlow === index}
                  className={`flow-step ${selectedFlow === index ? 'active' : ''}`}
                  key={step.title}
                  onClick={() => setSelectedFlow(index)}
                  role="tab"
                  type="button"
                >
                  <StepIcon aria-hidden="true" />
                  <span>{index + 1}</span>
                  <p>{step.title}</p>
                </button>
              );
            })}
          </div>

          <article className="flow-detail" role="tabpanel">
            <CurrentFlowIcon aria-hidden="true" />
            <p className="eyebrow">Etapa {selectedFlow + 1}</p>
            <h3>{currentFlow.title}</h3>
            <p>{currentFlow.description}</p>
          </article>
        </div>
      </section>

      <section className="landing-section feature-band" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">Recursos</p>
          <h2 id="features-title">O necessario para revisar, comparar e controlar seus audios.</h2>
        </div>
        <div className="feature-grid">
          <article>
            <FileText aria-hidden="true" />
            <h3>Texto completo</h3>
            <p>O resultado fica disponivel em uma tela de detalhe para leitura e conferencia.</p>
          </article>
          <article>
            <PlayCircle aria-hidden="true" />
            <h3>Player autenticado</h3>
            <p>O audio e carregado por uma requisicao protegida e usado como URL temporaria.</p>
          </article>
          <article>
            <Download aria-hidden="true" />
            <h3>Download original</h3>
            <p>O arquivo enviado pode ser baixado com nome amigavel e sem expor caminho interno.</p>
          </article>
          <article>
            <History aria-hidden="true" />
            <h3>Historico pessoal</h3>
            <p>As transcricoes aparecem em ordem recente e pertencem apenas ao usuario autenticado.</p>
          </article>
        </div>
      </section>

      <section className="landing-section trust-section" aria-labelledby="trust-title">
        <div className="trust-copy">
          <p className="eyebrow">Seguranca aplicada</p>
          <h2 id="trust-title">Privacidade tratada como parte do fluxo, nao como detalhe.</h2>
          <p>
            O backend concentra as regras sensiveis: autenticacao, permissao, validacao do arquivo,
            chamada da Groq, streaming, download e exclusao.
          </p>
        </div>
        <div className="trust-grid">
          <div>
            <Lock aria-hidden="true" />
            <strong>JWT curto</strong>
            <span>Sessao expira em 5 minutos e nao usa refresh token no MVP.</span>
          </div>
          <div>
            <Database aria-hidden="true" />
            <strong>Storage privado</strong>
            <span>Audios ficam fora de pasta publica e usam nome fisico gerado no servidor.</span>
          </div>
          <div>
            <Server aria-hidden="true" />
            <strong>API como fronteira</strong>
            <span>Groq e chaves externas nunca passam pelo navegador.</span>
          </div>
          <div>
            <UserCheck aria-hidden="true" />
            <strong>Isolamento por usuario</strong>
            <span>Recurso de outra conta retorna 404, inclusive audio, download e detalhe.</span>
          </div>
        </div>
      </section>

      <section className="landing-section admin-preview" aria-labelledby="admin-title">
        <div>
          <p className="eyebrow">Administracao</p>
          <h2 id="admin-title">Controle simples de contas no MVP.</h2>
          <p>
            Administradores podem listar usuarios e ativar ou desativar contas, sem expor senha,
            hash ou mudanca de papel pela interface.
          </p>
        </div>
        <div className="admin-preview-list" aria-label="Previa administrativa">
          <div>
            <span className="user-avatar">CM</span>
            <strong>Camila Mendes</strong>
            <small>ativa</small>
          </div>
          <div>
            <span className="user-avatar muted">AL</span>
            <strong>Alex Lima</strong>
            <small>inativa</small>
          </div>
          <div>
            <span className="user-avatar">RS</span>
            <strong>Rafa Souza</strong>
            <small>ativa</small>
          </div>
        </div>
      </section>

      <section className="landing-cta" aria-label="Chamada para cadastro">
        <Clock aria-hidden="true" />
        <h2>Comece com um audio e acompanhe todo o ciclo.</h2>
        <p>Cadastre-se para testar o fluxo completo: upload, transcricao, historico, player e download.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/cadastro">
            <UserPlus aria-hidden="true" />
            Criar conta
          </Link>
          <Link className="button button-secondary" to="/entrar">
            Entrar
            <ArrowRight aria-hidden="true" />
          </Link>
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

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const canSubmit = email.trim().length > 0 && password.length > 0 && status !== 'loading';
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  useEffect(() => {
    const sessionMessage = window.sessionStorage.getItem('ditado.sessionMessage');

    if (sessionMessage) {
      setMessage(sessionMessage);
      setStatus('error');
      window.sessionStorage.removeItem('ditado.sessionMessage');
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post<{
        data: {
          user: {
            id: string;
            name: string;
            email: string;
            role: 'user' | 'admin';
          };
          accessToken: string;
          expiresIn: number;
        };
      }>('/auth/login', {
        email,
        password,
      });
      setSession({
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
      });
      setStatus('success');
      navigate(from, { replace: true });
    } catch (error) {
      setStatus('error');
      setMessage(getApiMessage(error) || 'E-mail ou senha invalidos.');
    }
  }

  return (
    <main className="page-shell auth-shell">
      <PublicHeader />
      <section className="auth-panel">
        <p className="eyebrow">Login</p>
        <h1>Entre no Ditado.</h1>
        <p className="lead">
          Acesse sua area privada para enviar audios e consultar transcricoes.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message ? <p className={`form-message ${status}`}>{message}</p> : null}

          <button className="button button-primary" disabled={!canSubmit} type="submit">
            <LogIn aria-hidden="true" />
            {status === 'loading' ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

function PrivateRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function PrivateLayout({ children }: { children: ReactNode }) {
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate('/entrar', { replace: true });
  }

  return (
    <main className="page-shell private-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          Ditado
        </Link>
        <nav aria-label="Navegacao privada">
          <span className="user-chip">{user?.name ?? 'Usuario'}</span>
          <button className="button button-ghost" onClick={handleLogout} type="button">
            <LogOut aria-hidden="true" />
            Sair
          </button>
        </nav>
      </header>
      {children}
    </main>
  );
}

function PrivatePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <PrivateLayout>
      <section className="private-panel">
        <Lock aria-hidden="true" />
        <p className="eyebrow">Area autenticada</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
      </section>
    </PrivateLayout>
  );
}

type TranscriptionResult = {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  language: string;
  text: string;
  createdAt: string;
  audio: {
    streamUrl: string;
    downloadUrl: string;
  };
};

type TranscriptionListItem = {
  id: string;
  originalFileName: string;
  fileSize: number;
  language: string;
  textPreview: string;
  createdAt: string;
};

type TranscriptionListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
};

function NewTranscriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('pt');
  const [status, setStatus] = useState<'idle' | 'selected' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Arraste um audio ou video para comecar.');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const audioPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  const selectedLanguageLabel = getLanguageLabel(language);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  function setSelectedFile(selectedFile: File | null) {
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setStatus('idle');
      setMessage('Arraste um audio ou video para comecar.');
      return;
    }

    const validationMessage = validateUploadFile(selectedFile);

    if (validationMessage) {
      setFile(null);
      setStatus('error');
      setMessage(validationMessage);
      return;
    }

    setFile(selectedFile);
    setStatus('selected');
    setMessage('Arquivo pronto para transcricao.');
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    if (status !== 'loading') {
      setIsDragging(true);
    }
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (status === 'loading') {
      return;
    }

    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus('error');
      setMessage('Selecione ou arraste um arquivo de audio/video.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    setStatus('loading');
    setMessage('Enviando e transcrevendo seu audio...');

    try {
      const response = await api.post<{ data: TranscriptionResult }>('/transcriptions', formData);
      setResult(response.data.data);
      setStatus('success');
      setMessage('Transcricao concluida.');
    } catch (error) {
      setStatus('error');
      setMessage(getApiMessage(error) || 'Nao foi possivel transcrever o audio agora.');
    }
  }

  return (
    <PrivateLayout>
      <section className="transcription-layout">
        <div className="upload-panel">
          <p className="eyebrow">Nova transcricao</p>
          <h1>Envie audio ou video para transcrever.</h1>
          <p className="lead">
            Arraste o arquivo, escolha o idioma e acompanhe o resultado sem sair desta tela.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label
              className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                accept="audio/*,video/mp4"
                className="visually-hidden"
                disabled={status === 'loading'}
                onChange={handleFileChange}
                type="file"
              />
              <UploadCloud aria-hidden="true" />
              <strong>{file ? 'Arquivo selecionado' : 'Arraste seu arquivo aqui'}</strong>
              <span>
                {file
                  ? 'Clique para trocar o arquivo antes de enviar.'
                  : 'Ou clique para escolher um audio ou video MP4.'}
              </span>
            </label>

            <label>
              Idioma
              <select
                disabled={status === 'loading'}
                onChange={(event) => setLanguage(event.target.value)}
                value={language}
              >
                {transcriptionLanguages.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {file ? (
              <dl className="file-summary">
                <div>
                  <dt>Nome</dt>
                  <dd>{file.name}</dd>
                </div>
                <div>
                  <dt>Tamanho</dt>
                  <dd>{formatBytes(file.size)}</dd>
                </div>
                <div>
                  <dt>Formato</dt>
                  <dd>{file.type || 'nao informado'}</dd>
                </div>
                <div>
                  <dt>Idioma</dt>
                  <dd>{selectedLanguageLabel}</dd>
                </div>
              </dl>
            ) : null}

            <div className="upload-guidance" aria-label="Orientacoes de envio">
              <div>
                <Check aria-hidden="true" />
                <span>mp3, m4a, wav, ogg, webm, flac, mp4 ou mpeg</span>
              </div>
              <div>
                <Check aria-hidden="true" />
                <span>Limite de {formatBytes(maxUploadSizeBytes)}</span>
              </div>
              <div>
                <Check aria-hidden="true" />
                <span>Uma transcricao por envio</span>
              </div>
            </div>

            <p className={`form-message ${status === 'error' ? 'error' : status === 'success' ? 'success' : ''}`}>
              {message}
            </p>

            <button className="button button-primary" disabled={!file || status === 'loading'} type="submit">
              <FileAudio aria-hidden="true" />
              {status === 'loading' ? 'Transcrevendo...' : 'Enviar audio'}
            </button>
          </form>
        </div>

        <div className="result-panel">
          <FileText aria-hidden="true" />
          <h2>Resultado</h2>
          {result ? (
            <>
              <p className="result-meta">
                {result.originalFileName} · {formatBytes(result.fileSize)} · {getLanguageLabel(result.language)}
              </p>
              {audioPreviewUrl ? <audio controls src={audioPreviewUrl} /> : null}
              <textarea readOnly value={result.text} />
              <div className="result-actions">
                <Link className="button button-primary" to={`/app/transcricoes/${result.id}`}>
                  <Eye aria-hidden="true" />
                  Abrir detalhe
                </Link>
                <Link className="button button-secondary" to="/app/historico">
                  <History aria-hidden="true" />
                  Ver historico
                </Link>
              </div>
            </>
          ) : (
            <p className="empty-result">
              O texto transcrito, o player local e os atalhos para detalhe/historico aparecerao aqui
              apos o envio.
            </p>
          )}
        </div>
      </section>
    </PrivateLayout>
  );
}

function HistoryPage() {
  const [items, setItems] = useState<TranscriptionListItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [message, setMessage] = useState('Carregando historico...');
  const [deletingId, setDeletingId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [meta, setMeta] = useState<TranscriptionListMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (searchQuery) {
      params.set('q', searchQuery);
    }

    if (languageFilter) {
      params.set('language', languageFilter);
    }

    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      params.set('dateTo', dateTo);
    }

    setStatus('loading');
    setMessage('Carregando historico...');

    api
      .get<{ data: TranscriptionListItem[]; meta: TranscriptionListMeta }>(
        `/transcriptions?${params.toString()}`,
      )
      .then((response) => {
        if (!active) {
          return;
        }

        setItems(response.data.data);
        setMeta(response.data.meta);

        if (response.data.data.length === 0) {
          setStatus('empty');
          setMessage(
            searchQuery || languageFilter || dateFrom || dateTo
              ? 'Nenhuma transcricao encontrada com os filtros atuais.'
              : 'Voce ainda nao possui transcricoes.',
          );
        } else {
          setStatus('success');
          setMessage('');
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setStatus('error');
        setMessage(getApiMessage(error) || 'Nao foi possivel carregar o historico.');
      });

    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, languageFilter, page, pageSize, refreshKey, searchQuery]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearchQuery('');
    setLanguageFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  async function handleDelete(id: string, originalFileName: string) {
    const confirmed = window.confirm(
      `Excluir a transcricao "${originalFileName}" e remover o audio associado?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage('');

    try {
      await api.delete(`/transcriptions/${id}`);
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setStatus('error');
      setMessage(getApiMessage(error) || 'Nao foi possivel excluir a transcricao.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <PrivateLayout>
      <section className="history-panel">
        <div className="history-header">
          <div>
            <p className="eyebrow">Historico</p>
            <h1>Suas transcricoes.</h1>
            <p className="lead">A lista mostra apenas audios enviados pela sua conta.</p>
          </div>
          <Link className="button button-primary" to="/app">
            <FileAudio aria-hidden="true" />
            Nova transcricao
          </Link>
        </div>

        <form className="history-filters" onSubmit={handleSearchSubmit}>
          <label>
            Pesquisar
            <input
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nome do arquivo ou texto transcrito"
              type="search"
              value={searchInput}
            />
          </label>

          <label>
            Idioma
            <select
              onChange={(event) => {
                setLanguageFilter(event.target.value);
                setPage(1);
              }}
              value={languageFilter}
            >
              <option value="">Todos os idiomas</option>
              {transcriptionLanguages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            De
            <input
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              type="date"
              value={dateFrom}
            />
          </label>

          <label>
            Ate
            <input
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              type="date"
              value={dateTo}
            />
          </label>

          <label>
            Por pagina
            <select
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              value={pageSize}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className="filter-actions">
            <button className="button button-primary" type="submit">
              <Eye aria-hidden="true" />
              Pesquisar
            </button>
            <button className="button button-secondary" onClick={handleClearFilters} type="button">
              Limpar
            </button>
          </div>
        </form>

        {status === 'loading' || status === 'empty' || status === 'error' ? (
          <p className={`history-state ${status === 'error' ? 'error-text' : ''}`}>{message}</p>
        ) : null}

        {status === 'success' ? (
          <>
            <div className="history-summary">
              <span>
                {meta.total} resultado{meta.total === 1 ? '' : 's'} · pagina {meta.page} de{' '}
                {meta.totalPages}
              </span>
            </div>
            <div className="history-list">
              {items.map((item) => (
                <article className="history-item" key={item.id}>
                  <div>
                    <h2>{item.originalFileName}</h2>
                    <p>{item.textPreview || 'Sem previa disponivel.'}</p>
                    <span>
                      {formatDate(item.createdAt)} · {formatBytes(item.fileSize)} ·{' '}
                      {getLanguageLabel(item.language)}
                    </span>
                  </div>
                  <div className="history-actions">
                    <Link className="button button-secondary" to={`/app/transcricoes/${item.id}`}>
                      <Eye aria-hidden="true" />
                      Visualizar
                    </Link>
                    <button
                      className="button button-secondary danger"
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item.id, item.originalFileName)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" />
                      {deletingId === item.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="pagination-controls" aria-label="Paginacao do historico">
              <button
                className="button button-secondary"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                type="button"
              >
                Anterior
              </button>
              <span>
                Pagina {meta.page} de {meta.totalPages}
              </span>
              <button
                className="button button-secondary"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                type="button"
              >
                Proxima
              </button>
            </div>
          </>
        ) : null}
      </section>
    </PrivateLayout>
  );
}

function TranscriptionDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState<TranscriptionResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Carregando transcricao...');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioMessage, setAudioMessage] = useState('Carregando audio...');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    if (!id) {
      setStatus('error');
      setMessage('Transcricao nao encontrada.');
      return;
    }

    api
      .get<{ data: TranscriptionResult }>(`/transcriptions/${id}`)
      .then((response) => {
        if (!active) {
          return;
        }

        setDetail(response.data.data);
        setStatus('success');
        setMessage('');
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setStatus('error');
        setMessage(getApiMessage(error) || 'Transcricao nao encontrada.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    let currentAudioUrl = '';

    if (!id || !detail) {
      return;
    }

    setAudioMessage('Carregando audio...');
    setAudioUrl('');

    api
      .get<Blob>(`/transcriptions/${id}/audio`, {
        responseType: 'blob',
      })
      .then((response) => {
        if (!active) {
          return;
        }

        currentAudioUrl = URL.createObjectURL(response.data);
        setAudioUrl(currentAudioUrl);
        setAudioMessage('');
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setAudioMessage(getApiMessage(error) || 'Nao foi possivel carregar o audio.');
      });

    return () => {
      active = false;

      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [id, detail]);

  async function handleDownload() {
    if (!id || !detail) {
      return;
    }

    setDownloadMessage('Preparando download...');

    try {
      const response = await api.get<Blob>(`/transcriptions/${id}/audio/download`, {
        responseType: 'blob',
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = detail.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setDownloadMessage('');
    } catch (error) {
      setDownloadMessage(getApiMessage(error) || 'Nao foi possivel baixar o audio.');
    }
  }

  async function handleDelete() {
    if (!id || !detail) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir a transcricao "${detail.originalFileName}" e remover o audio associado?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage('');

    try {
      await api.delete(`/transcriptions/${id}`);
      navigate('/app/historico', { replace: true });
    } catch (error) {
      setDeleteMessage(getApiMessage(error) || 'Nao foi possivel excluir a transcricao.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PrivateLayout>
      <section className="detail-panel">
        <div className="history-header">
          <div>
            <p className="eyebrow">Detalhe</p>
            <h1>{detail?.originalFileName ?? 'Transcricao'}</h1>
            <p className="lead">
              Confira o texto completo e os metadados do audio enviado.
            </p>
          </div>
          <Link className="button button-secondary" to="/app/historico">
            Voltar ao historico
          </Link>
        </div>

        {status === 'loading' || status === 'error' ? (
          <p className={`history-state ${status === 'error' ? 'error-text' : ''}`}>{message}</p>
        ) : null}

        {detail ? (
          <div className="detail-grid">
            <aside className="detail-card">
              <FileAudio aria-hidden="true" />
              <h2>Audio</h2>
              <dl className="file-summary">
                <div>
                  <dt>Arquivo</dt>
                  <dd>{detail.originalFileName}</dd>
                </div>
                <div>
                  <dt>Data</dt>
                  <dd>{formatDate(detail.createdAt)}</dd>
                </div>
                <div>
                  <dt>Tamanho</dt>
                  <dd>{formatBytes(detail.fileSize)}</dd>
                </div>
                <div>
                  <dt>Idioma</dt>
                  <dd>{detail.language}</dd>
                </div>
                <div>
                  <dt>MIME</dt>
                  <dd>{detail.mimeType}</dd>
                </div>
              </dl>

              <div className="detail-actions">
                {audioUrl ? (
                  <audio controls src={audioUrl} />
                ) : (
                  <p className="history-state">{audioMessage}</p>
                )}
                <button className="button button-secondary" onClick={handleDownload} type="button">
                  <Download aria-hidden="true" />
                  Baixar audio
                </button>
                {downloadMessage ? <p className="history-state">{downloadMessage}</p> : null}
                <button
                  className="button button-secondary danger"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
                {deleteMessage ? <p className="history-state error-text">{deleteMessage}</p> : null}
              </div>
            </aside>

            <article className="detail-card text-card">
              <FileText aria-hidden="true" />
              <h2>Texto completo</h2>
              <textarea readOnly value={detail.text} />
            </article>
          </div>
        ) : null}
      </section>
    </PrivateLayout>
  );
}

function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    let active = true;

    if (currentUser?.role !== 'admin') {
      setStatus('error');
      setMessage('Voce nao possui permissao para acessar esta area.');
      return;
    }

    setStatus('loading');
    setMessage('Carregando usuarios...');

    api
      .get<{ data: AdminUser[] }>('/users')
      .then((response) => {
        if (!active) {
          return;
        }

        setUsers(response.data.data);
        setStatus('success');
        setMessage('');
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setStatus('error');
        setMessage(getApiMessage(error) || 'Nao foi possivel carregar usuarios.');
      });

    return () => {
      active = false;
    };
  }, [currentUser?.role]);

  async function handleStatusChange(user: AdminUser) {
    setUpdatingId(user.id);
    setMessage('');

    try {
      const response = await api.patch<{ data: AdminUser }>(`/users/${user.id}`, {
        active: !user.active,
      });
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? response.data.data : item)),
      );
    } catch (error) {
      setStatus('error');
      setMessage(getApiMessage(error) || 'Nao foi possivel atualizar o usuario.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <PrivateLayout>
      <section className="history-panel">
        <div className="history-header">
          <div>
            <p className="eyebrow">Administracao</p>
            <h1>Usuarios cadastrados.</h1>
            <p className="lead">Gerencie somente o status das contas nesta versao.</p>
          </div>
        </div>

        {status === 'loading' || status === 'error' ? (
          <p className={`history-state ${status === 'error' ? 'error-text' : ''}`}>{message}</p>
        ) : null}

        {status === 'success' ? (
          <div className="admin-table" role="table" aria-label="Usuarios">
            <div className="admin-row admin-head" role="row">
              <span role="columnheader">Nome</span>
              <span role="columnheader">E-mail</span>
              <span role="columnheader">Papel</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Acao</span>
            </div>
            {users.map((user) => (
              <div className="admin-row" key={user.id} role="row">
                <span role="cell">{user.name}</span>
                <span role="cell">{user.email}</span>
                <span role="cell">{user.role}</span>
                <span role="cell">{user.active ? 'Ativa' : 'Inativa'}</span>
                <span role="cell">
                  <button
                    className="button button-secondary"
                    disabled={updatingId === user.id}
                    onClick={() => void handleStatusChange(user)}
                    type="button"
                  >
                    {updatingId === user.id
                      ? 'Atualizando...'
                      : user.active
                        ? 'Desativar'
                        : 'Ativar'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </PrivateLayout>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getLanguageLabel(language: string) {
  return transcriptionLanguages.find((option) => option.value === language)?.label ?? language;
}

function validateUploadFile(selectedFile: File) {
  if (selectedFile.size > maxUploadSizeBytes) {
    return `O arquivo precisa ter ate ${formatBytes(maxUploadSizeBytes)}.`;
  }

  const extension = getFileExtension(selectedFile.name);
  const mimeType = selectedFile.type.toLowerCase();
  const typeIsAllowed = mimeType ? allowedUploadMimeTypes.has(mimeType) : false;
  const extensionIsAllowed = allowedUploadExtensions.has(extension);

  if (!typeIsAllowed && !extensionIsAllowed) {
    return 'Formato nao suportado. Use mp3, m4a, wav, ogg, webm, flac, mp4 ou mpeg.';
  }

  return '';
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
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
      <Route path="/entrar" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="/app"
          element={<NewTranscriptionPage />}
        />
        <Route
          path="/app/historico"
          element={<HistoryPage />}
        />
        <Route
          path="/app/transcricoes/:id"
          element={<TranscriptionDetailPage />}
        />
        <Route
          path="/app/admin/usuarios"
          element={<AdminUsersPage />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
