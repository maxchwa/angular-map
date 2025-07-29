import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-memory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './create-memory.component.html',
})
export class CreateMemoryComponent {
  memoryForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
    alert(`Memory saved! ID: ${res.id}`);
    // Optionally: show image from `/uploads/${res.image}`
  },
  error: (err) => alert('Error uploading memory: ' + err.message),
});
  }
}
