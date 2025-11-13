"use client"

import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/ui/input"; // Asumo que tienes Input
import { Label } from "@/components/ui/label"; // Asumo que tienes Label
import { Textarea } from "@/components/ui/textarea"; // Asumo que tienes Textarea

// --- Definición de Tipos ---
type AlumnoInfo = {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
};

type MateriaInfo = {
  nombre: string;
};

type MesaInfo = {
  id: number;
  fecha: string; 
  materia: MateriaInfo;
};

type CalificacionBorrador = {
  id: number; 
  alumnoId: number;
  mesaExamenId: number;
  notaNumerica: number | null;
  notaConceptual: string | null; 
  observaciones: string | null;
  alumno: AlumnoInfo;
  mesaExamen: MesaInfo;
};

type NotasAgrupadas = {
  mesaId: number;
  mesaLabel: string; 
  calificaciones: CalificacionBorrador[];
};

// --- Componente de Spinner ---
const Spinner = ({ sm = false }: { sm?: boolean }) => (
  <div className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${sm ? 'h-4 w-4' : 'h-5 w-5'}`}></div>
);

// --- Schema de Zod para el Modal de Edición ---
// (Es el mismo schema del modal que el de la API PATCH)
const NotaEditSchema = z.object({
  tipoNota: z.enum(["numerica", "conceptual"]),
  notaNumerica: z.any(),
  notaConceptual: z.any(),
  observaciones: z.string().max(300, "Máximo 300 caracteres").optional(),
})
.superRefine((data, ctx) => {
  if (data.tipoNota === 'numerica') {
    const notaNum = parseFloat(data.notaNumerica);
    if (isNaN(notaNum)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ingresar una nota", path: ["notaNumerica"] });
    } else if (notaNum < 1 || notaNum > 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La nota debe ser entre 1 y 10", path: ["notaNumerica"] });
    }
  } 
  else if (data.tipoNota === 'conceptual') {
    if (data.notaConceptual !== "APROBADO" && data.notaConceptual !== "DESAPROBADO") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un resultado", path: ["notaConceptual"] });
    }
  }
});

type FormEditT = z.infer<typeof NotaEditSchema>;

// --- Componente Principal ---
export default function ConfirmarNotasPage() {
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });

  const [notas, setNotas] = useState<CalificacionBorrador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  
  // --- NUEVO: Estado para el Modal ---
  // Guarda la nota que estamos editando
  const [editingNota, setEditingNota] = useState<CalificacionBorrador | null>(null);

  // 1. Cargar las notas en borrador
  useEffect(() => {
    if (status === 'authenticated') {
      (async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/profesor/finales/confirmar');
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'No se pudieron cargar las notas.');
          }
          const data: CalificacionBorrador[] = await res.json();
          setNotas(data);
          setError(null);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [status]);

  // 2. Agrupar las notas por Mesa de Examen (sin cambios)
  const notasAgrupadas: NotasAgrupadas[] = useMemo(() => {
    const grupos = new Map<number, { mesaLabel: string, calificaciones: CalificacionBorrador[] }>();
    notas.forEach(nota => {
      if (!grupos.has(nota.mesaExamenId)) {
        grupos.set(nota.mesaExamenId, {
          mesaLabel: `${nota.mesaExamen.materia.nombre} - ${new Date(nota.mesaExamen.fecha).toLocaleDateString()}`,
          calificaciones: []
        });
      }
      grupos.get(nota.mesaExamenId)!.calificaciones.push(nota);
    });
    return Array.from(grupos.entries()).map(([mesaId, data]) => ({
      mesaId,
      ...data
    }));
  }, [notas]);

  // 3. Función para confirmar (sin cambios)
  const handleConfirmar = async (calificacionId: number) => {
    setConfirmandoId(calificacionId);
    console.log("TODO: Llamar a la API PATCH para CONFIRMAR (cambiar estado) la nota:", calificacionId);
    await new Promise(res => setTimeout(res, 1000)); 
    alert(`Nota ${calificacionId} confirmada (simulación).`);
    setNotas(prevNotas => prevNotas.filter(n => n.id !== calificacionId));
    setConfirmandoId(null);
  };
  
  // 4. NUEVO: Función para abrir el modal
  const handleAbrirModal = (nota: CalificacionBorrador) => {
    setEditingNota(nota);
  };

  // 5. NUEVO: Función para cerrar el modal
  const handleCerrarModal = () => {
    setEditingNota(null);
  };
  
  // 6. NUEVO: Función para actualizar la lista de notas después de editar
  const handleNotaActualizada = (notaActualizada: CalificacionBorrador) => {
    // Reemplazamos la nota vieja por la nueva en el estado 'notas'
    setNotas(prevNotas => 
      prevNotas.map(n => 
        n.id === notaActualizada.id ? notaActualizada : n
      )
    );
    // Cerramos el modal
    handleCerrarModal();
  };

  // 7. Renderizado de Estados de Carga/Error (sin cambios)
  if (status === 'loading' || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-gray-600">Cargando notas pendientes...</div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-red-600 bg-red-100 p-4 rounded-md shadow">
          <strong>Error:</strong> {error}
        </div>
      </main>
    );
  }

  // 8. Renderizado Principal (Lista de Notas)
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 relative">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Confirmar Notas Finales
        </h1>

        <div className="space-y-4">
          {notasAgrupadas.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No hay notas en estado "Borrador" pendientes de confirmación.
            </div>
          ) : (
            notasAgrupadas.map(grupo => (
              <details key={grupo.mesaId} className="bg-white shadow-sm rounded-lg" open>
                
                <summary className="p-4 font-medium text-lg cursor-pointer hover:bg-gray-50 rounded-t-lg">
                  {grupo.mesaLabel} 
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({grupo.calificaciones.length} pendientes)
                  </span>
                </summary>

                <div className="border-t border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alumno
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Legajo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nota (Borrador)
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grupo.calificaciones.map(cal => (
                        <tr key={cal.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cal.alumno.apellido}, {cal.alumno.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cal.alumno.legajo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                            {cal.notaNumerica ? cal.notaNumerica : (cal.notaConceptual || 'N/A')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {/* --- BOTÓN MODIFICAR (NUEVO) --- */}
                            <Button
                              type="button"
                              className="w-24 bg-black hover:bg-gray-700 text-white"
                              onClick={() => handleAbrirModal(cal)}
                              disabled={confirmandoId === cal.id}
                            >
                              Modificar
                            </Button>
                            
                            {/* --- BOTÓN CONFIRMAR (Existente) --- */}
                            <Button
                              type="button"
                              className="w-28 bg-green-900 hover:bg-green-700 text-white"
                              onClick={() => handleConfirmar(cal.id)}
                              disabled={confirmandoId === cal.id}
                            >
                              {confirmandoId === cal.id ? (
                                <Spinner sm />
                              ) : (
                                'Confirmar'
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))
          )}
        </div>
      </div>

      {/* Botón Volver */}
      <Button 
        type="button" 
        onClick={() => router.push("/profesor/notas/finales")}
        className="bg-gray-900 hover:bg-black text-white absolute bottom-6 right-6"
      >
        Volver
      </Button>

      {/* --- RENDERIZADO DEL MODAL (NUEVO) ---
        - Se renderiza solo si 'editingNota' tiene datos.
        - Usamos Fragment para no añadir un div innecesario.
      */}
      {editingNota && (
        <EditModal 
          nota={editingNota} 
          onClose={handleCerrarModal}
          onSaveSuccess={handleNotaActualizada}
        />
      )}

    </main>
  );
}


// -----------------------------------------------------------------
// --- COMPONENTE DEL MODAL DE EDICIÓN ---
// -----------------------------------------------------------------
// Lo incluimos en el mismo archivo para simplicidad.
// -----------------------------------------------------------------

interface EditModalProps {
  nota: CalificacionBorrador;
  onClose: () => void;
  onSaveSuccess: (notaActualizada: CalificacionBorrador) => void;
}

function EditModal({ nota, onClose, onSaveSuccess }: EditModalProps) {
  
  // Hook-form específico para este modal
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } =
    useForm<FormEditT>({
      resolver: zodResolver(NotaEditSchema),
      defaultValues: {
        // Pre-cargamos el modal con los datos de la nota
        tipoNota: nota.notaNumerica ? "numerica" : "conceptual",
        notaNumerica: nota.notaNumerica,
        notaConceptual: nota.notaConceptual as "APROBADO" | "DESAPROBADO" | undefined,
        observaciones: nota.observaciones || "",
      },
    });

  const tipoNota = watch('tipoNota'); // Para mostrar/ocultar campos

  const handleGuardarCambios = async (data: FormEditT) => {
    
    // 1. Limpiamos el payload
    const payload: any = { ...data };
    if (data.tipoNota === 'numerica') {
      payload.notaNumerica = parseFloat(data.notaNumerica);
      delete payload.notaConceptual;
    } else {
      delete payload.notaNumerica;
    }

    try {
      // 2. Llamamos a la API PATCH que creamos
      const res = await fetch(`/api/profesor/finales/${nota.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'No se pudo guardar la nota.');
      }
      
      const notaActualizada: CalificacionBorrador = await res.json();
      
      // 3. Si todo OK, llamamos al callback 'onSaveSuccess'
      // Esto le dice a la página principal que actualice su estado.
      alert("Nota actualizada con éxito.");
      onSaveSuccess(notaActualizada);

    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error al guardar. Intente nuevamente.");
    }
  };

  return (
    // Fondo oscuro (backdrop)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Cierra el modal si se hace clic fuera
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-6"
        onClick={e => e.stopPropagation()} // Evita que el clic en el modal lo cierre
      >
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Modificar Calificación
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar modal"
          >
            {/* Un ícono de 'X' (puedes reemplazarlo por uno de lucide-react si lo tienes) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Info del Alumno (no editable) */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md border">
          <p className="font-medium text-gray-900">
            {nota.alumno.apellido}, {nota.alumno.nombre}
          </p>
          <p className="text-sm text-gray-600">
            Legajo: {nota.alumno.legajo}
          </p>
        </div>

        {/* Formulario de Edición */}
        <form onSubmit={handleSubmit(handleGuardarCambios)} className="space-y-4">
          
          {/* Tipo de Nota */}
          <div className="space-y-1">
            <Label htmlFor="tipoNota" className="text-sm">Tipo de Nota</Label>
            <select
              id="tipoNota"
              className="w-full h-10 rounded-md border px-3 text-sm bg-gray-50"
              {...register("tipoNota")}
            >
              <option value="numerica">Numérica (1-10)</option>
              <option value="conceptual">Conceptual (Aprob/Desaprob)</option>
            </select>
          </div>

          {/* Nota (Condicional) */}
          {tipoNota === 'numerica' ? (
            <div className="space-y-1">
              <Label htmlFor="notaNumerica" className="text-sm">Nota (1-10)</Label>
              <Input
                id="notaNumerica"
                type="number"
                min="1"
                max="10"
                step="1"
                placeholder="Ej: 7"
                {...register("notaNumerica", { valueAsNumber: true })}
              />
              {errors.notaNumerica && (
                <p className="text-xs text-red-600">{String(errors.notaNumerica.message)}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="notaConceptual" className="text-sm">Nota</Label>
              <select
                id="notaConceptual"
                className="w-full h-10 rounded-md border px-3 text-sm bg-gray-50"
                {...register("notaConceptual")}
              >
                <option value="" disabled>Seleccionar resultado</option>
                <option value="APROBADO">Aprobado</option>
                <option value="DESAPROBADO">Desaprobado</option>
              </select>
              {errors.notaConceptual && (
                <p className="text-xs text-red-600">{String(errors.notaConceptual.message)}</p>
              )}
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-1">
            <Label htmlFor="observaciones" className="text-sm">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Ej: Se destaca la participación en clase. (Máx 300 caracteres)"
              className="min-h-[80px] bg-gray-50"
              {...register("observaciones")}
            />
            {errors.observaciones && (
              <p className="text-xs text-red-600">{String(errors.observaciones.message)}</p>
            )}
          </div>

          {/* Botones del Modal */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button 
              type="button" 
              variant="secondary" // Asumo que tienes una variante 'secondary'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-36 bg-black hover:bg-gray-700 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner sm /> : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}