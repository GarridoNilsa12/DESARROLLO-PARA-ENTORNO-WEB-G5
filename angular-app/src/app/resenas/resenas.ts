import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Review {
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  text: string;
}

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css'
})
export class Resenas {

  stars = [1, 2, 3, 4, 5];

  selectedStars = 0;

  reviewerName = '';

  reviewText = '';

  reviews: Review[] = [
    {
      name: 'Marco T.',
      rating: 5,
      date: 'hace 3 días',
      verified: true,
      text: 'Excelente relación precio-calidad. La batería rinde todo el día de trabajo remoto.'
    },
    {
      name: 'Andrea Q.',
      rating: 4,
      date: 'hace 1 semana',
      verified: true,
      text: 'Buen rendimiento para tareas de oficina y diseño básico. El teclado podría ser mejor.'
    },
    {
      name: 'Renzo P.',
      rating: 3,
      date: 'hace 2 semanas',
      verified: false,
      text: 'Cumple lo básico, pero esperaba más RAM en este rango de precio.'
    }
  ];

  get averageRating(): string {
    if (this.reviews.length === 0) {
      return '0.0';
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return (total / this.reviews.length).toFixed(1);
  }

  get summaryStars(): boolean[] {
    const rounded = Math.round(Number(this.averageRating));

    return this.stars.map(star => star <= rounded);
  }

  get ratingBars() {
    return [5, 4, 3, 2, 1].map(star => {

      const count = this.reviews.filter(
        review => review.rating === star
      ).length;

      const percentage = this.reviews.length
        ? Math.round((count / this.reviews.length) * 100)
        : 0;

      return {
        star,
        count,
        percentage
      };
    });
  }

  selectStars(star: number): void {
    this.selectedStars = star;
  }

  submitReview(): void {

    const name = this.reviewerName.trim() || 'Anónimo';

    const text = this.reviewText.trim();

    if (!this.selectedStars || !text) {
      alert('Elige una calificación y escribe tu comentario.');
      return;
    }

    this.reviews.unshift({
      name,
      rating: this.selectedStars,
      date: 'ahora',
      verified: false,
      text
    });

    this.reviewerName = '';

    this.reviewText = '';

    this.selectedStars = 0;
  }
}