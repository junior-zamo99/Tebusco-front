import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService } from '../../services/ad.service';
import { ActionType, Ad } from '../../models/ad.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ads-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads-carousel.html',
})
export class AdsCarousel implements OnInit, OnDestroy {

  ads: Ad[] = [];
  isLoading = true;
  public ActionType = ActionType;

  currentIndex = 0;
  itemsPerView = 3;
  intervalId: any;

  constructor(private adService: AdService) {}

  ngOnInit() {
    this.detectScreenSize();

    this.adService.getActiveAds().subscribe({
      next: (data) => {
        this.ads = data;
        this.isLoading = false;

        console.log('Anuncios cargados:', this.ads);

        if (this.ads.length > this.itemsPerView) {
          this.startAutoPlay();
        }
      },
      error: (err) => {
        console.error('Error cargando anuncios:', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }


  getDetailUrl(imagePath: string): string {
    return `${environment.backendUrl}${imagePath}`;
  }


  onAdClick(ad: Ad) {
    if (!ad.actionValue) return;

    switch (ad.actionType) {
      case ActionType.WEB_URL:
        const url = ad.actionValue.startsWith('http') ? ad.actionValue : `https://${ad.actionValue}`;
        window.open(url, '_blank');
        break;
      case ActionType.WHATSAPP:
        const phone = ad.actionValue.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
        break;
      case ActionType.PHONE_CALL:
        window.location.href = `tel:${ad.actionValue}`;
        break;
    }
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => { this.next(); }, 4000);
  }

  stopAutoPlay() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  next() {
    if (this.ads.length <= this.itemsPerView) return;
    this.currentIndex = (this.currentIndex >= this.ads.length - this.itemsPerView) ? 0 : this.currentIndex + 1;
  }

  prev() {
    if (this.ads.length <= this.itemsPerView) return;
    this.currentIndex = (this.currentIndex === 0) ? this.ads.length - this.itemsPerView : this.currentIndex - 1;
  }

  detectScreenSize() {
    this.itemsPerView = window.innerWidth < 768 ? 1 : 3;
  }
}
