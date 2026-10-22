import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

const USD_TO_GEL_RATE = 2.72;

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(query: Record<string, string>) {
    const {
      dealType,
      propertyType,
      city,
      district,
      status,
      condition,
      rooms,
      minPrice,
      maxPrice,
      currency = 'USD',
      minArea,
      maxArea,
      search,
      vipOnly,
      hasBalcony,
      hasParking,
      sort = 'vip_newest',
    } = query;

    const where: any = {};

    if (dealType && dealType !== 'ALL') where.dealType = dealType;
    if (propertyType && propertyType !== 'ALL') where.propertyType = propertyType;
    if (city && city !== 'ALL') where.city = city;
    if (district && district !== 'ALL') where.district = district;
    if (status && status !== 'ALL') where.status = status;
    if (condition && condition !== 'ALL') where.condition = condition;

    if (rooms && rooms !== 'ALL') {
      const r = parseInt(rooms, 10);
      if (!isNaN(r)) {
        where.rooms = r >= 5 ? { gte: 5 } : r;
      }
    }

    if (minPrice || maxPrice) {
      where.priceUsd = {};
      if (minPrice) {
        const val = parseFloat(minPrice);
        if (!isNaN(val)) {
          where.priceUsd.gte = currency === 'GEL' ? val / USD_TO_GEL_RATE : val;
        }
      }
      if (maxPrice) {
        const val = parseFloat(maxPrice);
        if (!isNaN(val)) {
          where.priceUsd.lte = currency === 'GEL' ? val / USD_TO_GEL_RATE : val;
        }
      }
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea && !isNaN(parseFloat(minArea))) where.area.gte = parseFloat(minArea);
      if (maxArea && !isNaN(parseFloat(maxArea))) where.area.lte = parseFloat(maxArea);
    }

    if (vipOnly === 'true') where.isVip = true;
    if (hasBalcony === 'true') where.hasBalcony = true;
    if (hasParking === 'true') where.hasParking = true;

    if (search && search.trim()) {
      const q = search.trim();
      const asCode = parseInt(q, 10);
      if (!isNaN(asCode) && String(asCode) === q) {
        where.code = asCode;
      } else {
        where.OR = [
          { title: { contains: q } },
          { description: { contains: q } },
          { address: { contains: q } },
          { district: { contains: q } },
          { city: { contains: q } },
        ];
      }
    }

    let orderBy: any = [{ isVip: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') orderBy = [{ priceUsd: 'asc' }];
    else if (sort === 'price_desc') orderBy = [{ priceUsd: 'desc' }];
    else if (sort === 'area_desc') orderBy = [{ area: 'desc' }];
    else if (sort === 'newest') orderBy = [{ createdAt: 'desc' }];

    const properties = await this.prisma.property.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { id: true, name: true, phone: true, role: true },
        },
      },
    });

    return { properties };
  }

  async create(authHeader: string | undefined, body: any) {
    const user = await this.authService.getUserFromAuthHeader(authHeader);
    if (!user) {
      throw new UnauthorizedException('განცხადების დასამატებლად გაიარეთ ავტორიზაცია');
    }

    const {
      title,
      description,
      dealType,
      propertyType,
      status,
      condition,
      city,
      district,
      address,
      priceUsd,
      area,
      rooms,
      bedrooms,
      bathrooms,
      floor,
      totalFloors,
      hasBalcony,
      hasParking,
      hasElevator,
      hasCentralHeating,
      isVip,
      vipType,
      imageUrl,
    } = body;

    if (!title || !city || !district || !priceUsd || !area) {
      throw new BadRequestException('შეავსეთ სავალდებულო ველები');
    }

    const randomCode = Math.floor(1900000 + Math.random() * 90000);
    const images = [
      imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ];

    const property = await this.prisma.property.create({
      data: {
        code: randomCode,
        title,
        description: description || title,
        dealType: dealType || 'SALE',
        propertyType: propertyType || 'APARTMENT',
        status: status || 'NEW_BUILDING',
        condition: condition || 'NEW_RENOVATED',
        city,
        district,
        address: address || `${district}, ${city}`,
        priceUsd: Number(priceUsd),
        area: Number(area),
        rooms: Number(rooms || 2),
        bedrooms: Number(bedrooms || 1),
        bathrooms: Number(bathrooms || 1),
        floor: Number(floor || 1),
        totalFloors: Number(totalFloors || 9),
        hasBalcony: Boolean(hasBalcony),
        hasParking: Boolean(hasParking),
        hasElevator: Boolean(hasElevator),
        hasCentralHeating: Boolean(hasCentralHeating),
        isVip: Boolean(isVip),
        vipType: isVip ? vipType || 'SUPER_VIP' : null,
        images: JSON.stringify(images),
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true, role: true },
        },
      },
    });

    return { property };
  }
}
