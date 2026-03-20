import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rrfcfigmyfpfvahguxmk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Datos completos de los tunos con ROA como identificador
const tunosData = [
  { roa: 1, nombres: 'Fernando Alberto', apellidos: 'Lacunza Murillo', mote: 'Pollo', fechaBautizoDia: 19, fechaBautizoMes: 12, fechaBautizoAno: 2009, lugarBautizo: 'La Casa Villa (ISUR)', padrino: 'Mormón (Hugo Robira) TUSMP', madrina: 'Borys (Nosferatus)', fechaNacimiento: '12/11/1988', carrera: 'Derecho', telefono: '959459669', telefonoEmergencia: '959868740', direccion: 'Calle Misti Nro. 219 - Yanahuara', correoElectronico: 'lacunza.murillo@gmail.com', tipoSangre: 'AB+' },
  { roa: 2, nombres: 'Adrian Jesus', apellidos: 'Gallegos Sanchez', mote: 'Meteoro', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Loco TUSMP', madrina: 'Borys (Nosferatus)', fechaNacimiento: '23/07/1988', carrera: 'Derecho', telefono: '942723657', telefonoEmergencia: '054-267933', direccion: 'Urb. Augusto Salazar Bondy B28 - Alto Selva Alegre', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 3, nombres: 'Kevin Mauricio', apellidos: 'Apaza Guaranga', mote: 'Ouija', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: null, madrina: 'Borys (Nosferatus)', fechaNacimiento: '09/02/1991', carrera: 'Ciencias de la Computación', telefono: '17824145916', telefonoEmergencia: '054-263142', direccion: '1004-5599 fenwick st, halifax. Nova Scotia, Canada', correoElectronico: null, tipoSangre: null },
  { roa: 4, nombres: 'Luis Alberto', apellidos: 'Miranda Herencia', mote: 'Borrego', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Mormón (Hugo Robira) TUSMP', madrina: 'Borys (Nosferatus)', fechaNacimiento: '28/08/1989', carrera: 'Administración', telefono: '958782281', telefonoEmergencia: '959729071', direccion: 'Calle Anpatacocha 309 - Yanahuara -Urb. Bello Horizonte, Distrito de Cayma', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 5, nombres: 'Allan', apellidos: 'Vilcanqui Mamani', mote: 'Shin Shan', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Francis TUSMP', madrina: 'Harry Potter', fechaNacimiento: null, carrera: 'Contabilidad', telefono: '958126312', telefonoEmergencia: null, direccion: 'Aduanas - Mollendo /Villamar U1 - Mollendo', correoElectronico: null, tipoSangre: null },
  { roa: 6, nombres: 'Holger Gerald', apellidos: 'Salas Valencia', mote: 'Ventrilocuo', fechaBautizoDia: 8, fechaBautizoMes: 8, fechaBautizoAno: 2010, lugarBautizo: 'Plaza de Armas', padrino: 'Borys (Nosferatus)', madrina: 'Borrego', fechaNacimiento: '14/03/1989', carrera: 'Ing. Industrial', telefono: '965321458', telefonoEmergencia: null, direccion: 'Sor Ana de Los Ángeles 3ra etapa- J205', correoElectronico: null, tipoSangre: 'B+' },
  { roa: 7, nombres: 'Hugo Manoel', apellidos: 'Gutierrez Pilco', mote: 'Chun Lee', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Pollo Loco TUSMP', madrina: 'Borrego', fechaNacimiento: '12/04/1988', carrera: 'Ing. Industrial', telefono: '983703740', telefonoEmergencia: null, direccion: 'Las Torres de la Alameda 2B-405 - Miraflores', correoElectronico: null, tipoSangre: null },
  { roa: 8, nombres: 'Roberto Carlos', apellidos: 'Velasquez Medina', mote: 'Cachorro', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Borys (Nosferatus)', madrina: 'Harry Potter', fechaNacimiento: '20/07/1983', carrera: null, telefono: '959318784', telefonoEmergencia: null, direccion: 'urb. Juan Pablo Vizcardo y Guzman C 22 III Etapa', correoElectronico: null, tipoSangre: null },
  { roa: 9, nombres: 'Jeancarlo Rommel', apellidos: 'Valencia Jimenez', mote: 'Mohamed', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Pollo', madrina: 'Borrego', fechaNacimiento: '31/01/1989', carrera: 'Ing. Industrial', telefono: '966215858', telefonoEmergencia: null, direccion: 'Calle Las Beatas 114 B Yanahuara', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 10, nombres: 'Giancarlo Alfredo', apellidos: 'Aparicio Ticona', mote: 'Mr. Popus', fechaBautizoDia: 13, fechaBautizoMes: 11, fechaBautizoAno: 2010, lugarBautizo: 'Centro Valparaiso (Cerro el Barón)-Chile', padrino: 'Meteoro', madrina: 'Borrego', fechaNacimiento: '15/02/1989', carrera: 'Ing. Industrial', telefono: '962753592', telefonoEmergencia: '934042925', direccion: 'Av. San Martin 1103 - Miraflores', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 11, nombres: 'José Eduardo', apellidos: 'Romero Diaz', mote: 'Rocoto', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Meteoro', madrina: 'Chun Lee', fechaNacimiento: '20-mar', carrera: 'Derecho - Historia', telefono: '958268691', telefonoEmergencia: null, direccion: 'Por el colegio de Huaranguillo', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 12, nombres: 'Carlos Andres', apellidos: 'Ballivian Martinez', mote: 'Lord Voldemort', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Borrego', madrina: 'Chun Lee', fechaNacimiento: null, carrera: null, telefono: '974211517', telefonoEmergencia: null, direccion: 'Recide en Lima', correoElectronico: null, tipoSangre: null },
  { roa: 13, nombres: 'Carlos Eugenio', apellidos: 'Moscoso Flores', mote: 'Sonic', fechaBautizoDia: 18, fechaBautizoMes: 7, fechaBautizoAno: 2012, lugarBautizo: 'Convento de Santa Catalina', padrino: 'Mr. Popus', madrina: 'Pollo', fechaNacimiento: '01/01/1991', carrera: 'Independiente', telefono: '910997626', telefonoEmergencia: '959002666', direccion: 'Urb. Jesús María Calle Los Lirios 110 - Paucarpata', correoElectronico: null, tipoSangre: 'B+' },
  { roa: 14, nombres: 'Paulo Cesar', apellidos: 'Benites Castillo', mote: 'Buque', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Arena', madrina: 'Mr. Popus', fechaNacimiento: '26/12/1990', carrera: 'Derecho', telefono: '980894103', telefonoEmergencia: '980894103', direccion: 'García Calderon 115 - Vallecito', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 15, nombres: 'Mauricio', apellidos: 'Rodriguez Camargo', mote: 'Anakin', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Mohamed', madrina: 'Borrego', fechaNacimiento: '27/09/1992', carrera: 'Educacion', telefono: '965722740', telefonoEmergencia: '054-251813', direccion: 'Calle Las Orquideas 233 segundo piso, Urb. Primavera. Umacollo - Yanahuara', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 16, nombres: 'Marcos Fernando', apellidos: 'Torrico Santos', mote: 'Mohojojo', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Rocoto', madrina: 'Mohamed', fechaNacimiento: '25/01/1993', carrera: 'Derecho', telefono: '958399003', telefonoEmergencia: null, direccion: 'Coop. Vista Alegre C-2 - Selva Alegre', correoElectronico: null, tipoSangre: null },
  { roa: 17, nombres: 'Malcus Galile', apellidos: 'Enriquez Almanza', mote: 'Shaggy', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Chun Lee', madrina: 'Harry Potter', fechaNacimiento: null, carrera: 'Administracion', telefono: null, telefonoEmergencia: null, direccion: 'Recide en Belgica', correoElectronico: null, tipoSangre: null },
  { roa: 18, nombres: 'Diego Mauricio', apellidos: 'Rios Carillo', mote: 'Espanta', fechaBautizoDia: 19, fechaBautizoMes: 12, fechaBautizoAno: 2013, lugarBautizo: 'Plaza de Armas', padrino: 'Anakin', madrina: 'Borrego', fechaNacimiento: '15/12/1992', carrera: 'Derecho', telefono: '984721108', telefonoEmergencia: null, direccion: 'Las Gardenias mz W It 10b Ur.Leoncio Prado - Paucarpata', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 19, nombres: 'Armando Raphael', apellidos: 'Banda Toma', mote: 'Capullo', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Rocoto', madrina: 'Mr. Popus', fechaNacimiento: '24/04/1994', carrera: 'Ing. Industrial', telefono: '987702005', telefonoEmergencia: '989032085', direccion: 'Urb. Las Viñas Casa - Parque A-2. Piso 3', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 20, nombres: 'Jorge Luis', apellidos: 'Oblitas Tejada', mote: 'Sinapodo', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Mr. Popus', madrina: 'Buque', fechaNacimiento: '3/11/1984', carrera: 'Telecomunicaciones', telefono: '953974368', telefonoEmergencia: '957959203', direccion: 'San Sebastian A-9 - Cercado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 21, nombres: 'Joshua Axel', apellidos: 'Aragon Chambi', mote: 'Doberman', fechaBautizoDia: 26, fechaBautizoMes: 9, fechaBautizoAno: 2014, lugarBautizo: 'Universidad Catolica San Pablo', padrino: 'Mr. Popus', madrina: 'Rocoto', fechaNacimiento: '02/09/1993', carrera: 'Telecomunicaciones', telefono: '935381272', telefonoEmergencia: null, direccion: 'Torres de la Alameda - Miraflores', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 22, nombres: 'Armando Gabriel', apellidos: 'Salas Alarcon', mote: 'Insomnio', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Rocoto', madrina: 'MR. Popus', fechaNacimiento: '25/06/1993', carrera: 'Adm. De Negocios', telefono: '980507164', telefonoEmergencia: '054-487560', direccion: 'Urb. Casa Blanca G-17 Dpto 501 - JL Bustamante', correoElectronico: null, tipoSangre: 'B+' },
  { roa: 23, nombres: 'Karlo Eduardo', apellidos: 'Apaza Merma', mote: 'Gusabio', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Rocoto', madrina: 'Capullo', fechaNacimiento: '18/12/1993', carrera: 'Adm. De Negocios', telefono: '994717938', telefonoEmergencia: '967721487', direccion: 'Pasaje Moquegua 103 Guaranguillo - Sachaca', correoElectronico: null, tipoSangre: null },
  { roa: 24, nombres: 'Carlos Eduardo', apellidos: 'Delgado Rendon', mote: 'Ben 10', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Sonic', madrina: 'Capullo', fechaNacimiento: '03/02/1994', carrera: 'Adm. De Negocios', telefono: '996963540', telefonoEmergencia: null, direccion: 'Recide en Lima', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 25, nombres: 'Frans', apellidos: 'Camero Cusihuallpa', mote: 'Pipilin', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Borrego', madrina: 'Capullo', fechaNacimiento: '21/04/1987', carrera: 'Adm. De Negocios', telefono: '948363359', telefonoEmergencia: '986883156', direccion: 'Urb. Aurora M-1, a espaldas del Parque Lambramani', correoElectronico: null, tipoSangre: 'RH+' },
  { roa: 26, nombres: 'Josias Jaime', apellidos: 'Conde Vargas', mote: 'Joshi', fechaBautizoDia: 13, fechaBautizoMes: 11, fechaBautizoAno: 2016, lugarBautizo: 'Parque de la residencial Markan', padrino: 'Borrego', madrina: 'Pipilin', fechaNacimiento: '05/05/1990', carrera: 'Adm. De Negocios', telefono: '962923461', telefonoEmergencia: '987252905', direccion: 'Garcia Carbajal -700 - Cercado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 27, nombres: 'Elmer Alexander', apellidos: 'Velazco Vera', mote: 'Manzana', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Sinapodo', madrina: 'Joshi', fechaNacimiento: '17/12/1994', carrera: 'Arquitectura', telefono: '977578497', telefonoEmergencia: '959839979', direccion: 'Rafael Belaunde Zn C. Mz G Ltd 18 - Cayma', correoElectronico: null, tipoSangre: null },
  { roa: 28, nombres: 'Edison Irvinc', apellidos: 'Zamata Alcahuaman', mote: 'Pichon de Ouija', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Anaking', madrina: 'Rocoto', fechaNacimiento: '16/03/1996', carrera: 'Ing. Industrial', telefono: '995995505', telefonoEmergencia: '944400067', direccion: 'Calle Dean Valdivia 573 - Cercado', correoElectronico: null, tipoSangre: null },
  { roa: 29, nombres: 'Randy Oliver', apellidos: 'Pari Vega', mote: 'Pompinchu', fechaBautizoDia: 29, fechaBautizoMes: 10, fechaBautizoAno: 2017, lugarBautizo: 'Malecòn Bolognesi', padrino: 'Joshi', madrina: 'Rocoto', fechaNacimiento: '08/09/1993', carrera: 'Ing. Industrial', telefono: '997911761', telefonoEmergencia: '931833221', direccion: 'Urb. Primavera Calle Los Tulipanes 103 - Yanahuara', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 30, nombres: 'Kevin Arnold', apellidos: 'Maras', mote: 'Chacana', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Rocoto', madrina: 'Capullo', fechaNacimiento: '12/12/1992', carrera: 'Ing. Civil', telefono: '910791895', telefonoEmergencia: '951200676', direccion: 'Las Orquideas (ASVEA) L-27 - Cercado', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 31, nombres: 'Jose Leonardo', apellidos: 'Neira Trujillo', mote: 'Chiru Chiru', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Capullo', madrina: 'Pipilin', fechaNacimiento: '10/11/1997', carrera: 'Derecho - Economia', telefono: '953287833', telefonoEmergencia: null, direccion: 'Urb. Sorona de lo Angeles 2da Etapa Guardia Civil - Paucarpata', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 32, nombres: 'Jhonathan', apellidos: 'Orihuela Cuadros', mote: 'Jimbo', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Imsomnio', madrina: 'Dobby', fechaNacimiento: '17/02/1998', carrera: 'Psicologia', telefono: '992871174', telefonoEmergencia: '959745442', direccion: 'Av. Puno 1007 Alto Libertad- Cerro Colorado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 33, nombres: 'Alexis Mario', apellidos: 'Barrios Salinas', mote: 'Chichico', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Capullo', madrina: 'Dobby', fechaNacimiento: '15/04/1998', carrera: 'Ing. Industrial', telefono: '974676077', telefonoEmergencia: '956125765', direccion: 'Coop. Clisa B-12 - Paucarpata', correoElectronico: null, tipoSangre: 'OH+' },
  { roa: 34, nombres: 'Luis Rodrigo', apellidos: 'Orihuela Cuadros', mote: 'Serrucho', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Imsomnio', madrina: 'Jimbo', fechaNacimiento: '04/01/1996', carrera: 'Ing. Civil', telefono: '959732188', telefonoEmergencia: '951730092', direccion: 'Av. Puno 1007 Alto Libertad- Cerro Colorado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 35, nombres: 'Yelsin Duval', apellidos: 'Alencastre', mote: 'Picoro', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Borrego', madrina: 'Pipilin', fechaNacimiento: '19/04/1996', carrera: 'Ing. Industrial', telefono: '989814667', telefonoEmergencia: '054-516487', direccion: 'Urb. 4 de Octubre - Socabaya', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 36, nombres: 'Giacomo Ernesto', apellidos: 'Gonzales Pacheco', mote: 'Pepino', fechaBautizoDia: 16, fechaBautizoMes: 12, fechaBautizoAno: 2018, lugarBautizo: 'Plaza San Lázaro', padrino: 'Mohojojo', madrina: 'Serrucho', fechaNacimiento: '21-oct', carrera: 'Ing. industrial', telefono: '987252905', telefonoEmergencia: '989196279', direccion: 'Calle Villalba 424 - Cercado', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 37, nombres: 'Cesar Rodrigo', apellidos: 'Vargas Valdivia', mote: 'Mumm Ra', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Sinapodo', madrina: 'Chacana', fechaNacimiento: '19-Set', carrera: 'Administración', telefono: '948087383', telefonoEmergencia: '959219775', direccion: 'Pasaje Las Dalias 101 Ciudad mi Trabajo - Socabaya', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 38, nombres: 'Jose Martin', apellidos: 'Cori Rodriguez', mote: 'Viernes', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Buque', madrina: 'Pepino', fechaNacimiento: '4-Set', carrera: 'Administración', telefono: '930216434', telefonoEmergencia: '930216434', direccion: 'Av. Caracas 404 Simon Bolivar - JL Bustamante', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 39, nombres: 'Jhon Milton', apellidos: 'Mina Aguilar', mote: 'Choko', fechaBautizoDia: 8, fechaBautizoMes: 3, fechaBautizoAno: 2020, lugarBautizo: 'Plaza San Lázaro', padrino: 'Chiru Chiru', madrina: 'Arena', fechaNacimiento: '2-ene', carrera: null, telefono: '984236830', telefonoEmergencia: null, direccion: 'Alto Selva. Gráficos - Metro - Cerro Colorado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 40, nombres: 'Humberto Manuel', apellidos: 'Flores Rodriguez', mote: 'Uub', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Jimbo', madrina: 'Serrucho', fechaNacimiento: '25/05/2000', carrera: 'Derecho', telefono: '959922158', telefonoEmergencia: '976782872', direccion: 'Urb. Pueblo Libre Tasahuayo - JL. Bustamante', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 41, nombres: 'Manuel Alejandro', apellidos: 'Pacco Navarro', mote: 'Winnie Pooh', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Pichon', madrina: 'Viernes', fechaNacimiento: '28/10/1999', carrera: 'Derecho', telefono: '974575171', telefonoEmergencia: '955313626', direccion: 'Urbanización los Alamos c-2 III etapa Guardia Civil', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 42, nombres: 'Diego Farid', apellidos: 'Cárdenas Vilcatoma', mote: 'Jaimico', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Joshi', madrina: 'Insomnio', fechaNacimiento: '22/09/1999', carrera: 'Derecho', telefono: '914519075', telefonoEmergencia: '959366415', direccion: 'Av. Mariano Melgar A-300 Cerro Colorado', correoElectronico: null, tipoSangre: 'No sabe' },
  { roa: 43, nombres: 'Omar Andrés', apellidos: 'Carrillo Pino', mote: 'CJ', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Espanta', madrina: 'Chichico', fechaNacimiento: '04/02/2000', carrera: 'Ing Industrial', telefono: '973168618', telefonoEmergencia: '953519958', direccion: 'Calle San Martin 202 Urb. Cerro Salaverry - Socabaya', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 44, nombres: 'Brandon Randall', apellidos: 'Valencia Calderon', mote: 'Psicopata', fechaBautizoDia: 15, fechaBautizoMes: 10, fechaBautizoAno: 2022, lugarBautizo: 'Universidad Catolica San Pablo', padrino: 'Jimbo', madrina: 'Uub', fechaNacimiento: '31-mar', carrera: 'Ciencia de la Computacion', telefono: '924783359', telefonoEmergencia: '958923314', direccion: 'Av Victor Andres Belaunde H16 Cerro Colorado', correoElectronico: 'brandon.valencia.calderon@gmail.com', tipoSangre: 'O+' },
  { roa: 45, nombres: 'Emerson José', apellidos: 'Gallegos Quispe', mote: 'Julien', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Uub', madrina: 'Winnie', fechaNacimiento: '8-jul', carrera: 'Administración', telefono: '936334713', telefonoEmergencia: '902736213', direccion: 'Av. Emancipación 433', correoElectronico: null, tipoSangre: null },
  { roa: 46, nombres: 'Álvaro', apellidos: 'Franco Cerna Ramos', mote: 'Funko', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Ben 10', madrina: 'Pepino', fechaNacimiento: '17-nov', carrera: 'Ciencia de la Computacion', telefono: '980922229', telefonoEmergencia: '958281545', direccion: 'Av Sepúlveda 508', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 47, nombres: 'Kevin Romario', apellidos: 'Blanco Ocola', mote: 'Koopa', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Ben 10', madrina: 'Capullo', fechaNacimiento: '20-ene', carrera: 'Administración', telefono: '924328996', telefonoEmergencia: null, direccion: 'Las Casuarinas C-10 - JL. Bustamante', correoElectronico: null, tipoSangre: null },
  { roa: 48, nombres: 'Brad Gino', apellidos: 'Tejada Juarez', mote: 'Locomia', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Buque', madrina: 'Viernes', fechaNacimiento: '4-oct', carrera: 'Administración', telefono: '942170777', telefonoEmergencia: null, direccion: 'Urb.Campo verde c-2', correoElectronico: null, tipoSangre: null },
  { roa: 49, nombres: 'Miguel Jhonatan', apellidos: 'Alvarez Bustinza', mote: 'Fonsi', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Capullo', madrina: 'Ben 10', fechaNacimiento: '27-sept', carrera: 'Ing. Industrial', telefono: '902575378', telefonoEmergencia: null, direccion: 'Calle los sauces Z-2 - Socabaya', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 50, nombres: 'Rafael', apellidos: 'Franco Zegarra Vela', mote: 'Tilín', fechaBautizoDia: 8, fechaBautizoMes: 12, fechaBautizoAno: 2023, lugarBautizo: 'Pasaje Ripacha', padrino: 'Cj', madrina: 'Frans', fechaNacimiento: '15-jul', carrera: 'Derecho', telefono: '984403317', telefonoEmergencia: null, direccion: 'Calle Boliva N° 505, Urb. fecia - Jose Luis B y R', correoElectronico: null, tipoSangre: null },
  { roa: 51, nombres: 'Gianpierre Alejandro', apellidos: 'Alegría Mendoza', mote: 'Géminis', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Psicópata', madrina: 'Rocoto', fechaNacimiento: '27-sept', carrera: 'Ing. Industrial', telefono: '998388500', telefonoEmergencia: null, direccion: 'Av. Lima 604 - Mariano Melgar', correoElectronico: null, tipoSangre: null },
  { roa: 52, nombres: 'Mauricio Renzo', apellidos: 'Estefanero Chávez', mote: 'Caradura', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Psicópata', madrina: 'Winnie', fechaNacimiento: '15-mar', carrera: 'Ciencias de la Computación', telefono: '959032733', telefonoEmergencia: null, direccion: 'Urb. Sta. Catalin R-12 - Jose Luis B y R', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 53, nombres: 'Josep Marko', apellidos: 'Quispe Salcedo', mote: 'Mowgli', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Jimbo', madrina: 'Winnie', fechaNacimiento: '1-may', carrera: 'Ciencias de la Computación', telefono: '941178294', telefonoEmergencia: null, direccion: 'Urbs. Transoceanica G7 - Cerro Colorado', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 54, nombres: 'Patrick Fabian', apellidos: 'Barreda Nuñez', mote: 'Chupetín', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Psicópata', madrina: 'Winnie', fechaNacimiento: '19-mar', carrera: 'Derecho', telefono: '957919697', telefonoEmergencia: null, direccion: 'Espinar N° 903 - Miraflores', correoElectronico: null, tipoSangre: null },
  { roa: 55, nombres: 'Jean Piere Manuel', apellidos: 'Ramos Parada', mote: 'Chungus', fechaBautizoDia: 24, fechaBautizoMes: 5, fechaBautizoAno: 2025, lugarBautizo: 'Parque Internacional', padrino: 'Cj', madrina: 'Jaimico', fechaNacimiento: '15-sept', carrera: 'Ing Civil', telefono: '923655248', telefonoEmergencia: '952110059', direccion: 'Coop. San Jose P-102 - Alto Selva Alegre', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 56, nombres: 'Nicolás Salvador', apellidos: 'Huamancha Berrios', mote: 'Nobita', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Jaimico', madrina: 'Mowgli', fechaNacimiento: '07-08-2004', carrera: 'Psicología', telefono: '955018553', telefonoEmergencia: '931333784', direccion: 'Mariano Melgar N° 300, La Libertad - Cerro Colorado', correoElectronico: null, tipoSangre: 'B+' },
  { roa: 57, nombres: 'Carlos', apellidos: 'Arce Coya', mote: 'Churicata', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Ben 10', madrina: 'Chiru Chiru', fechaNacimiento: '18-jun', carrera: 'Derecho', telefono: '951852269', telefonoEmergencia: '951318211', direccion: 'Av. Juan Velasco Alvarado Mza.C - Lte.15 - JByR', correoElectronico: null, tipoSangre: 'A+' },
  { roa: 58, nombres: 'Abraham Gabriel', apellidos: 'Cáceres Velásquez', mote: 'Abelardo', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Insomnio', madrina: 'Cj', fechaNacimiento: '14-abr', carrera: 'Derecho', telefono: '947307289', telefonoEmergencia: '934983467', direccion: 'Cooperativa vista alegre r-3, - A.S.A.', correoElectronico: null, tipoSangre: 'O+' },
  { roa: 59, nombres: 'Farid Héctor Franshesco', apellidos: 'Cornejo Vásquez', mote: 'Lujurio', fechaBautizoDia: null, fechaBautizoMes: null, fechaBautizoAno: null, lugarBautizo: null, padrino: 'Winnie', madrina: 'Cj', fechaNacimiento: '4-mar', carrera: 'Arquitectura y Urbanismo', telefono: '954977447', telefonoEmergencia: '923192682', direccion: 'Calle Huascar 167 Carmen Alto - Cayma', correoElectronico: null, tipoSangre: null },
];

async function insertTunosData() {
  try {
    console.log('Iniciando inserción de datos de tunos...');
    console.log(`Total de registros a insertar: ${tunosData.length}`);

    // Crear mapa de nombres a IDs para resolver relaciones de padrinos/madrinas
    const moteToId = {};
    
    // Primera pasada: insertar todos los perfiles para obtener los IDs
    for (const tuno of tunosData) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: tuno.roa.toString(),
          first_name: tuno.nombres,
          last_name: tuno.apellidos,
          mote: tuno.mote,
          fecha_ingreso: tuno.fechaBautizoDia && tuno.fechaBautizoMes && tuno.fechaBautizoAno 
            ? `${tuno.fechaBautizoAno}-${String(tuno.fechaBautizoMes).padStart(2, '0')}-${String(tuno.fechaBautizoDia).padStart(2, '0')}`
            : null,
          fecha_bautizo: tuno.fechaBautizoDia && tuno.fechaBautizoMes && tuno.fechaBautizoAno
            ? `${tuno.fechaBautizoAno}-${String(tuno.fechaBautizoMes).padStart(2, '0')}-${String(tuno.fechaBautizoDia).padStart(2, '0')}`
            : null,
          lugar_bautizo: tuno.lugarBautizo,
          fecha_nacimiento: tuno.fechaNacimiento ? new Date(tuno.fechaNacimiento).toISOString().split('T')[0] : null,
          carrera: tuno.carrera,
          telefono: tuno.telefono,
          persona_emergencia: null,
          telefono_emergencia: tuno.telefonoEmergencia,
          direccion: tuno.direccion,
          correo_electronico: tuno.correoElectronico,
          tipo_sangre: tuno.tipoSangre,
          dni: null,
          role: 'tuno',
        })
        .select();

      if (error) {
        console.error(`Error al insertar ${tuno.nombres} ${tuno.apellidos}:`, error);
      } else {
        moteToId[tuno.mote] = tuno.roa.toString();
        console.log(`✓ Insertado: ${tuno.nombres} ${tuno.apellidos} (ROA: ${tuno.roa}, Mote: ${tuno.mote})`);
      }
    }

    // Segunda pasada: actualizar referencias de padrinos/madrinas
    console.log('\nActualizando referencias de padrinos/madrinas...');
    for (const tuno of tunosData) {
      let padrino_id = null;
      
      if (tuno.padrino) {
        // Buscar por mote
        const padrinoMote = tuno.padrino.split(' ')[0]; // Tomar la primera palabra como mote
        padrino_id = moteToId[padrinoMote] || null;
      }

      if (padrino_id) {
        const { error } = await supabase
          .from('profiles')
          .update({ padrino_id })
          .eq('id', tuno.roa.toString());

        if (error) {
          console.error(`Error al actualizar padrino de ${tuno.mote}:`, error);
        } else {
          console.log(`✓ Actualizado padrino de ${tuno.mote}: ${tuno.padrino}`);
        }
      }
    }

    console.log('\n✅ Inserción de datos completada');
  } catch (error) {
    console.error('Error en inserción:', error);
    process.exit(1);
  }
}

insertTunosData();
