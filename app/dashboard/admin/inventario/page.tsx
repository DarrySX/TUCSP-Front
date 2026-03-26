'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { getCurrentUser, supabase } from '@/lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Instrument {
  id: string;
  numero: number | null;
  instrumento: string;
  marca: string | null;
  responsable: string | null;
  estado: number;
  detalles: string | null;
  propiedad: string;
  referencia: string | null;
  activo: boolean;
  updated_at: string;
}

interface HistoryEntry {
  id: string;
  campo: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  changed_by_name: string | null;
  created_at: string;
}

type FilterEstado = 'all' | 'ok' | 'attention' | 'critical';
type FilterProp   = 'all' | 'TUCSP' | 'UNIVERSIDAD';

// ── Constants ─────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<number, { label: string; badge: string; dot: string }> = {
  5: { label: 'Excelente',   badge: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
  4: { label: 'Bueno',       badge: 'bg-lime-100 text-lime-800',     dot: 'bg-lime-500'  },
  3: { label: 'Regular',     badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500' },
  2: { label: 'Malo',        badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500'},
  1: { label: 'Muy malo',    badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500'   },
  0: { label: 'Inoperativo', badge: 'bg-gray-200 text-gray-700',     dot: 'bg-gray-500'  },
};

const CAMPO_LABELS: Record<string, string> = {
  instrumento: 'Instrumento',
  marca:       'Marca',
  responsable: 'Responsable',
  estado:      'Estado',
  detalles:    'Detalles',
  propiedad:   'Propiedad',
  referencia:  'Referencia',
};

const EMPTY_FORM = {
  instrumento: '',
  marca: '',
  responsable: '',
  estado: 5,
  detalles: '',
  propiedad: 'TUCSP',
  referencia: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: number }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG[0];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {estado} — {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InventarioPage() {
  const router = useRouter();
  const [userId, setUserId]         = useState<string | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [members, setMembers]       = useState<{ id: string; display: string }[]>([]);
  const [isLoading, setIsLoading]   = useState(true);

  // Filters
  const [search, setSearch]         = useState('');
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('all');
  const [filterProp, setFilterProp] = useState<FilterProp>('all');

  // Add / Edit
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Instrument | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);
  const [respOpen, setRespOpen]       = useState(false);

  // History
  const [historyFor, setHistoryFor]   = useState<Instrument | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Instrument | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (p?.role !== 'super_admin' && p?.role !== 'tuno_admin') {
        router.push('/dashboard');
        return;
      }
      setUserId(user.id);
      await Promise.all([loadInstruments(), loadMembers()]);
    })();
  }, [router]);

  async function loadMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, mote')
      .order('first_name');
    setMembers(
      (data ?? []).map((m: { id: string; first_name: string | null; last_name: string | null; mote: string | null }) => {
        const name = [m.first_name, m.last_name].filter(Boolean).join(' ');
        const display = m.mote ? `${m.mote}${name ? ` — ${name}` : ''}` : name || 'Sin nombre';
        return { id: m.id, display };
      })
    );
  }

  async function loadInstruments() {
    setIsLoading(true);
    const { data } = await supabase
      .from('instruments')
      .select('*')
      .eq('activo', true)
      .order('numero', { ascending: true });
    setInstruments((data as Instrument[]) ?? []);
    setIsLoading(false);
  }

  // ── Filter logic ─────────────────────────────────────────────────────────

  const filtered = instruments.filter((i) => {
    const q = search.toLowerCase();
    if (q && ![i.instrumento, i.marca, i.responsable, i.referencia, i.detalles]
              .some((f) => f?.toLowerCase().includes(q))) return false;
    if (filterProp !== 'all' && i.propiedad !== filterProp) return false;
    if (filterEstado === 'ok'        && i.estado < 4) return false;
    if (filterEstado === 'attention' && (i.estado < 2 || i.estado > 3)) return false;
    if (filterEstado === 'critical'  && i.estado > 1) return false;
    return true;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────

  const total     = instruments.length;
  const ok        = instruments.filter((i) => i.estado >= 4).length;
  const attention = instruments.filter((i) => i.estado === 2 || i.estado === 3).length;
  const critical  = instruments.filter((i) => i.estado <= 1).length;
  const tucsp     = instruments.filter((i) => i.propiedad === 'TUCSP').length;
  const univ      = instruments.filter((i) => i.propiedad === 'UNIVERSIDAD').length;

  // ── Add / Edit ────────────────────────────────────────────────────────────

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setRespOpen(false);
    setShowForm(true);
  }

  function openEdit(i: Instrument) {
    setEditing(i);
    setRespOpen(false);
    setForm({
      instrumento: i.instrumento,
      marca:       i.marca       ?? '',
      responsable: i.responsable ?? '',
      estado:      i.estado,
      detalles:    i.detalles    ?? '',
      propiedad:   i.propiedad,
      referencia:  i.referencia  ?? '',
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!userId || !form.instrumento.trim()) {
      setFormError('El instrumento es requerido.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        instrumento: form.instrumento.trim(),
        marca:       form.marca.trim()       || null,
        responsable: form.responsable.trim() || null,
        estado:      Number(form.estado),
        detalles:    form.detalles.trim()    || null,
        propiedad:   form.propiedad,
        referencia:  form.referencia.trim()  || null,
        updated_by:  userId,
      };

      if (editing) {
        const { error } = await supabase.from('instruments').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const nextNumero = instruments.length > 0
          ? Math.max(...instruments.map((i) => i.numero ?? 0)) + 1
          : 1;
        const { error } = await supabase.from('instruments').insert({ ...payload, numero: nextNumero });
        if (error) throw error;
      }
      setShowForm(false);
      await loadInstruments();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget || !userId) return;
    setDeleting(true);
    await supabase.from('instruments')
      .update({ activo: false, updated_by: userId })
      .eq('id', deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await loadInstruments();
  }

  // ── History ───────────────────────────────────────────────────────────────

  async function openHistory(i: Instrument) {
    setHistoryFor(i);
    setHistoryLoading(true);
    const { data } = await supabase
      .from('instrument_history')
      .select('*')
      .eq('instrument_id', i.id)
      .order('created_at', { ascending: false });
    setHistory((data as HistoryEntry[]) ?? []);
    setHistoryLoading(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario de Instrumentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión y seguimiento del estado del patrimonio musical
          </p>
        </div>
        <Button onClick={openAdd}>+ Agregar instrumento</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total',        value: total,     color: '',              onClick: () => { setFilterEstado('all'); setFilterProp('all'); } },
          { label: 'Buen estado',  value: ok,        color: 'text-green-600', onClick: () => setFilterEstado('ok') },
          { label: 'Atención',     value: attention, color: 'text-amber-600', onClick: () => setFilterEstado('attention') },
          { label: 'Crítico',      value: critical,  color: 'text-red-600',   onClick: () => setFilterEstado('critical') },
          { label: 'TUCSP',        value: tucsp,     color: 'text-primary',   onClick: () => setFilterProp('TUCSP') },
        ].map((s) => (
          <Card key={s.label}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={s.onClick}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar instrumento, marca, responsable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {/* Estado filter */}
          {([
            ['all', 'Todos los estados'],
            ['ok', 'Buen estado (4-5)'],
            ['attention', 'Atención (2-3)'],
            ['critical', 'Crítico (0-1)'],
          ] as [FilterEstado, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setFilterEstado(v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filterEstado === v ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-foreground'
              }`}>
              {l}
            </button>
          ))}
          <span className="w-px bg-border self-stretch" />
          {(['all', 'TUCSP', 'UNIVERSIDAD'] as FilterProp[]).map((v) => (
            <button key={v} onClick={() => setFilterProp(v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filterProp === v ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-foreground'
              }`}>
              {v === 'all' ? 'Todos' : v}
            </button>
          ))}
        </div>
        {(filterEstado !== 'all' || filterProp !== 'all' || search) && (
          <button onClick={() => { setSearch(''); setFilterEstado('all'); setFilterProp('all'); }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 self-center">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando inventario...</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instrumento</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Marca</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Responsable</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Detalles</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Propiedad</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Referencia</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      No hay instrumentos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : filtered.map((i) => (
                  <tr key={i.id} className={`border-b last:border-0 hover:bg-secondary/20 transition ${i.estado <= 1 ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i.numero ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{i.instrumento}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{i.marca ?? '—'}</td>
                    <td className="px-4 py-3">{i.responsable ?? '—'}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={i.estado} /></td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px]">
                      <span className="line-clamp-1">{i.detalles ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        i.propiedad === 'TUCSP' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {i.propiedad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell max-w-[200px]">
                      <span className="line-clamp-1 text-xs">{i.referencia ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5 justify-end">
                        <button onClick={() => openHistory(i)} title="Ver historial"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                          </svg>
                        </button>
                        <button onClick={() => openEdit(i)} title="Editar"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteTarget(i)} title="Eliminar"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t bg-secondary/20 text-xs text-muted-foreground">
            Mostrando {filtered.length} de {total} instrumento{total !== 1 ? 's' : ''}
          </div>
        </Card>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[95vw] max-w-xl rounded-xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar instrumento' : 'Agregar instrumento'}</DialogTitle>
          </DialogHeader>
          {formError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{formError}</p>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Instrumento *</label>
                <Input value={form.instrumento}
                  onChange={(e) => setForm((p) => ({ ...p, instrumento: e.target.value }))}
                  placeholder="Guitarra, Timple, Bandurria..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Marca</label>
                <Input value={form.marca}
                  onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))}
                  placeholder="Cordoba, Fender..." />
              </div>
              {/* Responsable — Combobox buscable */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Responsable</label>
                <Popover open={respOpen} onOpenChange={setRespOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={respOpen}
                      className="w-full justify-between font-normal text-sm h-9">
                      <span className={form.responsable ? '' : 'text-muted-foreground'}>
                        {form.responsable || '— Sin asignar —'}
                      </span>
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar miembro..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="__none__"
                            onSelect={() => { setForm((p) => ({ ...p, responsable: '' })); setRespOpen(false); }}>
                            <CheckIcon className={`mr-2 h-4 w-4 ${!form.responsable ? 'opacity-100' : 'opacity-0'}`} />
                            Sin asignar
                          </CommandItem>
                          <CommandItem value="Universidad"
                            onSelect={() => { setForm((p) => ({ ...p, responsable: 'Universidad' })); setRespOpen(false); }}>
                            <CheckIcon className={`mr-2 h-4 w-4 ${form.responsable === 'Universidad' ? 'opacity-100' : 'opacity-0'}`} />
                            Universidad
                          </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Miembros de la Tuna">
                          {members.map((m) => {
                            const val = m.display.split(' — ')[0].trim();
                            return (
                              <CommandItem key={m.id} value={m.display}
                                onSelect={() => { setForm((p) => ({ ...p, responsable: val })); setRespOpen(false); }}>
                                <CheckIcon className={`mr-2 h-4 w-4 ${form.responsable === val ? 'opacity-100' : 'opacity-0'}`} />
                                {m.display}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Estado — shadcn Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Estado (0–5)</label>
                <Select value={String(form.estado)}
                  onValueChange={(v) => setForm((p) => ({ ...p, estado: Number(v) }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1, 0].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ESTADO_CONFIG[n].dot}`} />
                          {n} — {ESTADO_CONFIG[n].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Propiedad — shadcn Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Propiedad</label>
                <Select value={form.propiedad}
                  onValueChange={(v) => setForm((p) => ({ ...p, propiedad: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUCSP">TUCSP</SelectItem>
                    <SelectItem value="UNIVERSIDAD">UNIVERSIDAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Detalles</label>
                <Textarea value={form.detalles}
                  onChange={(e) => setForm((p) => ({ ...p, detalles: e.target.value }))}
                  placeholder="Observaciones sobre el estado actual..." rows={2} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Referencia</label>
                <Textarea value={form.referencia}
                  onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))}
                  placeholder="Origen, certamen, fecha de adquisición..." rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="w-[95vw] max-w-sm rounded-xl p-5">
          <DialogHeader>
            <DialogTitle>¿Eliminar instrumento?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se eliminará <span className="font-medium text-foreground">
              {deleteTarget?.instrumento}{deleteTarget?.marca ? ` (${deleteTarget.marca})` : ''}
            </span> del inventario. El historial se conserva.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── History dialog ── */}
      <Dialog open={!!historyFor} onOpenChange={(o) => { if (!o) setHistoryFor(null); }}>
        <DialogContent className="w-[95vw] max-w-lg rounded-xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              Historial — {historyFor?.instrumento}
              {historyFor?.marca ? ` (${historyFor.marca})` : ''}
            </DialogTitle>
          </DialogHeader>

          {/* Current state */}
          {historyFor && (
            <div className="rounded-lg bg-secondary/30 p-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span><span className="text-muted-foreground">Responsable:</span> {historyFor.responsable ?? '—'}</span>
              <span><span className="text-muted-foreground">Estado:</span> {historyFor.estado} — {ESTADO_CONFIG[historyFor.estado]?.label}</span>
              <span><span className="text-muted-foreground">Propiedad:</span> {historyFor.propiedad}</span>
              <span className="text-xs text-muted-foreground">Últ. actualización: {formatDate(historyFor.updated_at)}</span>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {historyLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Cargando historial...</p>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Sin cambios registrados. Los cambios futuros aparecerán aquí.
              </div>
            ) : (
              <div className="space-y-1 mt-2">
                {history.map((h, idx) => (
                  <Fragment key={h.id}>
                    {idx === 0 || new Date(history[idx - 1].created_at).toDateString() !== new Date(h.created_at).toDateString() ? (
                      <p className="text-xs font-semibold text-muted-foreground pt-3 pb-1 px-1">
                        {new Date(h.created_at).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    ) : null}
                    <div className="flex gap-3 items-start py-2 px-2 rounded-lg hover:bg-secondary/20 transition">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span className="text-sm">
                            <span className="font-medium">{CAMPO_LABELS[h.campo] ?? h.campo}</span>
                            {' '}cambió de{' '}
                            <span className="line-through text-muted-foreground">
                              {h.valor_anterior ?? '—'}
                            </span>
                            {' '}a{' '}
                            <span className="font-medium text-primary">
                              {h.campo === 'estado'
                                ? `${h.valor_nuevo} — ${ESTADO_CONFIG[Number(h.valor_nuevo)]?.label ?? ''}`
                                : (h.valor_nuevo ?? '—')}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(h.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          por {h.changed_by_name ?? 'Sistema'}
                        </p>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryFor(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
