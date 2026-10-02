import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Activity, Plus, Edit, Trash2, LogIn, FileText } from 'lucide-react';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus size={16} className="text-green-500" />,
  UPDATE: <Edit size={16} className="text-blue-500" />,
  DELETE: <Trash2 size={16} className="text-red-500" />,
  LOGIN: <LogIn size={16} className="text-purple-500" />,
  EXPEDITION: <Activity size={16} className="text-orange-500" />,
  DEFAULT: <FileText size={16} className="text-gray-500" />
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditApi.list()
      .then(res => setLogs(res.data))
      .catch(() => toast.error('Erro ao carregar auditoria'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
        <p className="text-sm text-gray-500 mt-1">Rastreamento de todas as ações críticas no sistema</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum log encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ação</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Entidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-700">
                        {ACTION_ICONS[log.acao] || ACTION_ICONS.DEFAULT}
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {log.usuario_nome || 'Sistema'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="font-semibold">{log.tipo_entidade}</span>
                      <br />
                      <span className="text-xs text-gray-400">{log.entidade_id}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={JSON.stringify(log.valor_novo || log.valor_antigo)}>
                      {log.valor_novo ? 'Novo Valor Registrado' : log.valor_antigo ? 'Valor Antigo Registrado' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}