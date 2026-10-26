// src/Components/auditoria/ModalImprimirExportar.tsx
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalImprimirExportarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalImprimirExportar({ isOpen, onClose }: ModalImprimirExportarProps) {
  const { servicios, configuracion } = useOperativo();

  if (!isOpen) return null;

  const exportarCSV = () => {
    const encabezados = 'Codigo,Direccion,Barrio,Prioridad,Estado,LlamadosAsociados,ResultadoFinal\n';
    const filas = servicios.map(s => 
      `"${s.codigoServicio}","${s.direccionPrincipal}","${s.barrio}","${s.prioridad}","${s.estado}",${s.pedidosAsociados.length},"${s.resultadoFinal || 'PENDIENTE'}"`
    ).join('\n');

    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parte_operativo_areco_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-200">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Impresión y Exportación del Parte Operativo (RF14)
              </h2>
              <p className="text-[11px] text-slate-400">{configuracion.nombreOperativo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700"
            >
              <Printer className="w-4 h-4 text-indigo-400" /> Imprimir Planilla Situacional
            </button>
            <button
              onClick={exportarCSV}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" /> Exportar Base a CSV / Excel
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2">Código</th>
                <th>Dirección</th>
                <th>Barrio</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Llamados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {servicios.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-white">{s.codigoServicio}</td>
                  <td className="font-sans">{s.direccionPrincipal}</td>
                  <td className="font-sans">{s.barrio}</td>
                  <td><span className="font-bold">{s.prioridad}</span></td>
                  <td>{s.estado}</td>
                  <td>{s.pedidosAsociados.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}