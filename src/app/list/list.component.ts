/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Config } from 'datatables.net';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { PostulanteService } from '../Services/postulante.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, DataTablesModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();

  storageKey = 'DataTables_postulantes_listado';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  tipo!: string;
  estadoId!: number;
  private tipoPostulanteId = 1;
  dtOptions: Config = {};
  private postulanteService = inject(PostulanteService)


  private baseUrl = environment.apiUrl;
  private apiKey =
    'gRnMxbEdZjkVr9m9jc18o4DcLu9CbD202KmzVp0m0LN-YPlZXUvXKgmp2GrJd9o6F1NfUFUKIyyGzh9LJ56G1LFZsJClNkbJjf-iCHhvLj1kO8oDaLKaS2pvtu1IcgsgFgqDuT4B0TieOpn8GEJuiUIM-VXUMvCR0JdsH9vWDr2KjewWqfCsQbnudLP2sUwz0vAWpLNaDPpFbXeq3V-xO7W1qlO9ETHtnoBBUHyrQQPIIiE4Ywc4oDsFkANjSxT9';
  filteredIds: number[] = [];

  ngOnInit(): void {
    this.tipo = this.route.snapshot.paramMap.get('tipo')!;
    this.estadoId = Number(this.route.snapshot.queryParamMap.get('est') ?? '1');
    this.tipoPostulanteId = this.tipoANumero(this.tipo.toLowerCase());


    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, queryParams]) => {
        const nuevoTipo = params.get('tipo')!;
        const nuevoEstadoId = Number(queryParams.get('est') ?? '1');
        this.tipo = nuevoTipo;
        this.estadoId = nuevoEstadoId;
        this.tipoPostulanteId = this.tipoANumero(this.tipo.toLowerCase());

         // Ocultar o mostrar columna "Sector"
        this.dtElement.dtInstance.then((dtInstance) => {
          const mostrar = this.tipoPostulanteId === 3;
          dtInstance.column(7).visible(mostrar); // columna "Sector"
        });

        this.dtElement.dtInstance.then((dtInstance) => {
          const mostrar = this.tipoPostulanteId === 2 || this.tipoPostulanteId === 3 ;
          dtInstance.column(6).visible(mostrar); // columna "Establecimiento"
        });

        this.rerender();
      },
    );

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
        { title: 'Establecimiento', data: 'estabSolicitud', visible:(this.tipoPostulanteId === 2 || this.tipoPostulanteId === 3) },
        { title: 'Sector', data: 'nombreSector', visible:this.tipoPostulanteId === 3},
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

  ngAfterViewInit(): void {
  this.dtTrigger.next(null);

  combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
    ([params, queryParams]) => {
      const nuevoTipo = params.get('tipo')!;
      const nuevoEstadoId = Number(queryParams.get('est') ?? '1');
      this.tipo = nuevoTipo;
      this.estadoId = nuevoEstadoId;
      this.tipoPostulanteId = this.tipoANumero(this.tipo.toLowerCase());

      this.dtElement.dtInstance.then((dtInstance) => {
        dtInstance.column(7).visible(this.tipoPostulanteId === 3); // Sector
        dtInstance.column(6).visible(this.tipoPostulanteId === 2 || this.tipoPostulanteId === 3 ); // Establecimiento
      });

      this.rerender();
    }
  );
}

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    if (!this.dtElement) {
      console.warn('dtElement no está definido aún.');
      return;
    }

    this.dtElement.dtInstance.then((dtInstance) => {
      // Destroy the table first
      //dtInstance.destroy();
      // Call the dtTrigger to rerender again
      //this.dtTrigger.next(null);
       dtInstance.clear();
       dtInstance.draw(false);
      this.resetearEstadoDataTable();
    });
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




