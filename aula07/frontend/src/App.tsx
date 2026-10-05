import { Activity, Database, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from './services/api';

type HealthResponse = {
  data: {
    status: string;
    service: string;
    timestamp: string;
  };
};

export function App() {
  const [health, setHealth] = useState<HealthResponse['data'] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<HealthResponse>('/health')
      .then((response) => {
        setHealth(response.data.data);
        setError('');
      })
      .catch(() => {
        setError('Nao foi possivel consultar /api/health.');
      });
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Ditado</p>
        <h1>Transcricao de audio com historico privado.</h1>
        <p className="lead">
          Base inicial do sistema full stack: React/Vite no navegador, NestJS na API e PostgreSQL
          como banco de dados.
        </p>
      </section>

      <section className="status-grid" aria-label="Status da etapa 2">
        <article>
          <Server aria-hidden="true" />
          <h2>Frontend</h2>
          <p>Aplicacao Vite configurada para consumir a API por proxy em `/api`.</p>
        </article>
        <article>
          <Activity aria-hidden="true" />
          <h2>Health check</h2>
          {health ? (
            <p>
              API respondeu: <strong>{health.status}</strong> em {new Date(health.timestamp).toLocaleString('pt-BR')}.
            </p>
          ) : (
            <p>{error || 'Consultando /api/health...'}</p>
          )}
        </article>
        <article>
          <Database aria-hidden="true" />
          <h2>Banco</h2>
          <p>PostgreSQL 17 definido no Docker Compose para as proximas etapas.</p>
        </article>
      </section>
    </main>
  );
}
