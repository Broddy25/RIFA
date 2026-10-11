import React from 'react';
import { Producto } from '../types.js';
import { ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

interface CestaTabProps {
  productos: Producto[];
  moneda: string;
}

export const CestaTab: React.FC<CestaTabProps> = ({ productos, moneda }) => {
  const totalUnidades = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const totalMonto = productos.reduce((sum, p) => sum + (p.total || (p.cantidad * p.precio) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1f3a] to-[#16325c] rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffd23f]/20 text-[#ffd23f] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Premio Rifa Compradores
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display">La MEGACESTA</h2>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-xl">
              Cesta completa con {totalUnidades} unidades de alimentos y productos de primera necesidad, marcas reconocidas para la familia.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3.5 border border-white/10 min-w-[130px]">
              <span className="text-xs text-slate-300 block">Total Unidades</span>
              <span className="text-2xl font-black font-display text-[#ffd23f]">{totalUnidades}</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3.5 border border-white/10 min-w-[130px]">
              <span className="text-xs text-slate-300 block">Valor Referencial</span>
              <span className="text-2xl font-black font-display text-white">{moneda}{totalMonto.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-[#0b1f3a] font-display flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Inventario Detallado de Productos ({productos.length})
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            100% productos garantizados
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0b1f3a] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-center">Cant.</th>
                <th className="py-3 px-4 text-right">Precio Ref.</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((item, idx) => {
                const subtotal = item.total || (item.cantidad * item.precio);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item.producto}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0b1f3a] bg-slate-50/50">
                      {item.cantidad}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {moneda}{Number(item.precio).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {moneda}{subtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-[#0b1f3a] uppercase text-xs">
                  Totales de la Megacesta
                </td>
                <td className="py-3 px-4 text-center text-[#0b1f3a] text-base">{totalUnidades} uds</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-base text-[#0b1f3a]">
                  {moneda}{totalMonto.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
