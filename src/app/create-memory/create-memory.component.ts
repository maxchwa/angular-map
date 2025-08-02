import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { toLonLat } from 'ol/proj';

@Component({
  selector: 'app-create-memory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <form [formGroup]="memoryForm" (ngSubmit)="submitMemory()" enctype="multipart/form-data"
      class="flex flex-col gap-4 max-w-md mx-auto mt-6">

      <div>Coordinates: {{ lonLat }}</div>

      <input
        type="text"
        formControlName="title"
        placeholder="Memory title"
        class="border p-2 rounded"
      />

      <textarea
        formControlName="description"
        placeholder="Description"
        class="border p-2 rounded"
      ></textarea>

      <input
        type="file"
        (change)="onFileSelected($event)"
        class="border p-2 rounded"
      />

      <div class="flex gap-2 justify-end">
        <button
          type="button"
          (click)="cancel()"
          class="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit Memory
        </button>
      </div>
    </form>
  ` 
})
export class CreateMemoryComponent {
  @Input() coordinate: any;
  @Input() lonLat?: [number, number];
  @Output() closed = new EventEmitter<void>();
  memoryForm: FormGroup;
  selectedFile: File | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if ('coordinate' in changes || 'lonLat' in changes) {
      this.resetForm(); // reset when inputs change to allow repeated use
    }
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.memoryForm = this.fb.group({
      title: [''],
      description: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  submitMemory(): void {
    this.closed.emit();
    const formData = new FormData();
    formData.append('title', this.memoryForm.get('title')?.value);
    formData.append('description', this.memoryForm.get('description')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http.post('http://localhost:8080/api/memories', formData, {
      responseType: 'text',
    }).subscribe({
      next: (res: any) => {
        alert(`Memory saved!`);
      },
      error: (err) => alert('Error uploading memory: ' + err.message),
    });
  }

  resetForm() {
//    this.formState = {}; // or whatever default
  }

  cancel(): void {
    this.closed.emit();
  }
}
