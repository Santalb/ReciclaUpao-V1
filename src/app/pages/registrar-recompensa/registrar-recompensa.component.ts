import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RRecompensaService } from 'src/app/service/r-recompensa.service';
import Swal from 'sweetalert2';
import { Recompensa } from 'src/app/Modelo/recompensa';

@Component({
  selector: 'app-registrar-recompensa',
  templateUrl: './registrar-recompensa.component.html',
  styleUrls: ['./registrar-recompensa.component.css']
})
export class RegistrarRecompensaComponent implements OnInit {
  recompensaForm: FormGroup;
  imagenArchivo: File | null = null;
  imageTouched: boolean = false; // Para controlar si la imagen fue tocada
  recompensas: Recompensa[] = []; // Lista de recompensas para verificar duplicados

  constructor(
    private fb: FormBuilder,
    private recompensaService: RRecompensaService
  ) {
    this.recompensaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$/), Validators.maxLength(40)]],
      descripcion: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$/), Validators.maxLength(30)]],
      categoria: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$/), Validators.maxLength(12)]],
      valor: ['', [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit(): void {
    // Cargar recompensas existentes al inicio para verificar duplicados
    this.recompensaService.listarRecompensa().subscribe(
      (data: any) => {
        this.recompensas = data.content;
      },
      (error) => {
        console.error('Error al cargar recompensas:', error);
      }
    );
  }

  // Función para verificar si hay recompensas duplicadas
  verificarDuplicado(titulo: string, descripcion: string): boolean {
    return this.recompensas.some(
      recompensa =>
        recompensa.titulo.toLowerCase() === titulo.toLowerCase() ||
        recompensa.descripcion.toLowerCase() === descripcion.toLowerCase()
    );
  }

  onSubmit(): void {
    const titulo = this.recompensaForm.value.titulo;
    const descripcion = this.recompensaForm.value.descripcion;

    // Verifica si ya existe una recompensa con el mismo título o descripción
    const recompensaDuplicada = this.verificarDuplicado(titulo, descripcion);

    if (recompensaDuplicada) {
      Swal.fire('Error', 'Ya existe una recompensa con el mismo título o descripción.', 'error');
      return; // No continuar si hay duplicados
    }

    if (this.recompensaForm.valid && this.imagenArchivo) {
      const formData = new FormData();
      formData.append('titulo', this.recompensaForm.value.titulo);
      formData.append('descripcion', this.recompensaForm.value.descripcion);
      formData.append('categoria', this.recompensaForm.value.categoria);
      formData.append('valor', this.recompensaForm.value.valor);
      formData.append('imagenPath', this.imagenArchivo);

      this.recompensaService.registrarRecompensa(formData).subscribe(
        (response) => {
          Swal.fire('Éxito', 'Recompensa registrada con éxito', 'success');
        },
        (error) => {
          console.error('Error al registrar la recompensa:', error);
          Swal.fire('Error', 'La imagen excede los límites de tamaño (5mb)', 'error');
        }
      );
    } else {
      this.imageTouched = true;
      Swal.fire('Error', 'Por favor, completa todos los campos y selecciona una imagen', 'error');
    }
  }

  onFileSelected(event: Event): void {
    this.imageTouched = true;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imagenArchivo = input.files[0];
    }
  }

  onReset(): void {
    this.recompensaForm.reset();
    this.imagenArchivo = null;
    this.imageTouched = false;
  }
}
