import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { CurrentUser, PropertyItem } from './models/property.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly USD_TO_GEL_RATE = 2.72;

  readonly DEAL_TYPES = [
    { id: 'ALL', label: 'ყველა' },
    { id: 'SALE', label: 'იყიდება' },
    { id: 'RENT', label: 'ქირავდება' },
    { id: 'DAILY', label: 'ქირავდება დღიურად' },
    { id: 'MORTGAGE', label: 'გირავდება' },
  ];

  readonly DEAL_TYPE_LABELS: Record<string, string> = {
    SALE: 'იყიდება',
    RENT: 'ქირავდება',
    DAILY: 'დღიურად',
    MORTGAGE: 'გირავდება',
  };

  readonly PROPERTY_TYPES = [
    { id: 'ALL', label: 'ყველა ტიპი' },
    { id: 'APARTMENT', label: 'ბინა' },
    { id: 'HOUSE', label: 'კერძო სახლი' },
    { id: 'COMMERCIAL', label: 'კომერციული ფართი' },
    { id: 'LAND', label: 'მიწის ნაკვეთი' },
  ];

  readonly PROPERTY_TYPE_LABELS: Record<string, string> = {
    APARTMENT: 'ბინა',
    HOUSE: 'კერძო სახლი',
    COMMERCIAL: 'კომერციული',
    LAND: 'მიწის ნაკვეთი',
  };

  readonly BUILDING_STATUSES = [
    { id: 'ALL', label: 'ყველა სტატუსი' },
    { id: 'NEW_BUILDING', label: 'ახალი აშენებული' },
    { id: 'OLD_BUILDING', label: 'ძველი აშენებული' },
    { id: 'UNDER_CONSTRUCTION', label: 'მშენებარე' },
  ];

  readonly STATUS_LABELS: Record<string, string> = {
    NEW_BUILDING: 'ახალი აშენებული',
    OLD_BUILDING: 'ძველი აშენებული',
    UNDER_CONSTRUCTION: 'მშენებარე',
  };

  readonly CONDITIONS = [
    { id: 'ALL', label: 'ყველა მდგომარეობა' },
    { id: 'NEW_RENOVATED', label: 'ახალი გარემონტებული' },
    { id: 'GREEN_FRAME', label: 'მწვანე კარკასი' },
    { id: 'BLACK_FRAME', label: 'შავი კარკასი' },
    { id: 'OLD_RENOVATED', label: 'ძველი გარემონტებული' },
  ];

  readonly CONDITION_LABELS: Record<string, string> = {
    NEW_RENOVATED: 'ახალი გარემონტებული',
    GREEN_FRAME: 'მწვანე კარკასი',
    BLACK_FRAME: 'შავი კარკასი',
    OLD_RENOVATED: 'ძველი გარემონტებული',
  };

  readonly CITIES_WITH_DISTRICTS: Record<string, string[]> = {
    'თბილისი': ['ვაკე', 'საბურთალო', 'მთაწმინდა', 'კრწანისი', 'ისანი', 'დიდუბე', 'ჩუღურეთი', 'გლდანი', 'ნაძალადევი', 'სამგორი'],
    'ბათუმი': ['ხიმშიაშვილის უბანი', 'ძველი ბათუმი', 'ბაგრატიონის უბანი', 'ახალი ბულვარი'],
    'მცხეთა': ['საგურამო', 'მცხეთა', 'წოდორეთი', 'ლისი'],
    'ქუთაისი': ['ცენტრი', 'ბალახვანი', 'გორა'],
  };

  currency: 'USD' | 'GEL' = 'USD';
  user: CurrentUser | null = null;
  favoriteIds: string[] = [];
  showFavoritesOnly = false;

  // Filters
  dealType = 'ALL';
  propertyType = 'ALL';
  city = 'ALL';
  district = 'ALL';
  minPrice = '';
  maxPrice = '';
  minArea = '';
  maxArea = '';
  rooms = 'ALL';
  status = 'ALL';
  condition = 'ALL';
  searchQuery = '';
  vipOnly = false;
  hasBalcony = false;
  hasParking = false;
  sort = 'vip_newest';
  showAdvancedFilters = false;

  properties: PropertyItem[] = [];
  loading = true;

  // Modals
  selectedProperty: PropertyItem | null = null;
  activeImageIdx = 0;
  showPhone = false;
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';
  showAddModal = false;

  // Auth form
  authEmail = '';
  authPassword = '';
  authName = '';
  authPhone = '';
  authError = '';
  authSubmitting = false;

  // Add Property form
  newProp = {
    title: '',
    description: '',
    dealType: 'SALE',
    propertyType: 'APARTMENT',
    status: 'NEW_BUILDING',
    condition: 'NEW_RENOVATED',
    city: 'თბილისი',
    district: 'ვაკე',
    address: '',
    priceUsd: '',
    area: '',
    rooms: '3',
    bedrooms: '2',
    bathrooms: '1',
    floor: '5',
    totalFloors: '12',
    hasBalcony: true,
    hasParking: true,
    hasElevator: true,
    hasCentralHeating: true,
    isVip: true,
    vipType: 'SUPER_VIP',
    imageUrl: '',
  };
  addError = '';
  addSubmitting = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getMe().subscribe({
      next: (res) => {
        if (res.user) {
          this.user = res.user;
          this.favoriteIds = (res.user.favorites || []).map((f) => f.propertyId);
        }
      },
    });
    this.loadProperties();
  }

  get cityKeys(): string[] {
    return Object.keys(this.CITIES_WITH_DISTRICTS);
  }

  get availableDistricts(): string[] {
    return this.city !== 'ALL' ? this.CITIES_WITH_DISTRICTS[this.city] || [] : [];
  }

  get newPropDistricts(): string[] {
    return this.CITIES_WITH_DISTRICTS[this.newProp.city] || [];
  }

  get displayedProperties(): PropertyItem[] {
    if (this.showFavoritesOnly) {
      return this.properties.filter((p) => this.favoriteIds.includes(p.id));
    }
    return this.properties;
  }

  loadProperties(): void {
    this.loading = true;
    const filters: Record<string, string> = {
      dealType: this.dealType,
      propertyType: this.propertyType,
      city: this.city,
      district: this.district,
      minPrice: String(this.minPrice || ''),
      maxPrice: String(this.maxPrice || ''),
      currency: this.currency,
      minArea: String(this.minArea || ''),
      maxArea: String(this.maxArea || ''),
      rooms: this.rooms,
      status: this.status,
      condition: this.condition,
      search: this.searchQuery.trim(),
      vipOnly: this.vipOnly ? 'true' : '',
      hasBalcony: this.hasBalcony ? 'true' : '',
      hasParking: this.hasParking ? 'true' : '',
      sort: this.sort,
    };

    this.api.getProperties(filters).subscribe({
      next: (res) => {
        this.properties = res.properties || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onCityChange(): void {
    this.district = 'ALL';
    this.loadProperties();
  }

  onNewPropCityChange(): void {
    const list = this.CITIES_WITH_DISTRICTS[this.newProp.city] || [];
    this.newProp.district = list[0] || '';
  }

  setCurrency(curr: 'USD' | 'GEL'): void {
    this.currency = curr;
    this.loadProperties();
  }

  resetFilters(): void {
    this.dealType = 'ALL';
    this.propertyType = 'ALL';
    this.city = 'ALL';
    this.district = 'ALL';
    this.minPrice = '';
    this.maxPrice = '';
    this.minArea = '';
    this.maxArea = '';
    this.rooms = 'ALL';
    this.status = 'ALL';
    this.condition = 'ALL';
    this.searchQuery = '';
    this.vipOnly = false;
    this.hasBalcony = false;
    this.hasParking = false;
    this.showFavoritesOnly = false;
    this.loadProperties();
  }

  formatPrice(priceUsd: number): string {
    if (this.currency === 'USD') {
      return `$${Math.round(priceUsd).toLocaleString('en-US')}`;
    }
    return `${Math.round(priceUsd * this.USD_TO_GEL_RATE).toLocaleString('en-US')} ₾`;
  }

  formatSqmPrice(priceUsd: number, area: number): string {
    if (!area || area <= 0) return '';
    const perSqmUsd = priceUsd / area;
    if (this.currency === 'USD') {
      return `$${Math.round(perSqmUsd).toLocaleString('en-US')} / მ²`;
    }
    return `${Math.round(perSqmUsd * this.USD_TO_GEL_RATE).toLocaleString('en-US')} ₾ / მ²`;
  }

  getImages(prop: PropertyItem): string[] {
    try {
      const parsed = JSON.parse(prop.images);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'];
    } catch {
      return ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'];
    }
  }

  isFavorite(propertyId: string): boolean {
    return this.favoriteIds.includes(propertyId);
  }

  toggleFavorite(event: Event, propertyId: string): void {
    event.stopPropagation();
    if (!this.user) {
      this.showAuthModal = true;
      return;
    }
    const exists = this.favoriteIds.includes(propertyId);
    if (exists) {
      this.favoriteIds = this.favoriteIds.filter((id) => id !== propertyId);
    } else {
      this.favoriteIds = [...this.favoriteIds, propertyId];
    }
    this.api.toggleFavorite(propertyId).subscribe();
  }

  openDetails(prop: PropertyItem): void {
    this.selectedProperty = prop;
    this.activeImageIdx = 0;
    this.showPhone = false;
  }

  prevImage(imgs: string[]): void {
    this.activeImageIdx = this.activeImageIdx === 0 ? imgs.length - 1 : this.activeImageIdx - 1;
  }

  nextImage(imgs: string[]): void {
    this.activeImageIdx = this.activeImageIdx === imgs.length - 1 ? 0 : this.activeImageIdx + 1;
  }

  handleAuthSubmit(): void {
    this.authError = '';
    this.authSubmitting = true;
    const obs =
      this.authMode === 'login'
        ? this.api.login({ email: this.authEmail, password: this.authPassword })
        : this.api.register({
            name: this.authName,
            email: this.authEmail,
            phone: this.authPhone,
            password: this.authPassword,
          });

    obs.subscribe({
      next: (res) => {
        localStorage.setItem('myhome_token', res.token);
        this.user = res.user;
        this.favoriteIds = (res.user.favorites || []).map((f) => f.propertyId);
        this.showAuthModal = false;
        this.authSubmitting = false;
      },
      error: (err) => {
        this.authError = err.error?.message || 'შეცდომა ავტორიზაციისას';
        this.authSubmitting = false;
      },
    });
  }

  handleDemoLogin(): void {
    this.authError = '';
    this.authSubmitting = true;
    this.api.login({ email: 'giorgi@myhome.ge', password: 'password123' }).subscribe({
      next: (res) => {
        localStorage.setItem('myhome_token', res.token);
        this.user = res.user;
        this.favoriteIds = (res.user.favorites || []).map((f) => f.propertyId);
        this.showAuthModal = false;
        this.authSubmitting = false;
      },
      error: () => {
        this.authSubmitting = false;
      },
    });
  }

  handleLogout(): void {
    localStorage.removeItem('myhome_token');
    this.user = null;
    this.favoriteIds = [];
    this.showFavoritesOnly = false;
  }

  openAddModal(): void {
    if (!this.user) {
      this.showAuthModal = true;
    } else {
      this.showAddModal = true;
    }
  }

  handleAddProperty(): void {
    this.addError = '';
    this.addSubmitting = true;
    this.api.createProperty(this.newProp).subscribe({
      next: () => {
        this.showAddModal = false;
        this.addSubmitting = false;
        this.newProp.title = '';
        this.newProp.description = '';
        this.newProp.address = '';
        this.newProp.priceUsd = '';
        this.newProp.area = '';
        this.newProp.imageUrl = '';
        this.loadProperties();
      },
      error: (err) => {
        this.addError = err.error?.message || 'შეცდომა განცხადების დამატებისას';
        this.addSubmitting = false;
      },
    });
  }
}
