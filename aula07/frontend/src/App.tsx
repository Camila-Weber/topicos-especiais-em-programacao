import {
  ArrowRight,
  Check,
  Download,
  Eye,
  FileText,
  FileAudio,
  History,
  Lock,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
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

function NewTranscriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('pt');
  const [status, setStatus] = useState<'idle' | 'selected' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Selecione um arquivo para comecar.');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const audioPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setResult(null);

    if (selectedFile) {
      setStatus('selected');
      setMessage('Arquivo selecionado. Pronto para enviar.');
    } else {
      setStatus('idle');
      setMessage('Selecione um arquivo para comecar.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus('error');
      setMessage('Selecione um arquivo de audio.');
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
          <h1>Envie um audio para transcrever.</h1>
          <p className="lead">
            Formatos previstos: mp3, m4a, wav, ogg, webm, flac, mp4 e mpeg. Limite de 25 MB.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Arquivo de audio
              <input
                accept="audio/*,video/mp4"
                disabled={status === 'loading'}
                onChange={handleFileChange}
                type="file"
              />
            </label>

            <label>
              Idioma
              <input
                disabled={status === 'loading'}
                maxLength={10}
                onChange={(event) => setLanguage(event.target.value)}
                value={language}
              />
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
              </dl>
            ) : null}

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
                {result.originalFileName} · {formatBytes(result.fileSize)} · {result.language}
              </p>
              {audioPreviewUrl ? <audio controls src={audioPreviewUrl} /> : null}
              <textarea readOnly value={result.text} />
              <button className="button button-secondary" disabled type="button">
                <Download aria-hidden="true" />
                Download sera ativado na etapa 10
              </button>
            </>
          ) : (
            <p className="empty-result">
              A transcricao aparecera aqui apos o envio do audio.
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

  useEffect(() => {
    let active = true;

    api
      .get<{ data: TranscriptionListItem[] }>('/transcriptions')
      .then((response) => {
        if (!active) {
          return;
        }

        setItems(response.data.data);

        if (response.data.data.length === 0) {
          setStatus('empty');
          setMessage('Voce ainda nao possui transcricoes.');
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
  }, []);

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

        {status === 'loading' || status === 'empty' || status === 'error' ? (
          <p className={`history-state ${status === 'error' ? 'error-text' : ''}`}>{message}</p>
        ) : null}

        {status === 'success' ? (
          <div className="history-list">
            {items.map((item) => (
              <article className="history-item" key={item.id}>
                <div>
                  <h2>{item.originalFileName}</h2>
                  <p>{item.textPreview || 'Sem previa disponivel.'}</p>
                  <span>
                    {formatDate(item.createdAt)} · {formatBytes(item.fileSize)} · {item.language}
                  </span>
                </div>
                <Link className="button button-secondary" to={`/app/transcricoes/${item.id}`}>
                  <Eye aria-hidden="true" />
                  Visualizar
                </Link>
              </article>
            ))}
          </div>
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
                <button className="button button-secondary danger" disabled type="button">
                  <Trash2 aria-hidden="true" />
                  Excluir na etapa 11
                </button>
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

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
