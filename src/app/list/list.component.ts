/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Config } from 'datatables.net';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { PostulanteService } from '../Services/postulante.service';
import { ESTADOS_POSTULANTE } from '../shared/enums/estados-postulantes';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, AfterViewInit {

  estados = ESTADOS_POSTULANTE
  storageKey = 'DataTables_postulantes_listado';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oidcSecurityService = inject(OidcSecurityService);
  tipo!: string;
  estadoId!: number;
  private tipoPostulanteId = 1;
  dtOptions: Config = {};
  private postulanteService = inject(PostulanteService);
  title = "";
  private baseUrl = environment.apiUrl;
  private apiKey =
    'gRnMxbEdZjkVr9m9jc18o4DcLu9CbD202KmzVp0m0LN-YPlZXUvXKgmp2GrJd9o6F1NfUFUKIyyGzh9LJ56G1LFZsJClNkbJjf-iCHhvLj1kO8oDaLKaS2pvtu1IcgsgFgqDuT4B0TieOpn8GEJuiUIM-VXUMvCR0JdsH9vWDr2KjewWqfCsQbnudLP2sUwz0vAWpLNaDPpFbXeq3V-xO7W1qlO9ETHtnoBBUHyrQQPIIiE4Ywc4oDsFkANjSxT9';
  filteredIds: number[] = [];


  ngOnInit(): void {
    this.tipo = this.route.snapshot.paramMap.get('tipo')!;
    this.estadoId = Number(this.route.snapshot.queryParamMap.get('est') ?? '1');
    this.tipoPostulanteId = this.tipoANumero(this.tipo.toLowerCase());
    this.cargaTitulo(this.tipo, this.estadoId);

    this.storageKey = `DataTables_${this.router.url}`;

    const windowHeight: number = $(window).height() ?? 600;
    const tabla = $('#laTabla');
    let tableOffsetTop = 0;
    if (tabla.length > 0 && tabla.offset()) {
      tableOffsetTop = tabla.offset()!.top;
    }
    const availableHeight = windowHeight - tableOffsetTop - 300;

    this.dtOptions = {
      serverSide: true,
      stateSave: true,
      stateDuration: -1,
      order: [[1, 'desc']],
      lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100, 'Todos'],
      ],
      pageLength: 50,
      scrollY: availableHeight + 'px',
      responsive: true,
      deferRender: true,
      processing: true,
      language: {
        url: 'assets/Language.Json',
      },
      ajax: {
        url: `${this.baseUrl}/Postulantes/postulantesList`,
        type: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        beforeSend: (xhr: any) => {
          // Obtener el token del OIDC y agregarlo como Bearer
          this.oidcSecurityService.getAccessToken().subscribe(token => {
            if (token) {
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
          });
        },
        data: (dataTablesParameters: any) => {
          // Agregar parámetros personalizados
          dataTablesParameters.tipoPostulante = this.tipoPostulanteId;
          dataTablesParameters.estado = this.estadoId;
          return dataTablesParameters;
        },
        dataSrc: (json: any) => {
          this.filteredIds = json.filteredIds;
          return json.data;
        },
        error: (err) => {
          console.error('Error al cargar datos:', err);
          return [];
        },
      },
      columns: [
        { title: 'ID', data: 'id' },
        {
          title: 'Fecha',
          data: 'fechaSolicitud',
          render: function (data) {
            const date = new Date(data);
            return date.toLocaleDateString('es-AR');
          },
        },
        { title: 'Apellido', data: 'apellido' },
        { title: 'Nombres', data: 'nombre' },
        { title: 'Sexo', data: 'sexo' },
        { title: 'DNI', data: 'dni' },
        { title: 'Establecimiento', data: 'estabSolicitud' },
        { title: 'Sector', data: 'nombreSector'},
        { title: 'Campaña', data: 'nombreCampania'},
        { title: 'Estado', data: 'estadoNombre'  },
        {
          title: 'Fecha',
          data: 'estadoFecha',
          className: 'text-nowrap',
          render: function (data) {
            const date = new Date(data);
            return (
              date.toLocaleDateString('es-AR') +
              ' ' +
              date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
            );
          },
        },

      ],
      dom:
        "<'row mb-2'<'col-sm-6 text-start'l><'col-sm-6 text-end'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
        "<'row mt-2' <'dt-buttons text-end'B>>",
      buttons: [
        {
          extend: 'print',
          title: 'Postulantes',
          message: 'Listado de postulantes',
          messageTop: 'Postulantes',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8,9],
          },
        },
        {
          extend: 'excel',
          title: 'Listado de postulantes',
          messageTop: 'Listado de postulantes',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8,9],
          },
        },
        {
          text: 'Excel Extendido',
          key: '1',
          action: (e, dt, node) => {
            const originalText = node.html();
            this.excelDownload(node, originalText);
          }
        }
      ],
      rowCallback: (row: Node, data: any[] | any) => {
        $('td', row).off('click');
        $('td', row).on('click', () => {
          const id = (data as any).id;
          this.ClickHandler(id);
        });
        return row;
      },
      stateSaveCallback: (settings, data) => {
        sessionStorage.setItem(this.storageKey, JSON.stringify(data));
      },

      stateLoadCallback: () => {
        const data = sessionStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
      },
    };

  }

  cargaTitulo(tipo:string, estado:number) : void
    {
      const estadoActual = ESTADOS_POSTULANTE.find(e => e.value === estado);
      const label = estadoActual ? estadoActual.label : "Desconocido";
      this.title = tipo + " (" + label + ")";
    }


  private initTable(): void {
    if (!$.fn.DataTable.isDataTable('#laTabla')) {
      $('#laTabla').DataTable(this.dtOptions);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const tableExists = $.fn.DataTable.isDataTable('#laTabla');
      combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
        ([params, queryParams]) => {
          const nuevoTipo = params.get('tipo')!;
          const nuevoEstadoId = Number(queryParams.get('est') ?? '1');
          const nuevoStorageKey = `DataTables_${nuevoTipo}_${nuevoEstadoId}`;

          const cambiarConfiguracion = nuevoStorageKey !== this.storageKey;

          this.tipo = nuevoTipo;
          this.estadoId = nuevoEstadoId;
          this.tipoPostulanteId = this.tipoANumero(nuevoTipo.toLowerCase());
          this.storageKey = nuevoStorageKey;

          this.cargaTitulo(this.tipo, this.estadoId);

          if (tableExists && cambiarConfiguracion) {
            $('#laTabla').DataTable().clear().destroy(true);
          }

          this.dtOptions.stateLoadCallback = () => {
            const data = sessionStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
          };

          if (!tableExists || cambiarConfiguracion) {
            this.initTable();
          }

          const table = $('#laTabla').DataTable();
          table.column(7).visible(this.tipoPostulanteId === 3);
          table.column(6).visible(this.tipoPostulanteId === 2 || this.tipoPostulanteId === 3);
          this.rerender();
        }
      );
    });
  }

  rerender(): void {
    const table = $('#laTabla').DataTable();
    if (!table) {
      console.warn('DataTable no inicializado.');
      return;
    }
    table.ajax.reload(undefined, false);
  }

  resetearEstadoDataTable() {
    this.storageKey = `DataTables_${this.router.url}`;
    sessionStorage.removeItem(this.storageKey);
  }

  ClickHandler(id: number) {
    sessionStorage.setItem('postulanteIds', JSON.stringify(this.filteredIds));
    this.router.navigate(['gestion', id]);
  }

  tipoANumero(tipo: string): number {
    switch (tipo) {
      case 'cadetes':
        return 1;
      case 'suboficiales':
        return 2;
      case 'profesionales':
        return 3;
      default:
        return 1;
    }
  }

  excelDownload(node: any, originalText: string) {
    node.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generando...'); // ícono de carga
    node.prop('disabled', true); // deshabilitar botón

    this.postulanteService.getExcel(this.filteredIds)
      .subscribe({
        next:(blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'postulantes.xlsx';
        a.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        a.click();
        window.URL.revokeObjectURL(url);
        },
        error: (err) =>{
          console.error(err);
          alert('Ocurrió un error al generar el Excel. Intente nuevamente.');
          node.html(originalText);
          node.prop('disabled', false);
        },
        complete:()=>{
          node.html(originalText);
          node.prop('disabled', false);
        }
      });
  }
}




