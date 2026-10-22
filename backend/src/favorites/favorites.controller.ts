import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

@Controller('favorites')
export class FavoritesController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  @Post('toggle')
  async toggle(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { propertyId: string },
  ) {
    const user = await this.authService.getUserFromAuthHeader(authHeader);
    if (!user) {
      throw new UnauthorizedException('ფავორიტებში დასამატებლად გაიარეთ ავტორიზაცია');
    }
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: body.propertyId,
        },
      },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    } else {
      await this.prisma.favorite.create({
        data: { userId: user.id, propertyId: body.propertyId },
      });
      return { favorited: true };
    }
  }
}
