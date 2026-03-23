import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserDashboard() {
  const proximosEventos = [
    {
      id: 1,
      nombre: 'Concierto de Primavera',
      fecha: '15 de marzo, 2025',
      lugar: 'Auditorio Principal',
      asistiendo: true,
    },
    {
      id: 2,
      nombre: 'Ensayo Semanal',
      fecha: '11 de marzo, 2025',
      lugar: 'Sala de Música 101',
      asistiendo: true,
    },
    {
      id: 3,
      nombre: 'Reunión Social',
      fecha: '22 de marzo, 2025',
      lugar: 'Café del Campus',
      asistiendo: false,
    },
  ];

  const estadisticas = [
    {
      etiqueta: 'Eventos Asistidos',
      valor: '12',
      icono: '📅',
    },
    {
      etiqueta: 'Estado Actual',
      valor: 'Miembro Activo',
      icono: '✓',
    },
    {
      etiqueta: 'Ingreso',
      valor: 'hace 6 meses',
      icono: '📍',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Bienvenida */}
        <div>
          <h1 className="text-4xl font-bold">Bienvenido a UCSP Tuna</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Mantente conectado con la comunidad y no te pierdas ningún evento
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6">
          {estadisticas.map((stat) => (
            <Card key={stat.etiqueta} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.etiqueta}</p>
                  <p className="text-2xl font-bold mt-2">{stat.valor}</p>
                </div>
                <div className="text-4xl">{stat.icono}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Próximos Eventos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Próximos Eventos</h2>
            <Button asChild>
              <Link href="/dashboard/events">Ver Todos</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {proximosEventos.map((evento) => (
              <Card key={evento.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{evento.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      📅 {evento.fecha} • 📍 {evento.lugar}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {evento.asistiendo ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          Confirmado
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto"
                        >
                          Cancelar Asistencia
                        </Button>
                      </>
                    ) : (
                      <Button className="ml-auto">
                        Confirmar Asistencia
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Novedades */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Últimas Novedades</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">🎵</div>
                <div>
                  <h4 className="font-semibold">Concierto de Primavera Confirmado</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nuestro Concierto de Primavera está oficialmente programado para el 15 de marzo. ¡Los ensayos comienzan la próxima semana!
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">hace 2 días</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">👥</div>
                <div>
                  <h4 className="font-semibold">Bienvenida a Nuevos Miembros</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    ¡Tenemos nuevos miembros uniéndose! Bienvenidos a todos los nuevos aspirantes.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">hace 5 días</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">📢</div>
                <div>
                  <h4 className="font-semibold">Reunión General el Próximo Martes</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Únete a nuestra reunión mensual de la comunidad. ¡Habrá pizza y bebidas!
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">hace 1 semana</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
