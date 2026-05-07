// Base de datos completa de estudiantes COEDUCA
const STUDENTS = {
  // PRUEBAS
  "1999": { name: "José Eliseo Martínez", grade: "Maestro" },

  // SÉPTIMO GRADO
  "20176653": { name: "Karen Aguilero", grade: "Séptimo" }, "20176654": { name: "Moisés Alfaro", grade: "Séptimo" },
  "20176658": { name: "Tania Barrera", grade: "Séptimo" }, "20316947": { name: "Gisselle Bonilla", grade: "Séptimo" },
  "20176659": { name: "Adonay Castillo", grade: "Séptimo" }, "20182709": { name: "Esperanza Chirino", grade: "Séptimo" },
  "20176660": { name: "Reyna Chirino", grade: "Séptimo" }, "20316949": { name: "Edwar Martínez", grade: "Séptimo" },
  "20298183": { name: "Andrea Anzora", grade: "Séptimo" }, "20062372": { name: "Paola SerrAño", grade: "Séptimo" },
  "20298185": { name: "Víctor Flores", grade: "Séptimo" }, "20199089": { name: "Ariel Fuentes", grade: "Séptimo" },
  "20182722": { name: "Daniela Henríquez", grade: "Séptimo" }, "20141583": { name: "Geovanny Jiménez", grade: "Séptimo" },
  "20138865": { name: "Manuel Jiménez", grade: "Séptimo" }, "20298188": { name: "Génesis Maldonado", grade: "Séptimo" },
  "20062488": { name: "Fredis Maravilla", grade: "Séptimo" }, "20182730": { name: "Cristofer Martínez", grade: "Séptimo" },
  "20062492": { name: "Marlon Mena", grade: "Séptimo" }, "20298191": { name: "Enrique Paredes", grade: "Séptimo" },
  "10000395": { name: "Valeria Portillo", grade: "Séptimo" }, "20298192": { name: "Naomi Ramírez", grade: "Séptimo" },
  "20298195": { name: "Karla Ríos", grade: "Séptimo" }, "20298194": { name: "Marcela Rivas", grade: "Séptimo" },
  "20176670": { name: "Azariel Rivas", grade: "Séptimo" }, "20316951": { name: "Axel Romero", grade: "Séptimo" },
  "20171117": { name: "Arlette Sánchez", grade: "Séptimo" }, "20298196": { name: "Magdalena Servellón", grade: "Séptimo" },

  // OCTAVO GRADO
  "20176655": { name: "Genesis Martinez", grade: "Octavo" }, "20176656": { name: "Karen Barrera", grade: "Octavo" },
  "20176657": { name: "Geremy Barrera", grade: "Octavo" }, "20176661": { name: "Gustavo Corvera", grade: "Octavo" },
  "20138869": { name: "Diego Corvera", grade: "Octavo" }, "20176662": { name: "Pedro Corvera", grade: "Octavo" },
  "20176663": { name: "Rafael Corvera", grade: "Octavo" }, "10065035": { name: "Justin Duran", grade: "Octavo" },
  "20176664": { name: "Hector Gonzalez", grade: "Octavo" }, "20305579": { name: "Estiven Henriquez", grade: "Octavo" },
  "20305581": { name: "Keily Manueles", grade: "Octavo" }, "20176667": { name: "Gisela Martinez", grade: "Octavo" },
  "20176668": { name: "Osiel Martinez", grade: "Octavo" }, "20179890": { name: "Vladimir Mejia", grade: "Octavo" },
  "20179891": { name: "Raul Melendez", grade: "Octavo" }, "20293665": { name: "Katherine Perez", grade: "Octavo" },
  "20305583": { name: "Samuel Rivas", grade: "Octavo" },

  // NOVENO GRADO
  "20062471": { name: "Diego Aguilero", grade: "Noveno" }, "19967142": { name: "Darwin Alfaro", grade: "Noveno" },
  "19971566": { name: "Dayana Angulo", grade: "Noveno" }, "19971565": { name: "Yesenia Angulo", grade: "Noveno" },
  "19967143": { name: "Marlon Barrera", grade: "Noveno" }, "20062474": { name: "Cesar David", grade: "Noveno" },
  "19967145": { name: "Oscar Fuentes", grade: "Noveno" }, "19967146": { name: "Elizabeth Canas", grade: "Noveno" },
  "19934096": { name: "Gisela Cordova", grade: "Noveno" }, "19934095": { name: "Ingrid Cordova", grade: "Noveno" },
  "4210274":  { name: "Pedro Escamilla", grade: "Noveno" }, "20200673": { name: "Michel Escobar", grade: "Noveno" },
  "20062484": { name: "Wendy Garcia", grade: "Noveno" }, "19934098": { name: "Adonay Hernandez", grade: "Noveno" },
  "19967150": { name: "Anggie Lopez", grade: "Noveno" }, "20062486": { name: "Rosa Maldonado", grade: "Noveno" },
  "20062489": { name: "Ernesto Martinez", grade: "Noveno" }, "19976021": { name: "Damary Martinez", grade: "Noveno" },
  "20023247": { name: "Alexandra Monterroza", grade: "Noveno" }, "19976024": { name: "Anahy Munoz", grade: "Noveno" },
  "20062495": { name: "Carolina Osorio", grade: "Noveno" }, "19956103": { name: "Griseida Perez", grade: "Noveno" },
  "20062498": { name: "Silvia Ramos", grade: "Noveno" }, "19967154": { name: "Cesar Rivas", grade: "Noveno" },

  // PRIMER AÑO DE BACHILLERATO
  "4210278":  { name: "Melisa Barahona", grade: "Primer Año" }, "4210264":  { name: "Jasmin Barahona", grade: "Primer Año" },
  "19967144": { name: "Andrea Barrera", grade: "Primer Año" }, "20068438": { name: "Keiry Bonilla", grade: "Primer Año" },
  "4210262":  { name: "Maria Luz Cordova", grade: "Primer Año" }, "19843597": { name: "Bryan Miguel Flores", grade: "Primer Año" },
  "4210272":  { name: "Ernesto Fuentes", grade: "Primer Año" }, "19967158": { name: "Liliana Hernandez", grade: "Primer Año" },
  "4210284":  { name: "Yeferson Maravilla", grade: "Primer Año" }, "19934099": { name: "Wilfredo Martinez", grade: "Primer Año" },
  "19967161": { name: "Rocio Mejia", grade: "Primer Año" }, "19967151": { name: "Yaquelin MontAño", grade: "Primer Año" },
  "20062496": { name: "Katherinne Palma", grade: "Primer Año" }, "19788973": { name: "Alexandra Portillo", grade: "Primer Año" },
  "3167629":  { name: "Keren Portillo", grade: "Primer Año" }, "19967163": { name: "Maria Jose", grade: "Primer Año" },
  "4210259":  { name: "Kennedy Ramirez", grade: "Primer Año" }, "4210276":  { name: "Fernanda Rivas", grade: "Primer Año" },
  "20062499": { name: "Wilian Rivera", grade: "Primer Año" }, "6954866":  { name: "Erika Rodriguez", grade: "Primer Año" },
  "4210263":  { name: "Isaias Romero", grade: "Primer Año" },

  // SEGUNDO AÑO DE BACHILLERATO
  "4210279":  { name: "Jose Maria Barrera", grade: "Segundo Año" }, "4210254":  { name: "Abel Barrera", grade: "Segundo Año" },
  "2724749":  { name: "Maicol Barrera", grade: "Segundo Año" }, "6473557":  { name: "Estephany Berrios", grade: "Segundo Año" },
  "6473562":  { name: "Amy Canas", grade: "Segundo Año" }, "19724473": { name: "Mauricio Cordova", grade: "Segundo Año" },
  "6473555":  { name: "Oscar Kennedy", grade: "Segundo Año" }, "4210255":  { name: "Estiven Hernandez", grade: "Segundo Año" },
  "1964480":  { name: "Juan David", grade: "Segundo Año" }, "4210256":  { name: "Yuleyde Lopez", grade: "Segundo Año" },
  "5531752":  { name: "Cintia Martinez", grade: "Segundo Año" }, "4210268":  { name: "Wilmer Mejia", grade: "Segundo Año" },
  "2295119":  { name: "Lisbeth Mejia", grade: "Segundo Año" }, "5531765":  { name: "Kevin Monterrosa", grade: "Segundo Año" },
  "2294851":  { name: "Alfredo Osorio", grade: "Segundo Año" }, "19769235": { name: "Angel Quezada", grade: "Segundo Año" },
  "19929938": { name: "Sophia Quinteros", grade: "Segundo Año" }, "4210277":  { name: "Leonel Rivera", grade: "Segundo Año" }
};